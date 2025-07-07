let funcionarios = [];

function getIniciais(nome) {
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function corAvatar(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 60%, 80%)`;
}



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


