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

if (document.referrer && document.referrer.includes(window.location.origin)) {
    sessionStorage.setItem('paginaAnteriorEditarProduto', document.referrer);
}


function upload() {
    document.getElementById('foto').click();
    // safety: se o input não existir (foi removido pelo innerHTML), recria e anexa antes de clicar
    let foto = document.getElementById('foto');
    const preview = document.getElementById('image-preview');
    if (!foto) {
        foto = document.createElement('input');
        foto.type = 'file';
        foto.id = 'foto';
        foto.name = 'foto';
        foto.accept = 'image/*';
        foto.style.display = 'none';
        // conecta o handler existente
        foto.addEventListener('change', previewImage);
        if (preview) preview.appendChild(foto);
    }
    foto.click();
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

// function updateOptions(selectedCategory = null, selectedSize = null) {
//     const categoriaSelect = document.getElementById('categoria');
//     const tamanhoSelect = document.getElementById('tamanho');
//     let options = '<option value="" disabled selected hidden>Selecionar</option>';

//     const tamLetra = [
//         { value: 'ÚNICO', label: 'Único' },
//         { value: 'PP', label: 'PP' },
//         { value: 'P', label: 'P' },
//         { value: 'M', label: 'M' },
//         { value: 'G', label: 'G' },
//         { value: 'GG', label: 'GG' },
//         { value: 'XG', label: 'XG' },
//         { value: 'XGG', label: 'XGG' },
//         { value: 'XXG', label: 'XXG' }
//     ];

//     const categoria = selectedCategory || categoriaSelect.value;

//     if (!categoria) {
//         tamanhoSelect.innerHTML = options;
//         return;
//     }

//     if (categoria === 'SAPATO' || categoria === 'MEIA') {
//         for (let i = 34; i <= 46; i++) {
//             options += `<option value="_${i}">${i}</option>`;
//         }
//     } else if (categoria === 'BERMUDA' || categoria === 'CALÇA' || categoria === 'VESTIDO') {
//         for (let i = 36; i <= 56; i += 2) {
//             options += `<option value="_${i}">${i}</option>`;
//         }
//     } else if (categoria === 'CAMISA' || categoria === 'CAMISETA') {
//         tamLetra.forEach(t => {
//             options += `<option value="${t.value}">${t.label}</option>`;
//         });
//     } else {
//         tamLetra.forEach(t => {
//             options += `<option value="${t.value}">${t.label}</option>`;
//         });
//         for (let i = 34; i <= 56; i++) {
//             options += `<option value="_${i}">${i}</option>`;
//         }
//     }

//     tamanhoSelect.innerHTML = options;

//     if (selectedSize) {
//         let found = false;
//         for (let i = 0; i < tamanhoSelect.options.length; i++) {
//             const optionValue = tamanhoSelect.options[i].value;
//             if (optionValue === selectedSize || optionValue === `_${selectedSize}`) {
//                 tamanhoSelect.value = optionValue;
//                 found = true;
//                 break;
//             }
//         }
//         if (!found) {
//             tamanhoSelect.value = "";
//         }
//     }
// }


// --- MULTISELECT PADRÃO CADASTRO ---

// const categorias = [
//   { id: 1, nome: "Camisa", tipoTamanho: 1, tipoGenero: "T" },
//   { id: 2, nome: "Camiseta", tipoTamanho: 1, tipoGenero: "T" },
//   { id: 3, nome: "Calça", tipoTamanho: 2, tipoGenero: "T" },
//   { id: 4, nome: "Bermuda", tipoTamanho: 2, tipoGenero: "T" },
//   { id: 5, nome: "Vestido", tipoTamanho: 1, tipoGenero: "F" },
//   { id: 6, nome: "Sapato", tipoTamanho: 2, tipoGenero: "T" },
//   { id: 7, nome: "Meia", tipoTamanho: 2, tipoGenero: "T" }
// ];
// const tamanhosLetra = ["ÚNICO","PP","P","M","G","GG","XG","XGG","XXG"];
// const tamanhosNumero = Array.from({length: 13}, (_,i)=>'_'+(34+i));
// const generosEnum = ["MASCULINO","FEMININO","UNISSEX"];

let categorias = [];
let tamanhosLetra = [];
let tamanhosNumero = [];
let generosEnum = [];

fetch('/categorias')
  .then(res => res.json())
  .then(data => {
    categorias = data.map(cat => ({
      id: cat.id,
      nome: cat.nome,
      tipoTamanho: cat.tipoTamanho,
      tipoGenero: cat.tipoGenero
    }));
    preencherRadiosCategoria();
    atualizarTamanhosEGenerosPorCategoria(null);
  });

fetch('/produtos/tamanhos')
  .then(res => res.json())
  .then(tamanhos => {
    tamanhosLetra = tamanhos.filter(t => !t.startsWith('_'));
    tamanhosNumero = tamanhos.filter(t => t.startsWith('_'));
  });

fetch('/produtos/generos')
  .then(res => res.json())
  .then(generos => { generosEnum = generos; });

// Categoria
const categoriaInput = document.getElementById('categoria-multi');
const radiosCategoria = document.getElementById('radios-categoria-multi');
const chevronCategoria = document.querySelector('.chevron-categoria');

// Preenche radios de categoria
function preencherRadiosCategoria() {
    radiosCategoria.innerHTML = '';
    categorias.forEach(cat => {
        const label = document.createElement('label');
        label.className = 'categoria-multi-label';
        label.innerHTML = `<input type="radio" name="categoria-radio" value="${cat.nome}">${cat.nome}`;
        radiosCategoria.appendChild(label);
    });
}

// Abre/fecha lista
function abrirFecharCategoriaMulti(e) {
    if (e) e.stopPropagation();
    radiosCategoria.style.display = radiosCategoria.style.display === 'block' ? 'none' : 'block';
}
categoriaInput.addEventListener('click', abrirFecharCategoriaMulti);
chevronCategoria.addEventListener('click', abrirFecharCategoriaMulti);

// Fecha ao clicar fora
document.addEventListener('mousedown', function(e) {
    if (radiosCategoria.style.display === 'block' && !radiosCategoria.contains(e.target) && e.target !== categoriaInput && e.target !== chevronCategoria) {
        radiosCategoria.style.display = 'none';
    }
});

// Seleciona categoria
radiosCategoria.addEventListener('click', function(e) {
    const label = e.target.closest('label');
    if (!label) return;
    radiosCategoria.querySelectorAll('label').forEach(l => l.classList.remove('selecionado'));
    label.classList.add('selecionado');
    const radio = label.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
    categoriaInput.value = label.textContent.trim();
    categoriaInput.dataset.value = radio.value;
    radiosCategoria.style.display = 'none';
    atualizarTamanhosEGenerosPorCategoria(radio.value);
});

// Tamanho
const tamanhoInput = document.getElementById('tamanho-multi');
const radiosTamanho = document.getElementById('radios-tamanho-multi');
const chevronTamanho = document.querySelector('.chevron-tamanho');

function abrirFecharTamanhoMulti(e) {
    if (e) e.stopPropagation();
    radiosTamanho.style.display = radiosTamanho.style.display === 'block' ? 'none' : 'block';
}
tamanhoInput.addEventListener('click', abrirFecharTamanhoMulti);
chevronTamanho.addEventListener('click', abrirFecharTamanhoMulti);

document.addEventListener('mousedown', function(e) {
    if (radiosTamanho.style.display === 'block' && !radiosTamanho.contains(e.target) && e.target !== tamanhoInput && e.target !== chevronTamanho) {
        radiosTamanho.style.display = 'none';
    }
});

radiosTamanho.addEventListener('click', function(e) {
    const label = e.target.closest('label');
    if (!label) return;
    radiosTamanho.querySelectorAll('label').forEach(l => l.classList.remove('selecionado'));
    label.classList.add('selecionado');
    const radio = label.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
    tamanhoInput.value = formatarTamanhoVisual(radio.value);
    tamanhoInput.dataset.value = radio.value;
    tamanhoInput.style.color = '#000';
    radiosTamanho.style.display = 'none';
});

// Gênero
const generoInput = document.getElementById('genero-multi');
const radiosGenero = document.getElementById('radios-genero-multi');
const chevronGenero = document.querySelector('.chevron-genero');

function abrirFecharGeneroMulti(e) {
  if (e) e.stopPropagation();
  radiosGenero.style.display = radiosGenero.style.display === 'block' ? 'none' : 'block';
}
generoInput.addEventListener('click', abrirFecharGeneroMulti);
chevronGenero.addEventListener('click', abrirFecharGeneroMulti);

document.addEventListener('mousedown', function(e) {
  if (radiosGenero.style.display === 'block' && !radiosGenero.contains(e.target) && e.target !== generoInput && e.target !== chevronGenero) {
    radiosGenero.style.display = 'none';
  }
});

radiosGenero.addEventListener('click', function(e) {
  const label = e.target.closest('label');
  if (!label) return;
  radiosGenero.querySelectorAll('label').forEach(l => l.classList.remove('selecionado'));
  label.classList.add('selecionado');
  const radio = label.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
  generoInput.value = formatarGeneroVisual(radio.value);
  generoInput.dataset.value = radio.value;
  generoInput.style.color = '#000';
  radiosGenero.style.display = 'none';
});

// Funções auxiliares
function formatarGeneroVisual(gen) {
    if (gen === "F") return "Feminino";
    if (gen === "M") return "Masculino";
    if (gen === "U") return "Unissex";
    if (gen === "T") return "Todos";
    return gen;
}
function formatarTamanhoVisual(tam) {
  if (tam === "ÚNICO" || tam === "UNICO") return "Único";
  if (tam.startsWith("_")) return tam.slice(1);
  return tam;
}

// Atualiza tamanhos e gêneros ao selecionar categoria
function atualizarTamanhosEGenerosPorCategoria(categoriaNome) {
    const categoriaObj = categorias.find(cat => cat.nome === categoriaNome);

    // Tamanhos
    radiosTamanho.innerHTML = '';
    tamanhoInput.value = '';
    tamanhoInput.dataset.value = '';
    tamanhoInput.disabled = !categoriaObj;

    let tamanhosPermitidos = [];
    if (categoriaObj) {
        switch (categoriaObj.tipoTamanho) {
            case "L":
                tamanhosPermitidos = tamanhosLetra;
                break;
            case "N":
                tamanhosPermitidos = tamanhosNumero;
                break;
            case "T":
                tamanhosPermitidos = [...tamanhosLetra, ...tamanhosNumero];
                break;
            default:
                tamanhosPermitidos = [];
        }
    }
    tamanhosPermitidos.forEach(tam => {
        const label = document.createElement('label');
        label.className = 'tamanho-multi-label';
        label.innerHTML = `<input type="radio" name="tamanho-radio" value="${tam}">${formatarTamanhoVisual(tam)}`;
        radiosTamanho.appendChild(label);
    });
    if (tamanhosPermitidos.length === 1) {
        tamanhoInput.value = formatarTamanhoVisual(tamanhosPermitidos[0]);
        tamanhoInput.style.color = '#000';
        tamanhoInput.dataset.value = tamanhosPermitidos[0];
        radiosTamanho.querySelector('input[type="radio"]').checked = true;
    }

    radiosTamanho.addEventListener('click', function(e) {
        const radio = e.target.closest('input[type="radio"]');
        if (radio) {
            tamanhoInput.value = formatarTamanhoVisual(radio.value);
            tamanhoInput.style.color = '#000';
            tamanhoInput.dataset.value = radio.value;
            radiosTamanho.style.display = 'none';
        }
    });

    // Gêneros
    radiosGenero.innerHTML = '';
    generoInput.value = '';
    generoInput.dataset.value = '';
    generoInput.disabled = !categoriaObj;

    let generosPermitidos = [];
    if (categoriaObj) {
        if (categoriaObj.tipoGenero === "T") {
            generosPermitidos = ["F", "M", "U"];
        } else if (categoriaObj.tipoGenero === "FM") {
            generosPermitidos = ["F", "M"];
        } else if (categoriaObj.tipoGenero === "F") {
            generosPermitidos = ["F"];
        } else if (categoriaObj.tipoGenero === "M") {
            generosPermitidos = ["M"];
        } else if (categoriaObj.tipoGenero === "U") {
            generosPermitidos = ["U"];
        }
    }

    generosPermitidos.forEach(gen => {
        const label = document.createElement('label');
        label.className = 'genero-multi-label';
        label.innerHTML = `<input type="radio" name="genero-radio" value="${gen}">${formatarGeneroVisual(gen)}`;
        radiosGenero.appendChild(label);
    });
    if (generosPermitidos.length === 1) {
        generoInput.value = formatarGeneroVisual(generosPermitidos[0]);
        generoInput.style.color = '#000';
        generoInput.dataset.value = generosPermitidos[0];
        radiosGenero.querySelector('input[type="radio"]').checked = true;
    }

    radiosGenero.addEventListener('click', function(e) {
        const radio = e.target.closest('input[type="radio"]');
        if (radio) {
            generoInput.value = formatarGeneroVisual(radio.value);
            generoInput.style.color = '#000';
            generoInput.dataset.value = radio.value; 
            radiosGenero.style.display = 'none';
        }
    });
}

// Ao carregar, desabilita tamanho/genero até escolher categoria
// document.addEventListener('DOMContentLoaded', function() {
//     atualizarTamanhosEGenerosPorCategoria(null);
// });

function fillFields(product) {
    document.getElementById('codigo').value = product.codigo || '';
    document.getElementById('nome').value = product.nome || '';

    // Categoria
    if (product.categoria) {
        categoriaInput.value = product.categoria;
        categoriaInput.dataset.value = product.categoria;
        // Marca o radio correspondente
        const radio = radiosCategoria.querySelector(`input[type="radio"][value="${(product.categoria || '').toUpperCase()}"]`);
        if (radio) {
            radio.checked = true;
            radio.parentNode.classList.add('selecionado');
        }
        atualizarTamanhosEGenerosPorCategoria(product.categoria);
    } else {
        categoriaInput.value = '';
        categoriaInput.dataset.value = '';
        atualizarTamanhosEGenerosPorCategoria(null);
    }

    // Tamanho
    if (product.tamanho) {
        let tamanhoRadioValue = product.tamanho;
        if (/^\d+$/.test(tamanhoRadioValue)) tamanhoRadioValue = '_' + tamanhoRadioValue;
        tamanhoInput.value = formatarTamanhoVisual(tamanhoRadioValue);
        tamanhoInput.dataset.value = tamanhoRadioValue;
        const radio = radiosTamanho.querySelector(`input[type="radio"][value="${tamanhoRadioValue}"]`);
        if (radio) {
            radio.checked = true;
            radio.parentNode.classList.add('selecionado');
        }
    } else {
        tamanhoInput.value = '';
        tamanhoInput.dataset.value = '';
    }

    // Gênero
    if (product.genero) {
        let generoRadioValue = product.genero;
        if (generoRadioValue === "MASCULINO") generoRadioValue = "M";
        else if (generoRadioValue === "FEMININO") generoRadioValue = "F";
        else if (generoRadioValue === "UNISSEX") generoRadioValue = "U";
        else if (generoRadioValue === "TODOS") generoRadioValue = "T";
        generoInput.value = formatarGeneroVisual(generoRadioValue);
        generoInput.dataset.value = generoRadioValue;
        const radio = radiosGenero.querySelector(`input[type="radio"][value="${generoRadioValue}"]`);
        if (radio) {
            radio.checked = true;
            radio.parentNode.classList.add('selecionado');
        }
    } else {
        generoInput.value = '';
        generoInput.dataset.value = '';
    }

    document.getElementById('quantidade').value = (product.quantidade !== undefined && product.quantidade !== null) ? product.quantidade : '';
    document.getElementById('limiteMinimo').value = product.limiteMinimo || '';

    if (product.preco !== undefined && product.preco !== null) {
        let value = String(product.preco).replace(/\D/g, '');
        if (value.length > 5) value = value.slice(0, 5);
        if (value.length > 0) {
            value = (parseInt(value) / 100).toFixed(2).replace('.', ',');
        precoInput.value = 'R$ ' + value;
    } else {
        precoInput.value = '';
    }
        // garante duas casas decimais antes de extrair dígitos (evita perda de zeros)
        const precoStr = Number(product.preco).toFixed(2); // ex: "49.90"
        let digits = precoStr.replace(/\D/g, ''); // ex: "4990"
        if (digits.length > 0) {
            const formatted = (parseInt(digits, 10) / 100).toFixed(2).replace('.', ',');
            precoInput.value = 'R$ ' + formatted;
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
        // cria skeleton sem remover o input#foto
        // remove apenas elementos visuais (não INPUTs)
        Array.from(imagePreview.childNodes).forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'INPUT') {
                imagePreview.removeChild(node);
            }
        });
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-img';
        skeleton.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%);background-size:200% 100%;animation:skeleton-loading 1.2s infinite;';
        skeleton.innerHTML = `<i class="fa fa-spinner fa-spin" style="font-size:32px;color:#aaa;" id="img-skeleton"></i>`;
        imagePreview.appendChild(skeleton);

        const img = document.createElement('img');
        img.src = product.url_imagem;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.onload = function() {
            const sk = imagePreview.querySelector('.skeleton-img');
            if (sk) imagePreview.removeChild(sk);
            // remove elementos visuais restantes (mantém INPUT)
            Array.from(imagePreview.childNodes).forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'INPUT' && node !== img) {
                    imagePreview.removeChild(node);
                }
            });
            imagePreview.appendChild(img);
        };
        img.onerror = function() {
            const sk = imagePreview.querySelector('.skeleton-img');
            if (sk) imagePreview.removeChild(sk);
            if (!imagePreview.querySelector('.fa-image')) {
                const icon = document.createElement('i');
                icon.className = 'fa-regular fa-image';
                icon.style.fontSize = '32px';
                imagePreview.appendChild(icon);
            }
        };
    } else {
        const icon = document.createElement('i');
        icon.className = 'fa-regular fa-image';
        icon.style.fontSize = '30px';
        if (!imagePreview.querySelector('.fa-image')) {
            imagePreview.insertBefore(icon, document.getElementById('foto'));
        }
    }

        window.dadosOriginaisEdicaoProduto = {
        codigo: product.codigo || '',
        nome: product.nome || '',
        categoria: product.categoria || '',
        tamanho: product.tamanho || '',
        genero: product.genero || '',
        quantidade: String(product.quantidade ?? ''),
        limiteMinimo: String(product.limiteMinimo ?? ''),
        preco: product.preco !== undefined && product.preco !== null ? String(product.preco) : '',
        descricao: product.descricao || ''
    };
}


