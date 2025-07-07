// Aplica a mesma lógica de cor pastel do avatar da home para o avatar do infos_usuario
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
// Lógica para redefinir senha na tela de informações do usuário

document.addEventListener('DOMContentLoaded', function() {
    const btnRedefinir = document.getElementById('btn-redefinir-senha');
    const senhaFields = document.getElementById('senha-fields');
    const form = document.querySelector('.form-container');

    if (btnRedefinir && senhaFields) {
        btnRedefinir.addEventListener('click', function() {
            senhaFields.style.display = senhaFields.style.display === 'none' ? 'flex' : 'none';
            if (senhaFields.style.display === 'flex') {
                btnRedefinir.textContent = 'Cancelar';
            } else {
                btnRedefinir.textContent = 'Redefinir senha';
                // Limpa os campos
                senhaFields.querySelectorAll('input').forEach(i => i.value = '');
            }
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
                    Swal.fire('Atenção', 'Preencha todos os campos de senha.', 'warning');
                    return;
                }
                if (nova.length < 8) {
                    e.preventDefault();
                    Swal.fire('Atenção', 'A nova senha deve ter pelo menos 8 caracteres.', 'warning');
                    return;
                }
                if (nova !== confirmar) {
                    e.preventDefault();
                    Swal.fire('Atenção', 'A confirmação da nova senha não confere.', 'warning');
                    return;
                }
                // Aqui você pode adicionar lógica extra, como enviar via AJAX se desejar
                // Exemplo de alerta de sucesso (pode ser movido para resposta do backend)
                // e.preventDefault();
                // Swal.fire('Sucesso', 'Senha atualizada com sucesso!', 'success');
            }
        });
    }
});
