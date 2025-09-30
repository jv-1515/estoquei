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
            editLink.removeAttribute('href');
            editLink.title = 'Sem permissão';
            editLink.style.cursor = 'not-allowed';
            editLink.style.opacity = '0.6';
        }
    }
    document.querySelectorAll('a[title="Editar"], .edit-icon, .btn-editar-produto').forEach(btn => {
        if (!temPermissao(cargo, 'produtos', 3)) {
            btn.disabled = true;
            btn.removeAttribute('href');
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


    // Links de movimentações, baixo-estoque, movimentar-produto (cards)
    document.querySelectorAll('a[href="/movimentacoes"], a[href="/baixo-estoque"], a[href="/movimentar-produto"]').forEach(link => {
        if (!temPermissao(cargo, 'movimentacoes', 2)) {
            link.style.pointerEvents = 'none';
            link.title = 'Sem permissão';
        }
    });

    // Link de cadastrar produto (card)
    document.querySelectorAll('a[href="/cadastrar-produto"]').forEach(link => {
        if (!temPermissao(cargo, 'produtos', 2)) {
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
            link.removeAttribute('href');
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


    // controle movimentar o produto
    document.querySelectorAll('a[title="Abastecer produto"]').forEach(triangulo => {
        if (!temPermissao(cargo, 'movimentacoes', 2)) {
            triangulo.removeAttribute('href');
            triangulo.removeAttribute('title');
            triangulo.style.cursor = 'default';
        }
    });

    // sino (baixo-estoque) - só aparece se tem permissão de movimentações nível 2
        const notsDiv = document.getElementById('nots');
        if (notsDiv && temPermissao(cargo, 'movimentacoes', 2)) {
            notsDiv.style.display = 'flex';
        }

        const lixeiraDiv = document.getElementById('lixeira');
        if (lixeiraDiv) {
            lixeiraDiv.style.display = 'none'; // sempre começa escondida
            if (temPermissao(cargo, 'produtos', 4) && cargo.id < 2) {
                fetch('/produtos/removidos')
                    .then(res => res.json())
                    .then(removidos => {
                        if (removidos && removidos.length > 0) {
                            lixeiraDiv.style.display = 'flex';
                        } else {
                            lixeiraDiv.style.display = 'none';
                        }
                    });
            }
        }
}

// -------- MOVIMENTACOES --------
async function aplicarPermissoesMovimentacoes() {
    const { usuario, cargo } = await getPermissoesUsuario();

    // Nova movimentação (criar = 2)
    const btnNovaMov = document.querySelector('button[onclick*="/movimentar-produto"]');
    if (btnNovaMov && !temPermissao(cargo, 'movimentacoes', 2)) {
        btnNovaMov.disabled = true;
        btnNovaMov.title = 'Sem permissão';
        btnNovaMov.style.cursor = 'not-allowed';
        btnNovaMov.style.backgroundColor = '#aaa';
    }

    // Editar movimentação (editar = 3)
    document.querySelectorAll('button[title="Editar"]').forEach(btn => {
        if (!temPermissao(cargo, 'movimentacoes', 3)) {
            btn.disabled = true;
            btn.title = 'Sem permissão';
            btn.style.cursor = 'not-allowed';
            btn.style.opacity = '0.6';
        }
    });
    
    // Excluir movimentação (excluir = 4)
    document.querySelectorAll('button[title="Excluir"]').forEach(btn => {
        if (!temPermissao(cargo, 'movimentacoes', 4)) {
            btn.disabled = true;
            btn.title = 'Sem permissão';
            btn.style.cursor = 'not-allowed';
            btn.style.opacity = '0.6';
        }
    });



    // Sino (baixo-estoque) - só aparece se tem permissão de movimentações nível 2
    const notsDiv = document.getElementById('nots');
    if (notsDiv) {
        if (!temPermissao(cargo, 'movimentacoes', 2)) {
            notsDiv.style.display = 'none';
        } else {
            notsDiv.style.display = 'flex';
        }
    }

}

// -------- MOVIMENTAR PRODUTO --------
async function aplicarPermissoesMovimentarProduto() {

    //sino
    const notsDiv = document.getElementById('nots');
    if (notsDiv) {
        if (!temPermissao(cargo, 'movimentacoes', 2)) {
            notsDiv.style.display = 'none';
        } else {
            notsDiv.style.display = 'flex';
        }
    }
}


// Inicio
async function aplicarPermissoesInicio() {
    // Obtenha o cargo do usuário (pode usar window.cargoUsuario se já está disponível)
    let cargo = window.cargoUsuario;
    if (!cargo) {
        // Se não existir, tente buscar via API
        const res = await fetch('/usuarios/usuario-logado');
        if (res.ok) {
            const usuario = await res.json();
            cargo = usuario.cargo;
        }
    }
    const notsDiv = document.getElementById('nots');
    if (notsDiv) {
        if (!temPermissao(cargo, 'movimentacoes', 2)) {
            notsDiv.style.display = 'none';
        } else {
            notsDiv.style.display = 'flex';
        }
    }
}


// Infos Usuario
async function aplicarPermissoesInfosUsuario() {
    // Obtenha o cargo do usuário
    const res = await fetch('/usuarios/usuario-logado');
    let cargo = null;
    if (res.ok) {
        const usuario = await res.json();
        cargo = usuario.cargo;
    }
    const notsDiv = document.getElementById('nots');
    if (notsDiv) {
        if (!temPermissao(cargo, 'movimentacoes', 2)) {
            notsDiv.style.display = 'none';
        } else {
            notsDiv.style.display = 'flex';
        }
    }
}


// -------- RELATÓRIOS --------
async function aplicarPermissoesRelatorios() {
    const { usuario, cargo } = await getPermissoesUsuario();

    // gerar relatório (nível 2)
    const btnNovoRelatorio = document.getElementById('btn-gerar-busca');
    if (btnNovoRelatorio && !temPermissao(cargo, 'relatorios', 2)) {
        btnNovoRelatorio.disabled = true;
        btnNovoRelatorio.title = 'Sem permissão';
        btnNovoRelatorio.style.cursor = 'not-allowed';
        btnNovoRelatorio.style.backgroundColor = '#aaa';
    }

    // Renomear relatório (nível 3)
    document.querySelectorAll('a[title="Renomear"]').forEach(link => {
        if (!temPermissao(cargo, 'relatorios', 3)) {
            link.removeAttribute('onclick');
            link.removeAttribute('href');
            link.title = 'Sem permissão';
            link.style.cursor = 'not-allowed';
            link.style.opacity = '0.6';
        }
    });

    // Remover relatório (nível 4)
    document.querySelectorAll('a[title="Excluir"]').forEach(link => {
        if (!temPermissao(cargo, 'relatorios', 4)) {
            link.removeAttribute('onclick');
            link.removeAttribute('href');
            link.title = 'Sem permissão';
            link.style.cursor = 'not-allowed';
            link.style.opacity = '0.6';
        }
    });
}


// -------- FORNECEDORES --------
async function aplicarPermissoesFornecedores() {
    const { usuario, cargo } = await getPermissoesUsuario();

    // Cadastrar fornecedor (criar = 2)
    const btnCadastrar = document.getElementById('btn-novo-fornecedor');
    if (btnCadastrar && !temPermissao(cargo, 'fornecedores', 2)) {
        btnCadastrar.disabled = true;
        btnCadastrar.title = 'Sem permissão';
        btnCadastrar.style.cursor = 'not-allowed';
        btnCadastrar.style.backgroundColor = '#aaa';
    }

    // Editar fornecedor (editar = 3)
    document.querySelectorAll('a[title="Editar"], button[title="Editar"]').forEach(btn => {
        if (!temPermissao(cargo, 'fornecedores', 3)) {
            btn.disabled = true;
            btn.removeAttribute('onclick');
            btn.removeAttribute('href');
            btn.title = 'Sem permissão';
            btn.style.cursor = 'not-allowed';
            btn.style.opacity = '0.6';
        }
    });

    // Remover fornecedor (excluir = 4)
    document.querySelectorAll('button[title="Excluir"], button[title="Remover"], a[title="Excluir"], a[title="Remover"]').forEach(btn => {
        if (!temPermissao(cargo, 'fornecedores', 4)) {
            btn.disabled = true;
            btn.removeAttribute('onclick');
            btn.removeAttribute('href');
            btn.title = 'Sem permissão';
            btn.style.cursor = 'not-allowed';
            btn.style.opacity = '0.6';
        }
    });
}


// funções para usar nos outros arquivos
window.aplicarPermissoesEstoque = aplicarPermissoesEstoque;
window.aplicarPermissoesMovimentacoes = aplicarPermissoesMovimentacoes;
window.aplicarPermissoesMovimentarProduto = aplicarPermissoesMovimentarProduto;
window.aplicarPermissoesInicio = aplicarPermissoesInicio;
window.aplicarPermissoesInfosUsuario = aplicarPermissoesInfosUsuario;
window.aplicarPermissoesRelatorios = aplicarPermissoesRelatorios;
window.aplicarPermissoesFornecedores = aplicarPermissoesFornecedores;