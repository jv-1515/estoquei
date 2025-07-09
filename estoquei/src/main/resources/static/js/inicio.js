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

            if (idx === 0 && icon) {
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const h1 = document.querySelector('h1');
    const avatarDiv = document.getElementById('user-avatar-float');
    const avatarCircle = document.getElementById('avatar-circle');
    const avatarNome = document.getElementById('avatar-nome');
    const avatarTipo = document.getElementById('avatar-tipo');

    let nome = '';
    if (h1) {
        nome = h1.textContent.trim();
        nome = nome.substring(4).trim();

        const nomes = nome.split(/\s+/);
        let nomeFormatado = nomes[0];
        if (nomes.length > 1) {
            nomeFormatado += ' ' + nomes[nomes.length - 1];
        }
        h1.textContent = 'Olá, ' + nomeFormatado + '!';
    }

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
    if (avatarNome && nome) {
        avatarNome.textContent = nome;
    }
    if (avatarTipo) {
        let tipo = avatarTipo.textContent;
        avatarTipo.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
    }
});



document.querySelectorAll('.card').forEach(card => {
    card._timeouts = [];
    card._animating = false;
    card._mouseOver = false;
    card._saidaTimeout = null;

    function clearAllTimeouts(card) {
        if (card._timeouts && card._timeouts.length) {
            card._timeouts.forEach(t => clearTimeout(t));
            card._timeouts = [];
        }
        if (card._saidaTimeout) {
            clearTimeout(card._saidaTimeout);
            card._saidaTimeout = null;
        }
    }

    function resetCardState(card) {
        card.classList.remove(
            'cena2','cena3','cena4','cena5','cena6','cena7','cena8',
            'saida1','saida2','saida3','saida4','saida5','saida6','saida7','saida8'
        );

        const p = card.querySelector('p');
        const i = card.querySelector('i');
        const span = card.querySelector('span.card-value');
        if (p) p.style.color = '';
        if (i) i.style.color = '';
        if (span) span.style.color = '';
    }

    function setTextWhite(card) {
        const p = card.querySelector('p');
        const i = card.querySelector('i');
        const span = card.querySelector('span.card-value');
        if (p) p.style.color = '#fff';
        if (i) i.style.color = '#fff';
        if (span) span.style.color = '#fff';
    }
    function setTextDefault(card) {
        const p = card.querySelector('p');
        const i = card.querySelector('i');
        const span = card.querySelector('span.card-value');
        if (p) p.style.color = '';
        if (i) i.style.color = '';
        if (span) span.style.color = '';
    }

    card.addEventListener('mouseenter', function () {
        card._mouseOver = true;

        if (card._saidaTimeout) {
            clearTimeout(card._saidaTimeout);
            card._saidaTimeout = null;
        }
        if (card._animating) return; 
        clearAllTimeouts(card);
        resetCardState(card);
        card.classList.add('card-reveal-gradient');
        card._animating = true;
        setTextWhite(card);
        card._timeouts.push(setTimeout(() => card.classList.add('cena2'), 60));
        card._timeouts.push(setTimeout(() => card.classList.add('cena3'), 120));
        card._timeouts.push(setTimeout(() => card.classList.add('cena4'), 200));
        card._timeouts.push(setTimeout(() => card.classList.add('cena5'), 300));
        card._timeouts.push(setTimeout(() => card.classList.add('cena6'), 400));
        card._timeouts.push(setTimeout(() => card.classList.add('cena7'), 500));
        card._timeouts.push(setTimeout(() => card.classList.add('cena8'), 650));
        card._timeouts.push(setTimeout(() => card.classList.add('filled'), 800));
        card._timeouts.push(setTimeout(() => {
            card.classList.remove('cena2','cena3','cena4','cena5','cena6','cena7','cena8');
            card._animating = false;

            if (!card._mouseOver) {
                card.dispatchEvent(new Event('mouseleave'));
            }
        }, 1500));
    });

    card.addEventListener('mouseleave', function () {
        card._mouseOver = false;
        if (card._animating) return; // nao interrompe animação em andamento

        card._saidaTimeout = setTimeout(() => {
            card._saidaTimeout = null;
            clearAllTimeouts(card);
            resetCardState(card);
            card.classList.add('card-reveal-gradient');
            card.classList.add('filled');
            setTextWhite(card);
            card._animating = true;
            card._timeouts.push(setTimeout(() => {
                card.classList.remove('cena2','cena3','cena4','cena5','cena6','cena7','cena8');
                setTextDefault(card);
                //reversa
                card._timeouts.push(setTimeout(() => card.classList.add('saida8'), 60));
                card._timeouts.push(setTimeout(() => { card.classList.remove('saida8'); card.classList.add('saida7'); card.classList.add('cena8'); }, 120));
                card._timeouts.push(setTimeout(() => { card.classList.remove('saida7'); card.classList.add('saida6'); card.classList.add('cena7'); }, 200));
                card._timeouts.push(setTimeout(() => { card.classList.remove('saida6'); card.classList.add('saida5'); card.classList.add('cena6'); }, 300));
                card._timeouts.push(setTimeout(() => { card.classList.remove('saida5'); card.classList.add('saida4'); }, 400));
                card._timeouts.push(setTimeout(() => { card.classList.remove('saida4'); card.classList.add('saida3'); }, 500));
                card._timeouts.push(setTimeout(() => { card.classList.remove('saida3'); card.classList.add('saida2'); }, 650));
                card._timeouts.push(setTimeout(() => { card.classList.remove('saida2'); card.classList.add('saida1'); }, 800));
                card._timeouts.push(setTimeout(() => {
                card.classList.remove('saida1','card-reveal-gradient','filled');
                card.classList.remove('cena2','cena3','cena4','cena5','cena6','cena7','cena8',
                    'saida2','saida3','saida4','saida5','saida6','saida7','saida8');
                setTextDefault(card);
                card._animating = false;

                if (card._mouseOver) {
                    card.classList.add('card-reveal-gradient','filled');
                    setTextWhite(card);
                }
            }, 900));
            }, 1500));
        }, 1500);
    });
});