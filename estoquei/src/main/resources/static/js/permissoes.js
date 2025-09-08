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
      // Remove classe novo-cargo se existir
      btn.classList.remove('novo-cargo');
    } else {
      btn.innerHTML = `<i class="fa-solid fa-plus"></i> Novo Cargo`;
      btn.onclick = () => abrirCriarCargo(i);
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
                                <i class="fa-solid fa-delete-left" style="cursor:pointer;" onclick="removerCargo(${cargo.id})"></i>
                            </span>
                        </h2>
                        <div class="permissoes">
                            <p style="margin:0;">Produtos</p>
                            <p style="margin:0;">Movimentações</p>
                            <p style="margin:0;">Relatórios</p>
                            <p style="margin:0; font-weight: bold;">Fornecedores <i class="fa-solid fa-circle-info" title="Módulo sensível" style="color:#333; font-size:12px; position: relative; left: 0;"></i></p>
                            <p style="margin:0; font-weight: bold;">Funcionários <i class="fa-solid fa-circle-info" title="Módulo sensível" style="color:#333; font-size:12px; position: relative; left: 5px;"></i></p>
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
    // Mantém gerente
    const gerente = JSON.parse(localStorage.getItem('cargosPermissoes')).find(c => c.id === 1);
    if (gerente) cargos.unshift(gerente);
    localStorage.setItem('cargosPermissoes', JSON.stringify(cargos));
}

// function abrirCriarCargo(id) {
//   Swal.fire({
//     title: '<h2>Criar cargo</h2>',
//     input: 'text',
//     inputPlaceholder: 'Digite o título do cargo',
//     showCancelButton: true,
//     confirmButtonText: 'Confirmar',
//     cancelButtonText: 'Cancelar',
//     allowOutsideClick: false,
//     inputValidator: (value) => {
//       if (!value || value.trim().length < 3) return 'Digite um nome válido!';
//       const cargos = JSON.parse(localStorage.getItem('cargosPermissoes')) || [];
//       if (cargos.some(c => c.nome.toLowerCase() === value.trim().toLowerCase())) return 'Cargo já existe!';
//     }
//   }).then(result => {
//     if (result.isConfirmed) {
//       criarCargo(id, result.value.trim());
//     }
//   });
// }

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
        if (div) {
            div.scrollIntoView({ behavior: 'smooth', block: 'center' });
            div.classList.add('highlight-cargo'); // opcional: destaque visual
            setTimeout(() => div.classList.remove('highlight-cargo'), 1200); // remove destaque depois
        }
    }, 200);
}

function abrirEditarCargo(id) {
  const cargos = JSON.parse(localStorage.getItem('cargosPermissoes')) || [];
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
        const cargos = JSON.parse(localStorage.getItem('cargosPermissoes')) || [];
        if (cargos.some(c => c.nome.toLowerCase() === nome.toLowerCase())) return 'Cargo já existe!';
        // Validação de caracteres especiais
        if (/[^a-zA-Z0-9_\- áéíóúãõâêîôûçÁÉÍÓÚÃÕÂÊÎÔÛÇ]/.test(nome)) return 'Não pode conter caracteres especiais!';
        if (/[_\-]$/.test(nome)) return 'Não pode terminar com _ ou -';
        return null;
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
    const cargos = JSON.parse(localStorage.getItem('cargosPermissoes')) || [];
    const cargo = cargos.find(c => c.id === id);
    const nomeCargo = cargo ? cargo.nome : 'este cargo';
    Swal.fire({
        icon: 'warning',
        title: `Remover "${nomeCargo}"?`,
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