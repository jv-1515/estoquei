const precoInput = document.getElementById('preco');

precoInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) value = value.slice(0, 5);
    if (value.length > 0) {
        value = (parseInt(value) / 100).toFixed(2).replace('.', ',');
        e.target.value = 'R$ ' + value;
    } else {
        e.target.value = '';
    }
});

function upload() {
    document.getElementById('foto').click();
}

function previewImage(event) {
    const input = event.target;
    const preview = document.getElementById('image-preview');
    Array.from(preview.childNodes).forEach(node => {
        if (node.tagName !== 'INPUT' && node.nodeType === Node.ELEMENT_NODE) {
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

function updateOptions(selectedCategory = null, selectedSize = null) {
    const categoriaSelect = document.getElementById('categoria');
    const tamanhoSelect = document.getElementById('tamanho');
    let options = '<option value="" disabled selected hidden>Selecionar</option>';

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

    const categoria = selectedCategory || categoriaSelect.value;

    if (!categoria) {
        tamanhoSelect.innerHTML = options;
        return;
    }

    if (categoria === 'SAPATO' || categoria === 'MEIA') {
        for (let i = 34; i <= 46; i++) {
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
        for (let i = 34; i <= 56; i++) {
            options += `<option value="_${i}">${i}</option>`;
        }
    }

    tamanhoSelect.innerHTML = options;

    if (selectedSize) {
        let found = false;
        for (let i = 0; i < tamanhoSelect.options.length; i++) {
            const optionValue = tamanhoSelect.options[i].value;
            if (optionValue === selectedSize || optionValue === `_${selectedSize}`) {
                tamanhoSelect.value = optionValue;
                found = true;
                break;
            }
        }
        if (!found) {
            tamanhoSelect.value = "";
        }
    }
}


function fillFields(product) {
    document.getElementById('codigo').value = product.codigo || '';
    document.getElementById('nome').value = product.nome || '';

    const categoriaSelect = document.getElementById('categoria');
    if (product.categoria) {
        categoriaSelect.value = product.categoria;
        updateOptions(product.categoria, product.tamanho);
    } else {
        updateOptions();
    }

    const generoSelect = document.getElementById('genero');
    if (product.genero) {
        generoSelect.value = product.genero;
    }

    document.getElementById('quantidade').value = (product.quantidade !== undefined && product.quantidade !== null) ? product.quantidade : '';
    document.getElementById('limiteMinimo').value = product.limiteMinimo || '';

    if (product.preco !== undefined && product.preco !== null) {
        let value = String(product.preco).replace(/\D/g, '');
        if (value.length > 5) value = value.slice(0, 5);
        if (value.length > 0) {
            value = (parseInt(value) / 100).toFixed(2).replace('.', ',');
            precoInput.value = 'R$' + value;
        } else {
            precoInput.value = '';
        }
    } else {
        precoInput.value = '';
    }

    document.getElementById('descricao').value = product.descricao || '';

    const textarea = document.getElementById('descricao');
    const contador = document.getElementById('contador-descricao');
    if (textarea && contador) {
        const max = textarea.maxLength || 200;
        contador.textContent = `${textarea.value.length}/${max}`;
    }

    const imagePreview = document.getElementById('image-preview');
    const existingChildren = Array.from(imagePreview.childNodes);
    existingChildren.forEach(node => {
        if (node.tagName !== 'INPUT' && node.nodeType === Node.ELEMENT_NODE) {
            imagePreview.removeChild(node);
        }
    });

    if (product.url_imagem) {
        const img = document.createElement('img');
        img.src = product.url_imagem;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        imagePreview.insertBefore(img, document.getElementById('foto'));
    } else {
        const icon = document.createElement('i');
        icon.className = 'fa-regular fa-image';
        icon.style.fontSize = '30px';
        if (!imagePreview.querySelector('.fa-image')) {
            imagePreview.insertBefore(icon, document.getElementById('foto'));
        }
    }
}


document.querySelector('form').addEventListener('submit', function(event) {
    const saveBtn = document.getElementById('save');
    saveBtn.disabled = true;
    saveBtn.innerHTML = 'Salvando <i class="fa-solid fa-spinner fa-spin"></i> ';
    event.preventDefault();

    Swal.fire({
        title: 'Tem certeza?',
        text: 'As alterações não poderão ser desfeitas',
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
            let rawValue = precoInput.value.replace(/[^\d,]/g, '').replace(',', '.');
            precoInput.value = rawValue;

            const formData = new FormData(this);
            formData.set('descricao', document.getElementById('descricao').value); // Garante que a descrição está no FormData
            
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');

            if (!id) {
                Swal.fire('Erro', 'ID do produto não encontrado na URL para atualizar.', 'error');
                precoInput.dispatchEvent(new Event('input'));
                return;
            }

            fetch(`/produtos/${id}`, {
                method: 'PUT',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao salvar alterações: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
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
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = 'Salvar alterações';
                    if (result.isConfirmed) {
                        window.location.href = "/estoque";
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        window.location.href = "/inicio";
                    }
                });
            })
            .catch(error => {
                console.error('Erro ao salvar alterações:', error);
                Swal.fire({
                    title: 'Erro!',
                    text: error.message || 'Não foi possível salvar as alterações.',
                    icon: 'error',
                    confirmButtonColor: '#1E94A3'
                });
                saveBtn.disabled = false;
                saveBtn.innerHTML = 'Salvar alterações';
            });
        } else {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Salvar alterações';
        }
    });
});

function removerProduto() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        Swal.fire('Erro', 'ID do produto não encontrado na URL para remoção.', 'error');
        return;
    }

    Swal.fire({
        title: 'Remover produto?',
        text: 'Esta ação não poderá ser desfeita',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Remover',
        cancelButtonText: 'Cancelar',
        allowOutsideClick: false,
        customClass: {
            confirmButton: 'swal2-deny',
            cancelButton: 'swal2-cancel-custom'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/produtos/' + id, {
                method: 'DELETE'
            }).then(response => {
                if (response.ok) {
                    Swal.fire({
                        title: 'Removendo produto',
                        text: 'Aguarde...',
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
                        text: 'Não foi possível remover o produto. Verifique se ele não está associado a outras operações.',
                        icon: 'error',
                    });
                }
            }).catch(error => {
                console.error('Erro ao remover produto:', error);
                Swal.fire({
                    title: 'Erro de Conexão!',
                    text: 'Não foi possível se conectar ao servidor para remover o produto',
                    icon: 'error',
                });
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

    document.getElementById('categoria').addEventListener('change', () => updateOptions());

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        fetch(`/produtos/${id}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Produto não encontrado.');
                    }
                    throw new Error('Erro ao buscar o produto. Status: ' + response.status);
                }
                return response.json();
            })
            .then(product => {
                fillFields(product);
                updateOptions(product.categoria, product.tamanho);
            })
            .catch(error => {
                console.error('Erro ao buscar o produto:', error);
                Swal.fire({
                    title: 'Erro!',
                    text: error.message || 'Não foi possível carregar os detalhes do produto.',
                    icon: 'error',
                    confirmButtonColor: '#1E94A3'
                }).then(() => {
                    history.back();
                });
            });
    } else {
        Swal.fire({
            title: 'Erro!',
            text: 'ID do produto não encontrado na URL.',
            icon: 'error',
            confirmButtonColor: '#1E94A3'
        }).then(() => {
            history.back();
        });
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const editIcon = document.querySelector('.edit-icon');
    const preview = document.getElementById('image-preview');

    if (editIcon && preview) {
        editIcon.addEventListener('click', function(e) {
            e.stopPropagation();
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

window.addEventListener('DOMContentLoaded', function() {
    const limiteInput = document.getElementById('limiteMinimo');
    if (limiteInput) {
        limiteInput.addEventListener('input', function() {
            if (this.value.length > 3) this.value = this.value.slice(0, 3);
            if (this.value > 999) this.value = 999;
        });
    }
});

window.addEventListener('DOMContentLoaded', function() {
    const quantidadeInput = document.getElementById('quantidade');
    if (quantidadeInput) {
        quantidadeInput.addEventListener('input', function() {
            if (this.value.length > 3) this.value = this.value.slice(0, 3);
            if (this.value > 999) this.value = 999;
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const codigoInput = document.getElementById('codigo');
    let codigoOriginal = null;

    // Descobre o código original do produto carregado
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        fetch(`/produtos/${id}`)
            .then(response => response.json())
            .then(product => {
                codigoOriginal = product.codigo;
            });
    }

    if (codigoInput) {
        codigoInput.addEventListener('mouseleave', function(e) {
            const codigo = this.value.trim();
            if (!codigo || codigo === codigoOriginal) return;

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
                        this.value = codigoOriginal !== null ? codigoOriginal : '';
                        this.focus();
                    }
                });
        });
    }
});


function aplicarEstiloInputs() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim() === '') {
                input.style.backgroundColor = 'white';
            } else {
                input.style.backgroundColor = '#f1f1f1';
            }
        });
    });

    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('focus', () => {
            select.style.backgroundColor = 'white';
        });
        select.addEventListener('blur', () => {
            select.style.backgroundColor = '';
        });
    });

    const textarea = document.getElementById('descricao');
    const contador = document.getElementById('contador-descricao');
    if (textarea && contador) {
        function updateContadorStyle() {
            if (textarea.value.trim() === '') {
                textarea.style.backgroundColor = 'white';
                contador.style.backgroundColor = 'white';
            } else {
                textarea.style.backgroundColor = '#f1f1f1';
                contador.style.backgroundColor = '#f1f1f1';
            }
        }
        textarea.addEventListener('blur', updateContadorStyle);
    }
}
document.addEventListener('DOMContentLoaded', aplicarEstiloInputs);
