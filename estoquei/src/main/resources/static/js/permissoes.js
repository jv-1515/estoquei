const MODULOS = ["produtos", "movimentacoes", "relatorios", "fornecedores", "funcionarios"];
const CARGOS_PADRAO = [
  {
    id: 1,
    nome: "Gerente",
    produtos: 4,
    movimentacoes: 4,
    relatorios: 4,
    fornecedores: 4,
    funcionarios: 4
  }
];

if (!localStorage.getItem('cargosPermissoes')) {
  localStorage.setItem('cargosPermissoes', JSON.stringify(CARGOS_PADRAO));
}

function renderizarCargos() {
  const cargos = JSON.parse(localStorage.getItem('cargosPermissoes')) || [];
  const container = document.getElementById('cargo-list');
  container.innerHTML = '';
  for (let i = 1; i <= 7; i++) {
    const cargo = cargos.find(c => c.id === i);
    const btn = document.createElement('button');
    btn.className = `cargo-btn cargo-${i}`;
    if (cargo) {
      btn.innerHTML = `${cargo.nome} ${i !== 1 ? '<i class="fa-solid fa-pen"></i>' : ''}`;
      btn.onclick = () => { if (i !== 1) abrirEditarCargo(i); };
    } else {
      btn.innerHTML = `<i class="fa-solid fa-plus"></i> Novo cargo`;
      btn.onclick = () => abrirCriarCargo(i);
    }
    container.appendChild(btn);
  }
}
document.addEventListener('DOMContentLoaded', renderizarCargos);

const permissoes = [
    { label: "Produtos" },
    { label: "Movimentações" },
    { label: "Relatórios" },
    { label: "Fornecedores", info: true },
    { label: "Funcionários", info: true }
];

const tiposPerm = [
    { key: "visualizar", cor: "#43b04a", texto: "Visualizar" },
    { key: "criar", cor: "#bfa100", texto: "Criar" },
    { key: "editar", cor: "#e67e22", texto: "Editar" },
    { key: "excluir", cor: "#c0392b", texto: "Excluir" },
    { key: "tudo", cor: "#1e94a3", texto: "Tudo" }
];

