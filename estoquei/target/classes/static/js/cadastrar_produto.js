let generosEnum = [];

fetch('/produtos/generos')
    .then(res => res.json())
    .then(generos => {
        generosEnum = generos;
    });


let tamanhosLetra = [];
let tamanhosNumero = [];

fetch('/produtos/tamanhos')
    .then(res => res.json())
    .then(tamanhos => {
        tamanhosLetra = tamanhos.filter(t => !t.startsWith('_'));
        tamanhosNumero = tamanhos.filter(t => t.startsWith('_'));
    });


function formatarGeneroVisual(gen) {
  return gen.charAt(0) + gen.slice(1).toLowerCase();
}

function formatarTamanhoVisual(tam) {
    if (tam === "ÚNICO" || tam === "UNICO") return "Único";
    if (tam.startsWith("_")) return tam.slice(1);
    return tam;
}

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



// Array de categorias cadastrado no modal (com nível de tamanhos)
let categoriasModal = JSON.parse(localStorage.getItem('categoriasModal'));
if (!categoriasModal || categoriasModal.length === 0) {
  categoriasModal = [];
  localStorage.setItem('categoriasModal', JSON.stringify(categoriasModal));
}
// Evento de clique do radio da categoria
document.querySelectorAll('.checkboxes-categoria-multi input[type="radio"]').forEach(radio => {
    radio.addEventListener('click', function(e) {
        const categoriaSelecionada = e.target.value;
        const categoriaObj = categorias.find(cat => cat.nome === categoriaSelecionada);

        // Tamanhos (já está correto, usando tipoTamanho)
        let tamanhosPermitidos = [];
        if (categoriaObj) {
            if (categoriaObj.tipoTamanho === 2) {
                tamanhosPermitidos = tamanhosNumero;
            } else if (categoriaObj.tipoTamanho === 1) {
                tamanhosPermitidos = tamanhosLetra;
            } else {
                tamanhosPermitidos = [...tamanhosLetra, ...tamanhosNumero];
            }
        }
        const tamanhoSelect = document.getElementById('tamanho');
        tamanhoSelect.innerHTML = '<option value="" disabled selected hidden>Selecionar</option>';
        tamanhosPermitidos.forEach(tam => {
            tamanhoSelect.innerHTML += `<option value="${tam}">${tam}</option>`;
        });

        // ----------- GÊNEROS: use apenas tipoGenero do array fixo -----------
        let generosPermitidos = [];
        if (categoriaObj) {
            switch (categoriaObj.tipoGenero) {
                case "T":
                    generosPermitidos = ["MASCULINO", "FEMININO", "UNISSEX"];
                    break;
                case "F":
                    generosPermitidos = ["FEMININO"];
                    break;
                case "M":
                    generosPermitidos = ["MASCULINO"];
                    break;
                case "U":
                    generosPermitidos = ["UNISSEX"];
                    break;
                case "FM":
                    generosPermitidos = ["MASCULINO", "FEMININO"];
                    break;
                default:
                    generosPermitidos = ["MASCULINO", "FEMININO", "UNISSEX"];
            }
        } else {
            generosPermitidos = ["MASCULINO", "FEMININO", "UNISSEX"];
        }

        // Atualiza o select de gêneros
        const generoSelect = document.getElementById('genero');
        generoSelect.innerHTML = '<option value="" disabled selected hidden>Selecionar</option>';
        generosPermitidos.forEach(gen => {
            generoSelect.innerHTML += `<option value="${gen}">${gen.charAt(0) + gen.slice(1).toLowerCase()}</option>`;
        });
        // --------------------------------------------------------
    });
});


