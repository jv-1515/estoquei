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
  if (gen === "M") return "Masculino";
  if (gen === "F") return "Feminino";
  if (gen === "U") return "Unissex";
  if (gen === "T") return "Todos";
  return gen;
}

window.abrirGeneroMulti = function(idx) {
  const menu = document.getElementById('checkboxes-genero-multi-' + idx);
  const input = document.getElementById('genero_input_' + idx);
  if (!menu || !input) return;
  if (menu.style.display === 'block' && menu.dataset.floating === '1') {
    unfloatMenu(menu);
  } else {
    floatMenu(menu, input);
  }
};

window.abrirTamanhoMulti = function(idx) {
  const menu = document.getElementById('checkboxes-tamanho-multi-' + idx);
  const input = document.getElementById('tamanho_input_' + idx);
  if (!menu || !input) return;
  if (menu.style.display === 'block' && menu.dataset.floating === '1') {
    unfloatMenu(menu);
  } else {
    floatMenu(menu, input);
  }
};

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



let categorias = [];

function carregarCategorias() {
    fetch('/categorias')
        .then(res => res.json())
        .then(data => {
            categorias = data.map(cat => ({
                id: cat.id,
                nome: cat.nome,
                tipoTamanho: cat.tipoTamanho,
                tipoGenero: cat.tipoGenero
            }));
            categoriasSnapshot = JSON.stringify(categorias);
            renderizarCategorias();
            preencherRadiosCategoria();
        });
}

document.addEventListener('DOMContentLoaded', carregarCategorias);

