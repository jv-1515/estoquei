const precoInput = document.getElementById('preco');

precoInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // remove tudo que não for número
    if (value.length > 5) value = value.slice(0, 5);
    if (value.length > 0) {
        value = (parseInt(value) / 100).toFixed(2).replace('.', ',');
        e.target.value = 'R$ ' + value;
    } else {
        e.target.value = '';
    }
});

const form = document.querySelector('form');

form.addEventListener('submit', function(e) {
    let rawValue = precoInput.value.replace(/[^\d,]/g, '').replace(',', '.');
    let hidden = form.querySelector('input[name="preco_real"]');
    if (hidden) hidden.remove();
    hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = 'preco';
    hidden.value = rawValue;
    form.appendChild(hidden);
});



function updateOptions() {
    const categoria = document.getElementById('categoria').value;
    const tamanho = document.getElementById('tamanho');
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

    if (!categoria) {
        tamanho.innerHTML = options;
        return;
    }

    if (categoria === 'SAPATO' || categoria === 'MEIA') {
        for (let i = 36; i <= 44; i++) {
            options += `<option value="_${i}">${i}</option>`;
        }
    } else if (categoria === 'BERMUDA' || categoria === 'CALÇA' || categoria === 'VESTIDO') {
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
    const saveBtn = document.getElementById('save');
    saveBtn.disabled = true;
    Swal.fire({
        title: '<span style="margin-top:20px;padding-top: 20px;display:block;">Cadastrando produto</span>',
        text: 'Aguarde...',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    event.preventDefault();

    const precoInput = document.getElementById('preco');
    const precoLimpo = precoInput.value.replace(/[^\d,]/g, '').replace(',', '.');
    const formData = new FormData(this);
    formData.set('preco', precoLimpo);

    fetch(this.action, {
        method: this.method,
        body: formData
    }).then(async data => {  
        if (!data.ok) {
            throw new Error('Falha de conexão');
        }
        const produto = await data.json();
        const idProduto = produto.id;

        form.reset();
        const preview = document.getElementById('image-preview');
        if (preview) {
            Array.from(preview.querySelectorAll('img')).forEach(img => preview.removeChild(img));
            Array.from(preview.querySelectorAll('.fa-image')).forEach(icon => preview.removeChild(icon));
            const icon = document.createElement('i');
            icon.className = 'fa-regular fa-image';
            icon.style.fontSize = '30px';
            preview.appendChild(icon);
        }
        const descricaoInput = document.getElementById('descricao');
        if (descricaoInput) descricaoInput.value = '';

        Swal.fire({
            title: "Sucesso!",
            text: "Produto cadastrado no estoque!",
            icon: "success",
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Acessar Estoque',
            cancelButtonText: 'Abastecer Produto',
            allowOutsideClick: false,
            customClass: {
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "/estoque";
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                window.location.href = `/movimentar-produto?id=${idProduto}`;
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
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Cadastrar';
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
        const preview = document.getElementById('image-preview');
        const observer = new MutationObserver(function() {
            if (preview.querySelector('img')) {
                editIcon.style.color = '#555';
                editIcon.addEventListener('mouseenter', function() {
                    editIcon.style.color = '#1e94a3';
                });
                editIcon.addEventListener('mouseleave', function() {
                    editIcon.style.color = '#555';
                });
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
        codigoInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });        
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
                            text: 'Informe outro código',
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

window.addEventListener('DOMContentLoaded', function() {
    const limiteInput = document.getElementById('limiteMinimo');
    if (limiteInput) {
        limiteInput.addEventListener('input', function() {
            if (this.value.length > 3) this.value = this.value.slice(0, 3);
            if (this.value > 999) this.value = 999;
        });
    }
});

window.dadosOriginaisCadastroProduto = {
    codigo: '',
    nome: '',
    categoria: '',
    tamanho: '',
    genero: '',
    quantidade: '',
    limiteMinimo: '',
    preco: '',
    descricao: ''
};

function descartarInformacoes() {
    const orig = window.dadosOriginaisCadastroProduto || {};
    const codigo = document.getElementById('codigo').value.trim();
    const nome = document.getElementById('nome').value.trim();
    const categoria = document.getElementById('categoria').value;
    const tamanho = document.getElementById('tamanho').value;
    const genero = document.getElementById('genero').value;
    const quantidade = document.getElementById('quantidade') ? document.getElementById('quantidade').value.trim() : '';
    const limiteMinimo = document.getElementById('limiteMinimo').value.trim();
    const preco = document.getElementById('preco').value.replace(/[^\d,]/g, '').replace(',', '.');
    const descricao = document.getElementById('descricao').value.trim();

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

document.addEventListener('DOMContentLoaded', function() {
    const btnVoltar = document.getElementById('btn-voltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', function(e) {
            if (descartarInformacoes()) {
                e.preventDefault();
                Swal.fire({
                    icon: 'warning',
                    title: 'Descartar informações?',
                    text: 'As informações preenchidas não serão salvas',
                    showCancelButton: true,
                    confirmButtonText: 'Descartar',
                    cancelButtonText: 'Voltar',
                    allowOutsideClick: false,
                    customClass: {
                        confirmButton: 'swal2-remove-custom',
                        cancelButton: 'swal2-cancel-custom'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        history.back();
                    }
                });
            }
        });
    }
});

function fecharModalCategorias() {
  for(let i=1;i<=12;i++) {
    atualizarArrayTamanho(i);
    atualizarArrayGenero(i);
    categoriasModal[i-1].nome = document.getElementById('categoria_'+i).value.slice(0,10);
  }

  if (JSON.stringify(categoriasModal) === categoriasModalSnapshot) {
    document.getElementById('modal-categorias-bg').style.display = 'none';
    document.body.style.overflow = '';
    return;
  }

  Swal.fire({
    icon: 'warning',
    title: 'Descartar alterações?',
    text: 'As alterações não serão salvas',
    showCancelButton: true,
    confirmButtonText: 'Descartar',
    cancelButtonText: 'Voltar',
    allowOutsideClick: false,
    customClass: {
      confirmButton: 'swal2-remove-custom',
      cancelButton: 'swal2-cancel-custom'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      document.getElementById('modal-categorias-bg').style.display = 'none';
      document.body.style.overflow = '';
      // Restaura o array para o snapshot
      categoriasModal = JSON.parse(categoriasModalSnapshot);
      preencherCamposCategorias();
    }
  });
}

// Array de categorias (carrega do localStorage ou começa vazio)
let categoriasModal = JSON.parse(localStorage.getItem('categoriasModal')) || Array.from({length:12}, (_,i)=>({id:i+1,nome:"",tamanhos:[],generos:[]}));
// Snapshot para comparação
let categoriasModalSnapshot = JSON.stringify(categoriasModal);

// Ao abrir modal, salva snapshot
document.querySelector('[title="Categorias"]').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('modal-categorias-bg').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  categoriasModalSnapshot = JSON.stringify(categoriasModal);
  preencherCamposCategorias();
});

// Preenche os campos do modal com o array
function preencherCamposCategorias() {
  for(let i=1;i<=12;i++) {
    document.getElementById('categoria_'+i).value = categoriasModal[i-1].nome || "";
    document.getElementById('categoria_'+i).maxLength = 10;
    atualizarCheckboxesTamanho(i, categoriasModal[i-1].tamanhos);
    atualizarCheckboxesGenero(i, categoriasModal[i-1].generos);
    atualizarPlaceholderTamanhoMulti(i);
    atualizarPlaceholderGeneroMulti(i);
  }
}

// Atualiza checkboxes de tamanho
function atualizarCheckboxesTamanho(idx, arr) {
  const checks = document.querySelectorAll(`#checkboxes-tamanho-multi-${idx} .tamanho-multi-check`);
  checks.forEach(cb => cb.checked = false);
  if(arr.includes("TODOS")) checks[0].checked = true;
  if(arr.includes("LETRAS")) checks[1].checked = true;
  if(arr.includes("NUMERICOS")) checks[2].checked = true;
}

// Atualiza checkboxes de genero
function atualizarCheckboxesGenero(idx, arr) {
  const checks = document.querySelectorAll(`#checkboxes-genero-multi-${idx} .genero-multi-check`);
  checks.forEach(cb => cb.checked = false);
  if(arr.includes("TODOS")) checks[0].checked = true;
  if(arr.includes("MASCULINO")) checks[1].checked = true;
  if(arr.includes("FEMININO")) checks[2].checked = true;
  if(arr.includes("UNISSEX")) checks[3].checked = true;
}

// Multiselect Tamanhos
function abrirTamanhoMulti(idx) {
  document.querySelectorAll('.checkboxes-tamanho-multi').forEach(div => div.style.display = 'none');
  document.getElementById('checkboxes-tamanho-multi-' + idx).style.display = 'block';
}
document.querySelectorAll('.checkboxes-tamanho-multi').forEach((container, idx) => {
  container.addEventListener('change', function(e) {
    if (e.target.classList.contains('tamanho-multi-check')) {
      const checks = container.querySelectorAll('.tamanho-multi-check');
      const todos = checks[0];
      const letras = checks[1];
      const nums = checks[2];
      if (e.target.value === "TODOS") {
        checks.forEach(cb => cb.checked = todos.checked);
      } else {
        todos.checked = letras.checked && nums.checked;
      }
      atualizarPlaceholderTamanhoMulti(idx + 1);
      atualizarArrayTamanho(idx + 1);
    }
  });
});
function atualizarPlaceholderTamanhoMulti(idx) {
  const div = document.getElementById('checkboxes-tamanho-multi-' + idx);
  const checks = div.querySelectorAll('.tamanho-multi-check');
  const todos = checks[0];
  const letras = checks[1];
  const nums = checks[2];
  let texto = 'Selecionar';
  let color = '#757575';
  if (todos && todos.checked) {
    texto = 'Todos';
    color = '#000';
  } else {
    let arr = [];
    if (letras && letras.checked) arr.push('Letras');
    if (nums && nums.checked) arr.push('Numéricos');
    texto = arr.length ? arr.join(', ') : 'Selecionar';
    color = arr.length ? '#000' : '#757575';
  }
  const input = document.getElementById('tamanho_input_' + idx);
  input.value = texto;
  input.style.color = color;
}
function atualizarArrayTamanho(idx) {
  const div = document.getElementById('checkboxes-tamanho-multi-' + idx);
  const checks = div.querySelectorAll('.tamanho-multi-check');
  const todos = checks[0];
  const letras = checks[1];
  const nums = checks[2];
  categoriasModal[idx-1].tamanhos = [];
  if (todos && todos.checked) categoriasModal[idx-1].tamanhos = ["TODOS"];
  else {
    if (letras && letras.checked) categoriasModal[idx-1].tamanhos.push("LETRAS");
    if (nums && nums.checked) categoriasModal[idx-1].tamanhos.push("NUMERICOS");
  }
}

// Multiselect Genero
function abrirGeneroMulti(idx) {
  document.querySelectorAll('.checkboxes-genero-multi').forEach(div => div.style.display = 'none');
  document.getElementById('checkboxes-genero-multi-' + idx).style.display = 'block';
}
document.querySelectorAll('.checkboxes-genero-multi').forEach((container, idx) => {
  container.addEventListener('change', function(e) {
    if (e.target.classList.contains('genero-multi-check')) {
      const checks = container.querySelectorAll('.genero-multi-check');
      const todos = checks[0];
      const masc = checks[1];
      const fem = checks[2];
      const uni = checks[3];
      if (e.target.value === "TODOS") {
        checks.forEach(cb => cb.checked = todos.checked);
      } else {
        todos.checked = masc.checked && fem.checked && uni.checked;
      }
      atualizarPlaceholderGeneroMulti(idx + 1);
      atualizarArrayGenero(idx + 1);
    }
  });
});
function atualizarPlaceholderGeneroMulti(idx) {
  const div = document.getElementById('checkboxes-genero-multi-' + idx);
  const checks = div.querySelectorAll('.genero-multi-check');
  const todos = checks[0];
  let texto = 'Selecionar';
  let color = '#757575';
  let arr = [];
  if (todos && todos.checked) {
    texto = 'Todos';
    color = '#000';
  } else {
    if (checks[1] && checks[1].checked) arr.push('Masculino');
    if (checks[2] && checks[2].checked) arr.push('Feminino');
    if (checks[3] && checks[3].checked) arr.push('Unissex');
    texto = arr.length ? arr.join(', ') : 'Selecionar';
    color = arr.length ? '#000' : '#757575';
  }
  const input = document.getElementById('genero_input_' + idx);
  input.value = texto;
  input.style.color = color;
}
function atualizarArrayGenero(idx) {
  const div = document.getElementById('checkboxes-genero-multi-' + idx);
  const checks = div.querySelectorAll('.genero-multi-check');
  categoriasModal[idx-1].generos = [];
  if (checks[0] && checks[0].checked) categoriasModal[idx-1].generos = ["TODOS"];
  else {
    if (checks[1] && checks[1].checked) categoriasModal[idx-1].generos.push("MASCULINO");
    if (checks[2] && checks[2].checked) categoriasModal[idx-1].generos.push("FEMININO");
    if (checks[3] && checks[3].checked) categoriasModal[idx-1].generos.push("UNISSEX");
  }
}

// Fecha popups ao clicar fora
document.addEventListener('mousedown', function(e) {
  document.querySelectorAll('.checkboxes-tamanho-multi').forEach(div => {
    if (div.style.display === 'block' && !div.contains(e.target)) div.style.display = 'none';
  });
  document.querySelectorAll('.checkboxes-genero-multi').forEach(div => {
    if (div.style.display === 'block' && !div.contains(e.target)) div.style.display = 'none';
  });
});

// Sincroniza nome da categoria no array
document.querySelectorAll('.categorias-input[id^="categoria_"]').forEach((input, idx) => {
  input.addEventListener('input', function() {
    categoriasModal[idx].nome = this.value.slice(0,10);
  });
});

// Validação dos campos obrigatórios
function validarCategoriasObrigatorias() {
  let ok = true;
  for(let i=0;i<12;i++) {
    const cat = categoriasModal[i];
    if(cat.nome.trim() && cat.tamanhos.length && cat.generos.length) continue;
    // Se algum campo está preenchido, todos devem estar
    if(cat.nome.trim() || cat.tamanhos.length || cat.generos.length) {
      ok = false;
      break;
    }
  }
  return ok;
}

// Salvar alterações
document.getElementById('form-categorias').addEventListener('submit', function(e) {
  e.preventDefault();
  // Atualiza arrays antes de comparar
  for(let i=1;i<=12;i++) {
    atualizarArrayTamanho(i);
    atualizarArrayGenero(i);
    categoriasModal[i-1].nome = document.getElementById('categoria_'+i).value.slice(0,10);
  }
  // Validação obrigatória
  if(!validarCategoriasObrigatorias()) {
    Swal.fire({
      icon: 'warning',
      title: 'Preencha todos os campos!',
      text: 'São obrigatórios para cada categoria',
      timer: 1500,
      showConfirmButton: false
    });
    return;
  }
  // Comparação
  if(JSON.stringify(categoriasModal) === categoriasModalSnapshot) {
    Swal.fire({
      icon: 'info',
      title: 'Sem alterações',
      text: 'Nenhuma alteração foi feita',
      timer: 1500,
      showConfirmButton: false
    });
    document.getElementById('modal-categorias-bg').style.display = 'none';
    document.body.style.overflow = '';
    return;
  }
  // Salva no localStorage
  localStorage.setItem('categoriasModal', JSON.stringify(categoriasModal));
  categoriasModalSnapshot = JSON.stringify(categoriasModal);
  Swal.fire({
    icon: 'success',
    title: 'Categorias salvas!',
    text: 'Alterações registradas.',
    timer: 1500,
    showConfirmButton: false
  });
  document.getElementById('modal-categorias-bg').style.display = 'none';
  document.body.style.overflow = '';
});


// Adiciona listeners aos botões remover
function adicionarListenersRemoverCategorias() {
  document.querySelectorAll('.remover').forEach((btn, idx) => {
    btn.onclick = function(e) {
      e.preventDefault();
      // Só permite remover se houver mais de 1 preenchida
      const preenchidas = categoriasModal.filter(cat => cat.nome.trim());
      if (preenchidas.length <= 1) {
        Swal.fire({
          icon: 'warning',
          title: 'Não é possível remover!',
          text: 'Deve existir pelo menos 1 categoria',
          timer: 1500,
          showConfirmButton: false
        });
        return;
      }

      // TODO: Verificar se existe produto cadastrado com essa categoria
      // const nomeCategoria = categoriasModal[idx].nome.trim();
      // if (existeProdutoComCategoria(nomeCategoria)) {
      //   Swal.fire({
      //     icon: 'error',
      //     title: 'Não é possível remover',
      //     text: 'Já existe produto cadastrado com essa categoria!',
      //     timer: 1800,
      //     showConfirmButton: false
      //   });
      //   return;
      // }

      Swal.fire({
        icon: 'warning',
        title: 'Remover categoria?',
        text: 'Essa ação não pode ser desfeita.',
        showCancelButton: true,
        confirmButtonText: 'Remover',
        cancelButtonText: 'Voltar',
        allowOutsideClick: false,
        customClass: {
        confirmButton: 'swal2-remove-custom',
        cancelButton: 'swal2-cancel-custom'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Remove do array e reordena
          categoriasModal.splice(idx, 1);
          // Adiciona uma categoria vazia ao final para manter 12 linhas
          categoriasModal.push({id: categoriasModal.length+1, nome:"", tamanhos:[], generos:[]});
          // Atualiza os campos
          preencherCamposCategorias();
          adicionarListenersRemoverCategorias();
          // Atualiza snapshot para garantir que a alteração será detectada
          categoriasModalSnapshot = JSON.stringify(categoriasModal);
        }
      });
    };
  });
}

// Chame após preencher os campos
function preencherCamposCategorias() {
  for(let i=1;i<=12;i++) {
    document.getElementById('categoria_'+i).value = categoriasModal[i-1].nome || "";
    document.getElementById('categoria_'+i).maxLength = 10;
    atualizarCheckboxesTamanho(i, categoriasModal[i-1].tamanhos);
    atualizarCheckboxesGenero(i, categoriasModal[i-1].generos);
    atualizarPlaceholderTamanhoMulti(i);
    atualizarPlaceholderGeneroMulti(i);
  }
  adicionarListenersRemoverCategorias();
}