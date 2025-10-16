const MODULOS = ["produtos", "movimentacoes", "relatorios", "fornecedores", "funcionarios"];

//botão de voltar ao topo
window.addEventListener('scroll', function() {
    const btn = document.getElementById('btn-topo');
    if (window.scrollY > 100) {
        btn.style.display = 'block';
    } else {
        btn.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    atualizarBadgeBaixoEstoque();
    const btn = document.getElementById('btn-topo');
    if (btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

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

            // Tabela de permissões igual ao gerente
            let tabela = `
                <div class="permissoes-table">
                    <div class="permissoes-header permissoes-row" style="display:flex; justify-content:space-between; align-items:center;">
                        <div class="permissoes-cell modulo-header" style="flex:1;">
                            <h2 title="${cargo.nome}" style="display:flex; align-items:center;">
                                ${cargo.nome}
                                <button class="btn-editar-cargo" data-cargo="${cargo.id}" title="Editar cargo ${cargo.nome}">
                                    <i class="fa-solid fa-pen"></i> Editar
                                </button>
                                <button class="btn-cancelar-cargo" data-cargo="${cargo.id}" style="display:none;" title="Cancelar edição de ${cargo.nome}">
                                    <i class="fa-solid fa-xmark"></i> Cancelar
                                </button>
                                <button class="btn-salvar-cargo" data-cargo="${cargo.id}" style="display:none;" title="Salvar alterações de ${cargo.nome}">
                                    <i class="fa-solid fa-check"></i> Salvar
                                </button>
                                <button class="btn-excluir-cargo" data-cargo="${cargo.id}" title="Excluir cargo ${cargo.nome}">
                                    <i class="fa-solid fa-trash"></i> Excluir
                                </button>
                            </h2>
                        </div>
                        <div class="permissoes-cell acoes-header" style="display:flex; gap:12px; align-items:center; justify-content:flex-end; width:auto;">
                            <div class="cell" title="Visualizar">Visualizar</div>
                            <div class="cell" title="Criar">Criar</div>
                            <div class="cell" title="Editar">Editar</div>
                            <div class="cell" title="Excluir">Excluir</div>
                            <div class="cell" title="Tudo"></div>
                        </div>
                    </div>
                    ${MODULOS.map((mod, mIdx) => `
                        <div class="permissoes-row" data-modulo="${mod}" style="display:flex; justify-content:space-between; align-items:center;">
                            <div class="permissoes-cell modulo-nome" style="flex:1; display:flex; align-items:center; gap:8px;">
                                <span style="${permissoes[mIdx].info ? 'font-weight:bold;' : ''}" title="${permissoes[mIdx].label}">${permissoes[mIdx].label}</span>
                                ${permissoes[mIdx].info ? '<i class="fa-solid fa-circle-info" title="Módulo sensível"></i>' : ''}
                            </div>
                            <div class="permissoes-cell checboxes-container" style="display:flex; gap:12px; align-items:center; justify-content:flex-end; width:auto;">
                                <div class="cell">
                                    <input type="checkbox" class="perm-check" data-modulo="${mod}" data-nivel="1" data-cargo="${cargo.id}" ${cargo[mod] >= 1 ? 'checked' : ''} title="Visualizar ${permissoes[mIdx].label}"/>
                                </div>
                                <div class="cell">
                                    <input type="checkbox" class="perm-check" data-modulo="${mod}" data-nivel="2" data-cargo="${cargo.id}" ${cargo[mod] >= 2 ? 'checked' : ''} title="Criar ${permissoes[mIdx].label}"/>
                                </div>
                                <div class="cell">
                                    <input type="checkbox" class="perm-check" data-modulo="${mod}" data-nivel="3" data-cargo="${cargo.id}" ${cargo[mod] >= 3 ? 'checked' : ''} title="Editar ${permissoes[mIdx].label}"/>
                                </div>
                                <div class="cell">
                                    <input type="checkbox" class="perm-check" data-modulo="${mod}" data-nivel="4" data-cargo="${cargo.id}" ${cargo[mod] >= 4 ? 'checked' : ''} title="Excluir ${permissoes[mIdx].label}"/>
                                </div>
                                <div class="cell">
                                    <input type="checkbox" class="perm-check-all" data-modulo="${mod}" data-cargo="${cargo.id}" ${cargo[mod] === 4 ? 'checked' : ''} title="Tudo: ${permissoes[mIdx].label}"/>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            
            div.innerHTML = tabela;
            container.appendChild(div);
            
            // BLOQUEIA CHECKBOXES
            div.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.style.pointerEvents = 'none';
                cb.style.opacity = '0.5';
            });
            
            // CAPTURA OS BOTÕES
            const btnEditar = div.querySelector('.btn-editar-cargo');
            const btnSalvar = div.querySelector('.btn-salvar-cargo');
            const btnCancelar = div.querySelector('.btn-cancelar-cargo');
            
            // EDITAR
            btnEditar.onclick = function() {
                div.dataset.permissoesOriginais = JSON.stringify(MODULOS.map(mod => cargo[mod]));
                div.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.disabled = false;
                    cb.style.opacity = '1';
                });
                btnEditar.style.display = 'none';
                btnCancelar.style.display = '';
                btnSalvar.style.display = '';
            };
            
            // CANCELAR
            btnCancelar.addEventListener('click', function() {
                const originais = JSON.parse(div.dataset.permissoesOriginais || '[]');
                MODULOS.forEach((mod, idx) => {
                    let nivel = originais[idx] || 0;
                    [1,2,3,4].forEach(n => {
                        const cb = div.querySelector(`.perm-check[data-modulo="${mod}"][data-nivel="${n}"]`);
                        if (cb) cb.checked = n <= nivel;
                    });
                    const tudoCb = div.querySelector(`.perm-check-all[data-modulo="${mod}"]`);
                    if (tudoCb) tudoCb.checked = nivel === 4;
                    cargo[mod] = nivel;
                });
                div.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.style.pointerEvents = 'none';
                    cb.style.opacity = '0.5';
                });
                btnEditar.style.display = '';
                btnSalvar.style.display = 'none';
                btnCancelar.style.display = 'none';
                // btnCancelar.classList.remove('btn', 'btn-primary');
            });
            
            // SALVAR
            btnSalvar.addEventListener('click', function() {
                salvarPermissoesCargo(cargo.id, div);
                div.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.disabled = true;
                    cb.style.opacity = '0.5';
                });
                btnEditar.style.display = '';
                btnSalvar.style.display = 'none';
                btnCancelar.style.display = 'none';
                // btnCancelar.classList.remove('btn', 'btn-primary');
            });


            // Listeners dos checkboxes
            MODULOS.forEach(mod => {
                [1,2,3,4].forEach(nivel => {
                    const cb = div.querySelector(`.perm-check[data-modulo="${mod}"][data-nivel="${nivel}"]`);
                    if (cb) {
                        cb.addEventListener('change', function() {
                            const checks = [1,2,3,4].map(n => div.querySelector(`.perm-check[data-modulo="${mod}"][data-nivel="${n}"]`));
                            if (cb.checked) {
                                for (let i = 0; i < nivel; i++) checks[i].checked = true;
                                cargo[mod] = nivel;
                            } else {
                                for (let i = nivel-1; i < 4; i++) checks[i].checked = false;
                                let novoNivel = 0;
                                for (let i = 0; i < 4; i++) if (checks[i].checked) novoNivel = i+1;
                                cargo[mod] = novoNivel;
                            }
                            const tudoCb = div.querySelector(`.perm-check-all[data-modulo="${mod}"]`);
                            tudoCb.checked = cargo[mod] === 4;
                        });
                    }
                });
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
                    });
                }
            });

            //     div.querySelector('.btn-editar-cargo').addEventListener('click', function() {
            //     // Salva estado original para possível desfazer
            //     div.dataset.permissoesOriginais = JSON.stringify(MODULOS.map(mod => cargo[mod]));
            
            //     // Habilita edição dos checkboxes
            //     div.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            //         cb.style.pointerEvents = 'auto';
            //         cb.style.opacity = '1';
            //     });
            
            //     // Troca botão para "Salvar"
            //     // this.classList.add('btn');
            //     // this.classList.remove('btn-editar-cargo');
            //     // this.classList.add('btn-salvar-cargo');
            //     // this.innerHTML = '<i class="fa-solid fa-check"></i> Salvar';
            
            //     // Adiciona listener para salvar
            //     this.onclick = function() {
            //         // Envia para backend
            //         salvarPermissoesCargo(cargo.id, div);
            //         // Bloqueia novamente
            //         div.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            //             cb.style.pointerEvents = 'none';
            //             cb.style.opacity = '0.7';
            //         });
            //         // Volta botão para "Editar"
            //         this.classList.remove('btn');
            //         this.classList.remove('btn-salvar-cargo');
            //         this.classList.add('btn-editar-cargo');
            //         this.innerHTML = '<i class="fa-solid fa-pen"></i> Editar';
            //         // Reativa listener de editar
            //         this.onclick = arguments.callee;
            //     };
            // });
        });
}