document.querySelectorAll('.checkboxes-categoria-multi input[type="radio"]').forEach(radio => {
    radio.addEventListener('click', function(e) {
        const categoriaSelecionada = e.target.value;
        const categoriaObj = categorias.find(cat => cat.nome === categoriaSelecionada);

        let tamanhosPermitidos = [];
        if (categoriaObj) {
            if (categoriaObj.tipoTamanho === "N") {
                tamanhosPermitidos = tamanhosNumero;
            } else if (categoriaObj.tipoTamanho === "L") {
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

        // Atualiza o select de gêneros
        const generoSelect = document.getElementById('genero');
        generoSelect.innerHTML = '<option value="" disabled selected hidden>Selecionar</option>';
        generosPermitidos.forEach(gen => {
            generoSelect.innerHTML += `<option value="${gen}">${formatarGeneroVisual(gen)}</option>`;        
      });
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

    const categoriaNome = document.getElementById('categoria-multi').dataset.value;
    const categoriaObj = categorias.find(cat => cat.nome === categoriaNome);
    formData.set('categoria', categoriaObj ? categoriaObj.id : '');
    
    const generoInput = document.getElementById('genero-multi');
    const tamanhoInput = document.getElementById('tamanho-multi');
    
    let generoValue = generoInput.dataset.value || '';
    if (generoValue === "M") generoValue = "MASCULINO";
    if (generoValue === "F") generoValue = "FEMININO";
    if (generoValue === "U") generoValue = "UNISSEX";
    formData.set('genero', generoValue);
    
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
  // sincroniza inputs para o array
  for (let i = 1; i <= categorias.length; i++) {
    const el = document.getElementById('categoria_' + i);
    categorias[i - 1].nome = el ? (el.value || '').slice(0, 10) : (categorias[i - 1].nome || '');
    atualizarArrayTamanho(i);
    atualizarArrayGenero(i);
  }

  // remove entradas TRAILING (últimas) que estiverem completamente vazias
  let trimmed = categorias.slice();
  while (trimmed.length > 0) {
    const last = trimmed[trimmed.length - 1];
    const nomeVazio = !last.nome || !last.nome.toString().trim();
    if (nomeVazio) {
      trimmed.pop();
    } else {
      break;
    }
  }
  // atualiza array em memória (sem salvar localStorage)
  if (trimmed.length !== categorias.length) {
    categorias = trimmed;
  }

  // se nada mudou em relação ao snapshot (após aparar), fecha sem prompt
  if (JSON.stringify(categorias) === categoriasSnapshot) {
    document.getElementById('modal-categorias-bg').style.display = 'none';
    document.body.style.overflow = '';
    // re-renderiza para garantir UI sem linhas vazias (opcional)
    renderizarCategorias();
    return;
  }

  // caso existam alterações reais, pede confirmação antes de descartar
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
      // descarta alterações e restaura snapshot
      categorias = JSON.parse(categoriasSnapshot);
      preencherCamposCategorias();
      document.getElementById('modal-categorias-bg').style.display = 'none';
      aplicarEstiloInputs();
      document.body.style.overflow = '';
    }
  });
}

// Array de categorias (carrega do localStorage ou começa vazio)
// let categorias = JSON.parse(localStorage.getItem('categorias')) || Array.from({length:12}, (_,i)=>({id:i+1,nome:"",tamanhos:[],generos:[]}));
// Snapshot para comparação
let categoriasSnapshot = JSON.stringify(categorias);

// Evento de clique dos radios de categoria para atualizar tamanhos
document.querySelectorAll('.checkboxes-categoria-multi input[type="radio"]').forEach(radio => {
  radio.addEventListener('click', function(e) {
    const categoriaSelecionada = e.target.value;
    const categoriaObj = categorias.find(cat => cat.nome === categoriaSelecionada);

    let tamanhosPermitidos = [];
    if (categoriaObj) {
      if (categoriaObj.tipoTamanho === "N") {
        tamanhosPermitidos = tamanhosNumero;
      } else if (categoriaObj.tipoTamanho === "L") {
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
  });
});
// ...existing code...

function renderizarCategorias() {
  const container = document.querySelector('.categorias-table');
  if (!container) return;

  // Remove todas as linhas exceto o header
  Array.from(container.querySelectorAll('.categorias-row')).forEach(row => row.remove());

  categorias.forEach((cat, idx) => {
    const linhaValida = cat.nome && cat.nome.trim() && cat.tipoTamanho && cat.tipoGenero;
    const novaLinha = document.createElement('div');
    novaLinha.className = 'categorias-row';
    novaLinha.innerHTML = `
      <div class="categorias-col">
        <input type="text" class="categorias-input" id="categoria_${idx+1}" maxlength="10" value="${cat.nome || ''}" placeholder="Digite o nome">
      </div>
      <div class="categorias-col">
        <div class="multiselect-tamanho">
          <input type="text" class="categorias-input" id="tamanho_input_${idx+1}" value="Todos" placeholder="Selecionar" readonly onclick="abrirTamanhoMulti(${idx+1})" style="color: #757575;">
          <span class="chevron-tamanho"><i class="fa fa-chevron-down"></i></span>
          <div class="checkboxes-tamanho-multi" id="checkboxes-tamanho-multi-${idx+1}" style="display:none;">
            <label><input type="checkbox" class="tamanho-multi-check" value="T" checked> Todos (Numéricos e Letras)</label>
            <label><input type="checkbox" class="tamanho-multi-check" value="L" checked> Letras (Único, PP-XXG)</label>
            <label><input type="checkbox" class="tamanho-multi-check" value="N" checked> Numéricos (36-56)</label>
          </div>
        </div>
        </div>
        <div class="categorias-col">
          <div class="multiselect-genero">
            <input type="text" class="categorias-input" id="genero_input_${idx+1}" value="Todos" placeholder="Selecionar" readonly onclick="abrirGeneroMulti(${idx+1})" style="color: #757575;">
            <span class="chevron-genero"><i class="fa fa-chevron-down"></i></span>
            <div class="checkboxes-genero-multi" id="checkboxes-genero-multi-${idx+1}" style="display:none;">
              <label><input type="checkbox" class="genero-multi-check" value="T" checked> Todos</label>
              <label><input type="checkbox" class="genero-multi-check" value="F" checked> Feminino</label>
              <label><input type="checkbox" class="genero-multi-check" value="M" checked> Masculino</label>
              <label><input type="checkbox" class="genero-multi-check" value="U" checked> Unissex</label>
            </div>
          </div>
        </div>
      <div class="categorias-col" style="display:flex; justify-content:center; align-items:flex-end;">
        ${linhaValida ? `<button type="button" class="remover" data-idx="${idx+1}" title="Remover"><i class="fa-solid fa-delete-left"></i></button>` : ''}
      </div>
    `;
    container.appendChild(novaLinha);

    atualizarCheckboxesTamanho(idx + 1, cat.tipoTamanho);
    atualizarCheckboxesGenero(idx + 1, cat.tipoGenero);
    atualizarPlaceholderTamanhoMulti(idx + 1);
    atualizarPlaceholderGeneroMulti(idx + 1);

  });

  atualizarEstadoScrollCategorias();


  requestAnimationFrame(() => {
    container.scrollTo({ top: 0, behavior: 'auto' });
  });

  // Listeners dinâmicos
  // categorias.forEach((cat, idx) => {
  //   // Tamanhos
  //   document.querySelectorAll(`#checkboxes-tamanho-multi-${idx+1} .tamanho-multi-check`).forEach(cb => {
  //     cb.addEventListener('change', function() {
  //       const checks = document.querySelectorAll(`#checkboxes-tamanho-multi-${idx+1} .tamanho-multi-check`);
  //       const todos = checks[0];
  //       const letras = checks[1];
  //       const nums = checks[2];
  //       if (cb.value === "TODOS") {
  //         checks.forEach(c => c.checked = todos.checked);
  //       } else {
  //         todos.checked = letras.checked && nums.checked;
  //       }
  //       atualizarPlaceholderTamanhoMulti(idx+1);
  //       atualizarArrayTamanho(idx+1);
  //     });
  //   });
  //   atualizarPlaceholderTamanhoMulti(idx+1);

  //   // Gêneros
  //   document.querySelectorAll(`#checkboxes-genero-multi-${idx+1} .genero-multi-check`).forEach(cb => {
  //     cb.addEventListener('change', function() {
  //       const checks = document.querySelectorAll(`#checkboxes-genero-multi-${idx+1} .genero-multi-check`);
  //       const todos = checks[0];
  //       const masc = checks[1];
  //       const fem = checks[2];
  //       const uni = checks[3];
  //       if (cb.value === "TODOS") {
  //         checks.forEach(c => c.checked = todos.checked);
  //       } else {
  //         todos.checked = masc.checked && fem.checked && uni.checked;
  //       }
  //       atualizarPlaceholderGeneroMulti(idx+1);
  //       atualizarArrayGenero(idx+1);
  //     });
  //   });
  //   atualizarPlaceholderGeneroMulti(idx+1);
  // });

  atualizarBotaoCriar();
  preencherCamposCategorias();
  adicionarListenersRemoverCategorias();
  aplicarEstiloInputs();
}


document.querySelector('.categorias-table').addEventListener('change', function(e) {
  // Tamanhos
  if (e.target.classList.contains('tamanho-multi-check')) {
    const idx = Number(e.target.closest('.checkboxes-tamanho-multi').id.split('-').pop());
    const checks = document.querySelectorAll(`#checkboxes-tamanho-multi-${idx} .tamanho-multi-check`);
    const todos = checks[0];
    const letras = checks[1];
    const nums = checks[2];
    if (e.target.value === "T") {
      checks.forEach(cb => cb.checked = todos.checked);
    } else {
      todos.checked = letras.checked && nums.checked;
    }
    atualizarPlaceholderTamanhoMulti(idx);
    atualizarArrayTamanho(idx);
  }
  // Gêneros
  if (e.target.classList.contains('genero-multi-check')) {
    const idx = Number(e.target.closest('.checkboxes-genero-multi').id.split('-').pop());
    const checks = document.querySelectorAll(`#checkboxes-genero-multi-${idx} .genero-multi-check`);
    const todos = checks[0];
    const fem = checks[1];
    const masc = checks[2];
    const uni = checks[3];
    if (e.target.value === "T") {
      checks.forEach(cb => cb.checked = todos.checked);
    } else {
      // Lógica de combinação igual ao seu código
      if (fem.checked && masc.checked) uni.checked = false;
      if (fem.checked && uni.checked) masc.checked = false;
      if (masc.checked && uni.checked) fem.checked = false;
      todos.checked = fem.checked && masc.checked && uni.checked;
    }
    atualizarPlaceholderGeneroMulti(idx);
    atualizarArrayGenero(idx);
  }
});

// Validação de duplicidade para todos inputs de categoria
document.querySelector('.categorias-table').addEventListener('blur', function(e) {
  if (e.target && e.target.classList.contains('categorias-input') && /^categoria_\d+$/.test(e.target.id)) {
    const input = e.target;
    const idx = Number(input.id.split('_')[1]) - 1;
    const nomeAtual = input.value.trim().toLowerCase();
    if (!nomeAtual) return;
    if (/\d/.test(nomeAtual)) {
      Swal.fire({
        icon: 'error',
        title: 'Nome inválido!',
        text: 'O nome não pode conter números!',
        timer: 2000,
        timerProgressBar: true,
        allowOutsideClick: false,
        showConfirmButton: false,
        didClose: () => input.focus()
      });
      input.value = '';
      categorias[idx].nome = '';
      return;
    }
    const nomes = categorias.map((cat, i) => i !== idx ? (cat.nome || '').trim().toLowerCase() : null).filter(n => n);
    if (nomes.includes(nomeAtual)) {
      Swal.fire({
        icon: 'error',
        title: 'Categoria já cadastrada!',
        text: 'Escolha outro nome',
        timer: 2000,
        timerProgressBar: true,
        allowOutsideClick: false,
        showConfirmButton: false,
        didClose: () => input.focus()
      });
      input.value = '';
      categorias[idx].nome = '';
    }
  }
}, true);



document.querySelector('[title="Gerenciar categorias"]').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('modal-categorias-bg').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  categoriasSnapshot = JSON.stringify(categorias);
  renderizarCategorias();
});


// Atualiza checkboxes de tamanho
function atualizarCheckboxesTamanho(idx, tipoTamanho) {
    const checks = document.querySelectorAll(`#checkboxes-tamanho-multi-${idx} .tamanho-multi-check`);
    checks.forEach(cb => cb.checked = false);
    if (tipoTamanho === "T") {
        checks[0].checked = true;
        checks[1].checked = true;
        checks[2].checked = true;
    } else if (tipoTamanho === "L") {
        checks[1].checked = true;
    } else if (tipoTamanho === "N") {
        checks[2].checked = true;
    }
}

function atualizarCheckboxesGenero(idx, tipoGenero) {
    const checks = document.querySelectorAll(`#checkboxes-genero-multi-${idx} .genero-multi-check`);
    checks.forEach(cb => cb.checked = false);
    if (tipoGenero === "T") {
        checks[0].checked = true;
        checks[1].checked = true;
        checks[2].checked = true;
        checks[3].checked = true;
    } else if (tipoGenero === "FM") {
        checks[1].checked = true;
        checks[2].checked = true;
    } else if (tipoGenero === "F") {
        checks[1].checked = true;
    } else if (tipoGenero === "M") {
        checks[2].checked = true;
    } else if (tipoGenero === "U") {
        checks[3].checked = true;
    }
}

// Multiselect Tamanhos
function abrirTamanhoMulti(idx) {
  const menu = document.getElementById('checkboxes-tamanho-multi-' + idx);
  const input = document.getElementById('tamanho_input_' + idx);
  if (!menu || !input) return;
  // toggle: se já flutuando, fecha; caso contrário abre flutuando
  if (menu.style.display === 'block' && menu.dataset.floating === '1') {
    unfloatMenu(menu);
  } else {
    floatMenu(menu, input);
  }
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
  } else if (letras.checked && !nums.checked) {
    texto = 'Letras';
    color = '#000';
  } else if (!letras.checked && nums.checked) {
    texto = 'Numéricos';
    color = '#000';
  } else if (letras.checked && nums.checked) {
    texto = 'Letras, Numéricos';
    color = '#000';
  }
  const input = document.getElementById('tamanho_input_' + idx);
  input.value = texto;
  input.style.color = color;
}


function atualizarArrayTamanho(idx) {
  const checks = document.querySelectorAll(`#checkboxes-tamanho-multi-${idx} .tamanho-multi-check`);
  if (checks[0].checked) categorias[idx-1].tipoTamanho = "T";
  else if (checks[1].checked && checks[2].checked) categorias[idx-1].tipoTamanho = "T";
  else if (checks[1].checked) categorias[idx-1].tipoTamanho = "L";
  else if (checks[2].checked) categorias[idx-1].tipoTamanho = "N";
  else categorias[idx-1].tipoTamanho = "";
}


// Multiselect Genero
function atualizarArrayGenero(idx) {
  const checks = document.querySelectorAll(`#checkboxes-genero-multi-${idx} .genero-multi-check`);
  if (checks[0].checked) categorias[idx-1].tipoGenero = "T";
  else if (checks[1].checked && checks[2].checked) categorias[idx-1].tipoGenero = "FM";
  else if (checks[1].checked) categorias[idx-1].tipoGenero = "F";
  else if (checks[2].checked) categorias[idx-1].tipoGenero = "M";
  else if (checks[3].checked) categorias[idx-1].tipoGenero = "U";
  else categorias[idx-1].tipoGenero = "";
}

document.querySelectorAll('.checkboxes-genero-multi').forEach((container, idx) => {
  container.addEventListener('change', function(e) {
    if (e.target.classList.contains('genero-multi-check')) {
      const checks = container.querySelectorAll('.genero-multi-check');
      const todos = checks[0];
      const fem = checks[1];
      const masc = checks[2];
      const uni = checks[3];

      // Se "Todos" marcado, marca tudo
      if (e.target.value === "T") {
        checks.forEach(cb => cb.checked = todos.checked);
      } else {
        // Garante combinações válidas
        // Se F e M marcados, desmarca U
        if (fem.checked && masc.checked) {
          uni.checked = false;
        }
        // Se F e U marcados, desmarca M
        if (fem.checked && uni.checked) {
          masc.checked = false;
        }
        // Se M e U marcados, desmarca F
        if (masc.checked && uni.checked) {
          fem.checked = false;
        }
        // Se todos marcados, marca "Todos"
        todos.checked = fem.checked && masc.checked && uni.checked;
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
    if (checks[1] && checks[1].checked) arr.push('Feminino');
    if (checks[2] && checks[2].checked) arr.push('Masculino');
    if (checks[3] && checks[3].checked) arr.push('Unissex');
    texto = arr.length ? arr.join(', ') : 'Selecionar';
    color = arr.length ? '#000' : '#757575';
  }
  const input = document.getElementById('genero_input_' + idx);
  input.value = texto;
  input.style.color = color;
}



function atualizarArrayGenero(idx) {
  const checks = document.querySelectorAll(`#checkboxes-genero-multi-${idx} .genero-multi-check`);
  if (checks[0].checked) categorias[idx-1].tipoGenero = "T";
  else if (checks[1].checked && checks[2].checked) categorias[idx-1].tipoGenero = "FM";
  else if (checks[1].checked) categorias[idx-1].tipoGenero = "F";
  else if (checks[2].checked) categorias[idx-1].tipoGenero = "M";
  else if (checks[3].checked) categorias[idx-1].tipoGenero = "U";
  else categorias[idx-1].tipoGenero = "";
}

document.addEventListener('mousedown', function(e) {
  // checkboxes de tamanho
  document.querySelectorAll('.checkboxes-tamanho-multi').forEach(div => {
    const idx = div.id ? div.id.split('-').pop() : null;
    const input = idx ? document.getElementById('tamanho_input_' + idx) : null;
    // se visível e clique fora do menu e fora do input -> fechar (restaura estilo floating)
    if (div.style.display === 'block' && !div.contains(e.target) && e.target !== input) {
      if (typeof unfloatMenu === 'function') unfloatMenu(div);
      else div.style.display = 'none';
    }
  });

  // checkboxes de genero
  document.querySelectorAll('.checkboxes-genero-multi').forEach(div => {
    const idx = div.id ? div.id.split('-').pop() : null;
    const input = idx ? document.getElementById('genero_input_' + idx) : null;
    if (div.style.display === 'block' && !div.contains(e.target) && e.target !== input) {
      if (typeof unfloatMenu === 'function') unfloatMenu(div);
      else div.style.display = 'none';
    }
  });
});

// Sincroniza nome da categoria no array
// document.querySelectorAll('.categorias-input[id^="categoria_"]').forEach((input, idx) => {
//   function verificarDuplicidade() {
//     const nomeAtual = input.value.trim().toLowerCase();
//     if (!nomeAtual) return;
//         if (/\d/.test(nomeAtual)) {
//         Swal.fire({
//             icon: 'error',
//             title: 'Nome inválido!',
//             text: 'O nome da categoria não pode conter números!',
//             timer: 1500,
//             timerProgressBar: true,
//             allowOutsideClick: false,
//             showConfirmButton: false
//         });
//         input.value = '';
//         categorias[idx].nome = '';
//         input.focus();
//         return;
//     }
//     const nomes = categorias.map((cat, i) => i !== idx ? cat.nome.trim().toLowerCase() : null).filter(n => n);
//     if (nomes.includes(nomeAtual)) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Categoria já cadastrada!',
//         text: 'Escolha outro nome',
//         timer: 1500,
//         timerProgressBar: true,
//         allowOutsideClick: false,
//         showConfirmButton: false,
//         didClose: () => input.focus()
//       });
//       input.value = '';
//       categorias[idx].nome = '';
//       input.focus();
//     }
//   }
//   input.addEventListener('blur', verificarDuplicidade);
// });

// Validação dos campos obrigatórios
function validarCategoriasObrigatorias() {
  let ok = true;
  for(let i=0;i<categorias.length;i++) {
    const cat = categorias[i];
    if(cat.nome.trim() && cat.tipoTamanho && cat.tipoGenero) continue;
    if(cat.nome.trim() || cat.tipoTamanho || cat.tipoGenero) {
      ok = false;
      break;
    }
  }
  return ok;
}

function validarCategoriasDuplicadas() {
  const nomes = categorias
    .map(cat => (cat.nome || '').trim().toUpperCase())
    .filter(nome => nome !== '');
  const nomesSet = new Set();
  for (const nome of nomes) {
    if (nomesSet.has(nome)) return true;
    nomesSet.add(nome);
  }
  return false;
}

// Salvar alterações
document.getElementById('form-categorias').addEventListener('submit', function(e) {
  e.preventDefault();

  for (let i = 1; i <= categorias.length; i++) {
      const el = document.getElementById('categoria_' + i);
      categorias[i - 1].nome = el ? (el.value || '').slice(0, 10) : (categorias[i - 1].nome || '');
  
      // Tamanho
      const tamanhoChecks = document.querySelectorAll(`#checkboxes-tamanho-multi-${i} .tamanho-multi-check`);
      if (tamanhoChecks[0].checked) categorias[i - 1].tipoTamanho = "T";
      else if (tamanhoChecks[1].checked && tamanhoChecks[2].checked) categorias[i - 1].tipoTamanho = "T";
      else if (tamanhoChecks[1].checked) categorias[i - 1].tipoTamanho = "L";
      else if (tamanhoChecks[2].checked) categorias[i - 1].tipoTamanho = "N";
      else categorias[i - 1].tipoTamanho = "";
  
      // Genero
      const generoChecks = document.querySelectorAll(`#checkboxes-genero-multi-${i} .genero-multi-check`);
      if (generoChecks[0].checked) categorias[i - 1].tipoGenero = "T";
      else if (generoChecks[1].checked && generoChecks[2].checked) categorias[i - 1].tipoGenero = "FM";
      else if (generoChecks[1].checked) categorias[i - 1].tipoGenero = "F";
      else if (generoChecks[2].checked) categorias[i - 1].tipoGenero = "M";
      else if (generoChecks[3].checked) categorias[i - 1].tipoGenero = "U";
      else categorias[i - 1].tipoGenero = "";
  }

  // 2) remove linhas sem NOME
  while (categorias.length > 0) {
    const last = categorias[categorias.length - 1];
    const nomeVazio = !last.nome || !last.nome.toString().trim();
    if (nomeVazio) categorias.pop();
    else break;
  }

  // 3) valida obrigatoriedade por linha
  if (!validarCategoriasObrigatorias()) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos vazios!',
      text: 'Preencha todos os campos',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false
    });
    return;
  }

  // 4) categorias repetidas
  if (validarCategoriasDuplicadas()) {
    Swal.fire({
      icon: 'warning',
      title: 'Categoria já cadastrada!',
      text: 'Escolha outro nome',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false
    });
    return;
  }

  // 5) sem alterações → fecha
  if (JSON.stringify(categorias) === categoriasSnapshot) {
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

  // 6) confirma e salva
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
      fetch('/categorias/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categorias)
      })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao salvar categorias');
        return res.json().catch(() => ({}));
      })
      .then(() => {
        // categoriasSnapshot = JSON.stringify(categorias);
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
        carregarCategorias();
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao salvar!',
          text: 'Tente novamente.',
          timer: 2000,
          showConfirmButton: false
        });
      });
    }
  });
});