document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Validação dos campos obrigatórios
    const codigo = document.getElementById('codigo').value.trim();
    const nome = document.getElementById('nome').value.trim();
    const categoria = categoriaInput.dataset.value || '';
    const tamanho = tamanhoInput.dataset.value || '';
    const genero = generoInput.dataset.value || '';
    const quantidade = document.getElementById('quantidade').value.trim();
    const limiteMinimo = document.getElementById('limiteMinimo').value.trim();
    const preco = precoInput.value.replace(/[^\d,]/g, '').replace(',', '.');

    if (!codigo || !nome || !categoria || !tamanho || !genero || !quantidade || !limiteMinimo || !preco) {
        Swal.fire({
            icon: 'warning',
            title: 'Edição inválida!',
            text: 'Preencha todos os campos obrigatórios',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false
        });
        return;
    }

    // Validação de combinação categoria/tamanho
    const categoriaObj = categorias.find(cat => cat.nome === categoria);
    if (categoriaObj) {
        if (categoriaObj.tipoTamanho === "L" && tamanhosNumero.includes(tamanho)) {
            Swal.fire('Erro', 'Categoria não aceita tamanho numérico!', 'error');
            return;
        }
        if (categoriaObj.tipoTamanho === "N" && tamanhosLetra.includes(tamanho)) {
            Swal.fire('Erro', 'Categoria não aceita tamanho por letra!', 'error');
            return;
        }
    }

    const produtoAtual = {
        codigo: document.getElementById('codigo').value.trim(),
        nome: document.getElementById('nome').value.trim(),
        categoria: categoriaInput.dataset.value || '',
        tamanho: tamanhoInput.dataset.value || '',
        genero: generoInput.dataset.value || '',
        quantidade: document.getElementById('quantidade').value.trim(),
        limiteMinimo: document.getElementById('limiteMinimo').value.trim(),
        preco: document.getElementById('preco').value.replace(/[^\d,]/g, '').replace(',', '.'),
        descricao: document.getElementById('descricao').value.trim()
    };

    if (JSON.stringify(produtoAtual) === JSON.stringify(window.dadosOriginaisEdicaoProduto)) {
        Swal.fire({
            icon: 'info',
            title: 'Sem alterações',
            text: "Selecione uma opção",
            showCloseButton: true,
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Acessar Estoque',
            cancelButtonText: 'Voltar para Início',
            allowOutsideClick: false,
            customClass: {
                confirmButton: 'swal2-confirm-custom',
            }
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "/estoque";
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                window.location.href = "/inicio";
            }
        });
        event.preventDefault();
        return;
    }

    const saveBtn = document.getElementById('save');
    saveBtn.disabled = true;
    saveBtn.innerHTML = 'Salvando <i class="fa-solid fa-spinner fa-spin"></i> ';
    event.preventDefault();

    Swal.fire({
        title: 'Tem certeza?',
        text: 'As alterações não poderão ser desfeitas',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Voltar',
        allowOutsideClick: false,
        customClass: {
            confirmButton: 'swal2-confirm-custom',
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                icon: 'info',
                title: 'Salvando alterações...',
                text: 'Aguarde',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            let rawValue = precoInput.value.replace(/[^\d,]/g, '').replace(',', '.');
            precoInput.value = rawValue;

            const formData = new FormData(this);
            formData.set('descricao', document.getElementById('descricao').value);
            formData.set('categoria', (categoriaInput.dataset.value || '').toUpperCase());
            let generoValue = generoInput.dataset.value || '';
            if (generoValue === "M") generoValue = "MASCULINO";
            else if (generoValue === "F") generoValue = "FEMININO";
            else if (generoValue === "U") generoValue = "UNISSEX";
            else if (generoValue === "T") generoValue = "TODOS";
            formData.set('genero', generoValue);
            let tamanhoValue = tamanhoInput.dataset.value || '';
            formData.set('tamanho', tamanhoValue);
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');

            if (!id) {
                Swal.fire('Erro', 'ID do produto não encontrado na URL para atualizar.', 'error');
                precoInput.dispatchEvent(new Event('input'));
                return;
            }

            fetch(`/produtos/${id}`, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                Swal.close(); // Fecha o loading
                if (!response.ok) {
                    throw new Error('Erro ao salvar alterações: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                Swal.fire({
                    title: "Alterações salvas!",
                    text: "Selecione uma opção",
                    icon: "success",
                    showCloseButton: true,
                    showCancelButton: true,
                    showConfirmButton: true,
                    confirmButtonText: 'Acessar Estoque',
                    cancelButtonText: 'Voltar para Início',
                    allowOutsideClick: false,
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
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
                Swal.close();
                console.error('Erro ao salvar alterações:', error);
                Swal.fire({
                    title: 'Erro!',
                    text: error.message || 'Não foi possível salvar as alterações',
                    icon: 'error',
                    timer: 1500,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    timerProgressBar: true,
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

    fetch(`/produtos/${id}`)
        .then(response => response.json())
        .then(produto => {
            const nomeProduto = produto.nome || 'produto';
            const quantidade = produto.quantidade || 0;

            if (quantidade === 0) {
                let cancelado = false;
                Swal.fire({
                    title: `Removendo "${nomeProduto}"`,
                    text: 'O produto será movido para a lixeira',
                    icon: 'info',
                    showCancelButton: true,
                    showConfirmButton: false,
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        cancelButton: 'swal2-remove-custom'
                    },
                    allowOutsideClick: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: () => {
                        const cancelBtn = Swal.getCancelButton();
                        if (cancelBtn) {
                            cancelBtn.style.width = '90px';
                            cancelBtn.style.maxWidth = '90px';
                            cancelBtn.style.border = 'none';
                            
                            cancelBtn.addEventListener('mouseenter', function() {
                                cancelBtn.style.backgroundColor = '#c82333';
                                cancelBtn.style.borderColor = '#bd2130';
                            });
                            cancelBtn.addEventListener('mouseleave', function() {
                                cancelBtn.style.backgroundColor = '#dc3545';
                                cancelBtn.style.borderColor = '#dc3545';
                            });
                        }
                        const swalTimer = setTimeout(() => {
                            if (!cancelado) {
                                fetch('/produtos/' + id, {
                                    method: 'DELETE'
                                }).then(response => {
                                    if (response.ok) {
                                        Swal.fire({
                                            title: `"${nomeProduto}" removido!`,
                                            text: 'Produto movido para a lixeira',
                                            icon: 'success',
                                            showConfirmButton: false,
                                            timer: 1500,
                                        }).then(() => {
                                            history.back();
                                        });
                                    } else {
                                        Swal.fire('Erro!', `Não foi possível remover ${nomeProduto}. Tente novamente`, 'error');
                                    }
                                });
                            }
                        }, 3000);

                        Swal.getCancelButton().onclick = () => {
                            cancelado = true;
                            clearTimeout(swalTimer);
                            Swal.close();
                        };
                    }
                });
            } else {

                const unidadeTexto = quantidade === 1 ? 'unidade' : 'unidades';
                Swal.fire({
                    title: `Excluir "${nomeProduto}"?`,
                    html: `Este produto possui <b>${quantidade} ${unidadeTexto}</b><br>Esta ação é permanente`,
                    icon: 'warning',
                    showCancelButton: true,
                    allowOutsideClick: false,
                    confirmButtonText: 'Remover',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        confirmButton: 'swal2-remove-custom',
                        cancelButton: 'swal2-cancel-custom'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        fetch('/produtos/' + id, {
                            method: 'DELETE'
                        }).then(response => {
                            if (response.ok) {
                                Swal.fire({
                                    title: `"${nomeProduto}" removido!`,
                                    text: 'Produto movido para a lixeira',
                                    icon: 'success',
                                    showConfirmButton: false,
                                    timer: 1500,
                                }).then(() => {
                                    history.back();
                                });
                            } else {
                                Swal.fire('Erro!', `Não foi possível remover ${nomeProduto}. Tente novamente`, 'error');
                            }
                        });
                    }
                });
            }
        })
        .catch(error => {
            console.error('Erro ao buscar produto:', error);
            Swal.fire('Erro!', 'Erro ao carregar dados do produto', 'error');
        });
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.aplicarPermissoesEditarProduto) {
        window.aplicarPermissoesEditarProduto();
    }

    const textarea = document.getElementById('descricao');
    const contador = document.getElementById('contador-descricao');
    if (textarea && contador) {
        const max = textarea.maxLength || 200;
        contador.textContent = `${textarea.value.length}/${max}`;
        textarea.addEventListener('input', function() {
            contador.textContent = `${this.value.length}/${max}`;
        });
    }

    // document.getElementById('categoria').addEventListener('change', () => updateOptions());

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

Promise.all([
    fetch('/categorias').then(res => res.json()),
    fetch('/produtos/tamanhos').then(res => res.json()),
    fetch('/produtos/generos').then(res => res.json())
]).then(([categoriasData, tamanhosData, generosData]) => {
    categorias = categoriasData.map(cat => ({
        id: cat.id,
        nome: cat.nome,
        tipoTamanho: cat.tipoTamanho,
        tipoGenero: cat.tipoGenero
    }));
    tamanhosLetra = tamanhosData.filter(t => !t.startsWith('_'));
    tamanhosNumero = tamanhosData.filter(t => t.startsWith('_'));
    generosEnum = generosData;

    preencherRadiosCategoria();
    atualizarTamanhosEGenerosPorCategoria(null);

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
            })
            .catch(error => {
                console.error('Erro ao buscar o produto:', error);
                Swal.fire({
                    title: 'Erro!',
                    text: error.message || 'Não foi possível carregar os detalhes do produto',
                    icon: 'error',
                    confirmButtonColor: '#1E94A3'
                }).then(() => {
                    history.back();
                });
            });
    } else {
        Swal.fire({
            title: 'Erro!',
            text: 'ID do produto não encontrado na URL',
            icon: 'error',
            confirmButtonColor: '#1E94A3'
        }).then(() => {
            history.back();
        });
    }
    });
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
        codigoInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });
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
                            text: 'Informe outro código',
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


