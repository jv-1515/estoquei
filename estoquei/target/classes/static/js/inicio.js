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

window.addEventListener('DOMContentLoaded', function() {
    atualizarBadgeBaixoEstoque();
});
function atualizarBadgeBaixoEstoque() {
    const badge = document.querySelector('.badge');
    if (!badge) return;

    badge.style.display = 'none'; // Oculta sempre no início

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
