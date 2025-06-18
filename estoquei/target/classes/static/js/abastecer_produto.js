function formatarPrecoInput(input) {
    if (!input) return;
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) value = value.slice(0, 5);
        if (value.length > 0) {
            value = (parseInt(value) / 100).toFixed(2).replace('.', ',');
            e.target.value = 'R$' + value;
        } else {
            e.target.value = '';
        }
    });
}

formatarPrecoInput(document.getElementById('preco'));
formatarPrecoInput(document.getElementById('valor-compra'));

document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    document.querySelector('form').reset();
    Swal.fire({
        title: "Sucesso!",
        text: "Abastecimento registrado!",
        icon: "success",
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Visualizar Estoque',
        cancelButtonText: 'Voltar para Início',
        allowOutsideClick: false,
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "/baixo-estoque";
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            window.location.href = "/inicio";
        }
    });
});
