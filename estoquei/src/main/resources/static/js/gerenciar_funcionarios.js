let funcionarios = [];
let funcionariosOriginais = [];

window.expandedCargoMulti = false;
window.expandedStatusMulti = false;

// Utilidades de avatar
function getIniciais(nome) {
    if (!nome || typeof nome !== 'string' || !nome.trim()) return '';
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

function formatarNome(nome) {
    if (!nome) return '';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0];
    return partes[0] + ' ' + partes[partes.length - 1];
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

    //cadastro
    
        // Código
    document.getElementById('cad-codigo').addEventListener('blur', function() {
        const codigo = this.value.trim();
        if (!codigo) return; // Só valida se não está vazio!
        if (codigo.length !== 6) {
            Swal.fire({
                icon: 'warning',
                title: 'Código inválido!',
                text: 'Informe um código de 6 dígitos',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            this.focus();
            return;
        }
        if (funcionarios.some(f => f.codigo === codigo)) {
            Swal.fire({
                icon: 'warning',
                title: 'Código já cadastrado!',
                text: 'Informe outro código',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            this.value = '';
            this.focus();
        }
    });
    
    // Cargo
    document.getElementById('cad-cargo').addEventListener('blur', function() {
        if (!this.value) return; // Só valida se tentou preencher
        // (Se quiser, pode nem validar no blur, só no botão)
    });
    
    // Nome
    document.getElementById('cad-nome').addEventListener('blur', function() {
        const nome = this.value.trim();
        if (!nome) return;
        if (nome.length < 3) {
            Swal.fire({
                icon: 'warning',
                title: 'Nome inválido!',
                text: 'O nome deve ter pelo menos 3 letras',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            this.focus();
            return;
        }
        if (/\d/.test(nome)) {
            Swal.fire({
                icon: 'warning',
                title: 'Nome inválido!',
                text: 'O nome não pode conter números',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            this.focus();
            return;
        }
        if (/[^a-zA-ZÀ-ÿ\s]/.test(nome)) {
            Swal.fire({
                icon: 'warning',
                title: 'Nome inválido!',
                text: 'O nome não pode conter símbolos',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            this.focus();
        }
    });
    
    // Email
    document.getElementById('cad-email').addEventListener('blur', function() {
        const email = this.value.trim();
        if (!email) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Swal.fire({
                icon: 'warning',
                title: 'Email inválido!',
                text: 'Informe um email válido',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            this.focus();
            return;
        }
        if (funcionarios.some(f => f.email.toLowerCase() === email.toLowerCase())) {
            Swal.fire({
                icon: 'warning',
                title: 'Email já cadastrado!',
                text: 'Informe outro email',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            this.value = '';
            this.focus();
        }
    });   

    // CPF
    document.getElementById('cad-cpf').addEventListener('blur', function() {
        const cpf = this.value.replace(/\D/g, '');
        if (!cpf) return;
        if (!validaCPF(cpf)) {
            Swal.fire({
                icon: 'warning',
                title: 'CPF inválido!',
                text: 'Digite um CPF válido.',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            this.focus();
            return;
        }
        if (funcionarios.some(f => f.cpf && f.cpf.replace(/\D/g, '') === cpf)) {
            Swal.fire({
                icon: 'warning',
                title: 'CPF já cadastrado!',
                text: 'Informe outro CPF.',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            this.value = '';
            this.focus();
        }
    });

    // Data de nascimento
    document.getElementById('cad-nascimento').addEventListener('blur', function() {
        const nascimento = this.value;
        if (!nascimento) return;
        const hoje = new Date();
        const nasc = new Date(nascimento);
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
        if (nasc > hoje) {
            Swal.fire({
                icon: 'warning',
                title: 'Data inválida!',
                text: 'A data de nascimento não pode ser posterior a hoje',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            this.focus();
            return;
        }
        if (idade < 16) {
            Swal.fire({
                icon: 'warning',
                title: 'Idade inválida!',
                text: 'O funcionário deve ter pelo menos 16 anos',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            this.focus();
            return;
        }
        if (idade > 99) {
            Swal.fire({
                icon: 'warning',
                title: 'Idade inválida!',
                text: 'O funcionário não pode ter mais de 99 anos',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            this.focus();
        }
    });

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

    const tbody = document.getElementById('func-list');
    const thead = tbody.parentNode.querySelector('thead');
    const registrosPagina = document.getElementById('registros-pagina');

    if (pagina.length === 0) {
        if (thead) thead.style.display = 'none';
        if (registrosPagina) registrosPagina.style.display = 'none';

        if (funcionariosOriginais.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px 0; background-color: white">
                        <div style="display: flex; flex-direction: column; align-items: center; font-size: 20px; color: #888;">
                            <span style="font-weight:bold;">Nenhum funcionário cadastrado</span>
                            <span>Cadastre o primeiro funcionário</span>
                            <img src="/images/sem_funcionarios.png" alt="Sem funcionários" style="width:400px;">
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px 0; background-color: white">
                        <div style="display: flex; flex-direction: column; align-items: center; font-size: 20px; color: #888;">
                            <span style="font-weight:bold;">Nenhum funcionário encontrado</span>
                            <span>Selecione outros filtros</span>
                            <img src="/images/sem_funcionarios.png" alt="Nenhum funcionário encontrado" style="width:400px;">
                        </div>
                    </td>
                </tr>
            `;
        }
        document.getElementById('paginacao').innerHTML = '';
        return;
    } else {
        if (thead) thead.style.display = '';
        if (registrosPagina) registrosPagina.style.display = '';
    }

    tbody.innerHTML = pagina
        .filter(f => f.tipo !== "ADMIN")
        .map(
            (f, idx) => `
            <tr tabindex="${idx + 1}">
                <td style="padding-left: 20px">
                    <div style="
                        width:30px;height:30px;
                        border-radius:50%;
                        background:${corAvatar(f.nome)};
                        display:flex;align-items:center;justify-content:center;
                        font-weight:bold;font-size:12px;
                        color: rgba(0,0,0,0.65);
                        cursor:pointer;"
                        onclick="abrirDetalhesFuncionario('${f.id}')"
                        title="Ver detalhes"
                    >
                        ${getIniciais(f.nome)}
                    </div>
                </td>
                <td style="position: relative;">
                    ${f.codigo}
                    ${
                        (!f.cpf || f.cpf.length < 11 || !f.telefone || f.telefone.length < 10 || !f.dataNascimento)
                        ? `
                        <span
                            title="Dados incompletos"
                            onclick="abrirEdicaoFuncionario('${f.id}')"
                            style="
                                border-radius: 7px;
                                position: absolute;
                                top: 50%;
                                right: 0px;
                                transform: translateY(-50%);
                                width: 7px;
                                height: 8px;
                                text-decoration: none;
                                display: flex;
                                background: black;
                                align-items: center;
                                justify-content: center;
                                pointer-events: auto;
                                cursor: pointer;
                                padding-right: 0px;
                                padding-left: 0px;
                            ">
                            <i class="fa-solid fa-triangle-exclamation"
                                style="color: #ffc107; font-size: 14px; vertical-align: middle; z-index: 3;"></i>
                        </span>
                        `
                        : ''
                    }
                </td>
                <td>${formatarNome(f.nome)}</td>
                <td>${f.cargo.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase())}
                </td>
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
                    <a href="#" onclick="abrirDetalhesFuncionario('${f.id}')" title="Detalhes">
                        <i class="fa-solid fa-eye""></i>
                    </a>
                    <a href="#" onclick="abrirEdicaoFuncionario('${f.id}')" title="Editar" tabindex="${pagina.length + idx + 1}">
                        <i class="fa-solid fa-pen"></i>
                    </a>
                    <button type="button" onclick="removerFuncionario('${f.id}')" title="Excluir" tabindex="${2 * pagina.length + idx + 1}"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
            `
        )
        .join("");

    renderizarPaginacao(totalPaginas);
    atualizarSetasOrdenacao();
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
    var overSelect = document.querySelector('#filter-cargo').parentNode.querySelector('.overSelect');
    if (!window.expandedCargoMulti) {
        checkboxes.style.display = "block";
        window.expandedCargoMulti = true;
        if (overSelect) overSelect.style.position = "static";
    } else {
        checkboxes.style.display = "none";
        window.expandedCargoMulti = false;
        if (overSelect) overSelect.style.position = "absolute";
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
    var overSelect = document.querySelector('#filter-status').parentNode.querySelector('.overSelect');
    if (!window.expandedStatusMulti) {
        checkboxes.style.display = "block";
        window.expandedStatusMulti = true;
        if (overSelect) overSelect.style.position = "static";
    } else {
        checkboxes.style.display = "none";
        window.expandedStatusMulti = false;
        if (overSelect) overSelect.style.position = "absolute";
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

const buscaInput = document.getElementById('busca-funcionario');
buscaInput.addEventListener('input', filtrarFuncionarios);

function filtrarFuncionarios() {
    const termo = buscaInput.value.trim();
    const cargos = Array.from(document.querySelectorAll('.cargo-multi-check'))
        .slice(1)
        .filter(cb => cb.checked && cb.value)
        .map(cb => cb.value);
    const status = Array.from(document.querySelectorAll('.status-multi-check'))
        .slice(1)
        .filter(cb => cb.checked && cb.value)
        .map(cb => cb.value);

    const filtro = {};
    if (termo) {
        filtro.nome = termo;
        filtro.codigo = termo;
    }
    if (cargos.length === 1) {
        filtro.cargo = cargos[0];
    }

    fetch('/usuarios/filtrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filtro)
    })
    .then(res => res.json())
    .then(data => {
        funcionarios = data;
        let filtrados = funcionarios;

        if (status.length === 1) {
            filtrados = funcionarios.filter(f => status[0] === "ATIVO" ? f.ativo : !f.ativo);
        }

        // Ordenacao
        const campo = campoOrdenacao[indiceOrdenacaoAtual];
        filtrados = filtrados.slice().sort((a, b) => {
            let valA = a[campo], valB = b[campo];
            if (campo === 'ativo') {
                valA = a.ativo ? 1 : 0;
                valB = b.ativo ? 1 : 0;
            }
            if (estadoOrdenacao[indiceOrdenacaoAtual]) {
                return valB > valA ? 1 : valB < valA ? -1 : 0;
            } else {
                return valA > valB ? 1 : valA < valB ? -1 : 0;
            }
        });

        renderizarFuncionarios(filtrados);
    });
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
    filtrarFuncionarios();
});

// Carregar funcionários do backend
function carregarFuncionarios() {
    fetch('/usuarios')
        .then(res => res.json())
        .then(data => {
            funcionarios = data;
            funcionariosOriginais = [...data];
            filtrarFuncionarios();
        })
        .catch(() => {
            funcionarios = [];
            funcionariosOriginais = [];
            filtrarFuncionarios();
        });
}

// Remover funcionário
function removerFuncionario(id) {
    fecharDetalhesFuncionario();
    if (usuarioLogadoId && String(id) === String(usuarioLogadoId)) {
        Swal.fire({
            icon: 'warning',
            title: 'Ação não permitida!',
            text: 'Você não pode remover a si mesmo',
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
        icon: 'warning',
        title: `Esta ação é irreversível!`,
        html: 'Para confirmar, digite <b>EXCLUIR</b> abaixo:',
        input: 'text',
        inputPlaceholder: 'EXCLUIR',
        inputValidator: (value) => {
            if (value !== 'EXCLUIR') return 'Digite exatamente: EXCLUIR';
        },
        showCloseButton: true,
        showConfirmButton: true,
        allowOutsideClick: false,
        customClass: {
            confirmButton: 'swal2-custom'
        },
        didOpen: () => {
            const input = Swal.getInput();
            if (input) {
                input.style.fontSize = '12px';
                input.style.margin = '10px 20px';
                input.style.border = 'solid 1px #aaa';
                input.style.borderRadius = '4px';
                input.style.background = '#fff';
            }

            const btn = Swal.getConfirmButton();
            if (btn) {
                btn.style.maxWidth = '80px';
            }
        }
    }).then((res) => {
        if (res.isConfirmed) {
            Swal.fire({
                title: `Excluindo "${funcionario.nome}"...`,
                text: 'Aguarde enquanto o funcionário é excluído',
                icon: 'info',
                showConfirmButton: false,
                allowOutsideClick: false,
                timer: 1500,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                    fetch(`/usuarios/${id}`, { method: 'DELETE' })
                        .then(response => {
                            if (response.ok) {
                                setTimeout(() => location.reload(), 1200);
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Erro!',
                                    text: 'Não foi possível excluir o funcionário',
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

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById('icon-' + inputId);
    if (!input || !icon) return;
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        input.type = "password";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}

function limparFormularioCadastroFuncionario() {
    document.getElementById('cad-codigo').value = '';
    document.getElementById('cad-nome').value = '';
    const cargo = document.getElementById('cad-cargo');
    if (cargo) cargo.selectedIndex = 0;    document.getElementById('cad-email').value = '';
    document.getElementById('cad-senha').value = '';
    document.getElementById('cad-cpf').value = '';
    document.getElementById('cad-nascimento').value = '';
    document.getElementById('cad-contato').value = '';
    if (window.atualizarAvatarCadastro) window.atualizarAvatarCadastro();
    aplicarEstiloInputs && aplicarEstiloInputs();
}

function abrirCadastroFuncionario() {
    limparFormularioCadastroFuncionario();
    document.getElementById('cadastro-funcionario').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    gerarSenhaProvisoria();
    mostrarEtapaCadastro(1);

    const telCad = document.getElementById('cad-contato');
    const cpfCad = document.getElementById('cad-cpf');
    if (telCad) mascaraTelefone(telCad);
    if (cpfCad) mascaraCPF(cpfCad);
}

function cadastroFuncionarioPreenchido() {
    const cargo = document.getElementById('cad-cargo');
    const codigo = document.getElementById('cad-codigo').value.trim();
    const nome = document.getElementById('cad-nome').value.trim();
    const email = document.getElementById('cad-email').value.trim();
    const cpf = document.getElementById('cad-cpf').value.replace(/\D/g, '');
    const nascimento = document.getElementById('cad-nascimento').value.trim();
    const contato = document.getElementById('cad-contato').value.replace(/\D/g, '');

    return (
        codigo ||
        nome ||
        (cargo && cargo.value && cargo.selectedIndex !== 0 && cargo.value !== '') ||
        email ||
        (cpf && cpf.length >= 11) ||
        nascimento ||
        (contato && contato.length >= 10)
    );
}

function fecharCadastroFuncionario() {

    document.activeElement && document.activeElement.blur();

    setTimeout(() => {
        if (cadastroFuncionarioPreenchido()) {
            Swal.fire({
                icon: 'warning',
                title: 'Tem certeza?',
                text: 'As informações preenchidas serão descartadas',
                showCancelButton: true,
                confirmButtonText: 'Sim, descartar',
                cancelButtonText: 'Não, voltar',
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    limparFormularioCadastroFuncionario();
                    document.getElementById('cadastro-funcionario').style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        } else {
            limparFormularioCadastroFuncionario();
            document.getElementById('cadastro-funcionario').style.display = 'none';
            document.body.style.overflow = '';
        }
    }, 50);
}

function cadastrarFuncionario() {
    const codigo = document.getElementById('cad-codigo').value;
    const nome = document.getElementById('cad-nome').value.trim();
    const email = document.getElementById('cad-email').value.trim();
    const senha = document.getElementById('cad-senha').value;
    const dataNascimento = document.getElementById('cad-nascimento').value;
    const cpf = document.getElementById('cad-cpf').value;


    //monta o objeto e envia
    const funcionario = {
        codigo: codigo,
        nome: nome,
        cargo: document.getElementById('cad-cargo').value,
        email: email,
        senha: senha,
        cpf: document.getElementById('cad-cpf').value.replace(/\D/g, '') || null,
        dataNascimento: dataNascimento || null,
        telefone: document.getElementById('cad-contato').value.replace(/\D/g, '') || null,
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
                text: `Funcionário(a) ${funcionario.nome} cadastrado(a)!`,
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                allowOutsideClick: false
            });
                limparFormularioCadastroFuncionario();
                document.getElementById('cadastro-funcionario').style.display = 'none';
                document.body.style.overflow = '';
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
        
        const telEdit = document.getElementById('edit-contato');
        const cpfEdit = document.getElementById('edit-cpf');
        if (telEdit && !telEdit._mascaraAplicada) {
            mascaraTelefone(telEdit);
            telEdit._mascaraAplicada = true;
        }
        if (cpfEdit && !cpfEdit._mascaraAplicada) {
            mascaraCPF(cpfEdit);
            cpfEdit._mascaraAplicada = true;
        }
    });
}

// Edição
function abrirEdicaoFuncionario(id) {
    fecharDetalhesFuncionario();
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
        
        const telEdit = document.getElementById('edit-contato');
        const cpfEdit = document.getElementById('edit-cpf');
        if (telEdit) mascaraTelefone(telEdit);
        if (cpfEdit) mascaraCPF(cpfEdit);
    });

    window.dadosOriginaisEdicaoFuncionario = {
        codigo: funcionario.codigo || '',
        nome: funcionario.nome || '',
        cargo: funcionario.cargo || '',
        email: funcionario.email || '',
        senha: funcionario.senha || '',
        cpf: funcionario.cpf || '',
        dataNascimento: funcionario.dataNascimento ? funcionario.dataNascimento.substring(0, 10) : '',
        telefone: funcionario.telefone || '',
        ativo: funcionario.ativo ?? true
    };
}

function fecharEdicaoFuncionario() {
    const orig = window.dadosOriginaisEdicaoFuncionario || {};
    const codigo = document.getElementById('edit-codigo').value.trim();
    const nome = document.getElementById('edit-nome').value.trim();
    const cargo = document.getElementById('edit-cargo').value;
    const email = document.getElementById('edit-email').value.trim();
    const senha = document.getElementById('edit-senha').value;
    const cpf = document.getElementById('edit-cpf').value.replace(/\D/g, '');
    const dataNascimento = document.getElementById('edit-nascimento').value;
    const telefone = document.getElementById('edit-contato').value.replace(/\D/g, '');
    const ativo = document.getElementById('edit-ativo').checked;

    const houveMudanca =
        codigo !== (orig.codigo || '') ||
        nome !== (orig.nome || '') ||
        cargo !== (orig.cargo || '') ||
        email !== (orig.email || '') ||
        senha !== (orig.senha || '') ||
        cpf !== (orig.cpf || '') ||
        dataNascimento !== (orig.dataNascimento || '') ||
        telefone !== (orig.telefone || '') ||
        ativo !== (orig.ativo);

    if (houveMudanca) {
        Swal.fire({
            icon: 'warning',
            title: 'Descartar alterações?',
            text: 'Você fez alterações não salvas. Deseja sair mesmo assim?',
            showCancelButton: true,
            confirmButtonText: 'Sim, descartar',
            cancelButtonText: 'Não, voltar',
            allowOutsideClick: false,
            customClass: {
                confirmButton: 'swal2-cancel-custom'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                document.getElementById('editar-funcionario').style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    } else {
        document.getElementById('editar-funcionario').style.display = 'none';
        document.body.style.overflow = '';
    }
}


function salvarEdicaoFuncionario() {
    const id = document.getElementById('edit-id').value;
    const codigo = document.getElementById('edit-codigo').value.trim();
    const nome = document.getElementById('edit-nome').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const senha = document.getElementById('edit-senha').value;
    const dataNascimento = document.getElementById('edit-nascimento').value;
    const cpf = document.getElementById('edit-cpf').value;
    const contato = document.getElementById('edit-contato').value.replace(/\D/g, '');
    const cargo = document.getElementById('edit-cargo').value;

    // --- CÓDIGO ---
    if (!codigo) {
        Swal.fire({
            icon: 'warning',
            title: 'Código obrigatório!',
            text: 'Informe o código do funcionário',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }
    if (codigo.length !== 6) {
        Swal.fire({
            icon: 'warning',
            title: 'Código inválido!',
            text: 'O código deve ter 6 dígitos',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }
    if (funcionarios.some(f => f.codigo === codigo && String(f.id) !== String(id))) {
        Swal.fire({
            icon: 'warning',
            title: 'Código já cadastrado!',
            text: 'Escolha outro código',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }

    // --- CARGO ---
    if (!cargo) {
        Swal.fire({
            icon: 'warning',
            title: 'Cargo obrigatório!',
            text: 'Selecione o cargo do funcionário',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }

    // --- NOME ---
    if (!nome) {
        Swal.fire({
            icon: 'warning',
            title: 'Nome obrigatório!',
            text: 'O nome não pode estar vazio',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }
    if (nome.length < 3) {
        Swal.fire({
            icon: 'warning',
            title: 'Nome inválido!',
            text: 'O nome deve ter pelo menos 3 letras',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
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
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }
    if (/[^a-zA-ZÀ-ÿ\s]/.test(nome)) {
        Swal.fire({
            icon: 'warning',
            title: 'Nome inválido!',
            text: 'O nome não pode conter símbolos',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }

    // --- EMAIL ---
    if (!email) {
        Swal.fire({
            icon: 'warning',
            title: 'Email obrigatório!',
            text: 'Informe o email do funcionário',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Swal.fire({
            icon: 'warning',
            title: 'Email inválido!',
            text: 'Informe um email válido',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }
    if (funcionarios.some(f => f.email.toLowerCase() === email.toLowerCase() && String(f.id) !== String(id))) {
        Swal.fire({
            icon: 'warning',
            title: 'Email já cadastrado!',
            text: 'Escolha outro email',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }

    // --- SENHA ---
    if (senha && senha.length < 8) {
        Swal.fire({
            icon: 'warning',
            title: 'Senha inválida!',
            text: 'A senha deve ter pelo menos 8 caracteres',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }

    // --- CPF (opcional) ---
    if (cpf) {
        if (!validaCPF(cpf)) {
            Swal.fire({
                icon: 'warning',
                title: 'CPF inválido!',
                text: 'Digite um CPF válido',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            return;
        }
        if (funcionarios.some(f => f.cpf && f.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, '') && String(f.id) !== String(id))) {
            Swal.fire({
                icon: 'warning',
                title: 'CPF já cadastrado!',
                text: 'Escolha outro CPF',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            return;
        }
    }

    // --- DATA DE NASCIMENTO (opcional) ---
    if (dataNascimento) {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const m = hoje.getMonth() - nascimento.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
        if (nascimento > hoje) {
            Swal.fire({
                icon: 'warning',
                title: 'Data inválida!',
                text: 'A data de nascimento não pode ser posterior a hoje',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
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
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            return;
        }
        if (idade > 99) {
            Swal.fire({
                icon: 'warning',
                title: 'Idade inválida!',
                text: 'O funcionário não pode ter mais de 99 anos',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
                allowOutsideClick: false
            });
            return;
        }
    }

    // --- TELEFONE (opcional) ---
    if (contato && contato.length < 10) {
        Swal.fire({
            icon: 'warning',
            title: 'Telefone inválido!',
            text: 'Informe um telefone válido (mínimo 10 dígitos)',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
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
        cpf: document.getElementById('edit-cpf').value.replace(/\D/g, ''),
        dataNascimento: dataNascimento,
        telefone: document.getElementById('edit-contato').value.replace(/\D/g, ''),
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
                    document.getElementById('editar-funcionario').style.display = 'none';
                    document.body.style.overflow = '';
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

document.addEventListener('mousedown', function(e) {
    // Cargo
    var checkboxesCargo = document.getElementById("checkboxes-cargo-multi");
    var overSelectCargo = document.querySelector('#filter-cargo').parentNode.querySelector('.overSelect');
    if (
        window.expandedCargoMulti &&
        checkboxesCargo &&
        !checkboxesCargo.contains(e.target) &&
        (!overSelectCargo || !overSelectCargo.contains(e.target))
    ) {
        checkboxesCargo.style.display = "none";
        window.expandedCargoMulti = false;
        if (overSelectCargo) overSelectCargo.style.position = "absolute";
    }
    // Status
    var checkboxesStatus = document.getElementById("checkboxes-status-multi");
    var overSelectStatus = document.querySelector('#filter-status').parentNode.querySelector('.overSelect');
    if (
        window.expandedStatusMulti &&
        checkboxesStatus &&
        !checkboxesStatus.contains(e.target) &&
        (!overSelectStatus || !overSelectStatus.contains(e.target))
    ) {
        checkboxesStatus.style.display = "none";
        window.expandedStatusMulti = false;
        if (overSelectStatus) overSelectStatus.style.position = "absolute";
    }
});

//ORDENACAO
let estadoOrdenacao = [true, true, true, true, true];
let campoOrdenacao = ['codigo', 'nome', 'cargo', 'email', 'ativo'];
let indiceOrdenacaoAtual = 0;

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('th.ordenar').forEach((th, idx) => {
        th.style.cursor = 'pointer';
        th.onclick = function() {
            if (indiceOrdenacaoAtual === idx) {
                estadoOrdenacao[idx] = !estadoOrdenacao[idx];
            } else {
                indiceOrdenacaoAtual = idx;
            }
            filtrarFuncionarios();
            atualizarSetasOrdenacao();
        };
    });
    atualizarSetasOrdenacao();
});

function atualizarSetasOrdenacao() {
    document.querySelectorAll('th.ordenar').forEach((th, idx) => {
        const icon = th.querySelector('.sort-icon');
        if (indiceOrdenacaoAtual === idx) {
            th.classList.add('sorted');
            if (icon) {
                icon.innerHTML = estadoOrdenacao[idx]
                    ? '<i class="fa-solid fa-arrow-down"></i>'
                    : '<i class="fa-solid fa-arrow-up"></i>';
            }
        } else {
            th.classList.remove('sorted');
            if (icon) {
                icon.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
            }
        }
    });
}


//mascara codigo
function aplicarMascaraCodigo(input) {
    input.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 6);
    });
}
document.addEventListener('DOMContentLoaded', function() {
    const cadCodigo = document.getElementById('cad-codigo');
    const editCodigo = document.getElementById('edit-codigo');
    if (cadCodigo) aplicarMascaraCodigo(cadCodigo);
    if (editCodigo) aplicarMascaraCodigo(editCodigo);
});

function mascaraTelefone(input) {
    function formatarTel(v) {
        v = v.replace(/\D/g, '').slice(0, 11);
        let mask = '(__) _____-____';
        let chars = v.split('');
        let out = '';
        let charIndex = 0;
        for (let i = 0; i < mask.length; i++) {
            if (mask[i] === '_') {
                out += charIndex < chars.length ? chars[charIndex++] : '_';
            } else {
                out += mask[i];
            }
        }
        return out;
    }

    function setCaret(pos) {
        if (pos < 2) pos = 2;
        setTimeout(() => input.setSelectionRange(pos, pos), 0);
    }

    input.addEventListener('input', function(e) {
        let raw = input.value.replace(/\D/g, '').slice(0, 11);
        let caret = input.selectionStart;

        // Atualiza valor
        input.value = formatarTel(raw);

        // Sempre coloca o cursor ANTES do próximo "_"
        let nextUnderscore = input.value.indexOf('_');
        if (nextUnderscore === -1) nextUnderscore = input.value.length;

        // Corrige para apagar corretamente ao ficar preso em caractere especial
        if (e.inputType === 'deleteContentBackward') {
            // Se o cursor está em um caractere especial, volta até o próximo dígito
            while (nextUnderscore > 2 && /[^\d_]/.test(input.value[nextUnderscore - 1])) {
                nextUnderscore--;
            }
        }

        setCaret(nextUnderscore);
    });

    // Impede o usuário de clicar antes do parêntese
    input.addEventListener('click', function() {
        let pos = input.selectionStart;
        if (pos < 2) setCaret(2);
    });
    input.addEventListener('keydown', function(e) {
        if ((e.key === "ArrowLeft" || e.key === "Home") && input.selectionStart <= 2) {
            setCaret(2);
            e.preventDefault();
        }
    });

    // Aplica ao carregar
    input.value = formatarTel(input.value.replace(/\D/g, ''));
    let pos = input.value.indexOf('_');
    if (pos < 2) pos = 2;
    setCaret(pos);
}


//CPF
function mascaraCPF(input) {
    function formatarCPF(v) {
        v = v.replace(/\D/g, '').slice(0, 11);
        let mask = '___.___.___-__';
        let chars = v.split('');
        let out = '';
        let charIndex = 0;
        for (let i = 0; i < mask.length; i++) {
            if (mask[i] === '_') {
                out += charIndex < chars.length ? chars[charIndex++] : '_';
            } else {
                out += mask[i];
            }
        }
        return v.length === 0 ? '' : out;
    }

    function setCaret(pos) {
        setTimeout(() => input.setSelectionRange(pos, pos), 0);
    }

    input.addEventListener('input', function(e) {
        let old = input.value;
        let caret = input.selectionStart;
        let raw = old.replace(/\D/g, '').slice(0, 11);

        input.value = formatarCPF(raw);

        let newCaret = caret;
        if (e.inputType === 'deleteContentBackward') {
            while (newCaret > 0 && /[^\d_]/.test(input.value[newCaret - 1])) newCaret--;
        } else if (e.inputType === 'insertText') {
            while (newCaret < input.value.length && /[^\d_]/.test(input.value[newCaret])) newCaret++;
        }
        setCaret(newCaret);
    });

    input.value = formatarCPF(input.value.replace(/\D/g, ''));
    let pos = input.value.indexOf('_');
    if (pos === -1) pos = input.value.length;
    setCaret(pos);
}

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


function formatarTelefoneExibicao(telefone) {
    if (!telefone) return 'Não informado';
    let v = telefone.replace(/\D/g, '');
    if (v.length === 11) {
        return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    } else if (v.length === 10) {
        return `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
    }
    return telefone;
}

function abrirDetalhesFuncionario(id) {
    window.detalhesFuncionarioId = id;
    const funcionario = funcionarios.find(f => String(f.id) === String(id));
    if (!funcionario) return;

    // Avatar
    const avatarDiv = document.getElementById('detalhes-avatar-func');
    const iniciaisSpan = document.getElementById('detalhes-avatar-iniciais');
    if (avatarDiv && iniciaisSpan) {
        avatarDiv.style.background = corAvatar(funcionario.nome);
        const partes = funcionario.nome.trim().split(/\s+/);
        let iniciais = partes.length === 1
            ? partes[0][0].toUpperCase()
            : (partes[0][0] + partes[partes.length-1][0]).toUpperCase();
        iniciaisSpan.textContent = iniciais;
    }

    // Código
    document.getElementById('detalhes-codigo').textContent = "Cód: " + (funcionario.codigo || "-");

    // Nome e cargo
    document.getElementById('detalhes-nome').textContent = funcionario.nome || '';

    // Ativo/Inativo
    const statusDiv = document.getElementById('detalhes-status');
    if (funcionario.ativo) {
        statusDiv.innerHTML = '<span style="display:inline-block; padding:4px 12px; border-radius:12px; font-size:12px; color:#fff; background:#43b04a;">Ativo</span>';
    } else {
        statusDiv.innerHTML = '<span style="display:inline-block; padding:4px 12px; border-radius:12px; font-size:12px; color:#fff; background:#888;">Inativo</span>';
    }
    
    // Cargo + idade na mesma linha
    const cargoIdadeDiv = document.getElementById('detalhes-cargo-idade');
    let cargo = funcionario.cargo
        ? funcionario.cargo.charAt(0) + funcionario.cargo.slice(1).toLowerCase()
        : '';
    let idadeStr = '';
    if (funcionario.dataNascimento) {
        const nasc = new Date(funcionario.dataNascimento);
        const hoje = new Date();
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
            idade--;
        }
        idadeStr = `, ${idade} anos`;
    }
    cargoIdadeDiv.textContent = cargo + idadeStr;
    
    // Email (link mailto)
    const emailEl = document.getElementById('detalhes-email');
    emailEl.textContent = funcionario.email || '';
    emailEl.href = funcionario.email ? `mailto:${funcionario.email}` : '#';

    // Telefone
    const detalhesTelefoneEl = document.getElementById('detalhes-telefone');
    const telefoneFormatado = formatarTelefoneExibicao(funcionario.telefone || '');
    detalhesTelefoneEl.textContent = telefoneFormatado;
    if (!funcionario.telefone) {
        detalhesTelefoneEl.style.color = '#757575';
    } else {
        detalhesTelefoneEl.style.color = '';
    }
    
    // Exibe o modal
    document.getElementById('detalhes-funcionario-popup').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function fecharDetalhesFuncionario() {
    document.getElementById('detalhes-funcionario-popup').style.display = 'none';
    document.body.style.overflow = '';
}


let etapaCadastroAtual = 1;

function mostrarEtapaCadastro(etapa) {
    document.querySelectorAll('.etapa-cadastro').forEach(div => {
        div.style.display = div.getAttribute('data-etapa') == etapa ? 'block' : 'none';
    });
    // const titulo = document.getElementById('cadastro-etapa-titulo');
    // if (titulo) {
    //     if (etapa == 1) titulo.textContent = 'Cadastrar Funcionário (1/3)';
    //     else if (etapa == 2) titulo.textContent = 'Informações Pessoais (2/3)';
    //     else if (etapa == 3) titulo.textContent = 'Revisar Informações (3/3)';
    // }
}


function atualizarAvatarCadastro() {
    const nome = document.getElementById('cad-nome').value || '';
    const iniciais = getIniciais(nome);

    [
        {div: 'cad-avatar-1', span: 'cad-avatar-iniciais-1'},
        {div: 'cad-avatar-2', span: 'cad-avatar-iniciais-2'},
        {div: 'cad-avatar-3', span: 'cad-avatar-iniciais-3'}
    ].forEach(({div, span}) => {
        const avatarDiv = document.getElementById(div);
        const spanEl = document.getElementById(span);
        const icon = avatarDiv ? avatarDiv.querySelector('i.fa-user') : null;
        if (avatarDiv && spanEl) {
            if (nome.length > 0) {
                spanEl.textContent = iniciais;
                avatarDiv.style.background = corAvatar(nome);
                if (icon) icon.style.display = 'none';
            } else {
                spanEl.textContent = '';
                avatarDiv.style.background = '#f1f1f1';
                if (icon) icon.style.display = '';
            }
        }
    });
}

document.getElementById('cad-nome').addEventListener('input', atualizarAvatarCadastro);

document.getElementById('btn-proximo-1').onclick = function() {
    const codigo = document.getElementById('cad-codigo').value.trim();
    const cargo = document.getElementById('cad-cargo').value;
    const nome = document.getElementById('cad-nome').value.trim();
    const email = document.getElementById('cad-email').value.trim();
    const senha = document.getElementById('cad-senha').value;

    if (!codigo || !cargo || !nome || !email) {
        let campo;
        if (!codigo) campo = 'Código';
        else if (!cargo) campo = 'Cargo';
        else if (!nome) campo = 'Nome';
        else campo = 'Email';
        Swal.fire({
            icon: 'warning',
            title: `${campo} obrigatório!`,
            text: `Preencha o ${campo.toLowerCase()}`,
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }

    // Preenche etapa 2
    document.getElementById('cad-codigo-2').value = codigo;
    document.getElementById('cad-cargo-2').value = document.getElementById('cad-cargo').options[document.getElementById('cad-cargo').selectedIndex].text;
    mostrarEtapaCadastro(2);
    atualizarAvatarCadastro();
};

document.getElementById('btn-voltar-2').onclick = function() {
    mostrarEtapaCadastro(1);
    atualizarAvatarCadastro();
};


document.getElementById('btn-proximo-2').onclick = function() {
    // Validação dos campos da etapa 2
    const cpf = document.getElementById('cad-cpf').value;
    const nascimento = document.getElementById('cad-nascimento').value;
    const contato = document.getElementById('cad-contato').value;

    if (cpf && !validaCPF(cpf)) {
        Swal.fire({
            icon: 'warning',
            title: 'CPF inválido!',
            text: 'Digite novamente o CPF',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return;
    }

    // Idade
    const hoje = new Date();
    const nasc = new Date(nascimento);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    if (nasc && nasc > hoje) {
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
    if (idade && idade < 16) {
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
    if (idade && idade > 99) {
        Swal.fire({
            icon: 'warning',
            title: 'Idade inválida!',
            text: 'O funcionário não pode ter mais de 99 anos',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }
    const contatoNumeros = contato.replace(/\D/g, '');  
    if (contatoNumeros && contatoNumeros.length < 10) {
        Swal.fire({
            icon: 'warning',
            title: 'Telefone inválido!',
            text: 'Informe um telefone válido',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return;
    }
    // Validação de CPF duplicado
    if (cpf && funcionarios.some(f => f.cpf && f.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, ''))) {
        Swal.fire({
            icon: 'warning',
            title: 'CPF já cadastrado!',
            text: 'Informe outro CPF',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true
        });
        return;
    }

    // Preenche etapa 3
    document.getElementById('cad-codigo-3').value = document.getElementById('cad-codigo').value;
    document.getElementById('cad-cargo-3').value = document.getElementById('cad-cargo').options[document.getElementById('cad-cargo').selectedIndex].text;
    document.getElementById('cad-nome-3').value = document.getElementById('cad-nome').value;
    document.getElementById('cad-email-3').value = document.getElementById('cad-email').value;
    document.getElementById('cad-senha-3').value = document.getElementById('cad-senha').value;
    document.getElementById('cad-cpf-3').value = cpf;
    document.getElementById('cad-nascimento-3').value = nascimento;
    document.getElementById('cad-contato-3').value = contato;
    mostrarEtapaCadastro(3);
    atualizarAvatarCadastro();
};
document.getElementById('btn-voltar-3').onclick = function() {
    mostrarEtapaCadastro(2);
    atualizarAvatarCadastro();
};

// Sempre começa na etapa 1 ao abrir
function abrirCadastroFuncionario() {
    document.getElementById('cadastro-funcionario').style.display = 'flex';
    document.body.style.overflow = 'hidden';
        gerarSenhaProvisoria();

    mostrarEtapaCadastro(1);
    atualizarAvatarCadastro();
}

mascaraCPF(document.getElementById('cad-cpf'));
mascaraTelefone(document.getElementById('cad-contato'));

function aplicarEstiloInputs() {
    // IDs dos inputs do cadastro que NÃO devem ser estilizados
    const idsIgnorar = [
        'cad-cargo',
        'cad-codigo',
        'cad-nome',
        'cad-email',
        'cad-cpf',
        'cad-nascimento',
        'cad-contato'
    ];

    const inputs = Array.from(document.querySelectorAll('input')).filter(
        input => !idsIgnorar.includes(input.id)
    );
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim() === '') {
                input.style.backgroundColor = 'white';
            } else {
                input.style.backgroundColor = '#f1f1f1';
            }
        });
    });

    const selects = Array.from(document.querySelectorAll('select, input[type="date"]')).filter(
        el => !idsIgnorar.includes(el.id)
    );
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