function formatarPrecoInput(input) {
    if (!input) return;
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 7) value = value.slice(0, 7);
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

window.addEventListener('DOMContentLoaded', function() {
    const quantidadeInput = document.getElementById('quantidade');
    const quantidadeFinalInput = document.getElementById('quantidade-final');

    function limitarSoma() {
        let quantidade = parseInt(quantidadeInput.value) || 0;
        let quantidadeFinal = parseInt(quantidadeFinalInput.value) || 0;
        let soma = quantidade + quantidadeFinal;

        if (soma > 999) {
            if (document.activeElement === quantidadeInput) {
                quantidade = 999 - quantidadeFinal;
                quantidadeInput.value = quantidade > 0 ? quantidade : 0;
            } else if (document.activeElement === quantidadeFinalInput) {
                quantidadeFinal = 999 - quantidade;
                quantidadeFinalInput.value = quantidadeFinal > 0 ? quantidadeFinal : 0;
            }
        }
    }

    if (quantidadeInput && quantidadeFinalInput) {
        quantidadeInput.addEventListener('input', limitarSoma);
        quantidadeFinalInput.addEventListener('input', limitarSoma);
    }
});