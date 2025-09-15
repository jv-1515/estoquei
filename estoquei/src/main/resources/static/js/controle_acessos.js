// Busca usuário logado
async function getUsuarioLogado() {
    const res = await fetch('/usuarios/usuario-logado');
    if (!res.ok) return null;
    return await res.json();
}

// Busca cargo pelo id
async function getCargoById(cargoId) {
    const res = await fetch(`/cargos/${cargoId}`);
    if (!res.ok) return null;
    return await res.json();
}

// Função principal para obter permissões do usuário logado
async function getPermissoesUsuario() {
    const res = await fetch('/usuarios/usuario-logado');
    if (!res.ok) return null;
    const usuario = await res.json();
    return { usuario, cargo: usuario.cargo };
}

// Checa permissão de módulo
function temPermissao(cargo, modulo, nivelMinimo) {
    return cargo && typeof cargo[modulo] !== 'undefined' && cargo[modulo] >= nivelMinimo;
}

// -------- ESTOQUE --------
async function aplicarPermissoesEstoque() {
    const { usuario, cargo } = await getPermissoesUsuario();
    if (!cargo) return;

    // Botão cadastrar produto (criar = 2)
    const btnCadastrar = document.getElementById('btn-cadastrar-produto');
    if (btnCadastrar && !temPermissao(cargo, 'produtos', 2)) {
        btnCadastrar.disabled = true;
        btnCadastrar.title = 'Sem permissão';
        btnCadastrar.style.cursor = 'not-allowed';
        btnCadastrar.style.backgroundColor = '#aaa'
    }

    // Editar produto (editar = 3)
    const editLink = document.getElementById('detalhes-edit-link');
    if (editLink) {
        editLink.href = `/editar-produto?id=${editLink.dataset.produtoId}`;
        if (!temPermissao(cargo, 'produtos', 2)) {
            editLink.disabled = true;
            editLink.title = 'Sem permissão';
            editLink.style.cursor = 'not-allowed';
            editLink.style.opacity = '0.6';
        }
    }
    document.querySelectorAll('a[title="Editar"], .edit-icon, .btn-editar-produto').forEach(btn => {
        if (!temPermissao(cargo, 'produtos', 3)) {
            btn.disabled = true;
            btn.title = 'Sem permissão';
            btn.style.cursor = 'not-allowed';
            btn.style.opacity = '0.6';
        }
    });

    // Remover produto (excluir = 4)
    document.querySelectorAll('button.btn-remover-produto, button.trash-icon, button[title="Remover"]').forEach(btn => {
        if (!temPermissao(cargo, 'produtos', 4)) {
            btn.disabled = true;
            btn.title = 'Sem permissão';
            btn.style.cursor = 'not-allowed';
            btn.style.opacity = '0.6';
        }
    });

    // Movimentar produto (criar movimentação = 2)
    document.querySelectorAll('a[href="/movimentacoes"], a[href="/baixo-estoque"], a[href="/movimentar-produto"]').forEach(link => {
        if (!temPermissao(cargo, 'movimentacoes', 2)) {
            link.style.pointerEvents = 'none';
            link.title = 'Sem permissão';
        }
    });

    const btnMovimentar = document.getElementById('movimentar-produto');
    if (btnMovimentar && !temPermissao(cargo, 'movimentacoes', 2)) {
        btnMovimentar.style.pointerEvents = 'none';
        btnMovimentar.title = 'Sem permissão';
    }

    // Detalhes/histórico (visualizar movimentações = 1)
    document.querySelectorAll('.detalhes-historico-link').forEach(link => {
        if (!temPermissao(cargo, 'movimentacoes', 1)) {
            link.title = 'Sem permissão';
            link.style.pointerEvents = 'unset';
            link.style.cursor = 'not-allowed';
            link.style.color = '#757575';
            const icon = link.previousElementSibling;
            if (icon && icon.classList.contains('fa-clock-rotate-left')) {
                icon.style.color = '#757575';
            }
        }
    });
}

// -------- MOVIMENTACOES --------
async function aplicarPermissoesMovimentacoes() {
    const { usuario, cargo } = await getPermissoesUsuario();

    // Nova movimentação (criar = 2)
    const btnNovaMov = document.querySelector('button[onclick*="/movimentar-produto"]');
    if (btnNovaMov && !temPermissao(cargo, 'movimentacoes', 2)) {
        btnNovaMov.style.pointerEvents = 'none';
        btnNovaMov.style.opacity = '0.5';
        btnNovaMov.title = 'Sem permissão';
    }

    // Editar movimentação (editar = 3)
    document.querySelectorAll('.edit-icon, .btn-editar-movimentacao').forEach(btn => {
        if (!temPermissao(cargo, 'movimentacoes', 3)) {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
            btn.title = 'Sem permissão';
        }
    });

    // Remover movimentação (excluir = 4)
    document.querySelectorAll('.trash-icon, .btn-remover-movimentacao').forEach(btn => {
        if (!temPermissao(cargo, 'movimentacoes', 4)) {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
            btn.title = 'Sem permissão';
        }
    });
}

// -------- MOVIMENTAR PRODUTO --------
async function aplicarPermissoesMovimentarProduto() {
    const { usuario, cargo } = await getPermissoesUsuario();

    // Só permite acessar se tem permissão de criar movimentações
    if (!temPermissao(cargo, 'movimentacoes', 2)) {
        document.body.innerHTML = '<h2 style="color:red;text-align:center;">Sem permissão para registrar movimentações</h2>';
    }
}

// Exporte as funções para usar nos outros arquivos
window.aplicarPermissoesEstoque = aplicarPermissoesEstoque;
window.aplicarPermissoesMovimentacoes = aplicarPermissoesMovimentacoes;
window.aplicarPermissoesMovimentarProduto = aplicarPermissoesMovimentarProduto;