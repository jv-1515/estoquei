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



function updateOptions() {
    const categoria = document.getElementById('categoria').value;
    const tamanho = document.getElementById('tamanho');
    let options = '<option value="" disabled selected hidden>Tamanho</option>';

    const tamLetra = [
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

    if (!categoria) {
        tamanho.innerHTML = options;
        return;
    }

    if (categoria === 'SAPATO' || categoria === 'MEIA') {
        for (let i = 36; i <= 44; i++) {
            options += `<option value="_${i}">${i}</option>`;
        }
    } else if (categoria === 'BERMUDA' || categoria === 'CALÇA' || categoria === 'SHORTS') {
        for (let i = 36; i <= 56; i += 2) {
            options += `<option value="_${i}">${i}</option>`;
        }
    } else if (categoria === 'CAMISA' || categoria === 'CAMISETA') {
        tamLetra.forEach(t => {
            options += `<option value="${t.value}">${t.label}</option>`;
        });
    } else {
        tamLetra.forEach(t => {
            options += `<option value="${t.value}">${t.label}</option>`;
        });
        for (let i = 36; i <= 56; i++) {
            options += `<option value="_${i}">${i}</option>`;
        }
    }

    tamanho.innerHTML = options;
}


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

document.addEventListener('DOMContentLoaded', function() {
    const editIcon = document.querySelector('.edit-icon');
    if (editIcon) {
        editIcon.style.color = 'white';

        const preview = document.getElementById('image-preview');
        const observer = new MutationObserver(function() {
            if (preview.querySelector('img')) {
                editIcon.style.color = '#555';
            } else {
                editIcon.style.color = 'white';
            }
        });
        observer.observe(preview, { childList: true });

        editIcon.addEventListener('click', function() {
            const img = preview.querySelector('img');
            if (img) preview.removeChild(img);
            if (!preview.querySelector('.fa-image')) {
                const icon = document.createElement('i');
                icon.className = 'fa-regular fa-image';
                icon.style.fontSize = '30px';
                preview.insertBefore(icon, preview.firstChild);
            }
            upload();
        });
    }
});


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

document.addEventListener('DOMContentLoaded', function() {
    const codigoInput = document.getElementById('codigo');
    if (codigoInput) {
        codigoInput.addEventListener('blur', function() {
            const codigo = this.value.trim();
            if (!codigo) return;

            fetch(`/produtos/codigo-existe?codigo=${encodeURIComponent(codigo)}`)
                .then(response => response.json())
                .then(existe => {
                    if (existe) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Código já cadastrado!',
                            text: 'Informe outro código.',
                            timer: 1500,
                            showConfirmButton: false
                        });
                        this.value = '';
                        this.focus();
                    }
                });
        });
    }
});