// Adiciona listeners aos botões remover
function adicionarListenersRemoverCategorias() {
  document.querySelectorAll('.remover').forEach((btn, idx) => {
    btn.onclick = function(e) {
      e.preventDefault();
      const preenchidas = categorias.filter(cat => cat.nome.trim());
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
          categorias.splice(idx, 1);
          fetch('/categorias/salvar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(categorias)
          })
          categoriasSnapshot = JSON.stringify(categorias);
          renderizarCategorias();
        }
      });
    };
  });
}

function preencherCamposCategorias() {
  for (let i = 1; i <= categorias.length; i++) {
    const nomeInput = document.getElementById('categoria_' + i);
    // prepara valores no array se ausentes
    if (!categorias[i - 1]) categorias[i - 1] = { id: i, nome: '', tipoTamanho: '', tipoGenero: '' };

    if (nomeInput) {
      // valor e restrições
      nomeInput.value = categorias[i - 1].nome || "";
      nomeInput.maxLength = 10;
      nomeInput.placeholder = "Digite o nome";

      // remove listener anterior para evitar duplicatas
      if (nomeInput._handler) nomeInput.removeEventListener('input', nomeInput._handler);

      // aplica cor/estilo conforme validade da linha
      const nomeValido = categorias[i - 1].nome && categorias[i - 1].nome.toString().trim() !== '';
      const algumTamanho = !!categorias[i - 1].tipoTamanho;
      const algumGenero = !!categorias[i - 1].tipoGenero;
      const linhaValida = nomeValido && algumTamanho && algumGenero;

      const corRgb = (typeof coresCategorias !== 'undefined' && coresCategorias[i - 1]) ? coresCategorias[i - 1] : "204,204,204";

      nomeInput.style.backgroundColor = linhaValida ? `rgb(${corRgb})` : `rgba(${corRgb},0.5)`;
      nomeInput.style.color = linhaValida ? "#fff" : "#000";
      nomeInput.style.border = `1px solid rgba(${corRgb}, ${linhaValida ? 1 : 0.5})`;
      nomeInput.style.opacity = "1";

      // handler atualiza array e reaplica estilos
      nomeInput._handler = function () {
        categorias[i - 1].nome = nomeInput.value.slice(0, 10);
        preencherCamposCategorias();
      };
      nomeInput.addEventListener('input', nomeInput._handler);
    }

    // atualiza checkboxes / placeholders mesmo se inputs não existirem
    atualizarCheckboxesTamanho(i, categorias[i - 1].tipoTamanho);
    atualizarCheckboxesGenero(i, categorias[i - 1].tipoGenero);
  }

  // reaplica listeners de remover e estilos dinâmicos que dependem do DOM
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
    "52,152,219",   // #3498db
    "46,204,113",   // #2ecc71
    "241,196,15",   // #f1c40f
    "155,89,182",   // #9b59b6
    "52,73,94",     // #34495e
    "127,140,141",  // #46adb4ff
    "231,76,60",    // #e74c3c
    "45,166,196"   // #2da6c4
];