document.querySelector('form').addEventListener('submit', function(event) {
    const saveBtn = document.getElementById('save');
    saveBtn.disabled = true;
    Swal.fire({
        icon: 'info',
        title: 'Cadastrando produto...',
        text: 'Aguarde',
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

    formData.set('categoria', document.getElementById('categoria-multi').dataset.value.toUpperCase() || '');

    const generoInput = document.getElementById('genero-multi');
    const tamanhoInput = document.getElementById('tamanho-multi');
    
    formData.set('genero', generoInput.dataset.value || '');
    formData.set('tamanho', tamanhoInput.dataset.value || '');

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

        const { cargo } = await getPermissoesUsuario();
        
        Swal.fire({
            title: `Produto "${produto.nome}" cadastrado!`,
            text: "Selecione uma opção",
            icon: "success",
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: 'Acessar Estoque',
            cancelButtonText: temPermissao(cargo, 'movimentacoes', 2) ? 'Abastecer Produto' : 'Voltar ao Início',
            allowOutsideClick: false,
            customClass: {
              confirmButton: 'swal2-confirm-custom',
              cancelButton: 'swal2-cancel'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "/estoque";
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                if (temPermissao(cargo, 'movimentacoes', 2)) {
                    window.location.href = `/movimentar-produto?id=${idProduto}`;
                } else {
                    window.location.href = "/inicio";
                }
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
  for(let i=1;i<=categoriasModal.length;i++) {
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
// let categoriasModal = JSON.parse(localStorage.getItem('categoriasModal')) || Array.from({length:12}, (_,i)=>({id:i+1,nome:"",tamanhos:[],generos:[]}));
// Snapshot para comparação
let categoriasModalSnapshot = JSON.stringify(categoriasModal);

// Evento de clique dos radios de categoria para atualizar tamanhos
document.querySelectorAll('.checkboxes-categoria-multi input[type="radio"]').forEach(radio => {
  radio.addEventListener('click', function(e) {
    const categoriaSelecionada = e.target.value;
    // Busca a categoria no array cadastrado
    const categoriaObj = categoriasModal.find(cat => cat.nome === categoriaSelecionada);
    // Decide os tamanhos permitidos conforme cadastrado
    let tamanhosPermitidos = [];
    if (categoriaObj && categoriaObj.tamanhos && categoriaObj.tamanhos.length > 0) {
      tamanhosPermitidos = categoriaObj.tamanhos;
    } else if (categoriaSelecionada === "SAPATO" || categoriaSelecionada === "MEIA") {
      tamanhosPermitidos = tamanhosNumero;
    } else {
      tamanhosPermitidos = tamanhosLetra;
    }
    // Atualiza o select de tamanhos
    const tamanhoSelect = document.getElementById('tamanho');
    tamanhoSelect.innerHTML = '<option value="" disabled selected hidden>Selecionar</option>';
    tamanhosPermitidos.forEach(tam => {
      tamanhoSelect.innerHTML += `<option value="${tam}">${tam}</option>`;
    });
  });
});

function renderizarCategoriasModal() {
  const container = document.querySelector('.categorias-table');
  container.innerHTML = '';
  categoriasModal.forEach((cat, idx) => {
    const linhaValida = cat.nome && cat.nome.trim() && cat.tamanhos && cat.tamanhos.length && cat.generos && cat.generos.length;
    container.innerHTML += `
      <div class="categorias-row">
        <div class="categorias-col">
          ${idx === 0 ? `<label class="categorias-label" for="categoria_${idx+1}">Categoria</label>` : ''}
          <input type="text" class="categorias-input" id="categoria_${idx+1}" maxlength="10" value="${cat.nome || ''}" placeholder="Digite o nome">
        </div>
        <div class="categorias-col">
          ${idx === 0 ? `<label class="categorias-label" for="tamanho_input_${idx+1}">Tamanhos</label>` : ''}
          <div class="multiselect-tamanho">
            <input type="text" class="categorias-input" id="tamanho_input_${idx+1}" value="Todos" placeholder="Selecionar" readonly onclick="abrirTamanhoMulti(${idx+1})" style="color: #757575;">
            <span class="chevron-tamanho"><i class="fa fa-chevron-down"></i></span>
            <div class="checkboxes-tamanho-multi" id="checkboxes-tamanho-multi-${idx+1}" style="display:none;">
              <label><input type="checkbox" class="tamanho-multi-check" value="TODOS" checked> Todos (Numéricos e Letras)</label>
              <label><input type="checkbox" class="tamanho-multi-check" value="LETRAS" checked> Letras (Único, PP-XXG)</label>
              <label><input type="checkbox" class="tamanho-multi-check" value="NUMERICOS" checked> Numéricos (36-56)</label>
            </div>
          </div>
        </div>
        <div class="categorias-col">
          ${idx === 0 ? `<label class="categorias-label" for="genero_input_${idx+1}">Gêneros</label>` : ''}
          <div class="multiselect-genero">
            <input type="text" class="categorias-input" id="genero_input_${idx+1}" value="Todos" placeholder="Selecionar" readonly onclick="abrirGeneroMulti(${idx+1})" style="color: #757575;">
            <span class="chevron-genero"><i class="fa fa-chevron-down"></i></span>
            <div class="checkboxes-genero-multi" id="checkboxes-genero-multi-${idx+1}" style="display:none;">
              <label><input type="checkbox" class="genero-multi-check" value="TODOS" checked> Todos</label>
              <label><input type="checkbox" class="genero-multi-check" value="MASCULINO" checked> Masculino</label>
              <label><input type="checkbox" class="genero-multi-check" value="FEMININO" checked> Feminino</label>
              <label><input type="checkbox" class="genero-multi-check" value="UNISSEX" checked> Unissex</label>
            </div>
          </div>
        </div>
        <div class="categorias-col" style="display:flex; justify-content:center; align-items:flex-end;">
          ${linhaValida ? `<button type="button" class="remover" data-idx="${idx+1}" title="Remover"><i class="fa-solid fa-delete-left"></i></button>` : ''}
        </div>
      </div>
    `;
  });
  atualizarBotaoCriar();
  preencherCamposCategorias();
  adicionarListenersRemoverCategorias();
}

document.querySelector('[title="Categorias"]').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('modal-categorias-bg').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  categoriasModalSnapshot = JSON.stringify(categoriasModal);
  renderizarCategoriasModal();
});

// Preenche os campos do modal com o array
function preencherCamposCategorias() {
  for(let i=1;i<=categoriasModal.length;i++) {
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
  if (!checks.length) return;
  if(arr.includes("TODOS")) {
    checks.forEach(cb => cb.checked = true);
  } else {
    checks.forEach(cb => cb.checked = false);
    if(arr.includes("LETRAS") && checks[1]) checks[1].checked = true;
    if(arr.includes("NUMERICOS") && checks[2]) checks[2].checked = true;
  }
}

// Atualiza checkboxes de genero
function atualizarCheckboxesGenero(idx, arr) {
  const checks = document.querySelectorAll(`#checkboxes-genero-multi-${idx} .genero-multi-check`);
  if(arr.includes("TODOS")) {
    checks.forEach(cb => cb.checked = true); // Marca todos
  } else {
    checks.forEach(cb => cb.checked = false);
    if(arr.includes("MASCULINO")) checks[1].checked = true;
    if(arr.includes("FEMININO")) checks[2].checked = true;
    if(arr.includes("UNISSEX")) checks[3].checked = true;
  }
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
  if (!div) return;
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
  if (!div) return;
  const checks = div.querySelectorAll('.genero-multi-check');
  if (!checks.length) return;
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
  function verificarDuplicidade() {
    const nomeAtual = input.value.trim().toLowerCase();
    if (!nomeAtual) return;
        if (/\d/.test(nomeAtual)) {
        Swal.fire({
            icon: 'error',
            title: 'Nome inválido!',
            text: 'O nome da categoria não pode conter números!',
            timer: 1500,
            timerProgressBar: true,
            allowOutsideClick: false,
            showConfirmButton: false
        });
        input.value = '';
        categoriasModal[idx].nome = '';
        input.focus();
        return;
    }
    const nomes = categoriasModal.map((cat, i) => i !== idx ? cat.nome.trim().toLowerCase() : null).filter(n => n);
    if (nomes.includes(nomeAtual)) {
      Swal.fire({
        icon: 'error',
        title: 'Categoria já criada!',
        text: 'Escolha outro nome',
        timer: 1500,
        timerProgressBar: true,
        allowOutsideClick: false,
        showConfirmButton: false
      });
      input.value = '';
      categoriasModal[idx].nome = '';
      input.focus();
    }
  }
  input.addEventListener('blur', verificarDuplicidade);
});

// Validação dos campos obrigatórios
function validarCategoriasObrigatorias() {
  let ok = true;
  for(let i=0;i<categoriasModal.length;i++) {
    const cat = categoriasModal[i];
    if(cat.nome.trim() && cat.tamanhos.length && cat.generos.length) continue;
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
  for(let i=1;i<=categoriasModal.length;i++) {
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
      timerProgressBar: true,
      allowOutsideClick: false,
      showConfirmButton: false
    });
    document.getElementById('modal-categorias-bg').style.display = 'none';
    document.body.style.overflow = '';
    return;
  }
  // Salva no localStorage
  Swal.fire({
    icon: 'question',
    title: 'Tem certeza?',
    text: 'As alterações não poderão ser desfeitas',
    showCancelButton: true,
    confirmButtonText: 'Salvar',
    cancelButtonText: 'Voltar',
    allowOutsideClick: false,
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.setItem('categoriasModal', JSON.stringify(categoriasModal));
      categoriasModalSnapshot = JSON.stringify(categoriasModal);
      Swal.fire({
        icon: 'success',
        title: 'Categorias salvas!',
        timer: 1500,
        timerProgressBar: true,
        allowOutsideClick: false,
        showConfirmButton: false
      });
      document.getElementById('modal-categorias-bg').style.display = 'none';
      document.body.style.overflow = '';
    }
  });
});

// Adiciona listeners aos botões remover
function adicionarListenersRemoverCategorias() {
  document.querySelectorAll('.remover').forEach((btn, idx) => {
    btn.onclick = function(e) {
      e.preventDefault();
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


      Swal.fire({
        icon: 'warning',
        title: 'Remover categoria?',
        text: 'Essa ação não pode ser desfeita',
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
          categoriasModal.splice(idx, 1);
          localStorage.setItem('categoriasModal', JSON.stringify(categoriasModal));
          categoriasModalSnapshot = JSON.stringify(categoriasModal);
          renderizarCategoriasModal();
        }
      });
    };
  });
}

function preencherCamposCategorias() {
  for(let i=1;i<=categoriasModal.length;i++) {
    const nomeInput = document.getElementById('categoria_'+i);
    if (nomeInput) {
      nomeInput.value = categoriasModal[i-1].nome || "";
      nomeInput.maxLength = 10;
    }
    atualizarCheckboxesTamanho(i, categoriasModal[i-1].tamanhos);
    atualizarCheckboxesGenero(i, categoriasModal[i-1].generos);
    atualizarPlaceholderTamanhoMulti(i);
    atualizarPlaceholderGeneroMulti(i);
  }
  adicionarListenersRemoverCategorias();
  aplicarEstiloInputs();
}

const coresCategorias = [
    "30,148,163",   // #1e94a3
    "39,117,128",   // #277580
    "191,161,0",    // #bfa100
    "192,57,43",    // #c0392b
    "230,103,34",   // #e67e22
    "142,68,173",   // #8e44ad
    "22,160,133",   // #16a085
    "63,106,179",   // #3f6ab3
    "59,69,138",    // #3b458a
    "190,148,84",   // #be9454
    "242,109,141",  // #f26d8d
    "255,152,86",   // #ff9856
];

function aplicarEstiloInputs() {
    for (let i = 1; i <= 12; i++) {
        const nomeInput = document.getElementById('categoria_' + i);
        const tamanhoChecks = document.querySelectorAll(`#checkboxes-tamanho-multi-${i} .tamanho-multi-check`);
        const generoChecks = document.querySelectorAll(`#checkboxes-genero-multi-${i} .genero-multi-check`);
        const tamanhoInput = document.getElementById('tamanho_input_' + i);
        const generoInput = document.getElementById('genero_input_' + i);
        const btnRemover = document.querySelector(`.remover[data-idx="${i}"]`);

        function atualizarCorLinha() {
            const nomeValido = nomeInput && nomeInput.value.trim() !== '';
            const algumTamanho = Array.from(tamanhoChecks).some(cb => cb.checked);
            const algumGenero = Array.from(generoChecks).some(cb => cb.checked);
            const linhaValida = nomeValido && algumTamanho && algumGenero;

            // Input de nome da categoria: cor personalizada
            if (nomeInput) {
                const corRgb = coresCategorias[i - 1] || "204,204,204";
                const bgColor = linhaValida ? `rgb(${corRgb})` : `rgba(${corRgb},0.5)`;
                const borderColor = linhaValida ? `rgb(${corRgb})` : `rgba(${corRgb},0.5)`;
                nomeInput.style.backgroundColor = bgColor;
                nomeInput.style.border = `1px solid ${borderColor}`;
                nomeInput.style.color = linhaValida ? "#fff" : "#000";
                nomeInput.style.opacity = "1";
                nomeInput.placeholder = "Digite o nome";
            }

            // Inputs de tamanho/gênero: cinza quando válidos, branco quando inválidos
            [tamanhoInput, generoInput].forEach(input => {
                if (input) input.style.backgroundColor = linhaValida ? '#f1f1f1' : 'white';
            });

            if (btnRemover) {
                btnRemover.disabled = !linhaValida;
            }
        }

        atualizarCorLinha();

        // Atualiza cor ao digitar no nome
        if (nomeInput) {
            nomeInput.addEventListener('input', atualizarCorLinha);
            nomeInput.addEventListener('blur', atualizarCorLinha);
        }
        // Atualiza cor ao marcar/desmarcar tamanhos
        tamanhoChecks.forEach(cb => cb.addEventListener('change', atualizarCorLinha));
        // Atualiza cor ao marcar/desmarcar gêneros
        generoChecks.forEach(cb => cb.addEventListener('change', atualizarCorLinha));
    }
}


// Função para preencher radios do multiselect categoria
function preencherRadiosCategoria() {
  const radiosDiv = document.getElementById('radios-categoria-multi');
  if (!radiosDiv) return;
  radiosDiv.innerHTML = '';
  categorias.forEach((cat, idx) => {
    const label = document.createElement('label');
    label.setAttribute('for', `categoria_radio_${cat.id}`);
    label.textContent = cat.nome;
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'categoria_radio';
    radio.id = `categoria_radio_${cat.id}`;
    radio.value = cat.nome;
    label.appendChild(radio);
    radiosDiv.appendChild(label);
  });
}

// função ao carregar
document.addEventListener('DOMContentLoaded', preencherRadiosCategoria);

// Array de categorias provisório
const categorias = [
  { id: 1, nome: "Camisa", tipoTamanho: 1, tipoGenero: "T" },
  { id: 2, nome: "Camiseta", tipoTamanho: 1, tipoGenero: "T" },
  { id: 3, nome: "Calça", tipoTamanho: 2, tipoGenero: "T" },
  { id: 4, nome: "Bermuda", tipoTamanho: 2, tipoGenero: "T" },
  { id: 5, nome: "Vestido", tipoTamanho: 1, tipoGenero: "F" },
  { id: 6, nome: "Sapato", tipoTamanho: 2, tipoGenero: "T" },
  { id: 7, nome: "Meia", tipoTamanho: 2, tipoGenero: "T" }
];

// tipoTamanho: 0 = todos, 1 = letras, 2 = numéricos
// tipoGenero: 0 = todos, 1 = feminino, 2 = masculino, 3 = unissex

const categoriaInput = document.getElementById('categoria-multi');
const radiosDiv = document.getElementById('radios-categoria-multi');
const chevron = document.querySelector('.chevron-categoria');

function preencherRadiosCategoria() {
  radiosDiv.innerHTML = '';
  categorias.forEach(cat => {
    const label = document.createElement('label');
    label.className = 'categoria-multi-label';
    label.innerHTML = `<input type="radio" name="categoria-radio" value="${cat.nome}" style="display:none;">${cat.nome}`;
    radiosDiv.appendChild(label);
  });
}
preencherRadiosCategoria();

function abrirFecharCategoriaMulti() {
  radiosDiv.style.display = radiosDiv.style.display === 'block' ? 'none' : 'block';
}
categoriaInput.addEventListener('click', abrirFecharCategoriaMulti);
chevron.addEventListener('click', abrirFecharCategoriaMulti);

document.addEventListener('mousedown', function(e) {
  if (radiosDiv.style.display === 'block') {
    if (!radiosDiv.contains(e.target) && e.target !== categoriaInput && e.target !== chevron) {
      radiosDiv.style.display = 'none';
    }
  }
});

radiosDiv.addEventListener('click', function(e) {
  const label = e.target.closest('label');
  if (!label) return;
  this.querySelectorAll('label').forEach(l => l.classList.remove('selecionado'));
  label.classList.add('selecionado');
  const radio = label.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
  categoriaInput.value = label.textContent.trim();
  categoriaInput.dataset.value = radio.value;
  this.style.display = 'none';
});

document.getElementById('radios-categoria-multi').addEventListener('click', function(e) {
  if (e.target && e.target.type === 'radio') {
    atualizarTamanhosEGenerosPorCategoria(e.target.value);
  }
});

// Função para abrir/fechar multiselect tamanho
function abrirFecharTamanhoMulti() {
  const radiosDiv = document.getElementById('radios-tamanho-multi');
  radiosDiv.style.display = radiosDiv.style.display === 'block' ? 'none' : 'block';
}
document.getElementById('tamanho-multi').addEventListener('click', abrirFecharTamanhoMulti);
document.querySelector('.chevron-tamanho').addEventListener('click', abrirFecharTamanhoMulti);

// Função para abrir/fechar multiselect genero
function abrirFecharGeneroMulti() {
  const radiosDiv = document.getElementById('radios-genero-multi');
  radiosDiv.style.display = radiosDiv.style.display === 'block' ? 'none' : 'block';
}
document.getElementById('genero-multi').addEventListener('click', abrirFecharGeneroMulti);
document.querySelector('.chevron-genero').addEventListener('click', abrirFecharGeneroMulti);

// Fecha popups ao clicar fora
document.addEventListener('mousedown', function(e) {
  const radiosTamanho = document.getElementById('radios-tamanho-multi');
  const radiosGenero = document.getElementById('radios-genero-multi');
  if (radiosTamanho.style.display === 'block' && !radiosTamanho.contains(e.target) && e.target.id !== 'tamanho-multi') {
    radiosTamanho.style.display = 'none';
  }
  if (radiosGenero.style.display === 'block' && !radiosGenero.contains(e.target) && e.target.id !== 'genero-multi') {
    radiosGenero.style.display = 'none';
  }
});

// Função para atualizar tamanhos e gêneros customizados
function atualizarTamanhosEGenerosPorCategoria(categoriaNome) {
  const categoriaObj = categorias.find(cat => cat.nome === categoriaNome);

  // Tamanhos
  const tamanhoInput = document.getElementById('tamanho-multi');
  const radiosTamanhoDiv = document.getElementById('radios-tamanho-multi');
  radiosTamanhoDiv.innerHTML = '';
  tamanhoInput.value = '';
  tamanhoInput.style.color = '#757575';
  tamanhoInput.disabled = !categoriaObj;

  let tamanhosPermitidos = [];
  if (categoriaObj) {
    if (categoriaObj.tipoTamanho === 2) {
      tamanhosPermitidos = tamanhosNumero;
    } else if (categoriaObj.tipoTamanho === 1) {
      tamanhosPermitidos = tamanhosLetra;
    } else {
      tamanhosPermitidos = [...tamanhosLetra, ...tamanhosNumero];
    }
    tamanhosPermitidos.forEach(tam => {
      const label = document.createElement('label');
      label.className = 'tamanho-multi-label';
            // Formata visualmente o tamanho
      function formatarTamanhoVisual(tam) {
          if (tam === "ÚNICO") return "Único";
          if (tam.startsWith("_")) return tam.slice(1);
          return tam;
      }
      
      label.innerHTML = `<input type="radio" name="tamanho-radio" value="${tam}">${formatarTamanhoVisual(tam)}`;
      radiosTamanhoDiv.appendChild(label);
    });
    // Se só tem uma opção, já seleciona
  if (tamanhosPermitidos.length === 1) {
    tamanhoInput.value = formatarTamanhoVisual(tamanhosPermitidos[0]);
    tamanhoInput.style.color = '#000';
    tamanhoInput.dataset.value = tamanhosPermitidos[0];
    radiosTamanhoDiv.querySelector('input[type="radio"]').checked = true;
  }
  } else {
    radiosTamanhoDiv.innerHTML = '<span style="color:#757575;">Selecionar</span>';
    tamanhoInput.value = '';
  }

  // Evento para atualizar input ao selecionar tamanho
  radiosTamanhoDiv.addEventListener('click', function(e) {
      const radio = e.target.closest('input[type="radio"]');
      if (radio) {
          tamanhoInput.value = formatarTamanhoVisual(radio.value);
          tamanhoInput.style.color = '#000';
          tamanhoInput.dataset.value = radio.value;
          radiosTamanhoDiv.style.display = 'none';
      }
  });

  // Gêneros
  const generoInput = document.getElementById('genero-multi');
  const radiosGeneroDiv = document.getElementById('radios-genero-multi');
  radiosGeneroDiv.innerHTML = '';
  generoInput.value = '';
  generoInput.style.color = '#757575';
  generoInput.disabled = !categoriaObj;

  let generosPermitidos = [];
  if (categoriaObj) {
    switch (categoriaObj.tipoGenero) {
      case "T":
        generosPermitidos = generosEnum;
        break;
      case "F":
        generosPermitidos = generosEnum.filter(g => g === "FEMININO");
        break;
      case "M":
        generosPermitidos = generosEnum.filter(g => g === "MASCULINO");
        break;
      case "U":
        generosPermitidos = generosEnum.filter(g => g === "UNISSEX");
        break;
      case "FM":
        generosPermitidos = generosEnum.filter(g => g === "MASCULINO" || g === "FEMININO");
        break;
      default:
        generosPermitidos = generosEnum;
    }
    generosPermitidos.forEach(gen => {
      const label = document.createElement('label');
      label.className = 'genero-multi-label';
      
      label.innerHTML = `<input type="radio" name="genero-radio" value="${gen}">${formatarGeneroVisual(gen)}`;
      radiosGeneroDiv.appendChild(label);
    });
    // Se só tem uma opção, já seleciona
    if (generosPermitidos.length === 1) {
      generoInput.value = formatarGeneroVisual(generosPermitidos[0]);
      generoInput.style.color = '#000';
      generoInput.dataset.value = generosPermitidos[0];
      radiosGeneroDiv.querySelector('input[type="radio"]').checked = true;
    }
  } else {
    radiosGeneroDiv.innerHTML = '<span style="color:#757575;">Selecionar</span>';
    generoInput.value = '';
  }

  // Evento para atualizar input ao selecionar gênero
  radiosGeneroDiv.addEventListener('click', function(e) {
      const radio = e.target.closest('input[type="radio"]');
      if (radio) {
          generoInput.value = formatarGeneroVisual(radio.value);
          generoInput.style.color = '#000';
          generoInput.dataset.value = radio.value; 
          radiosGeneroDiv.style.display = 'none';
      }
  });
}

// Chame ao selecionar categoria
document.getElementById('radios-categoria-multi').addEventListener('click', function(e) {
  if (e.target && e.target.type === 'radio') {
    atualizarTamanhosEGenerosPorCategoria(e.target.value);
  }
});

// Inicialize desabilitado
document.addEventListener('DOMContentLoaded', function() {
  atualizarTamanhosEGenerosPorCategoria(null);
});

let MAX_CATEGORIAS = 20;

// Função para contar linhas de categoria
function contarCategorias() {
  return document.querySelectorAll('.categorias-row').length;
}

// Atualiza texto do botão "+ Criar"
function atualizarBotaoCriar() {
  const btnCriar = document.getElementById('btn-criar-categoria');
  if (!btnCriar) return;
  btnCriar.textContent = `Adicionar (${contarCategorias()}/${MAX_CATEGORIAS})`;
  btnCriar.disabled = contarCategorias() >= MAX_CATEGORIAS;
}

// Adiciona nova linha de categoria
document.getElementById('btn-criar-categoria').onclick = function() {
  if (contarCategorias() >= MAX_CATEGORIAS) return;

  // Verifica se a última linha está preenchida
  const linhas = document.querySelectorAll('.categorias-row');
  if (linhas.length > 0) {
    const idx = linhas.length;
    const nome = document.getElementById(`categoria_${idx}`)?.value?.trim();
    const tamanhos = Array.from(document.querySelectorAll(`#checkboxes-tamanho-multi-${idx} .tamanho-multi-check:checked`));
    const generos = Array.from(document.querySelectorAll(`#checkboxes-genero-multi-${idx} .genero-multi-check:checked`));
    if (!nome || tamanhos.length === 0 || generos.length === 0) {
      const btnCriar = document.getElementById('btn-criar-categoria');
      btnCriar.disabled = true;
      return;
    }
  }

  // Cria nova linha (copiando o HTML da última linha, mas limpando os valores)
  const idxNovo = contarCategorias() + 1;
  const novaLinha = document.createElement('div');
  novaLinha.className = 'categorias-row';
  novaLinha.innerHTML = `
    <div class="categorias-col">
      <input type="text" class="categorias-input" id="categoria_${idxNovo}" maxlength="10" placeholder="Digite o nome">
    </div>
    <div class="categorias-col">
      <div class="multiselect-tamanho">
        <input type="text" class="categorias-input" id="tamanho_input_${idxNovo}" value="" placeholder="Selecionar" readonly onclick="abrirTamanhoMulti(${idxNovo})" style="color: #757575;">
        <span class="chevron-tamanho"><i class="fa fa-chevron-down"></i></span>
        <div class="checkboxes-tamanho-multi" id="checkboxes-tamanho-multi-${idxNovo}" style="display:none;">
          <label><input type="checkbox" class="tamanho-multi-check" value="TODOS"> Todos (Numéricos e Letras)</label>
          <label><input type="checkbox" class="tamanho-multi-check" value="LETRAS"> Letras (Único, PP-XXG)</label>
          <label><input type="checkbox" class="tamanho-multi-check" value="NUMERICOS"> Numéricos (36-56)</label>
        </div>
      </div>
    </div>
    <div class="categorias-col">
      <div class="multiselect-genero">
        <input type="text" class="categorias-input" id="genero_input_${idxNovo}" value="" placeholder="Selecionar" readonly onclick="abrirGeneroMulti(${idxNovo})" style="color: #757575;">
        <span class="chevron-genero"><i class="fa fa-chevron-down"></i></span>
        <div class="checkboxes-genero-multi" id="checkboxes-genero-multi-${idxNovo}" style="display:none;">
          <label><input type="checkbox" class="genero-multi-check" value="TODOS"> Todos</label>
          <label><input type="checkbox" class="genero-multi-check" value="MASCULINO"> Masculino</label>
          <label><input type="checkbox" class="genero-multi-check" value="FEMININO"> Feminino</label>
          <label><input type="checkbox" class="genero-multi-check" value="UNISSEX"> Unissex</label>
        </div>
      </div>
    </div>
    <div class="categorias-col" style="display:flex; justify-content:center; align-items:flex-end;">
    </div>
  `;
  document.querySelector('.categorias-table').appendChild(novaLinha);
  atualizarBotaoCriar();
  atualizarBotaoRemover(idxNovo);
};

// Atualiza botão ao abrir modal
document.getElementById('modal-categorias-bg').addEventListener('show', atualizarBotaoCriar);
document.addEventListener('DOMContentLoaded', atualizarBotaoCriar);

function atualizarBotaoRemover(idx) {
  const nome = document.getElementById(`categoria_${idx}`)?.value?.trim();
  const tamanhos = Array.from(document.querySelectorAll(`#checkboxes-tamanho-multi-${idx} .tamanho-multi-check:checked`));
  const generos = Array.from(document.querySelectorAll(`#checkboxes-genero-multi-${idx} .genero-multi-check:checked`));
  const colRemover = document.querySelectorAll('.categorias-row')[idx-1].querySelector('.categorias-col:last-child');
  colRemover.innerHTML = ''; // Limpa

  if (nome && tamanhos.length > 0 && generos.length > 0) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'remover';
    btn.setAttribute('data-idx', idx);
    btn.title = 'Remover';
    btn.innerHTML = '<i class="fa-solid fa-delete-left"></i>';
    btn.onclick = function(e) {
      e.preventDefault();
      const preenchidas = Array.from(document.querySelectorAll('.categorias-row')).filter((row, i) => {
        const nomeVal = document.getElementById(`categoria_${i+1}`)?.value?.trim();
        return nomeVal;
      });
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
      Swal.fire({
        icon: 'warning',
        title: 'Remover categoria?',
        text: 'Essa ação não pode ser desfeita',
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
          document.querySelectorAll('.categorias-row')[idx-1].remove();
          atualizarBotaoCriar();
        }
      });
    };
    colRemover.appendChild(btn);
  }
}

document.getElementById(`categoria_${idxNovo}`).addEventListener('input', function() {
  atualizarBotaoRemover(idxNovo);
});
document.querySelectorAll(`#checkboxes-tamanho-multi-${idxNovo} .tamanho-multi-check`).forEach(cb => {
  cb.addEventListener('change', function() {
    atualizarBotaoRemover(idxNovo);
  });
});
document.querySelectorAll(`#checkboxes-genero-multi-${idxNovo} .genero-multi-check`).forEach(cb => {
  cb.addEventListener('change', function() {
    atualizarBotaoRemover(idxNovo);
  });
});