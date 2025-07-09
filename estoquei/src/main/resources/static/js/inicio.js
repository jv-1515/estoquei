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
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Desconectando sua conta...',
                text: 'Aguarde',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            setTimeout(() => {
                window.location.href = '/admin/logout';
            }, 1500);
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
            if (qtd < 0) {
                const bellIcon = document.querySelector('.fa-regular.fa-bell');
                const notification = document.querySelector('.notification');
                const nots = document.getElementById('nots');
                if (bellIcon && notification && nots) {
                    bellIcon.style.display = 'none';
                    notification.style.display = 'none';
                    nots.style.display = 'none';
                }
                return;
            }

            badge.textContent = qtd > 99 ? '99+' : qtd;
            badge.removeAttribute('style');
            badge.style.display = 'inline-block';

            if (qtd < 10) {
                badge.style.padding = '3px 6px';

            } else if (qtd < 99) {
                badge.style.padding = '3px';

            } else if (qtd > 99) {
                badge.style.padding = '5px 0px 3px 2px';
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

document.addEventListener('DOMContentLoaded', function() {
    // Avatar flutuante
    const h1 = document.querySelector('h1');
    const avatarDiv = document.getElementById('user-avatar-float');
    const avatarCircle = document.getElementById('avatar-circle');
    const avatarNome = document.getElementById('avatar-nome');
    const avatarTipo = document.getElementById('avatar-tipo');

    let nome = '';
    if (h1) {
        nome = h1.textContent.trim();
        nome = nome.substring(4).trim();
        // Atualiza h1 para primeiro e último nome
        const nomes = nome.split(/\s+/);
        let nomeFormatado = nomes[0];
        if (nomes.length > 1) {
            nomeFormatado += ' ' + nomes[nomes.length - 1];
        }
        h1.textContent = 'Olá, ' + nomeFormatado + '!';
    }

    // Avatar: iniciais
    if (avatarCircle && nome) {
        const partes = nome.trim().split(/\s+/);
        let iniciais = '';
        if (partes.length === 1) {
            iniciais = partes[0][0].toUpperCase();
        } else if (partes.length > 1) {
            iniciais = (partes[0][0] + partes[partes.length-1][0]).toUpperCase();
        }
        avatarCircle.textContent = iniciais;
        // Cor pastel baseada no nome
        let hash = 0;
        for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
        const h = Math.abs(hash) % 360;
        avatarCircle.style.background = `hsl(${h}, 60%, 80%)`;

        // Hover: troca iniciais por engrenagem girando
        let gearIcon = document.createElement('i');
        gearIcon.className = 'fa-solid fa-gear';
        gearIcon.style.transition = 'transform 0.4s';
        gearIcon.style.display = 'none';

        avatarCircle.appendChild(gearIcon);

        avatarDiv.addEventListener('mouseenter', () => {
            avatarCircle.textContent = '';
            avatarCircle.appendChild(gearIcon);
            gearIcon.style.display = 'inline-block';
            setTimeout(() => {
                gearIcon.style.transform = 'rotate(30deg)';
            }, 10);
        });

        avatarDiv.addEventListener('mouseleave', () => {
            gearIcon.style.transform = 'rotate(0deg)';
            gearIcon.style.display = 'none';
            avatarCircle.textContent = iniciais;
            avatarCircle.appendChild(gearIcon);
        });
    }
    // Nome e tipo
    if (avatarNome && nome) {
        avatarNome.textContent = nome;
    }
    if (avatarTipo) {
        // Tenta pegar o tipo do backend (se disponível via Thymeleaf)
        let tipo = avatarTipo.textContent;
        avatarTipo.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
    }
});

document.querySelectorAll('.card').forEach(card => {
    let timeouts = [];
    let animating = false;
    card.addEventListener('mouseenter', function () {
        // Limpa timeouts antigos
        timeouts.forEach(t => clearTimeout(t));
        timeouts = [];
        card.classList.add('card-reveal-gradient');
        card.classList.remove('filled','cena2','cena3','cena4','cena5','cena6','cena7','cena8','saida1','saida2','saida3','saida4','saida5','saida6','saida7','saida8','texto-branco');
        animating = true;
        // Sequência de "cenas" sincronizada
        timeouts.push(setTimeout(() => card.classList.add('cena2'), 60));
        timeouts.push(setTimeout(() => card.classList.add('cena3'), 120));
        timeouts.push(setTimeout(() => card.classList.add('cena4'), 200));
        timeouts.push(setTimeout(() => card.classList.add('cena5'), 300));
        timeouts.push(setTimeout(() => card.classList.add('cena6'), 400));
        // Só aqui o texto fica branco
        timeouts.push(setTimeout(() => card.classList.add('texto-branco'), 420));
        timeouts.push(setTimeout(() => card.classList.add('cena7'), 500));
        timeouts.push(setTimeout(() => card.classList.add('cena8'), 650));
        timeouts.push(setTimeout(() => card.classList.add('filled'), 800));
        timeouts.push(setTimeout(() => {
            card.classList.remove('cena2','cena3','cena4','cena5','cena6','cena7','cena8');
            animating = false;
        }, 1200));
    });
    card.addEventListener('mouseleave', function () {
        // Não interrompe a animação de entrada: só remove as classes depois que ela terminar
        if (animating) {
            // Sequência de saída: degrade branco "voltando"
            card.classList.remove('filled');
            let saidaTimeouts = [];
            saidaTimeouts.push(setTimeout(() => card.classList.add('saida8'), 60));
            saidaTimeouts.push(setTimeout(() => { card.classList.remove('saida8'); card.classList.add('saida7'); }, 120));
            saidaTimeouts.push(setTimeout(() => { card.classList.remove('saida7'); card.classList.add('saida6'); }, 200));
            saidaTimeouts.push(setTimeout(() => { card.classList.remove('saida6'); card.classList.add('saida5'); }, 300));
            saidaTimeouts.push(setTimeout(() => { card.classList.remove('saida5'); card.classList.add('saida4'); card.classList.remove('texto-branco'); }, 400));
            saidaTimeouts.push(setTimeout(() => { card.classList.remove('saida4'); card.classList.add('saida3'); }, 500));
            saidaTimeouts.push(setTimeout(() => { card.classList.remove('saida3'); card.classList.add('saida2'); }, 650));
            saidaTimeouts.push(setTimeout(() => { card.classList.remove('saida2'); card.classList.add('saida1'); }, 800));
            saidaTimeouts.push(setTimeout(() => {
                card.classList.remove('saida1', 'card-reveal-gradient');
                card.classList.remove('cena2','cena3','cena4','cena5','cena6','cena7','cena8','texto-branco');
                // Garante fundo branco puro ao final
                card.style.background = '';
            }, 1200));
            timeouts = timeouts.concat(saidaTimeouts);
        } else {
            card.classList.remove('card-reveal-gradient','filled','cena2','cena3','cena4','cena5','cena6','cena7','cena8','saida1','saida2','saida3','saida4','saida5','saida6','saida7','saida8','texto-branco');
            card.style.background = '';
        }
    });
});