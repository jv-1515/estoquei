const cargos = [
    { nome: "Gerente" },
    { nome: "Estoquista" },
    { nome: "Vendedor" },
    { nome: "Caixa" },
    { nome: "Extra 1" },
    { nome: "Extra 2" }
];

const permissoes = [
    { label: "Produtos" },
    { label: "Movimentações" },
    { label: "Relatórios" },
    { label: "Fornecedores", info: true },
    { label: "Funcionários", info: true }
];

const tiposPerm = [
    { key: "visualizar", cor: "#43b04a", texto: "Visualizar" },
    { key: "criar", cor: "#bfa100", texto: "Criar" },
    { key: "editar", cor: "#e67e22", texto: "Editar" },
    { key: "excluir", cor: "#c0392b", texto: "Excluir" },
    { key: "tudo", cor: "#1e94a3", texto: "Tudo" }
];

// Renderiza todos os cargos
function renderizarPermissoes() {
    const container = document.getElementById('permissoes-list');
    container.innerHTML = '';
    cargos.forEach(cargo => {
        const div = document.createElement('div');
        div.className = 'main-container';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h2 class="cargo-title">${cargo.nome}</h2>
                    <div class="permissoes-labels">
                        ${permissoes.map(p => `<p>${p.label}${p.info ? ' <i class="fa-solid fa-circle-info"></i>' : ''}</p>`).join('')}
                    </div>
                </div>
                <div class="permissoes-table">
                    ${tiposPerm.map(tp => `
                        <div class="permissoes-col ${tp.key}">
                            <span style="color:${tp.cor};">${tp.texto}</span>
                            ${permissoes.map((_, idx) => `
                                <input type="checkbox" data-cargo="${cargo.nome}" data-perm="${tp.key}" data-row="${idx}" />
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    // Marcar linha toda ao clicar no "Tudo"
    document.querySelectorAll('.permissoes-col.tudo input[type="checkbox"]').forEach((chk, idx) => {
        chk.addEventListener('change', function() {
            const mainDiv = chk.closest('.main-container');
            const row = chk.dataset.row;
            // Marca/desmarca todos da linha
            mainDiv.querySelectorAll(`input[data-row="${row}"]:not([data-perm="tudo"])`).forEach(cb => {
                cb.checked = chk.checked;
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', renderizarPermissoes);