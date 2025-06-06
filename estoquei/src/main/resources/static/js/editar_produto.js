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

function removerProduto(codigo) {
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
        Swal.fire({
        title: 'Removido!',
        text: 'O produto foi removido.',
        icon: 'success',
        confirmButtonColor: '#1E94A3'
        });
    }
    });
}

