const MODULOS = ["produtos", "movimentacoes", "relatorios", "fornecedores", "funcionarios"];
// const CARGOS_PADRAO = [
//   {
//     id: 1,
//     nome: "Gerente",
//     produtos: 4,
//     movimentacoes: 4,
//     relatorios: 4,
//     fornecedores: 4,
//     funcionarios: 4
//   }
// ];

// if (!localStorage.getItem('cargosPermissoes')) {
//   localStorage.setItem('cargosPermissoes', JSON.stringify(CARGOS_PADRAO));
// }

let cargosBackend = [];

function carregarCargosBackend() {
    fetch('/cargos')
      .then(res => res.json())
      .then(cargos => {
        cargosBackend = cargos;
        renderizarCargos();
        renderizarPermissoes();
      });
}
document.addEventListener('DOMContentLoaded', carregarCargosBackend);

function renderizarCargos() {
  const container = document.getElementById('cargo-list');
  container.innerHTML = '';
  const maxCargos = 7;

  // Filtra cargos reais (exceto admin) e ordena por id crescente
  const cargos = cargosBackend
    .filter(c => c.nome.toLowerCase() !== 'admin')
    .sort((a, b) => a.id - b.id);

  const idsOcupados = cargos.map(c => c.id);

  for (let i = 1; i <= maxCargos; i++) {

    const cargo = cargos.find((c, idx) => idx === i - 1);
    const btn = document.createElement('button');
    btn.className = `cargo-btn cargo-${i}`;

    if (cargo) {
    btn.innerHTML = `${cargo.nome} ${i !== 1 ? '<i class="fa-solid fa-pen" title="Renomear"></i>' : ''}`;
        btn.onclick = () => {
        if (cargo.id !== 1) abrirEditarCargo(cargo.id);
        };
      btn.classList.remove('novo-cargo');
    } else {
      btn.innerHTML = `<i class="fa-solid fa-plus"></i> Novo Cargo`;
      btn.onclick = () => {
        abrirCriarCargo();
      };
      btn.classList.add('novo-cargo');
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
    const cargos = cargosBackend;
    const container = document.getElementById('permissoes-list');
    container.innerHTML = '';
    cargos
        .filter(cargo => cargo.id !== 1)
        .sort((a, b) => a.id - b.id)
        .forEach(cargo => {
            const div = document.createElement('div');
            div.className = 'main-container';
            if (cargo.id >= 2) {
                div.id = `permissoes-cargo-${cargo.id}`;
            } else {
                return;
            }
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                    <div>
                        <h2 style="margin-bottom: 5px;">
                            ${cargo.nome}
                        <span class="actions" title="Excluir">
                                <i class="fa-solid fa-delete-left" style="cursor:pointer;" onclick="removerCargo(${cargo.id})"></i>
                            </span>
                        </h2>
                        <div class="permissoes">
                            <p style="margin:0;">Produtos</p>
                            <p style="margin:0;">Movimentações</p>
                            <p style="margin:0;">Relatórios</p>
                            <p style="margin:0; font-weight: bold;">Fornecedores <i class="fa-solid fa-circle-info" title="Módulo sensível" style="left: 0;"></i></p>
                            <p style="margin:0; font-weight: bold;">Funcionários <i class="fa-solid fa-circle-info" title="Módulo sensível"></i></p>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        ${['visualizar','criar','editar','excluir','tudo'].map((tipo, idx) => `
                            <div class="permissoes-col ${tipo}">
                                ${tipo !== 'tudo' ? `<span>${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>` : ''}
                                ${MODULOS.map((mod, mIdx) => {
                                    if (tipo === 'tudo') {
                                        return `<input type="checkbox" class="perm-check-all" data-modulo="${mod}" data-cargo="${cargo.id}" ${cargo[mod] === 4 ? 'checked' : ''}/>`;
                                    } else {
                                        return `<input type="checkbox" class="perm-check" data-modulo="${mod}" data-nivel="${idx+1}" data-cargo="${cargo.id}" ${cargo[mod] >= idx+1 ? 'checked' : ''}/>`;
                                    }
                                }).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            container.appendChild(div);

            // Listeners progressivos
            MODULOS.forEach(mod => {
                // Colunas Visualizar, Criar, Editar, Excluir
                [1,2,3,4].forEach(nivel => {
                    const cb = div.querySelector(`.perm-check[data-modulo="${mod}"][data-nivel="${nivel}"]`);
                    if (cb) {
                        cb.addEventListener('change', function() {
                            const checks = [1,2,3,4].map(n => div.querySelector(`.perm-check[data-modulo="${mod}"][data-nivel="${n}"]`));
                            if (cb.checked) {
                                // Marca todos anteriores
                                for (let i = 0; i < nivel; i++) checks[i].checked = true;
                                cargo[mod] = nivel;
                            } else {
                                // Desmarca todos posteriores
                                for (let i = nivel-1; i < 4; i++) checks[i].checked = false;
                                // Define novo nível
                                let novoNivel = 0;
                                for (let i = 0; i < 4; i++) if (checks[i].checked) novoNivel = i+1;
                                cargo[mod] = novoNivel;
                            }
                            // Atualiza "tudo"
                            const tudoCb = div.querySelector(`.perm-check-all[data-modulo="${mod}"]`);
                            tudoCb.checked = cargo[mod] === 4;
                            salvarPermissoes();
                        });
                    }
                });
                // Coluna "Tudo" (linha toda)
                const tudoCb = div.querySelector(`.perm-check-all[data-modulo="${mod}"]`);
                if (tudoCb) {
                    tudoCb.addEventListener('change', function() {
                        const checks = [1,2,3,4].map(n => div.querySelector(`.perm-check[data-modulo="${mod}"][data-nivel="${n}"]`));
                        if (tudoCb.checked) {
                            checks.forEach(cb => cb.checked = true);
                            cargo[mod] = 4;
                        } else {
                            checks.forEach(cb => cb.checked = false);
                            cargo[mod] = 0;
                        }
                        salvarPermissoes();
                    });
                }
            });
        });
}
document.addEventListener('DOMContentLoaded', renderizarPermissoes);

function salvarPermissoes() {
    const cargos = [];
    document.querySelectorAll('#permissoes-list .main-container').forEach(div => {
        const id = parseInt(div.id.replace('permissoes-cargo-',''));
        const nome = div.querySelector('h2').childNodes[0].textContent.trim();
        const cargo = { id, nome };
        MODULOS.forEach(mod => {
            let nivel = 0;
            [1,2,3,4].forEach(n => {
                const cb = div.querySelector(`.perm-check[data-modulo="${mod}"][data-nivel="${n}"]`);
                if (cb && cb.checked) nivel = n;
            });
            cargo[mod] = nivel;
        });
        cargos.push(cargo);
    });
    const gerente = cargosBackend.find(c => c.id === 1);
    if (gerente) cargos.unshift(gerente);

    cargos.forEach(cargo => {
        fetch(`/cargos/${cargo.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cargo)
        });
    });
}
function criarCargo(id, nome) {
    const novoCargo = {
        nome,
        produtos: 0,
        movimentacoes: 0,
        relatorios: 0,
        fornecedores: 0,
        funcionarios: 0
    };
    fetch('/cargos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoCargo)
    })
    .then(() => {
        carregarCargosBackend();
        setTimeout(() => {
            const cargos = cargosBackend;
            const cargo = cargos.find(c => c.nome === nome);
            if (cargo) {
                const div = document.getElementById(`permissoes-cargo-${cargo.id}`);
                if (div) {
                    div.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 200);
    });
}

function abrirEditarCargo(id) {
  const cargos = cargosBackend;
  const cargo = cargos.find(c => c.id === id);
  if (!cargo) return;
  Swal.fire({
    title: `<h2 style="padding-top:20px; color:#277580; text-align:left;">Renomear Cargo</h2>`,
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
        input.maxLength = 12;
        input.style.fontSize = '12px';
        input.style.margin = '0px 20px 10px 20px';
        input.style.border = 'solid 1px #aaa';
        input.style.borderRadius = '4px';
      }
    },
    inputValidator: (value) => {
      const nome = (value || '').trim();
      if (!nome || nome.length < 3) return 'Digite um nome válido!';
      const cargos = cargosBackend;
      if (cargos.some(c => c.nome.toLowerCase() === nome.toLowerCase())) return 'Cargo já existe!';
      if (/[^a-zA-Z0-9_\- áéíóúãõâêîôûçÁÉÍÓÚÃÕÂÊÎÔÛÇ]/.test(nome)) return 'Não pode conter caracteres especiais!';
      if (/[_\-]$/.test(nome)) return 'Não pode terminar com _ ou -';
      if (/\d/.test(nome)) return 'O nome do cargo não pode conter números!';
      return null;
    }
  }).then(result => {
    if (result.isConfirmed) {
      fetch(`/usuarios/cargo/${cargo.id}`)
        .then(res => res.json())
        .then(funcionarios => {
          if (funcionarios.length > 0) {
            Swal.fire({
              icon: 'error',
              title: 'Não é possível renomear',
              text: 'Já existe funcionário cadastrado com esse cargo!',
              timer: 1800,
              showConfirmButton: false,
              timerProgressBar: true,
              allowOutsideClick: false,
            });
          } else {
            cargo.nome = result.value.trim();
            fetch(`/cargos/${cargo.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(cargo)
            })
            .then(() => {
              carregarCargosBackend();
              renderizarCargos();
              renderizarPermissoes();
              Swal.fire({
                icon: 'success',
                title: 'Renomeado com sucesso!',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                allowOutsideClick: false
              });
              setTimeout(() => {
                const div = document.getElementById(`permissoes-cargo-${cargo.id}`);
                if (div) {
                  div.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 300);
            });
          }
        });
    }
  });
}
function removerCargo(id) {
    const cargo = cargosBackend.find(c => c.id === id);
    fetch(`/usuarios/cargo/${id}`)
      .then(res => res.json())
      .then(funcionarios => {
        if (funcionarios.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Não é possível remover',
                text: 'Já existe funcionário cadastrado com esse cargo!',
                timer: 1800,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false,
            });
        } else {
            fetch(`/cargos/${id}`, { method: 'DELETE' })
              .then(() => {
                carregarCargosBackend();
                renderizarCargos();
                renderizarPermissoes();
                Swal.fire({
                    icon: 'success',
                    title: `"${cargo ? cargo.nome : 'Cargo'}" removido com sucesso!`,
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                    allowOutsideClick: false
                });
              });
        }
    });
}
function alterarPermissaoCargo(id, modulo, nivel) {
  const cargos = cargosBackend;
  const idx = cargos.findIndex(c => c.id === id);
  if (idx !== -1) {
    cargos[idx][modulo] = nivel;
    fetch(`/cargos/${cargos[idx].id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cargos[idx])
    });
    renderizarPermissoes();
  }
}

function proximoIdCargo() {
  const cargos = cargosBackend;
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
    const cargos = cargosBackend;
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
        // localStorage.setItem('cargosPermissoes', JSON.stringify(cargos));
        renderizarPermissoes();
    }
}

// Função para criar cargo
window.abrirCriarCargo = function(id) {
    Swal.fire({
        title: '<h2 style="padding-top:20px; margin-bottom: 10px; color:#277580; text-align:left;">Criar Cargo</h2>',
        input: 'text',
        inputPlaceholder: 'Digite o título do cargo',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        didOpen: () => {
            const input = Swal.getInput();
            if (input) {
                input.maxLength = 12;
                input.style.fontSize = '12px';
                input.style.margin = '0px 20px 10px 20px';
                input.style.border = 'solid 1px #aaa';
                input.style.borderRadius = '4px';
            }
        },
        inputValidator: (value) => {
            const nome = (value || '').trim();
            if (!nome || nome.length < 3) return 'Digite um nome válido!';
            const cargos = cargosBackend;
            if (cargos.some(c => c.nome.toLowerCase() === nome.toLowerCase())) return 'Cargo já existe!';
            // Validação de caracteres especiais
            if (/[^a-zA-Z0-9_\- áéíóúãõâêîôûçÁÉÍÓÚÃÕÂÊÎÔÛÇ]/.test(nome)) return 'Não pode conter caracteres especiais!';
            if (/[_\-]$/.test(nome)) return 'Não pode terminar com _ ou -';
            if (/\d/.test(nome)) return 'O nome do cargo não pode conter números!';
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