document.addEventListener('DOMContentLoaded', renderizarPermissoes);

// function salvarPermissoes() {
//     const cargos = [];
//     document.querySelectorAll('#permissoes-list .main-container').forEach(div => {
//         const id = parseInt(div.id.replace('permissoes-cargo-',''));
//         const nome = div.querySelector('h2').childNodes[0].textContent.trim();
//         const cargo = { id, nome };
//         MODULOS.forEach(mod => {
//             let nivel = 0;
//             [1,2,3,4].forEach(n => {
//                 const cb = div.querySelector(`.perm-check[data-modulo="${mod}"][data-nivel="${n}"]`);
//                 if (cb && cb.checked) nivel = n;
//             });
//             cargo[mod] = nivel;
//         });
//         cargos.push(cargo);
//     });
//     const gerente = cargosBackend.find(c => c.id === 1);
//     if (gerente) cargos.unshift(gerente);

//     cargos.forEach(cargo => {
//         fetch(`/cargos/${cargo.id}`, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(cargo)
//         });
//     });
// }

function salvarPermissoesCargo(id, div) {
    const cargo = cargosBackend.find(c => c.id === id);
    if (!cargo) return;
    MODULOS.forEach(mod => {
        let nivel = 0;
        [1,2,3,4].forEach(n => {
            const cb = div.querySelector(`.perm-check[data-modulo="${mod}"][data-nivel="${n}"]`);
            if (cb && cb.checked) nivel = n;
        });
        cargo[mod] = nivel;
    });
    fetch(`/cargos/${cargo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cargo)
    }).then(() => {
        carregarCargosBackend();
        renderizarPermissoes();
        Swal.fire({
            icon: 'success',
            title: 'Permissões salvas!',
            showConfirmButton: false,
            timer: 1200,
            timerProgressBar: true
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