// Renderiza todos os cargos
function renderizarPermissoes() {
    const cargos = JSON.parse(localStorage.getItem('cargosPermissoes')) || [];
    const container = document.getElementById('permissoes-list');
    container.innerHTML = '';
    cargos
        .filter(cargo => cargo.id !== 1)
        .sort((a, b) => a.id - b.id)
        .forEach(cargo => {
        const div = document.createElement('div');
        div.className = 'main-container';
        div.id = `permissoes-cargo-${cargo.id === 1 ? 'gerente' : cargo.id}`;
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                <div>
                    <h2 style="margin-bottom: 5px;">
                        ${cargo.nome}
                        <span class="actions" title="Excluir">
                            <i class="fa-solid fa-trash" style="cursor:pointer;" onclick="removerCargo(${cargo.id})"></i>
                        </span>
                    </h2>                    
                    <div class="permissoes">
                        <p style="margin:0;">Produtos</p>
                        <p style="margin:0;">Movimentações</p>
                        <p style="margin:0;">Relatórios</p>
                        <p style="margin:0; font-weight: bold;">Fornecedores <i class="fa-solid fa-circle-info" style="color:#888; font-size:12px; position: relative; left: 0;"></i></p>
                        <p style="margin:0; font-weight: bold;">Funcionários <i class="fa-solid fa-circle-info" style="color:#888; font-size:12px; position: relative; left: 5px;"></i></p>
                    </div>
                </div>
                <div style="display:flex; gap:10px;">
                    <!-- Visualizar -->
                    <div class="permissoes-col visualizar">
                        <span>Visualizar</span>
                        ${MODULOS.map(mod => `<input type="checkbox" class="perm-check" ${cargo[mod] >= 1 ? 'checked' : ''} />`).join('')}
                    </div>
                    <!-- Criar -->
                    <div class="permissoes-col criar">
                        <span>Criar</span>
                        ${MODULOS.map(mod => `<input type="checkbox" class="perm-check" ${cargo[mod] >= 2 ? 'checked' : ''} />`).join('')}
                    </div>
                    <!-- Editar -->
                    <div class="permissoes-col editar">
                        <span>Editar</span>
                        ${MODULOS.map(mod => `<input type="checkbox" class="perm-check" ${cargo[mod] >= 3 ? 'checked' : ''} />`).join('')}
                    </div>
                    <!-- Excluir -->
                    <div class="permissoes-col excluir">
                        <span>Excluir</span>
                        ${MODULOS.map(mod => `<input type="checkbox" class="perm-check" ${cargo[mod] >= 4 ? 'checked' : ''} />`).join('')}
                    </div>
                    <div class="permissoes-col tudo">
                        <span></span>
                        ${MODULOS.map(() => `<input type="checkbox" class="perm-check-all" />`).join('')}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    div.querySelectorAll('.perm-check').forEach(cb => {
        cb.addEventListener('change', function() {
            const modulo = cb.getAttribute('data-modulo');
            const nivel = parseInt(cb.getAttribute('data-nivel'));
            alterarPermissaoCargoCheckbox(cargo.id, modulo, nivel, cb.checked);
        });
    });
    
    document.querySelectorAll('.btn-remove-cargo').forEach(btn => {
        btn.onclick = function() {
            const id = parseInt(btn.dataset.id);
            removerCargo(id);
        };
    });
}

document.addEventListener('DOMContentLoaded', renderizarPermissoes);


function abrirCriarCargo(id) {
  Swal.fire({
    title: '<h2>Criar cargo</h2>',
    input: 'text',
    inputPlaceholder: 'Digite o título do cargo',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    allowOutsideClick: false,
    inputValidator: (value) => {
      if (!value || value.trim().length < 3) return 'Digite um nome válido!';
      const cargos = JSON.parse(localStorage.getItem('cargosPermissoes')) || [];
      if (cargos.some(c => c.nome.toLowerCase() === value.trim().toLowerCase())) return 'Cargo já existe!';
    }
  }).then(result => {
    if (result.isConfirmed) {
      criarCargo(id, result.value.trim());
    }
  });
}

function criarCargo(id, nome) {
    const cargos = JSON.parse(localStorage.getItem('cargosPermissoes')) || [];
    const novoCargo = {
        id,
        nome,
        produtos: 0,
        movimentacoes: 0,
        relatorios: 0,
        fornecedores: 0,
        funcionarios: 0
    };
    cargos.push(novoCargo);
    cargos.sort((a, b) => a.id - b.id);
    localStorage.setItem('cargosPermissoes', JSON.stringify(cargos));
    renderizarCargos();
    renderizarPermissoes();
    setTimeout(() => {
        const div = document.getElementById(`permissoes-cargo-${id}`);
        if (div) div.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function abrirEditarCargo(id) {
  const cargos = JSON.parse(localStorage.getItem('cargosPermissoes')) || [];
  const cargo = cargos.find(c => c.id === id);
  if (!cargo) return;
Swal.fire({
    title: `<h2 style="padding-top:20px; color:#277580; text-align:left;">Renomear cargo</h2>`,
    html: `<p style="text-align:left; padding: 0px 20px 0px 10px; margin: 0;">${cargo.nome}</p>`,
    input: 'text',
    inputValue: '',
    inputPlaceholder: 'Digite o título do cargo',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    allowOutsideClick: false,
    didOpen: () => {
        const input = Swal.getInput();
        if (input) {
            input.style.fontSize = '12px';
            input.style.margin = '0px 20px 10px 20px';
            input.style.border = 'solid 1px #aaa';
            input.style.borderRadius = '4px';
        }
    },
    inputValidator: (value) => {
        if (!value || value.trim().length < 3) return 'Digite um nome válido!';
        if (cargos.some(c => c.nome.toLowerCase() === value.trim().toLowerCase() && c.id !== id)) return 'Cargo já existe!';
    }
}).then(result => {
    if (result.isConfirmed) {
      cargo.nome = result.value.trim();
      localStorage.setItem('cargosPermissoes', JSON.stringify(cargos));
      renderizarCargos();
      renderizarPermissoes();
    }
});
}

function removerCargo(id) {
    // TODO: Verificar se existe funcionário com esse cargo antes de remover
    // if (existeFuncionarioComCargo(id)) {
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Não é possível remover',
    //     text: 'Já existe funcionário cadastrado com esse cargo!',
    //     timer: 1800,
    //     showConfirmButton: false,
    //     timerProgressBar: true,
    //     allowOutsideClick: false,
    //   });
    //   return;
    // }
    Swal.fire({
        icon: 'warning',
        title: 'Remover cargo?',
        text: 'Essa ação não pode ser desfeita.',
        showCancelButton: true,
        confirmButtonText: 'Remover',
        cancelButtonText: 'Voltar',
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            let cargos = JSON.parse(localStorage.getItem('cargosPermissoes')) || [];
            cargos = cargos.filter(c => c.id !== id);
            localStorage.setItem('cargosPermissoes', JSON.stringify(cargos));
            renderizarCargos();
            renderizarPermissoes();
        }
    });
}


function alterarPermissaoCargo(id, modulo, nivel) {
  const cargos = JSON.parse(localStorage.getItem('cargosPermissoes')) || [];
  const idx = cargos.findIndex(c => c.id === id);
  if (idx !== -1) {
    cargos[idx][modulo] = nivel;
    localStorage.setItem('cargosPermissoes', JSON.stringify(cargos));
    renderizarPermissoes();
  }
}

function proximoIdCargo() {
  const cargos = JSON.parse(localStorage.getItem('cargosPermissoes')) || [];
  for (let i = 1; i <= 7; i++) {
    if (!cargos.find(c => c.id === i)) return i;
  }
  return null;
}

document.addEventListener('DOMContentLoaded', function() {
  const btnNovoCargo = document.querySelector('.btn[onclick*="abrirCriarCargo"]');
  if (btnNovoCargo) {
    if (proximoIdCargo() === null) btnNovoCargo.disabled = true;
  }
});


function alterarPermissaoCargoCheckbox(id, modulo, nivel, checked) {
    const cargos = JSON.parse(localStorage.getItem('cargosPermissoes')) || [];
    const idx = cargos.findIndex(c => c.id === id);
    if (idx !== -1) {
        if (checked) {
            // Marcar: define o nível para o maior marcado
            cargos[idx][modulo] = nivel;
        } else {
            // Desmarcar: define o nível para o maior marcado abaixo desse
            // Busca todos os checkboxes desse módulo/cargo
            const container = document.getElementById(`permissoes-cargo-${id}`);
            const checks = container.querySelectorAll(`input[data-modulo="${modulo}"]`);
            let novoNivel = 0;
            checks.forEach((cb, i) => {
                if (cb.checked && (i+1) < nivel) novoNivel = i+1;
            });
            cargos[idx][modulo] = novoNivel;
        }
        localStorage.setItem('cargosPermissoes', JSON.stringify(cargos));
        renderizarPermissoes();
    }
}

// Função para criar cargo
window.abrirCriarCargo = function(id) {
    Swal.fire({
        title: '<h2 style="padding-top:20px; color:#277580; text-align:left;">Criar Cargo</h2>',
        html: `<p style="text-align:left; padding: 0px 20px 0px 10px; margin: 0;">Novo cargo</p>`,
        input: 'text',
        inputPlaceholder: 'Digite o título do cargo',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        didOpen: () => {
            const input = Swal.getInput();
            if (input) {
                input.style.fontSize = '12px';
                input.style.margin = '0px 20px 10px 20px';
                input.style.border = 'solid 1px #aaa';
                input.style.borderRadius = '4px';
            }
        },
        inputValidator: (value) => {
            const nome = (value || '').trim();
            if (!nome || nome.length < 3) return 'Digite um nome válido!';
            const cargos = JSON.parse(localStorage.getItem('cargosPermissoes')) || [];
            if (cargos.some(c => c.nome.toLowerCase() === nome.toLowerCase())) return 'Cargo já existe!';
            // Validação de caracteres especiais
            if (/[^a-zA-Z0-9_\- áéíóúãõâêîôûçÁÉÍÓÚÃÕÂÊÎÔÛÇ]/.test(nome)) return 'Não pode conter caracteres especiais!';
            if (/[_\-]$/.test(nome)) return 'Não pode terminar com _ ou -';
            return null;
        }
    }).then(result => {
        if (result.isConfirmed) {
            criarCargo(id, result.value.trim());
        }
    });
};

document.addEventListener('DOMContentLoaded', function() {
    const btnNovoCargo = document.getElementById('btn-novo-cargo');
    if (btnNovoCargo) {
        btnNovoCargo.addEventListener('click', function() {
            const id = proximoIdCargo();
            if (id) abrirCriarCargo(id);
        });
    }
});


document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('#permissoes-cargo-gerente .perm-check').forEach(cb => {
        cb.checked = true;
        cb.addEventListener('change', function(e) {
            if (!cb.checked) {
                cb.checked = true;
                Swal.fire({
                    icon: 'warning',
                    title: 'Ação não permitida!',
                    text: 'Cargo de Gerente não pode ser editado',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                    allowOutsideClick: false
                });
            }
        });
    });
    document.querySelectorAll('#permissoes-cargo-gerente .perm-check-all').forEach(cb => {
        cb.checked = true;
        cb.addEventListener('change', function(e) {
            if (!cb.checked) {
                cb.checked = true;
                Swal.fire({
                    icon: 'warning',
                    title: 'Ação não permitida!',
                    text: 'Cargo de Gerente não pode ser editado',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                    allowOutsideClick: false
                });
            }
        });
    });
});