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
    const select = document.getElementById('registros-select');
    let totalItens = lista.length;
    let valorSelect = select.value;
    let itensPorPagina = valorSelect === "" ? totalItens : parseInt(valorSelect);

    const totalPaginas = Math.ceil(totalItens / itensPorPagina) || 1;
    if (paginaAtual > totalPaginas) paginaAtual = 1;
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = valorSelect === "" ? totalItens : inicio + itensPorPagina;
    const pagina = lista.slice(inicio, fim);

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
    ${pagina
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
                <a href="javascript:void(0)" onclick="abrirEdicaoFuncionario('${f.id}')" title="Editar" tabindex="${pagina.length + idx + 1}">
                    <i class="fa-solid fa-pen"></i>
                </a>
                <button type="button" onclick="removerFuncionario('${f.id}')" title="Excluir" tabindex="${2 * pagina.length + idx + 1}"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
        `
        )
        .join("")}
    </tbody>
    `;

    renderizarPaginacao(totalPaginas);
}
let paginaAtual = 1;
let itensPorPagina = 10;


// Função para renderizar a paginação
function renderizarPaginacao(totalPaginas) {
    const paginacaoDiv = document.getElementById('paginacao');
    if (!paginacaoDiv) return;
    paginacaoDiv.innerHTML = '';
    if (totalPaginas <= 1) return;
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = (i === paginaAtual) ? 'pagina-ativa' : '';
        btn.onclick = function() {
            paginaAtual = i;
            filtrarFuncionarios();
        };
        paginacaoDiv.appendChild(btn);
    }
}

