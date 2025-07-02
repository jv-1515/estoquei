function confirmarSaida(event) {
    event.preventDefault();
    Swal.fire({
        title: 'Deseja realmente sair?',
        text: "Você será redirecionado para a página de login.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#1E94A3',
        confirmButtonText: 'Sair',
        cancelButtonText: 'Voltar',
        position: 'top-end',
        customClass: {
            popup: 'swal2-popup-right'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = '/admin/logout';
        }
    });
}


function atualizarBadgeBaixoEstoque() {
    const badge = document.querySelector('.badge');
    if (!badge) return;

    badge.style.display = 'none';

    fetch('/produtos/baixo-estoque')
        .then(res => res.json())
        .then(produtos => {
            const qtd = produtos.length;
            if (qtd <= 0) return;

            badge.textContent = qtd > 98 ? '99+' : qtd;
            badge.removeAttribute('style');
            badge.style.display = 'inline-block';

            if (qtd > 98) {
                badge.style.padding = '6px 4px';
                badge.style.fontSize = '8px';
            } else if (qtd > 9) {
                badge.style.padding = '6px 6px';
                badge.style.fontSize = '10px';
            }
        });
}

function atualizarCardFuncionarios() {
    fetch('/usuarios')
        .then(res => res.json())
        .then(lista => {
            document.getElementById('valor-funcionarios').textContent = (Array.isArray(lista) && lista.length) ? lista.length : 0;
        })
        .catch(() => {
            document.getElementById('valor-funcionarios').textContent = 0;
        });
}

function atualizarCardRelatorios() {
    fetch('/relatorios')
        .then(res => res.json())
        .then(lista => {
            document.getElementById('valor-relatorios').textContent = (Array.isArray(lista) && lista.length) ? lista.length : 0;
        })
        .catch(() => {
            document.getElementById('valor-relatorios').textContent = 0;
        });
}

function atualizarCardProdutos() {
    fetch('/produtos')
        .then(res => res.json())
        .then(produtos => {
            document.getElementById('valor-produtos-cadastrados').textContent = (Array.isArray(produtos) && produtos.length) ? produtos.length : 0;
            const total = Array.isArray(produtos)
                ? produtos.reduce((soma, p) => soma + (Number(p.quantidade) || 0), 0)
                : 0;
            document.getElementById('valor-total-produtos').textContent = total;
        })
        .catch(() => {
            document.getElementById('valor-produtos-cadastrados').textContent = 0;
            document.getElementById('valor-total-produtos').textContent = 0;
        });
}

// Chame esta função para atualizar todos os cards de uma vez
function atualizarCardsInfo() {
    atualizarCardFuncionarios();
    atualizarCardRelatorios();
    atualizarCardProdutos();

    document.getElementById('valor-fornecedores').textContent = 0;
    document.getElementById('valor-movimentacoes').textContent = 0;
}

window.addEventListener('pageshow', function() {
    atualizarBadgeBaixoEstoque();
});

window.addEventListener('DOMContentLoaded', function () {
    atualizarCardsInfo();

    const cards = document.querySelectorAll('.container .card');
    const originalTexts = [
        "Gerenciar Fornecedores",
        "Gerenciar Funcionários",
        "Relatório de Desempenho",
        "Cadastrar Produto",
        "Acessar Estoque",
        "Registrar Movimentação"
    ];
    const hoverTitles = [
        "Total de<br>Fornecedores<br>",
        "Total de<br>Funcionários<br>",
        "Total de<br>Relatórios<br>",
        "Produtos<br>Cadastrados<br>",
        "Total de<br>Produtos<br>",
        "Entradas e<br>Saídas Hoje<br>"
    ];
    const spanIds = [
        "valor-fornecedores",
        "valor-funcionarios",
        "valor-relatorios",
        "valor-produtos-cadastrados",
        "valor-total-produtos",
        "valor-movimentacoes"
    ];

    cards.forEach((card, idx) => {
        const p = card.querySelector('p');
        const span = card.querySelector('span.card-value');
        const icon = card.querySelector('i');
        if (!p || !span) return;

        card.addEventListener('mouseenter', () => {
            p.innerHTML = hoverTitles[idx];
            span.style.display = "inline";
            p.appendChild(span);

            if (idx === 0 && icon) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
            }
        });

        card.addEventListener('mouseleave', () => {
            p.innerHTML = originalTexts[idx] + "<br>";
            span.style.display = "none";
            p.appendChild(span);

            // Volta o ícone só no card de fornecedores
            if (idx === 0 && icon) {
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
            }
        });
    });
});