document.addEventListener('DOMContentLoaded', function() {
    const btnVoltar = document.getElementById('btn-voltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', function(e) {
            // Função para comparar alterações
            function descartarAlteracoes() {
                const codigo = document.getElementById('codigo').value.trim();
                const nome = document.getElementById('nome').value.trim();
                const categoria = categoriaInput.dataset.value || '';
                const tamanho = tamanhoInput.dataset.value || '';
                const genero = generoInput.dataset.value || '';
                const quantidade = document.getElementById('quantidade').value.trim();
                const limiteMinimo = document.getElementById('limiteMinimo').value.trim();
                const preco = document.getElementById('preco').value.replace(/[^\d,]/g, '').replace(',', '.');
                const descricao = document.getElementById('descricao').value.trim();
                const orig = window.dadosOriginaisEdicaoProduto || {};
                return (
                    codigo !== (orig.codigo || '') ||
                    nome !== (orig.nome || '') ||
                    categoria !== (orig.categoria || '') ||
                    tamanho !== (orig.tamanho || '') ||
                    genero !== (orig.genero || '') ||
                    quantidade !== (orig.quantidade || '') ||
                    limiteMinimo !== (orig.limiteMinimo || '') ||
                    preco !== (orig.preco || '') ||
                    descricao !== (orig.descricao || '')
                );
            }

            if (descartarAlteracoes()) {
                e.preventDefault();
                Swal.fire({
                    icon: 'warning',
                    title: 'Descartar alterações?',
                    text: 'As alterações não serão salvas',
                    showCancelButton: true,
                    confirmButtonText: 'Descartar',
                    cancelButtonText: 'Voltar',
                    allowOutsideClick: false,
                    customClass: {
                        confirmButton: 'swal2-deny'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        const anterior = sessionStorage.getItem('paginaAnteriorEditarProduto');
                        if (anterior) {
                            window.location.href = anterior;
                        } else {
                            window.location.href = '/inicio';
                        }
                    }
                });
            }
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

    // const selects = document.querySelectorAll('select');
    // selects.forEach(select => {
    //     select.addEventListener('focus', () => {
    //         select.style.backgroundColor = 'white';
    //     });
    //     select.addEventListener('blur', () => {
    //         select.style.backgroundColor = '';
    //     });
    // });

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


