function confirmarSaida(event) {
    event.preventDefault();
    Swal.fire({
        title: 'Deseja realmente sair?',
        text: "Você será redirecionado para a página de login",
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
                title: 'Desconectando sua conta',
                text: 'Aguarde...',
                allowOutsideClick: false,
                allowEscapeKey: false,
                timer: 1500,
                timerProgressBar: true,
                showConfirmButton: false,
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
        });}

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
let usuarioLogado = null;
document.addEventListener('DOMContentLoaded', function() {
    // Tenta obter o id do usuário logado a partir do campo hidden ou do DOM
    let usuarioId = null;
    const inputId = document.getElementById('usuario-id');
    if (inputId && inputId.value) {
        usuarioId = inputId.value;
    } else {
        // Alternativa: buscar pelo atributo data-usuario-id
        const dataDiv = document.querySelector('[data-usuario-id]');
        if (dataDiv && dataDiv.getAttribute('data-usuario-id')) {
            usuarioId = dataDiv.getAttribute('data-usuario-id');
        }
    }
    if (!usuarioId) {
        console.error('[DEBUG] Não foi possível obter o id do usuário logado do DOM.');
        return;
    }
    fetch(`/usuarios/${usuarioId}`)
        .then(res => res.json())
        .then(usuario => {
            if (!usuario) return;
            usuarioLogado = usuario;
        })
        .catch(err => {
            console.error('[DEBUG] Erro ao buscar usuarioLogado:', err);
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

document.addEventListener('DOMContentLoaded', function() {
    const btnRedefinir = document.getElementById('btn-redefinir-senha');
    const senhaFields = document.getElementById('senha-fields');
    const form = document.querySelector('.form-container');

    if (btnRedefinir && senhaFields) {
        btnRedefinir.addEventListener('click', function() {
            senhaFields.style.display = senhaFields.style.display === 'none' ? 'flex' : 'none';
            if (senhaFields.style.display === 'flex') {
                btnRedefinir.textContent = 'Fechar';
                btnRedefinir.style.backgroundColor = '#fff';
                btnRedefinir.style.color = '#1e94a3';
                btnRedefinir.style.border = '1px solid #1e94a3';
            } else {
                btnRedefinir.textContent = 'Redefinir';
                btnRedefinir.style.backgroundColor = '';
                btnRedefinir.style.color = '';
                btnRedefinir.style.border = '';
                senhaFields.querySelectorAll('input').forEach(i => i.value = '');
            }
        });
    }

    const senhaAtualInput = document.getElementById('senha-atual');
    if (senhaAtualInput) {
        senhaAtualInput.addEventListener('blur', function() {
            const senhaAtual = senhaAtualInput.value || '';
            if (!senhaAtual) return;
            if (!usuarioLogado || !usuarioLogado.id) {
                console.error('[DEBUG] usuarioLogado ou usuarioLogado.id indefinido ao tentar validar senha:', usuarioLogado);
                senhaAtualInput.dataset.valida = 'false';
                senhaAtualInput.style.borderColor = '#f27474';
                Swal.fire('Erro', 'Usuário não carregado. Tente novamente em instantes.', 'error');
                return;
            }
            const usuarioId = usuarioLogado.id;

            fetch(`/usuarios/${usuarioId}/validar-senha`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senha: senhaAtual })
            })
            .then(res => res.json())
            .then(data => {
                if (data && data.valida) {
                    senhaAtualInput.dataset.valida = 'true';
                    senhaAtualInput.style.border = '2px solid #43b04a';
                } else {
                    senhaAtualInput.dataset.valida = 'false';
                    senhaAtualInput.style.border = '2px solid #f27474';
                    Swal.fire({
                        title: 'Erro',
                        text: 'Senha atual incorreta',
                        icon: 'error',
                        showConfirmButton: false,
                        timer: 1000,
                        timerProgressBar: true
                    });
                }
            })
            .catch((err) => {
                console.error('[DEBUG] Erro ao validar senha:', err);
                senhaAtualInput.dataset.valida = 'false';
                senhaAtualInput.style.border = '2px solid #f27474';
                Swal.fire({
                    title: 'Erro',
                    text: 'Erro ao validar senha no servidor',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true
                });
            });
        });
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            if (senhaFields.style.display === 'flex') {
                const atual = document.getElementById('senha-atual').value;
                const nova = document.getElementById('nova-senha').value;
                const confirmar = document.getElementById('confirmar-nova-senha').value;

                if (!atual || !nova || !confirmar) {
                    e.preventDefault();
                    Swal.fire({
                        title: 'Atenção',
                        text: 'Preencha todos os campos obrigatórios',
                        icon: 'warning',
                        showConfirmButton: false,
                        timer: 1000,
                        timerProgressBar: true
                    });
                    return;
                }
                if (nova === atual) {
                    e.preventDefault();
                    Swal.fire({
                        title: 'Atenção',
                        text: 'A nova senha deve ser diferente da atual',
                        icon: 'warning',
                        showConfirmButton: false,
                        timer: 1000,
                        timerProgressBar: true
                    });
                    return;
                }
                if (nova !== confirmar) {
                    e.preventDefault();
                    Swal.fire({
                        title: 'Atenção',
                        text: 'As senhas não coincidem. Ambas devem ser iguais',
                        icon: 'warning',
                        showConfirmButton: false,
                        timer: 1200,
                        timerProgressBar: true
                    });
                    return;
                }
                if (document.getElementById('senha-atual').dataset.valida !== 'true') {
                    e.preventDefault();
                    Swal.fire({
                        title: 'Atenção',
                        text: 'Confirme a senha atual correta',
                        icon: 'warning',
                        showConfirmButton: false,
                        timer: 1000,
                        timerProgressBar: true
                    });
                    return;
                }
                e.preventDefault();
                const usuarioId = usuarioLogado?.id;
                if (!usuarioId) {
                    Swal.fire('Erro', 'ID do usuário não encontrado.', 'error');
                    return;
                }
                fetch(`/usuarios/${usuarioId}/senha`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ senha: nova })
                })
                .then(res => {
                    if (res.ok) {
                        Swal.fire({
                            title: 'Sucesso!',
                            text: 'Sua senha foi atualizada',
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 1000,
                            timerProgressBar: true
                        });
                        fetch(`/usuarios/${usuarioId}`)
                            .then(res => res.json())
                            .then(usuarioAtualizado => {
                                usuarioLogado = usuarioAtualizado;
                                const campoSenha = document.getElementById('senha');
                                if (campoSenha && usuarioAtualizado && usuarioAtualizado.senha) {
                                    campoSenha.value = usuarioAtualizado.senha;
                                }
                            });
                        const btnRedefinir = document.getElementById('btn-redefinir-senha');
                        if (btnRedefinir) {
                            btnRedefinir.textContent = 'Redefinir senha';
                            btnRedefinir.style.backgroundColor = '';
                            btnRedefinir.style.color = '';
                            btnRedefinir.style.border = '';
                        }
                        ['senha-atual', 'nova-senha', 'confirmar-nova-senha'].forEach(id => {
                            const input = document.getElementById(id);
                            if (input) {
                                input.style.border = '';
                                input.type = 'password';
                                const icon = document.getElementById('icon-' + id);
                                if (icon) {
                                    icon.classList.remove('fa-eye');
                                    icon.classList.add('fa-eye-slash');
                                }
                            }
                        });
                        senhaFields.style.display = 'none';
                        form.reset();
                    } else {
                        Swal.fire('Erro', 'Não foi possível atualizar a senha.', 'error');
                    }
                })
                .catch((err) => {
                    console.error('[DEBUG] Erro no fetch PUT /usuarios/{id}/senha:', err);
                    Swal.fire('Erro', 'Erro de conexão ao atualizar senha.', 'error');
                });
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', atualizarBadgeBaixoEstoque);