const precoInput = document.getElementById('preco');

precoInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // remove tudo que não for número
    if (value.length > 0) {
        value = (parseInt(value) / 100).toFixed(2).replace('.', ',');
        e.target.value = 'R$' + value;
    } else {
        e.target.value = '';
    }
});

const form = document.querySelector('form');

form.addEventListener('submit', function(e) {
    let rawValue = precoInput.value.replace(/[^\d,]/g, '').replace(',', '.'); 
    precoInput.value = rawValue; // Ex: 'R$12,34' -> '12.34'
});


document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    fetch(this.action, {
        method: this.method,
        body: formData
    }).then(data => {  
        if (!data.ok) {
            throw new Error('Falha de conexão');
        }   
        Swal.fire({
            title: "Sucesso!",
            text: "Produto cadastrado no estoque!",
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
                window.location.href = "/estoque";
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                window.location.href = "/inicio";
            }
        });
    }).catch(error => {
        Swal.fire({
            title: "Erro!",
            text: "Não foi possível cadastrar o produto. Tente novamente.",
            icon: "error",
            confirmButtonText: 'Tentar Novamente',
            allowOutsideClick: false,
            customClass: {
                confirmButton: 'swal2-confirm-custom'
            }
        });
        return;
    });

});

                function upload() {
                    document.getElementById('foto').click();
                }
                function previewImage(event) {
                    const input = event.target;
                    const preview = document.getElementById('image-preview');
                    Array.from(preview.childNodes).forEach(node => {
                        if (node.tagName !== 'INPUT') {
                            preview.removeChild(node);
                        }
                    });
                    if (input.files && input.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.style.width = '100%';
                            img.style.height = '100%';
                            img.style.objectFit = 'cover';
                            preview.insertBefore(img, input);
                        }
                        reader.readAsDataURL(input.files[0]);
                    } else {
                        const icon = document.createElement('i');
                        icon.className = 'fa-regular fa-image';
                        icon.style.fontSize = '30px';
                        preview.insertBefore(icon, input);
                    }
                }