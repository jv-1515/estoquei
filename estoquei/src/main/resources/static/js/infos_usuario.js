let funcionarios = [];

function getIniciais(nome) {
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

document.addEventListener('DOMContentLoaded', function() {
    const avatarCircle = document.getElementById('avatar-user-info');
    const nomeSpan = document.getElementById('avatar-nome');
    if (!avatarCircle || !nomeSpan) return;

    let nome = nomeSpan.textContent.trim();
    if (!nome) return;

    // Gera iniciais (primeira e última letra)
    const partes = nome.split(/\s+/);
    let iniciais = '';
    if (partes.length === 1) {
        iniciais = partes[0][0].toUpperCase();
    } else if (partes.length > 1) {
        iniciais = (partes[0][0] + partes[partes.length-1][0]).toUpperCase();
    }
    // Atualiza iniciais
    const span = avatarCircle.querySelector('span');
    if (span) span.textContent = iniciais;
    else avatarCircle.textContent = iniciais;

    // Cor pastel baseada no nome (igual home)
    let hash = 0;
    for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    avatarCircle.style.background = `hsl(${h}, 60%, 80%)`;
});



// Carrega informações do usuário logado e preenche os campos
document.addEventListener('DOMContentLoaded', function() {
    fetch('/usuarios')
        .then(res => res.json())
        .then(usuario => {
            if (!usuario) return;
            document.getElementById('info-nome').value = usuario.nome || '';
            document.getElementById('info-email').value = usuario.email || '';
            document.getElementById('info-cargo').value = usuario.cargo || usuario.tipo || '';
            document.getElementById('info-status').value = usuario.ativo ? 'Ativo' : 'Inativo';
        });

    // Redefinir senha (apenas exemplo de alerta)
    document.getElementById('redefinir-senha').addEventListener('click', function(e) {
        e.preventDefault();
        Swal.fire({
            title: 'Redefinir senha',
            text: 'Um link de redefinição será enviado para seu e-mail.',
            icon: 'info',
            confirmButtonText: 'OK',
            customClass: { confirmButton: 'swal2-confirm-custom' }
        });
    });
});


function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById('icon-' + inputId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        } else {
        input.type = "password";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}