document.getElementById('registros-select').addEventListener('change', function() {
    paginaAtual = 1;
    filtrarFuncionarios();
});

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
    if (usuarioLogadoId && String(id) === String(usuarioLogadoId)) {
        Swal.fire({
            icon: 'warning',
            title: 'Ação não permitida!',
            text: 'Você não pode remover a si mesmo.',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }

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
        title: `Remover "${funcionario.nome}"?`,
        text: 'Esta ação não poderá ser desfeita',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Remover',
        cancelButtonText: 'Cancelar',
        allowOutsideClick: false,
        customClass: {
            confirmButton: 'swal2-remove-custom',
            cancelButton: 'swal2-cancel-custom'
        }
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
    const nome = document.getElementById('cad-nome').value.trim();
    const senha = document.getElementById('cad-senha').value;
    const dataNascimento = document.getElementById('cad-nascimento').value;
    const cpf = document.getElementById('cad-cpf').value;

    // Validação do nome
    if (!nome) {
        Swal.fire({
            icon: 'warning',
            title: 'Nome inválido!',
            text: 'O nome não pode estar vazio',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }

    if (/\d/.test(nome)) {
        Swal.fire({
            icon: 'warning',
            title: 'Nome inválido!',
            text: 'O nome não pode conter números',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }

    // Validação da senha
    if (!senha || senha.length < 8) {
        Swal.fire({
            icon: 'warning',
            title: 'Senha inválida!',
            text: 'A senha deve ter pelo menos 8 caracteres',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }

    // Validação da data de nascimento
    if (!dataNascimento) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida!',
            text: 'Informe a data de nascimento',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }

    if (!validaCPF(cpf)) {
        Swal.fire({
            icon: 'warning',
            title: 'CPF inválido!',
            text: 'Digite um CPF válido',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }

    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    if (nascimento > hoje) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida!',
            text: 'A data de nascimento não pode ser posterior a hoje',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }
    if (idade < 16) {
        Swal.fire({
            icon: 'warning',
            title: 'Idade inválida!',
            text: 'O funcionário deve ter pelo menos 16 anos',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }

    //monta o objeto e envia
    const funcionario = {
        codigo: document.getElementById('cad-codigo').value,
        nome: nome,
        cargo: document.getElementById('cad-cargo').value,
        email: document.getElementById('cad-email').value,
        senha: senha,
        cpf: cpf,
        dataNascimento: dataNascimento,
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
                title: `Funcionário(a) ${funcionario.nome} cadastrado(a)!`,
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
    const nome = document.getElementById('edit-nome').value.trim();
    const senha = document.getElementById('edit-senha').value;
    const dataNascimento = document.getElementById('edit-nascimento').value;
    const cpf = document.getElementById('edit-cpf').value;

    // Validação do nome
    if (!nome) {
        Swal.fire({
            icon: 'warning',
            title: 'Nome inválido!',
            text: 'O nome não pode estar vazio.',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }

    if (/\d/.test(nome)) {
        Swal.fire({
            icon: 'warning',
            title: 'Nome inválido!',
            text: 'O nome não pode conter números.',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }

    // Validação da senha
    if (senha && senha.length < 8) {
        Swal.fire({
            icon: 'warning',
            title: 'Senha inválida!',
            text: 'A senha deve ter pelo menos 8 caracteres.',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }

    // Validação da data de nascimento
    if (!dataNascimento) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida!',
            text: 'Informe a data de nascimento.',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }

    if (!validaCPF(cpf)) {
        Swal.fire({
            icon: 'warning',
            title: 'CPF inválido!',
            text: 'Digite um CPF válido.',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }

    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    if (nascimento > hoje) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida!',
            text: 'A data de nascimento não pode ser posterior a hoje',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }
    if (idade < 16) {
        Swal.fire({
            icon: 'warning',
            title: 'Idade inválida!',
            text: 'O funcionário deve ter pelo menos 16 anos.',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }

    const funcionarioObj = {
        codigo: document.getElementById('edit-codigo').value,
        nome: nome,
        cargo: document.getElementById('edit-cargo').value,
        email: document.getElementById('edit-email').value,
        senha: senha,
        cpf: cpf,
        dataNascimento: dataNascimento,
        telefone: document.getElementById('edit-contato').value,
        ativo: document.getElementById('edit-ativo').checked
    };

    Swal.fire({
        title: 'Tem certeza?',
        text: 'As alterações não poderão ser desfeitas',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Sim, salvar alterações',
        cancelButtonText: 'Não, voltar',
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
                        text: 'Não foi possível salvar as alterações',
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

//mascara de tel
function aplicarMascaraTelefone(input) {
    input.addEventListener('input', function() {
        let v = input.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 10) {
            input.value = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else if (v.length > 6) {
            input.value = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        } else if (v.length > 2) {
            input.value = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        } else {
            input.value = v.replace(/^(\d*)/, '($1');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const telCad = document.getElementById('cad-contato');
    const telEdit = document.getElementById('edit-contato');
    if (telCad) aplicarMascaraTelefone(telCad);
    if (telEdit) aplicarMascaraTelefone(telEdit);
});


//cpf
function aplicarMascaraCPF(input) {
    input.addEventListener('input', function() {
        let v = input.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 9) {
            input.value = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, '$1.$2.$3-$4');
        } else if (v.length > 6) {
            input.value = v.replace(/^(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
        } else if (v.length > 3) {
            input.value = v.replace(/^(\d{3})(\d{0,3})/, '$1.$2');
        } else {
            input.value = v;
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const cpfCad = document.getElementById('cad-cpf');
    const cpfEdit = document.getElementById('edit-cpf');
    if (cpfCad) aplicarMascaraCPF(cpfCad);
    if (cpfEdit) aplicarMascaraCPF(cpfEdit);
});


function validaCPF(cpf) {
    var Soma = 0
    var Resto

    var strCPF = String(cpf).replace(/[^\d]/g, '')

    if (strCPF.length !== 11)
        return false

    if ([
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999',
    ].indexOf(strCPF) !== -1)
        return false

    for (let i = 1; i <= 9; i++)
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);

    Resto = (Soma * 10) % 11

    if ((Resto == 10) || (Resto == 11))
        Resto = 0

    if (Resto != parseInt(strCPF.substring(9, 10)))
        return false

    Soma = 0

    for (let i = 1; i <= 10; i++)
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i)

    Resto = (Soma * 10) % 11

    if ((Resto == 10) || (Resto == 11))
        Resto = 0

    if (Resto != parseInt(strCPF.substring(10, 11)))
        return false

    return true
}

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