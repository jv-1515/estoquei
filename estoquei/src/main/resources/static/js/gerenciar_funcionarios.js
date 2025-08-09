let funcionarios = [];

window.expandedCargoMulti = false;
window.expandedStatusMulti = false;

// Utilidades de avatar
function getIniciais(nome) {
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
function corAvatar(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 60%, 80%)`;
}

// Atualiza avatar ao digitar o nome no cadastro e na edição
document.addEventListener('DOMContentLoaded', function() {
    // Cadastro
    const nomeInput = document.getElementById('cad-nome');
    const avatarDiv = document.getElementById('cad-avatar');
    const iniciaisSpan = document.getElementById('cad-avatar-iniciais');
    const icon = avatarDiv ? avatarDiv.querySelector('i.fa-user') : null;

    function atualizarAvatarCadastro() {
        const nome = nomeInput ? nomeInput.value.trim() : '';
        if (nome.length > 0) {
            if (iniciaisSpan) iniciaisSpan.textContent = getIniciais(nome);
            if (avatarDiv) avatarDiv.style.background = corAvatar(nome);
            if (icon) icon.style.display = 'none';
        } else {
            if (iniciaisSpan) iniciaisSpan.textContent = '';
            if (avatarDiv) avatarDiv.style.background = '#f1f1f1';
            if (icon) icon.style.display = '';
        }
    }
    if (nomeInput && avatarDiv && iniciaisSpan) {
        nomeInput.addEventListener('input', atualizarAvatarCadastro);
        atualizarAvatarCadastro();
    }

    // Edição
    const editNomeInput = document.getElementById('edit-nome');
    const editAvatarDiv = document.getElementById('edit-avatar');
    const editIniciaisSpan = document.getElementById('edit-avatar-iniciais');
    const editIcon = editAvatarDiv ? editAvatarDiv.querySelector('i.fa-user') : null;

    function atualizarAvatarEdicao() {
        const nome = editNomeInput ? editNomeInput.value.trim() : '';
        if (nome.length > 0) {
            if (editIniciaisSpan) editIniciaisSpan.textContent = getIniciais(nome);
            if (editAvatarDiv) editAvatarDiv.style.background = corAvatar(nome);
            if (editIcon) editIcon.style.display = 'none';
        } else {
            if (editIniciaisSpan) editIniciaisSpan.textContent = '';
            if (editAvatarDiv) editAvatarDiv.style.background = '#f1f1f1';
            if (editIcon) editIcon.style.display = '';
        }
    }
    if (editNomeInput && editAvatarDiv && editIniciaisSpan) {
        editNomeInput.addEventListener('input', atualizarAvatarEdicao);
        atualizarAvatarEdicao();
    }
    window.atualizarAvatarEdicao = atualizarAvatarEdicao;
});

// Renderização da tabela
function renderizarFuncionarios(lista) {
    const container = document.getElementById("product-list");
    container.innerHTML = `
    <thead>
    <tr>
        <th style="width:48px"></th>
        <th>Código</th>
        <th>Nome</th>
        <th>Cargo</th>
        <th>Email</th>
        <th>Status</th>
        <th></th>
    </tr>
    </thead>
    <tbody>
    ${lista
        .map(
            (f, idx) => `
        <tr tabindex="${idx + 1}">
            <td>
                <div style="
                    width:30px;height:30px;
                    border-radius:50%;
                    background:${corAvatar(f.nome)};
                    display:flex;align-items:center;justify-content:center;
                    font-weight:bold;font-size:12px;
                    color: rgba(0,0,0,0.65);
                    margin:0 auto;
                    ">
                    ${getIniciais(f.nome)}
                </div>
            </td>
            <td>${f.codigo}</td>
            <td>${f.nome}</td>
            <td>${f.cargo
                .toLowerCase()
                .replace(/(^|\s)\S/g, l => l.toUpperCase())}</td>
            <td>${f.email}</td>
            <td>
                <span style="
                    display:inline-block;
                    padding:${f.ativo ? '4px 12px' : '4px 8px'};
                    border-radius:12px;
                    font-size:12px;
                    color:#fff;
                    background:${f.ativo ? '#43b04a' : '#888'};
                ">
                    ${f.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td class="actions">
                <a href="javascript:void(0)" onclick="abrirEdicaoFuncionario('${f.id}')" title="Editar" tabindex="${lista.length + idx + 1}">
                    <i class="fa-solid fa-pen"></i>
                </a>
                <button type="button" onclick="removerFuncionario('${f.id}')" title="Excluir" tabindex="${2 * lista.length + idx + 1}"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
        `
        )
        .join("")}
    </tbody>
    `;
}

// --- MULTISELECT CARGO ---
function showCheckboxesCargoMulti() {
    var checkboxes = document.getElementById("checkboxes-cargo-multi");
    if (!window.expandedCargoMulti) {
        checkboxes.style.display = "block";
        window.expandedCargoMulti = true;
        atualizarPlaceholderCargoMulti();
    } else {
        checkboxes.style.display = "none";
        window.expandedCargoMulti = false;
        atualizarPlaceholderCargoMulti();
    }
}
function atualizarPlaceholderCargoMulti() {
    const checks = Array.from(document.querySelectorAll('.cargo-multi-check'));
    const todas = checks[0];
    const input = document.getElementById('filter-cargo');
    const individuais = checks.slice(1);
    const selecionados = individuais.filter(cb => cb.checked).map(cb => cb.parentNode.textContent.trim());
    let ativo = false;

    if (selecionados.length === 0) {
        todas.checked = false; // Permite desmarcar todos
        input.value = 'Todos';
        ativo = false;
    } else if (selecionados.length === individuais.length) {
        todas.checked = true;
        input.value = 'Todos';
        ativo = false;
    } else {
        todas.checked = false;
        input.value = selecionados.length === 1 ? selecionados[0] : selecionados.join(', ');
        ativo = true;
    }
    const chevron = input.parentNode.querySelector('.chevron-cargo');
    if (ativo) {
        input.style.border = '2px solid #1e94a3';
        input.style.color = '#1e94a3';
        if (chevron) chevron.style.color = '#1e94a3';
    } else {
        input.style.border = '';
        input.style.color = '';
        if (chevron) chevron.style.color = '#888';
    }
}

document.querySelectorAll('.cargo-multi-check').forEach(cb => {
    cb.addEventListener('change', function() {
        const checks = Array.from(document.querySelectorAll('.cargo-multi-check'));
        const todas = checks[0];
        const individuais = checks.slice(1);

        if (cb === todas) {
            // Se clicou em "Todos"
            if (todas.checked) {
                individuais.forEach(c => c.checked = true);
            } else {
                individuais.forEach(c => c.checked = false);
            }
        } else {
            if (individuais.every(c => c.checked)) {
                todas.checked = true;
            } else {
                todas.checked = false;
            }
        }
        atualizarPlaceholderCargoMulti();
        filtrarFuncionarios();
    });
});
atualizarPlaceholderCargoMulti();

// --- MULTISELECT STATUS ---
function showCheckboxesStatusMulti() {
    var checkboxes = document.getElementById("checkboxes-status-multi");
    if (!window.expandedStatusMulti) {
        checkboxes.style.display = "block";
        window.expandedStatusMulti = true;
        atualizarPlaceholderStatusMulti();
    } else {
        checkboxes.style.display = "none";
        window.expandedStatusMulti = false;
        atualizarPlaceholderStatusMulti();
    }
}
function atualizarPlaceholderStatusMulti() {
    const checks = Array.from(document.querySelectorAll('.status-multi-check'));
    const todas = checks[0];
    const input = document.getElementById('filter-status');
    const individuais = checks.slice(1);
    const selecionados = individuais.filter(cb => cb.checked).map(cb => cb.parentNode.textContent.trim());
    let ativo = false;

    if (selecionados.length === 0) {
        todas.checked = false;
        input.value = 'Todos';
        ativo = false;
    } else if (selecionados.length === individuais.length) {
        todas.checked = true;
        input.value = 'Todos';
        ativo = false;
    } else {
        todas.checked = false;
        input.value = selecionados.length === 1 ? selecionados[0] : selecionados.join(', ');
        ativo = true;
    }
    const chevron = input.parentNode.querySelector('.chevron-status');
    if (ativo) {
        input.style.border = '2px solid #1e94a3';
        input.style.color = '#1e94a3';
        if (chevron) chevron.style.color = '#1e94a3';
    } else {
        input.style.border = '';
        input.style.color = '';
        if (chevron) chevron.style.color = '#888';
    }

}
document.querySelectorAll('.status-multi-check').forEach(cb => {
    cb.addEventListener('change', function() {
        const checks = Array.from(document.querySelectorAll('.status-multi-check'));
        const todas = checks[0];
        const individuais = checks.slice(1);

        if (cb === todas) {
            // Se clicou em "Todos"
            if (todas.checked) {
                individuais.forEach(c => c.checked = true);
            } else {
                individuais.forEach(c => c.checked = false);
            }
        } else {
            if (individuais.every(c => c.checked)) {
                todas.checked = true;
            } else {
                todas.checked = false;
            }
        }
        atualizarPlaceholderStatusMulti();
        filtrarFuncionarios();
    });
});

document.getElementById('edit-ativo').addEventListener('change', function() {
    document.getElementById('label-ativo').textContent = this.checked ? 'Ativo' : 'Inativo';
    document.getElementById('label-ativo').classList.toggle('ativo', this.checked);
    document.getElementById('label-ativo').classList.toggle('inativo', !this.checked);
});

// --- BUSCA FUNCIONÁRIO (SEM SUGESTÃO) ---
const buscaInput = document.getElementById('busca-funcionario');
buscaInput.addEventListener('input', filtrarFuncionarios);

// --- FILTRAR FUNCIONÁRIOS ---
function filtrarFuncionarios() {
    const termo = buscaInput.value.trim().toLowerCase();
    const cargos = Array.from(document.querySelectorAll('.cargo-multi-check'))
        .slice(1)
        .filter(cb => cb.checked && cb.value)
        .map(cb => cb.value);
    const status = Array.from(document.querySelectorAll('.status-multi-check'))
        .slice(1)
        .filter(cb => cb.checked && cb.value)
        .map(cb => cb.value);

    const filtrados = funcionarios.filter(f =>
        (!termo || f.codigo.toLowerCase().includes(termo) || f.nome.toLowerCase().includes(termo)) &&
        (cargos.length === 0 || cargos.includes(f.cargo)) &&
        (status.length === 0 || status.includes(f.ativo ? 'ATIVO' : 'INATIVO'))
    );
    renderizarFuncionarios(filtrados);
}

// --- LIMPAR FILTROS ---
function limpar() {
    buscaInput.value = '';
    document.querySelectorAll('.cargo-multi-check, .status-multi-check').forEach(cb => cb.checked = false);
    atualizarPlaceholderCargoMulti();
    atualizarPlaceholderStatusMulti();
    filtrarFuncionarios();
}

// --- AO CARREGAR, MOSTRA TODOS OS FUNCIONÁRIOS ---
document.addEventListener('DOMContentLoaded', function() {
    carregarFuncionarios();
});

// Carregar funcionários do backend
function carregarFuncionarios() {
    fetch('/usuarios')
        .then(res => res.json())
        .then(data => {
            funcionarios = data;
            filtrarFuncionarios();
        })
        .catch(() => {
            funcionarios = [];
            filtrarFuncionarios();
        });
}

// Remover funcionário
function removerFuncionario(id) {
    const funcionario = funcionarios.find(f => f.id == id);
    if (!funcionario) {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Funcionário não encontrado',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }
    Swal.fire({
        title: 'Tem certeza?',
        text: 'Esta ação não poderá ser desfeita',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/usuarios/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.ok) {
                        carregarFuncionarios();
                        Swal.fire({
                            title: `Funcionário ${funcionario.nome} removido!`,
                            icon: "success",
                            showConfirmButton: false,
                            timer: 1500,
                            timerProgressBar: true,
                            allowOutsideClick: false
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro!',
                            text: 'Não foi possível remover o funcionário',
                            showConfirmButton: false,
                            timer: 1500,
                            timerProgressBar: true,
                            allowOutsideClick: false
                        });
                    }
                });
        }
    });
}

// Cadastro
function gerarSenhaProvisoria() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let senha = '';
    for (let i = 0; i < 8; i++) {
        senha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('cad-senha').value = senha;
}
function abrirCadastroFuncionario() {
    document.getElementById('cadastro-funcionario').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    gerarSenhaProvisoria();
}
function fecharCadastroFuncionario() {
    document.getElementById('cadastro-funcionario').style.display = 'none';
    document.body.style.overflow = '';
}
function cadastrarFuncionario() {
    const funcionario = {
        codigo: document.getElementById('cad-codigo').value,
        nome: document.getElementById('cad-nome').value,
        cargo: document.getElementById('cad-cargo').value,
        email: document.getElementById('cad-email').value,
        senha: document.getElementById('cad-senha').value,
        cpf: document.getElementById('cad-cpf').value,
        dataNascimento: document.getElementById('cad-nascimento').value,
        telefone: document.getElementById('cad-contato').value,
        ativo: true
    };

    fetch('/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(funcionario)
    })
    .then(res => {
        if (res.ok) {
            Swal.fire({
                title: `Funcionário ${funcionario.nome} cadastrado!`,
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            fecharCadastroFuncionario();
            carregarFuncionarios();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Não foi possível cadastrar o funcionário',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                allowOutsideClick: false
            });
        }
    });
}

// Edição
function abrirEdicaoFuncionario(id) {
    const funcionario = funcionarios.find(f => f.id == id);
    document.getElementById('edit-id').value = funcionario.id;

    document.body.style.overflow = 'hidden';
    aplicarEstiloInputs();

    fetch(`/usuarios/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(funcionario => {
        document.getElementById('edit-codigo').value = funcionario.codigo;
        document.getElementById('edit-nome').value = funcionario.nome;
        document.getElementById('edit-cargo').value = funcionario.cargo;
        document.getElementById('edit-email').value = funcionario.email;
        document.getElementById('edit-senha').value = funcionario.senha;
        document.getElementById('edit-cpf').value = funcionario.cpf;
        document.getElementById('edit-contato').value = funcionario.telefone || '';
        document.getElementById('edit-nascimento').value = funcionario.dataNascimento
            ? funcionario.dataNascimento.substring(0, 10)
            : '';
        document.getElementById('edit-ativo').checked = funcionario.ativo ?? true;
        document.getElementById('label-ativo').textContent = funcionario.ativo ? 'Ativo' : 'Inativo';

        const label = document.getElementById('label-ativo');
        label.classList.toggle('ativo', funcionario.ativo);
        label.classList.toggle('inativo', !funcionario.ativo);

        if (window.atualizarAvatarEdicao) {
            window.atualizarAvatarEdicao();
        }
        document.getElementById('editar-funcionario').style.display = 'flex';
    });
}
function fecharEdicaoFuncionario() {
    document.getElementById('editar-funcionario').style.display = 'none';
    document.body.style.overflow = '';
}
function salvarEdicaoFuncionario() {
    const id = document.getElementById('edit-id').value;
    const funcionarioObj = {
        codigo: document.getElementById('edit-codigo').value,
        nome: document.getElementById('edit-nome').value,
        cargo: document.getElementById('edit-cargo').value,
        email: document.getElementById('edit-email').value,
        senha: document.getElementById('edit-senha').value,
        cpf: document.getElementById('edit-cpf').value,
        dataNascimento: document.getElementById('edit-nascimento').value,
        telefone: document.getElementById('edit-contato').value,
        ativo: document.getElementById('edit-ativo').checked
    };

    Swal.fire({
        title: 'Tem certeza?',
        text: 'As alterações não poderão ser desfeitas',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/usuarios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(funcionarioObj)
            })
            .then(res => {
                if (res.ok) {
                    Swal.fire({
                        title: "Alterações salvas!",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                        timerProgressBar: true,
                        allowOutsideClick: false
                    });
                    carregarFuncionarios();
                    fecharEdicaoFuncionario();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro!',
                        text: 'Não foi possível salvar as alterações.',
                        showConfirmButton: false,
                        timer: 1500,
                        timerProgressBar: true,
                        allowOutsideClick: false
                    });
                }
            });
        }
    });
}

