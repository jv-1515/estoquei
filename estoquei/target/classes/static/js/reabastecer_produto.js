function updateOptions() {
    const categoria = document.getElementById('filter-categoria').value;
    const tamanho = document.getElementById('filter-tamanho');
    let options = '<option value="">Tamanho</option>';

    if (categoria === 'SAPATO' || categoria === 'MEIA') {
        for (let i = 36; i <= 44; i++) {
            options += `<option value="${i}">${i}</option>`;
        }
    } else if (categoria === 'BERMUDA' || categoria === 'CALCA' || categoria === 'SHORTS') {
        for (let i = 36; i <= 52; i += 2) {
            options += `<option value="${i}">${i}</option>`;
        }
    } else if (categoria === 'CAMISA' || categoria === 'CAMISETA') {
        const tamanhos = [
            { value: 'ÚNICO', label: 'Único' },
            { value: 'PP', label: 'PP' },
            { value: 'P', label: 'P' },
            { value: 'M', label: 'M' },
            { value: 'G', label: 'G' },
            { value: 'GG', label: 'GG' },
            { value: 'XG', label: 'XG' },
            { value: 'XGG', label: 'XGG' },
            { value: 'XXG', label: 'XXG' }
        ];
        tamanhos.forEach(t => {
            options += `<option value="${t.value}">${t.label}</option>`;
        });
    } else {
        const tamanhos = [
            { value: 'ÚNICO', label: 'Único' },
            { value: 'PP', label: 'PP' },
            { value: 'P', label: 'P' },
            { value: 'M', label: 'M' },
            { value: 'G', label: 'G' },
            { value: 'GG', label: 'GG' },
            { value: 'XG', label: 'XG' },
            { value: 'XGG', label: 'XGG' },
            { value: 'XXG', label: 'XXG' }
        ];
        for (let i = 36; i <= 44; i++) {
            tamanhos.push({ value: i.toString(), label: i.toString() });
        }
        tamanhos.forEach(t => {
            options += `<option value="${t.value}">${t.label}</option>`;
        });
    }
    tamanho.innerHTML = options;
}
window.onload = function() {
    updateOptions();
};


document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    Swal.fire({
        title: "Sucesso!",
        text: "Reabastecimento registrado!",
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