function aplicarEstiloInputs() {
    for (let i = 1; i <= 50; i++) {
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
// function preencherRadiosCategoria() {
//   const radiosDiv = document.getElementById('radios-categoria-multi');
//   if (!radiosDiv) return;
//   radiosDiv.innerHTML = '';
//   categorias.forEach((cat, idx) => {
//     const label = document.createElement('label');
//     label.setAttribute('for', `categoria_radio_${cat.id}`);
//     label.textContent = cat.nome;
//     const radio = document.createElement('input');
//     radio.type = 'radio';
//     radio.name = 'categoria_radio';
//     radio.id = `categoria_radio_${cat.id}`;
//     radio.value = cat.nome;
//     label.appendChild(radio);
//     radiosDiv.appendChild(label);
//   });
// }

// função ao carregar
document.addEventListener('DOMContentLoaded', preencherRadiosCategoria);

// Array de categorias provisório
// const categorias = [
//   { id: 1, nome: "Camisa", tipoTamanho: 1, tipoGenero: "T" },
//   { id: 2, nome: "Camiseta", tipoTamanho: 1, tipoGenero: "T" },
//   { id: 3, nome: "Calça", tipoTamanho: 2, tipoGenero: "T" },
//   { id: 4, nome: "Bermuda", tipoTamanho: 2, tipoGenero: "T" },
//   { id: 5, nome: "Vestido", tipoTamanho: 1, tipoGenero: "F" },
//   { id: 6, nome: "Sapato", tipoTamanho: 2, tipoGenero: "T" },
//   { id: 7, nome: "Meia", tipoTamanho: 2, tipoGenero: "T" }
// ];

const categoriaInput = document.getElementById('categoria-multi');
const radiosDiv = document.getElementById('radios-categoria-multi');
const chevron = document.querySelector('.chevron-categoria');

function preencherRadiosCategoria() {
    const radiosDiv = document.getElementById('radios-categoria-multi');
    if (!radiosDiv) return;
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
        radiosTamanhoDiv.appendChild(label);
    });
    if (tamanhosPermitidos.length === 1) {
        tamanhoInput.value = formatarTamanhoVisual(tamanhosPermitidos[0]);
        tamanhoInput.style.color = '#000';
        tamanhoInput.dataset.value = tamanhosPermitidos[0];
        radiosTamanhoDiv.querySelector('input[type="radio"]').checked = true;
    }

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
        radiosGeneroDiv.appendChild(label);
    });
    if (generosPermitidos.length === 1) {
        generoInput.value = formatarGeneroVisual(generosPermitidos[0]);
        generoInput.style.color = '#000';
        generoInput.dataset.value = generosPermitidos[0];
        radiosGeneroDiv.querySelector('input[type="radio"]').checked = true;
    }

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

