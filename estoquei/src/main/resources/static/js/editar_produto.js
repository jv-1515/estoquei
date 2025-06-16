function upload() {
    document.getElementById('foto').click();
}
function previewImage(event) {
    const input = event.target;
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            preview.appendChild(img);
        }
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.innerHTML = '<i class="fa-regular fa-image" style="font-size: 30px"></i>';
    }
}


document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    Swal.fire({
        title: 'Tem certeza?',
        text: 'As alterações não poderão ser desfeitas.',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        allowOutsideClick: false,
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "Alterações salvas!",
                icon: "success",
                showCloseButton: true,
                showCancelButton: true,
                showConfirmButton: true,
                confirmButtonText: 'Visualizar Estoque',
                cancelButtonText: 'Voltar para Início',
                allowOutsideClick: false,
                customClass: {
                    confirmButton: 'swal2-confirm-custom',
                    cancelButton: 'swal2-cancel-custom'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "/estoque";
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    window.location.href = "/inicio";
                }
            });
        }
    });
});

function removerProduto(id) {
    Swal.fire({
        title: 'Tem certeza?',
        text: 'Esta ação não poderá ser desfeita.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#1E94A3',
        confirmButtonText: 'Remover',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {

            fetch('/produtos/' + id, {
                method: 'DELETE'
            }).then(response => {
                if (response.ok) {
                    Swal.fire({
                        title: 'Removendo...',
                        text: 'Aguarde enquanto o produto é removido.',
                        icon: 'info',
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        timer: 1500,
                    }).then(() => {
                        history.back();
                    });
                } else {
                    Swal.fire({
                        title: 'Erro!',
                        text: 'Não foi possível remover.',
                        icon: 'error',
                        confirmButtonColor: '#1E94A3'
                    });
                }
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('descricao');
    const contador = document.getElementById('contador-descricao');
    if (textarea && contador) {
        const max = textarea.maxLength || 200;
        contador.textContent = `${textarea.value.length}/${max}`;
        textarea.addEventListener('input', function() {
            contador.textContent = `${this.value.length}/${max}`;
        });
    }
});