function confirmarSaida(event) {
    event.preventDefault();
    Swal.fire({
        title: 'Deseja realmente sair?',
        text: "Você será redirecionado para a página de Login",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#1E94A3',
        confirmButtonText: 'Sair',
        cancelButtonText: 'Voltar',
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: 'info',
                title: 'Desconectando sua conta...',
                text: 'Aguarde',
                allowOutsideClick: false,
                allowEscapeKey: false,
                timer: 1500,
                timerProgressBar: true,
                showConfirmButton: false,
                titleText: undefined,
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

            const bellIcon = document.querySelector('.fa-bell');
            if (bellIcon) {
                bellIcon.classList.add('fa-shake');
                setTimeout(() => {
                    bellIcon.classList.remove('fa-shake');
                }, 2500);
            }
        });
}



const bellIcon = document.querySelector('.fa-bell');
if (bellIcon) {
    bellIcon.classList.add('fa-shake');
    setTimeout(() => {
        bellIcon.classList.remove('fa-shake');
    }, 2500);

    bellIcon.addEventListener('mouseenter', () => {
        bellIcon.classList.add('fa-shake');
    });
    bellIcon.addEventListener('mouseleave', () => {
        bellIcon.classList.remove('fa-shake');
    });
}

function atualizarCardFornecedores() {
    fetch('/fornecedores')
        .then(res => res.json())
        .then(lista => {
            document.getElementById('valor-fornecedores').textContent = (Array.isArray(lista) && lista.length) ? lista.length : 0;
        })
        .catch(() => {
            document.getElementById('valor-fornecedores').textContent = 0;
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
    // fetch('/relatorios')
    //     .then(res => res.json())
    //     .then(lista => {
    //         document.getElementById('valor-relatorios').textContent = (Array.isArray(lista) && lista.length) ? lista.length : 0;
    //     })
    //     .catch(() => {
    //         document.getElementById('valor-relatorios').textContent = 0;
    //     });

    // Mostrar quantidade de relatórios do localStorage
    const relatorios = JSON.parse(localStorage.getItem('relatoriosGerados') || '[]');
    document.getElementById('valor-relatorios').textContent = Array.isArray(relatorios) ? relatorios.length : 0;
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

function atualizarCardMovimentacoes() {
    const promiseEntradas = fetch('/entradas/total-hoje')
        .then(res => res.json())
        .catch(() => 0);
    
    const promiseSaidas = fetch('/saidas/total-hoje')
        .then(res => res.json())
        .catch(() => 0);
    
    Promise.all([promiseEntradas, promiseSaidas])
        .then(([entradas, saidas]) => {
            const totalMovimentacoes = entradas + saidas;
            document.getElementById('valor-movimentacoes').textContent = totalMovimentacoes;
        })
        .catch(() => {
            document.getElementById('valor-movimentacoes').textContent = 0;
        });
}

function atualizarCardsInfo() {
    if (document.getElementById('valor-produtos-cadastrados')) {
        atualizarCardProdutos();
    }
    if (document.getElementById('valor-total-produtos')) {
        atualizarCardProdutos();
    }
    if (document.getElementById('valor-movimentacoes')) {
        atualizarCardMovimentacoes();
    }

    if (document.getElementById('valor-fornecedores')) {
        atualizarCardFornecedores();
    }
    if (document.getElementById('valor-funcionarios')) {
        atualizarCardFuncionarios();
    }
    if (document.getElementById('valor-relatorios')) {
        atualizarCardRelatorios();
    }
}
window.addEventListener('pageshow', function() {
    atualizarBadgeBaixoEstoque();
});

window.addEventListener('DOMContentLoaded', function () {
    atualizarCardsInfo();

    const cardTextMap = [
        {
            id: 'card-fornecedores',
            original: 'Gerenciar Fornecedores',
            hover: 'Total de<br>Fornecedores<br>'
        },
        {
            id: 'card-funcionarios',
            original: 'Gerenciar Funcionários',
            hover: 'Total de<br>Funcionários<br>'
        },
        {
            id: 'card-relatorios',
            original: 'Relatório de Desempenho',
            hover: 'Total de<br>Relatórios<br>'
        },
        {
            id: 'card-produtos-cadastrados',
            original: 'Cadastrar Produto',
            hover: 'Produtos<br>Cadastrados<br>'
        },
        {
            id: 'card-total-produtos',
            original: 'Acessar Estoque',
            hover: 'Total de<br>Produtos<br>'
        },
        {
            id: 'card-movimentacoes',
            original: 'Movimentações do Estoque',
            hover: 'Entradas e<br>Saídas Hoje<br>'
        }
    ];

    cardTextMap.forEach((cardInfo, idx) => {
        const card = document.getElementById(cardInfo.id);
        if (!card) return;
        const p = card.querySelector('p');
        const span = card.querySelector('span.card-value');
        const icon = card.querySelector('i');
        if (!p || !span) return;

        card.addEventListener('mouseenter', () => {
            p.innerHTML = cardInfo.hover;
            span.style.display = "inline";
            p.appendChild(span);
            if (idx === 0 && icon) {
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
            }
        });
        card.addEventListener('mouseleave', () => {
            setTimeout(() => {
                p.innerHTML = cardInfo.original + "<br>";
                span.style.display = "none";
                p.appendChild(span);
                if (idx === 0 && icon) {
                    icon.classList.remove('fa-solid');
                    icon.classList.add('fa-regular');
                }
            }, 1190);
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
        gearIcon.style.fontSize = '15px';

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
    ajustarLayoutCards();
});



document.querySelectorAll('.card').forEach(card => {
    let animTimeout = null;
    card.addEventListener('mouseenter', () => {
        if (animTimeout) {
            clearTimeout(animTimeout);
            animTimeout = null;
        }
        card.classList.add('card-animating');
    });
    card.addEventListener('mouseleave', () => {
        animTimeout = setTimeout(() => {
            card.classList.remove('card-animating');
            animTimeout = null;
        }, 1200);
    });
});


document.addEventListener('DOMContentLoaded', function() {
    // Para fornecedores
    if (!window.cargoUsuario || window.cargoUsuario.fornecedores < 1) {
        document.getElementById('card-fornecedores').style.display = 'none';
    }
    // Para funcionários
    if (!window.cargoUsuario || window.cargoUsuario.funcionarios < 1) {
        document.getElementById('card-funcionarios').style.display = 'none';
    }
    // Para relatórios
    if (!window.cargoUsuario || window.cargoUsuario.relatorios < 1) {
        document.getElementById('card-relatorios').style.display = 'none';
    }
    // Para cadastrar produto
    if (!window.cargoUsuario || window.cargoUsuario.produtos < 2) {
        document.getElementById('card-produtos-cadastrados').style.display = 'none';
    }
    // Para acessar estoque
    if (!window.cargoUsuario || window.cargoUsuario.produtos < 1) {
        document.getElementById('card-total-produtos').style.display = 'none';
    }
    // Para movimentações
    if (!window.cargoUsuario || window.cargoUsuario.movimentacoes < 1) {
        document.getElementById('card-movimentacoes').style.display = 'none';
    }
});


function ajustarLayoutCards() {
    const container = document.querySelector('.container');
    if (!container) return;
    const total = Array.from(container.querySelectorAll('.card'))
        .filter(card => card.style.display !== 'none').length;
    container.classList.remove(
        'cards-1', 'cards-2', 'cards-3', 'cards-4', 'cards-5', 'cards-6'
    );
    container.classList.add(`cards-${total}`);
}

document.addEventListener('DOMContentLoaded', ajustarLayoutCards);


function montarCards5(cards) {
    const container = document.querySelector('.container');
    container.innerHTML = '';
    container.className = 'container cards-5';

    const row1 = document.createElement('div');
    row1.className = 'cards-row top';
    row1.appendChild(cards[0]);
    row1.appendChild(cards[1]);
    row1.appendChild(cards[2]);

    const row2 = document.createElement('div');
    row2.className = 'cards-row bottom';
    row2.appendChild(cards[3]);
    row2.appendChild(cards[4]);

    container.appendChild(row1);
    container.appendChild(row2);
}