let MAX_CATEGORIAS = 50;

// Função para contar linhas de categoria
function contarCategorias() {
  return document.querySelectorAll('.categorias-row').length;
}

// Atualiza texto do botão "+ Criar"
function atualizarBotaoCriar() {
  const btnCriar = document.getElementById('btn-criar-categoria');
  const contadorSpan = document.getElementById('contador');
  if (contadorSpan) {
    contadorSpan.textContent = String(contarCategorias()).padStart(2, '0');
  }
  if (!btnCriar) return;
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

  categorias.push({nome:"", tipoTamanho:"", tipoGenero:""});

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
          <label><input type="checkbox" class="tamanho-multi-check" value="T"> Todos (Numéricos e Letras)</label>
          <label><input type="checkbox" class="tamanho-multi-check" value="L"> Letras (Único, PP-XXG)</label>
          <label><input type="checkbox" class="tamanho-multi-check" value="N"> Numéricos (36-56)</label>
        </div>
      </div>
    </div>
    <div class="categorias-col">
      <div class="multiselect-genero">
        <input type="text" class="categorias-input" id="genero_input_${idxNovo}" value="" placeholder="Selecionar" readonly onclick="abrirGeneroMulti(${idxNovo})" style="color: #757575;">
        <span class="chevron-genero"><i class="fa fa-chevron-down"></i></span>
        <div class="checkboxes-genero-multi" id="checkboxes-genero-multi-${idxNovo}" style="display:none;">
          <label><input type="checkbox" class="genero-multi-check" value="T"> Todos</label>
          <label><input type="checkbox" class="genero-multi-check" value="F"> Feminino</label>
          <label><input type="checkbox" class="genero-multi-check" value="M"> Masculino</label>
          <label><input type="checkbox" class="genero-multi-check" value="U"> Unissex</label>
        </div>
      </div>
    </div>
    <div class="categorias-col" style="display:flex; justify-content:center; align-items:flex-end;">
    </div>
  `;
  document.querySelector('.categorias-table').appendChild(novaLinha);
  const container = document.querySelector('.categorias-table');
  requestAnimationFrame(() => {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  });

  const nomeInput = document.getElementById(`categoria_${idxNovo}`);
  setTimeout(() => {
    if (nomeInput) nomeInput.focus();
  }, 300);

  const tamanhoChecks = document.querySelectorAll(`#checkboxes-tamanho-multi-${idxNovo} .tamanho-multi-check`);
  const generoChecks = document.querySelectorAll(`#checkboxes-genero-multi-${idxNovo} .genero-multi-check`);

  function atualizarCorLinha() {
    const nomeValido = nomeInput && nomeInput.value.trim() !== '';
    const algumTamanho = Array.from(tamanhoChecks).some(cb => cb.checked);
    const algumGenero = Array.from(generoChecks).some(cb => cb.checked);
    const linhaValida = nomeValido && algumTamanho && algumGenero;
    const corRgb = coresCategorias[idxNovo - 1] || "204,204,204";
    if (nomeInput) {
      nomeInput.style.backgroundColor = linhaValida ? `rgb(${corRgb})` : `rgba(${corRgb},0.5)`;
      nomeInput.style.color = linhaValida ? "#fff" : "#000";
      nomeInput.style.border = `1px solid ${corRgb}`;
      nomeInput.style.opacity = "1";
      nomeInput.placeholder = "Digite o nome";
    }
    const tamanhoInput = document.getElementById('tamanho_input_' + idxNovo);
    const generoInput = document.getElementById('genero_input_' + idxNovo);
    [tamanhoInput, generoInput].forEach(input => {
      if (input) input.style.backgroundColor = linhaValida ? '#f1f1f1' : 'white';
    });
    atualizarBotaoRemover(idxNovo);
  }

  // Listeners para nova linha
  nomeInput.addEventListener('input', atualizarCorLinha);
  nomeInput.addEventListener('blur', atualizarCorLinha);
  tamanhoChecks.forEach(cb => {
    cb.addEventListener('change', function() {
      atualizarArrayTamanho(idxNovo);
      atualizarPlaceholderTamanhoMulti(idxNovo);
      atualizarCorLinha();
    });
  });
  generoChecks.forEach(cb => {
    cb.addEventListener('change', function() {
      atualizarArrayGenero(idxNovo);
      atualizarPlaceholderGeneroMulti(idxNovo);
      atualizarCorLinha();
    });
  });

  // Inicializa placeholders e cor da linha
  atualizarPlaceholderTamanhoMulti(idxNovo);
  atualizarPlaceholderGeneroMulti(idxNovo);
  atualizarCorLinha();
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
          atualizarEstadoScrollCategorias();
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


function floatMenu(menuEl, inputEl) {
  if (!menuEl || !inputEl) return;
  // fecha outros menus primeiro
  document.querySelectorAll('.checkboxes-tamanho-multi, .checkboxes-genero-multi').forEach(m => {
    if (m !== menuEl) {
      m.style.display = 'none';
      m.classList.remove('floating');
      m.style.left = m.style.top = m.style.width = '';
    }
  });

  const rect = inputEl.getBoundingClientRect();
  menuEl.classList.add('floating');
  // Adiciona pointer-events:none à .categorias-table-scroll
  const container = document.querySelector('.categorias-table');
  if (container) {
    container.style.pointerEvents = 'none';
  }
  const needed = Math.min(menuEl.scrollHeight || 160, 320);
  const spaceBelow = window.innerHeight - rect.bottom;
  if (spaceBelow < needed && rect.top > needed) {
    menuEl.style.top = (rect.top - needed) + 'px';
  } else {
    menuEl.style.top = (rect.bottom) + 'px';
  }
  menuEl.style.left = rect.left + 'px';
  menuEl.style.width = rect.width + 'px';
  menuEl.style.display = 'block';
  menuEl.dataset.floating = '1';
}

function unfloatMenu(menuEl) {
  if (!menuEl) return;
  menuEl.style.display = 'none';
  menuEl.classList.remove('floating');
  if (menuEl.dataset.floating === '1') {
    menuEl.style.left = '';
    menuEl.style.top = '';
    menuEl.style.width = '';
    delete menuEl.dataset.floating;
  }
  // Remove pointer-events:none da .categorias-table-scroll
  const container = document.querySelector('.categorias-table');
  if (container) {
    container.style.pointerEvents = '';
  }
}


/* substituir handler global que fecha dropdowns ao clicar fora */
document.addEventListener('mousedown', function(e) {
  // checkboxes de tamanho
  document.querySelectorAll('.checkboxes-tamanho-multi').forEach(div => {
    const idx = div.id ? div.id.split('-').pop() : null;
    const input = idx ? document.getElementById('tamanho_input_' + idx) : null;
    // se visível e clique fora do menu e fora do input -> fechar
    if (div.style.display === 'block' && !div.contains(e.target) && e.target !== input) {
      unfloatMenu(div);
    }
  });
  // checkboxes de genero
  document.querySelectorAll('.checkboxes-genero-multi').forEach(div => {
    const idx = div.id ? div.id.split('-').pop() : null;
    const input = idx ? document.getElementById('genero_input_' + idx) : null;
    if (div.style.display === 'block' && !div.contains(e.target) && e.target !== input) {
      unfloatMenu(div);
    }
  });
});

function atualizarEstadoScrollCategorias() {
  const container = document.querySelector('.categorias-table');
  if (!container) return;
  const linhas = container.querySelectorAll('.categorias-row');
  const detalhesModal = document.querySelector('.detalhes-modal');
  const btnSalvar = document.getElementById('btn-salvar');

  if (linhas.length >= 10) {
    container.classList.add('categorias-table-scroll');
    if (detalhesModal) {
      detalhesModal.style.width = '520px';
      detalhesModal.style.minWidth = '520px';
    }
    if (btnSalvar) btnSalvar.style.marginRight = '40px';
  } else {
    container.classList.remove('categorias-table-scroll');
    if (detalhesModal) {
      detalhesModal.style.width = '510px';
      detalhesModal.style.minWidth = '510px';
    }
    if (btnSalvar) btnSalvar.style.marginRight = '30px';
  }
}

// function converterCategoriaFrontend(cat) {
//   // Se já vier arrays, só retorna
//   if (Array.isArray(cat.tamanhos) && Array.isArray(cat.generos)) {
//     return {
//       id: cat.id,
//       nome: cat.nome,
//       tamanhos: cat.tamanhos,
//       generos: cat.generos
//     };
//   }

//   let tamanhos = [];
//   if (cat.tipoTamanho === 'T') tamanhos = ['T'];
//   else if (cat.tipoTamanho === 'L') tamanhos = ['L'];
//   else if (cat.tipoTamanho === 'N') tamanhos = ['N'];

//   let generos = [];
//   if (cat.tipoGenero === 'T') generos = ['T'];
//   else if (cat.tipoGenero === 'FM') generos = ['F', 'M'];
//   else if (cat.tipoGenero) generos = cat.tipoGenero.split('');
//   else generos = [];

//   return {
//     id: cat.id,
//     nome: cat.nome,
//     tamanhos,
//     generos
//   };
// }
// categorias = data.map(converterCategoriaFrontend);

// Ao abrir o modal
document.querySelector('[title="Gerenciar categorias"]').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('modal-categorias-bg').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    carregarCategorias();
});