// Botão voltar ao topo
window.addEventListener('scroll', function() {
    const btn = document.getElementById('btn-topo');
    if (btn) btn.style.display = window.scrollY > 100 ? 'block' : 'none';
});
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('btn-topo');
    if (btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

// Clique no input também abre
document.getElementById('filter-cargo').addEventListener('click', showCheckboxesCargoMulti);
document.getElementById('filter-status').addEventListener('click', showCheckboxesStatusMulti);

// Clique fora fecha
document.addEventListener('mousedown', function(e) {
    // Cargo
    var checkboxesCargo = document.getElementById("checkboxes-cargo-multi");
    var overSelectCargo = document.querySelector('.multiselect .overSelect');
    if (
        window.expandedCargoMulti &&
        checkboxesCargo &&
        !checkboxesCargo.contains(e.target) &&
        (!overSelectCargo || !overSelectCargo.contains(e.target))
    ) {
        checkboxesCargo.style.display = "none";
        window.expandedCargoMulti = false;
        atualizarPlaceholderCargoMulti();
    }
    // Status
    var checkboxesStatus = document.getElementById("checkboxes-status-multi");
    var overSelectStatus = document.querySelectorAll('.multiselect .overSelect')[1];
    if (
        window.expandedStatusMulti &&
        checkboxesStatus &&
        !checkboxesStatus.contains(e.target) &&
        (!overSelectStatus || !overSelectStatus.contains(e.target))
    ) {
        checkboxesStatus.style.display = "none";
        window.expandedStatusMulti = false;
        atualizarPlaceholderStatusMulti();
    }
});

// Estilo inputs
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
    const selects = document.querySelectorAll('select, input[type="date"]');
    selects.forEach(select => {
        select.addEventListener('focus', () => {
            select.style.backgroundColor = 'white';
        });
        select.addEventListener('blur', () => {
            if (select.value.trim() === '') {
                select.style.backgroundColor = 'white';
            } else {
                select.style.backgroundColor = '#f1f1f1';
            }
        });
    });
}