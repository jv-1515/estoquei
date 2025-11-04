# Script para renomear package com.example.estoquei -> com.example.stokmais
# Execute a partir do PowerShell: .\scripts\rename-package.ps1

$ProjectRoot = "C:\Users\JoãoVictorSilva-BDSD\Desktop\privado\stokmais\stokmais"
$oldPackage = "com.example.estoquei"
$newPackage = "com.example.stokmais"
$oldDirName = "estoquei"
$newDirName = "stokmais"

function Use-Git {
    pushd $ProjectRoot >$null
    $isGit = $false
    try {
        $res = git rev-parse --is-inside-work-tree 2>$null
        if ($LASTEXITCODE -eq 0 -and $res -eq "true") { $isGit = $true }
    } catch {}
    popd >$null
    return $isGit
}

function Move-PackageDir($relativePath) {
    $oldPath = Join-Path $ProjectRoot $relativePath
    $newPath = $oldPath -replace [regex]::Escape($oldDirName) + '$', $newDirName
    if (-Not (Test-Path $oldPath)) { return }
    if (Use-Git) {
        Push-Location $ProjectRoot
        git mv (Resolve-Path $oldPath).Path $newPath
        Pop-Location
        Write-Host "git mv: $oldPath -> $newPath"
    } else {
        Rename-Item -LiteralPath $oldPath -NewName $newDirName
        Write-Host "Rename-Item: $oldPath -> $newPath"
    }
}

function Replace-InFiles($pathRoot, $patterns) {
    Get-ChildItem -Path $pathRoot -Recurse -File | Where-Object { $_.Extension -match '\.java$|\.xml$|\.properties$|\.html$|\.js$|\.json$' } |
    ForEach-Object {
        $file = $_.FullName
        $text = Get-Content -Raw -LiteralPath $file -ErrorAction SilentlyContinue
        if (-not $text) { return }
        $newText = $text
        foreach ($p in $patterns) {
            $newText = $newText -replace $p.Key, $p.Value
        }
        if ($newText -ne $text) {
            Set-Content -LiteralPath $file -Value $newText
            Write-Host "Patched: $file"
        }
    }
}

# 1) Move package directories (main + test)
Move-PackageDir "src\main\java\com\example\$oldDirName"
Move-PackageDir "src\test\java\com\example\$oldDirName"

# 2) Replace package declarations and imports in source files
$patterns = @{
    "package\s+com\.example\.estoquei\s*;" = "package com.example.stokmais;"
    "import\s+com\.example\.estoquei" = "import com.example.stokmais"
    "\bcom\.example\.estoquei\b" = "com.example.stokmais"
}
Replace-InFiles "$ProjectRoot\src" $patterns

# 3) Search + replace in resources/configs (application.properties, templates etc.)
Replace-InFiles "$ProjectRoot\src\main\resources" $patterns

# 4) Remove compiled classes to force rebuild
$targetClasses = Join-Path $ProjectRoot "target\classes\com\example\estoquei"
if (Test-Path $targetClasses) {
    Remove-Item -LiteralPath $targetClasses -Recurse -Force
    Write-Host "Removed stale target classes: $targetClasses"
}

# 5) Show remaining occurrences (manual review)
Write-Host "`nRemaining occurrences of 'estoquei':"
Select-String -Path "$ProjectRoot\**\*" -Pattern "estoquei" -SimpleMatch -List | ForEach-Object {
    "{0}`t:{1}" -f $_.Path, $_.LineNumber
}

# 6) Build (run mvnw clean package). Remove or comment if you prefer to run manually.
Push-Location $ProjectRoot
if (Test-Path ".\mvnw.cmd") {
    .\mvnw.cmd -q clean package
} elseif (Test-Path "pom.xml") {
    mvn -q clean package
}
Pop-Location

Write-Host "`nDone. Revise the 'Remaining occurrences' list and restart VS Code / language server."