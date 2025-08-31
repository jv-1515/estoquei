let fornecedores = [];
let fornecedoresOriginais = [];
let paginaAtual = 1;

// Utilidades de avatar
function getIniciaisFornecedor(nome) {
    if (!nome || typeof nome !== 'string' || !nome.trim()) return '';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
function corAvatarFornecedor(str) {
    if (!str) return '#e0e7ef';
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 60%, 80%)`;
}
function formatarNomeFornecedor(nome) {
    if (!nome) return '';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0];
    return partes[0] + ' ' + partes[partes.length - 1];
}
function formatarTelefoneExibicao(telefone) {
    if (!telefone) return '';
    telefone = telefone.replace(/\D/g, '');
    if (telefone.length === 11)
        return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7)}`;
    if (telefone.length === 10)
        return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 6)}-${telefone.slice(6)}`;
    return telefone;
}

// Ordenação
let estadoOrdenacao = [true, true, true, true, true];
let campoOrdenacao = ['codigo', 'nome_empresa', 'email', 'telefone'];
let indiceOrdenacaoAtual = -1;

function atualizarSetasOrdenacao() {
    document.querySelectorAll('th.ordenar').forEach((th, idx) => {
        const icon = th.querySelector('.sort-icon');
        if (indiceOrdenacaoAtual === idx && indiceOrdenacaoAtual !== -1) {
            th.classList.add('sorted');
            if (icon) {
                icon.innerHTML = estadoOrdenacao[idx]
                    ? '<i class="fa-solid fa-arrow-down"></i>'
                    : '<i class="fa-solid fa-arrow-up"></i>';
            }
        } else {
            th.classList.remove('sorted');
            if (icon) icon.innerHTML = '';
        }
    });
}

// Renderização da tabela
function renderizarFornecedores(lista) {
    const select = document.getElementById('registros-select');
    let totalItens = lista.length;
    let valorSelect = select.value;
    let itensPorPagina = valorSelect === "" ? totalItens : parseInt(valorSelect);

    const totalPaginas = Math.ceil(totalItens / itensPorPagina) || 1;
    if (paginaAtual > totalPaginas) paginaAtual = 1;
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = valorSelect === "" ? totalItens : inicio + itensPorPagina;
    const pagina = lista.slice(inicio, fim);

    const tbody = document.getElementById('fornecedor-list');

    const thead = document.querySelector('thead');
    const registrosPagina = document.getElementById('registros-pagina');
    
    if (pagina.length === 0) {
        if (thead) thead.style.display = 'none';
        if (registrosPagina) registrosPagina.style.display = 'none';

        if (fornecedoresOriginais.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 30px 0; background-color: white">
                        <div style="display: flex; flex-direction: column; align-items: center; font-size: 20px; color: #888;">
                            <span style="font-weight:bold;">Nenhum fornecedor cadastrado</span>
                            <span>Cadastre o primeiro fornecedor</span>
                            <img src="/images/sem_fornecedor.png" alt="Sem fornecedores" style="width:400px;">
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 30px 0; background-color: white">
                        <div style="display: flex; flex-direction: column; align-items: center; font-size: 20px; color: #888;">
                            <span style="font-weight:bold;">Nenhum fornecedor encontrado</span>
                            <span>Selecione outros filtros</span>
                            <img src="/images/filtro_fornecedor.png" alt="Nenhum fornecedor encontrado" style="width:400px;">
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
        .map(
            (f, idx) => `
            <tr tabindex="${idx + 1}">
                <td style="padding-left: 20px">
                    <div class="avatar" style="
                        width:30px;height:30px;
                        border-radius:50%;
                        background:${corAvatarFornecedor(f.nome_empresa)};
                        display:flex;align-items:center;justify-content:center;
                        font-weight:bold;font-size:12px;
                        color: rgba(0,0,0,0.65);
                        cursor:pointer;"
                        onclick="abrirDetalhesFornecedor('${f.id}')"
                        title="Ver detalhes"
                    >
                        ${getIniciaisFornecedor(f.nome_empresa)}
                    </div>
                </td>
                <td>${f.codigo}</td>
                <td>${formatarNomeFornecedor(f.nome_empresa)}</td>
                <td>${f.email}</td>
                <td>${formatarTelefoneExibicao(f.telefone)}</td>
                <td class="actions">
                    <a href="#" onclick="abrirDetalhesFornecedor('${f.id}')" title="Detalhes">
                        <i class="fa-solid fa-eye"></i>
                    </a>
                    <a href="#" onclick="abrirEdicaoFornecedor('${f.id}')" title="Editar" tabindex="${pagina.length + idx + 1}">
                        <i class="fa-solid fa-pen"></i>
                    </a>
                    <button type="button" onclick="removerFornecedor('${f.id}')" title="Excluir" tabindex="${2 * pagina.length + idx + 1}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
            `
        )
        .join("");

    renderizarPaginacao(totalPaginas);
    atualizarSetasOrdenacao();
}

function renderizarPaginacao(totalPaginas) {
    const paginacaoDiv = document.getElementById('paginacao');
    if (!paginacaoDiv) return;
    paginacaoDiv.innerHTML = '';
    if (totalPaginas <= 1) return;
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'btn-paginacao' + (i === paginaAtual ? ' active' : '');
        btn.onclick = () => {
            paginaAtual = i;
            renderizarFornecedores(fornecedores);
        };
        paginacaoDiv.appendChild(btn);
    }
}

// Busca e filtro
const buscaInput = document.getElementById('busca-fornecedor');
buscaInput.addEventListener('input', filtrarFornecedores);

function filtrarFornecedores() {
    const termo = buscaInput.value.trim().toLowerCase();
    let filtrados = fornecedoresOriginais.filter(f =>
        (!termo ||
            (f.codigo && f.codigo.toLowerCase().includes(termo)) ||
            (f.nome_empresa && f.nome_empresa.toLowerCase().includes(termo)))
    );

    // Ordenação
    if (indiceOrdenacaoAtual !== -1) {
        const campo = campoOrdenacao[indiceOrdenacaoAtual];
        filtrados = filtrados.slice().sort((a, b) => {
            let valA = a[campo], valB = b[campo];
            if (valA === undefined || valA === null) valA = '';
            if (valB === undefined || valB === null) valB = '';
            if (estadoOrdenacao[indiceOrdenacaoAtual]) {
                return valB > valA ? 1 : valB < valA ? -1 : 0;
            } else {
                return valA > valB ? 1 : valA < valB ? -1 : 0;
            }
        });
    }

    fornecedores = filtrados;
    paginaAtual = 1;
    renderizarFornecedores(fornecedores);
}

// Limpar filtros
function limpar() {
    buscaInput.value = '';
    filtrarFornecedores();
}

// Ordenação ao clicar no th
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('th.ordenar').forEach((th, idx) => {
        th.addEventListener('click', function() {
            if (indiceOrdenacaoAtual === idx) {
                estadoOrdenacao[idx] = !estadoOrdenacao[idx];
            } else {
                indiceOrdenacaoAtual = idx;
            }
            filtrarFornecedores();
        });
    });
});

// Carregar fornecedores do backend ao abrir a tela
document.addEventListener('DOMContentLoaded', function() {
    fetch('/fornecedores')
        .then(res => res.json())
        .then(data => {
            fornecedoresOriginais = [...data];
            fornecedores = [...data];
            renderizarFornecedores(fornecedores);
        })
        .catch(() => {
            fornecedoresOriginais = [];
            fornecedores = [];
            renderizarFornecedores([]);
        });
    document.getElementById('registros-select').addEventListener('change', function() {
        paginaAtual = 1;
        renderizarFornecedores(fornecedores);
    });
});

function abrirDetalhesFornecedor(id) {
    // TODO: abrir modal de detalhes
    Swal.fire('Detalhes do fornecedor', 'Funcionalidade em construção!', 'info');
}
function abrirEdicaoFornecedor(id) {
    // TODO: abrir modal de edição
    Swal.fire('Editar fornecedor', 'Funcionalidade em construção!', 'info');
}
function removerFornecedor(id) {
    Swal.fire({
        icon: 'warning',
        title: 'Remover fornecedor?',
        text: 'Esta ação não pode ser desfeita!',
        showCancelButton: true,
        confirmButtonText: 'Remover',
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed) {
            fetch(`/fornecedores/${id}`, { method: 'DELETE' })
                .then(res => {
                    if (res.ok) {
                        fornecedoresOriginais = fornecedoresOriginais.filter(f => f.id != id);
                        fornecedores = fornecedores.filter(f => f.id != id);
                        renderizarFornecedores(fornecedores);
                        Swal.fire('Removido!', 'Fornecedor removido com sucesso.', 'success');
                    } else {
                        Swal.fire('Erro', 'Não foi possível remover o fornecedor.', 'error');
                    }
                });
        }
    });
}

// MODAL DE CADASTRO DE FORNECEDOR

let etapaCadastroFornecedor = 1;
const totalEtapasFornecedor = 4;

function abrirCadastroFornecedor() {
    etapaCadastroFornecedor = 1;
    document.getElementById('modal-cadastro-fornecedor-bg').style.display = 'flex';
    mostrarEtapaCadastroFornecedor();
    limparFormularioCadastroFornecedor();
    atualizarAvatarFornecedor();
    atualizarCategoriasInput();
}

function fecharCadastroFornecedor() {
    document.getElementById('modal-cadastro-fornecedor-bg').style.display = 'none';
}

function mostrarEtapaCadastroFornecedor() {
    document.querySelectorAll('#form-cadastro-fornecedor .etapa-cadastro').forEach(div => {
        div.style.display = div.getAttribute('data-etapa') == etapaCadastroFornecedor ? '' : 'none';
    });
    atualizarBulletsFornecedor();
    if (etapaCadastroFornecedor === 2) preencherResumoEtapa2();
    if (etapaCadastroFornecedor === 4) preencherRevisaoFornecedor();
}

function atualizarBulletsFornecedor() {
    document.querySelectorAll('#form-cadastro-fornecedor .cadastro-bullets').forEach(bullets => {
        bullets.querySelectorAll('.bullet').forEach((b, i) => {
            b.classList.toggle('active', i < etapaCadastroFornecedor);
        });
    });
}

function limparFormularioCadastroFornecedor() {
    document.getElementById('form-cadastro-fornecedor').reset();
    atualizarCategoriasInput();
    document.getElementById('cad-avatar-iniciais').textContent = '';
    document.getElementById('cad-avatar-iniciais-2').textContent = '';
}

function atualizarAvatarFornecedor() {
    const nome = document.getElementById('cad-nome-empresa').value;
    const iniciais = getIniciaisFornecedor(nome);
    document.getElementById('cad-avatar-iniciais').textContent = iniciais;
    document.getElementById('cad-avatar-iniciais-2').textContent = iniciais;
}

function getIniciaisFornecedor(nome) {
    if (!nome || typeof nome !== 'string' || !nome.trim()) return '';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

// Multicheck de categorias
function showCheckboxesCategoriaMulti() {
    const checkboxes = document.getElementById('checkboxes-categoria-multi');
    checkboxes.style.display = checkboxes.style.display === 'block' ? 'none' : 'block';
}
document.addEventListener('click', function(e) {
    if (!e.target.closest('#cad-categorias')) {
        document.getElementById('checkboxes-categoria-multi').style.display = 'none';
    }
});
document.querySelectorAll('.categoria-multi-check').forEach(cb => {
    cb.addEventListener('change', atualizarCategoriasInput);
});
document.getElementById('categoria-multi-todas').addEventListener('change', function() {
    const checked = this.checked;
    document.querySelectorAll('.categoria-multi-check:not(#categoria-multi-todas)').forEach(cb => {
        cb.checked = checked;
    });
    atualizarCategoriasInput();
});
function atualizarCategoriasInput() {
    const todas = document.getElementById('categoria-multi-todas');
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check:not(#categoria-multi-todas)'));
    const selecionadas = checks.filter(cb => cb.checked).map(cb => cb.parentElement.textContent.trim());
    if (selecionadas.length === checks.length) {
        todas.checked = true;
        document.getElementById('cad-categorias-input').value = 'Todas';
    } else {
        todas.checked = false;
        document.getElementById('cad-categorias-input').value = selecionadas.join(', ') || 'Nenhuma';
    }
}

// Navegação entre etapas
document.getElementById('btn-proximo-1').onclick = function() {
    if (!validarEtapa1Fornecedor()) return;
    etapaCadastroFornecedor = 2;
    mostrarEtapaCadastroFornecedor();
};
document.getElementById('btn-proximo-2').onclick = function() {
    etapaCadastroFornecedor = 3;
    mostrarEtapaCadastroFornecedor();
};
document.getElementById('btn-proximo-3').onclick = function() {
    etapaCadastroFornecedor = 4;
    mostrarEtapaCadastroFornecedor();
};
document.getElementById('btn-voltar-2').onclick = function() {
    etapaCadastroFornecedor = 1;
    mostrarEtapaCadastroFornecedor();
};
document.getElementById('btn-voltar-3').onclick = function() {
    etapaCadastroFornecedor = 2;
    mostrarEtapaCadastroFornecedor();
};
document.getElementById('btn-voltar-4').onclick = function() {
    etapaCadastroFornecedor = 3;
    mostrarEtapaCadastroFornecedor();
};

// Avatar dinâmico
document.getElementById('cad-nome-empresa').addEventListener('input', atualizarAvatarFornecedor);

// Preencher resumo na etapa 2
function preencherResumoEtapa2() {
    document.getElementById('cad-codigo-2').value = document.getElementById('cad-codigo').value;
    document.getElementById('cad-categorias-2').value = document.getElementById('cad-categorias-input').value;
    atualizarAvatarFornecedor();
}

// Revisão final
function preencherRevisaoFornecedor() {
    const get = id => document.getElementById(id).value || '';
    const categorias = document.getElementById('cad-categorias-input').value || 'Todas';
    const revisao = `
        <b>Código:</b> ${get('cad-codigo') || '<span style="color:#aaa">Não informado</span>'}<br>
        <b>Categorias:</b> ${categorias}<br>
        <b>Nome da empresa:</b> ${get('cad-nome-empresa') || '<span style="color:#aaa">Não informado</span>'}<br>
        <b>CNPJ:</b> ${get('cad-cnpj') || '<span style="color:#aaa">Não informado</span>'}<br>
        <b>Email:</b> ${get('cad-email') || '<span style="color:#aaa">Não informado</span>'}<br>
        <b>Nome do responsável:</b> ${get('cad-nome-responsavel') || '<span style="color:#aaa">Não informado</span>'}<br>
        <b>Email do responsável:</b> ${get('cad-email-responsavel') || '<span style="color:#aaa">Não informado</span>'}<br>
        <b>Telefone:</b> ${get('cad-telefone') || '<span style="color:#aaa">Não informado</span>'}<br>
        <b>CEP:</b> ${get('cad-cep') || '<span style="color:#aaa">_</span>'}<br>
        <b>Inscrição Estadual:</b> ${get('cad-inscricao-estadual') || '<span style="color:#aaa">Não informado</span>'}<br>
        <b>Logradouro:</b> ${get('cad-logradouro') || '<span style="color:#aaa">Não informado</span>'}<br>
        <b>Bairro:</b> ${get('cad-bairro') || '<span style="color:#aaa">Não informado</span>'}<br>
        <b>Cidade:</b> ${get('cad-cidade') || '<span style="color:#aaa">Não informado</span>'}<br>
        <b>Estado:</b> ${get('cad-estado') || '<span style="color:#aaa">_</span>'}<br>
        <b>Número:</b> ${get('cad-numero') || '<span style="color:#aaa">_</span>'}<br>
        <b>Observações:</b> ${get('cad-observacoes') || '<span style="color:#aaa">Não informado</span>'}
    `;
    document.getElementById('revisao-campos').innerHTML = revisao;
}

// Validação da etapa 1
function validarEtapa1Fornecedor() {
    let ok = true;
    const codigo = document.getElementById('cad-codigo');
    const nome = document.getElementById('cad-nome-empresa');
    const cnpj = document.getElementById('cad-cnpj');
    const email = document.getElementById('cad-email');
    [codigo, nome, cnpj, email].forEach(input => {
        input.classList.remove('input-erro');
        if (!input.value.trim()) {
            input.classList.add('input-erro');
            ok = false;
        }
    });
    if (!codigo.value.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Código obrigatório!',
            text: 'Informe o código do fornecedor',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false,
            showCloseButton: false
        });
        return false;
    }
    if (!nome.value.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Nome obrigatório!',
            text: 'Informe o nome da empresa',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false,
            showCloseButton: false
        });
        return false;
    }
    if (!cnpj.value.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'CNPJ obrigatório!',
            text: 'Informe o CNPJ do fornecedor',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false,
            showCloseButton: false
        });
        return false;
    }
    if (!email.value.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Email obrigatório!',
            text: 'Informe o email do fornecedor',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false,
            showCloseButton: false
        });
        return false;
    }
    if (!ok) {
        Swal.fire({
            icon: 'warning',
            title: 'Preencha todos os campos obrigatórios!',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false,
            showCloseButton: false
        });
    }
    return ok;
}

// Envio do formulário
document.getElementById('form-cadastro-fornecedor').onsubmit = function(e) {
    e.preventDefault();
    const categorias = Array.from(document.querySelectorAll('.categoria-multi-check:not(#categoria-multi-todas)'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    const fornecedor = {
        codigo: document.getElementById('cad-codigo').value,
        nome_empresa: document.getElementById('cad-nome-empresa').value,
        cnpj: document.getElementById('cad-cnpj').value,
        email: document.getElementById('cad-email').value,
        camisa: categorias.includes('CAMISA'),
        camiseta: categorias.includes('CAMISETA'),
        calça: categorias.includes('CALÇA'),
        bermuda: categorias.includes('BERMUDA'),
        shorts: categorias.includes('SHORTS'),
        sapato: categorias.includes('SAPATO'),
        meia: categorias.includes('MEIA'),
        nome_responsavel: document.getElementById('cad-nome-responsavel').value,
        email_responsavel: document.getElementById('cad-email-responsavel').value,
        telefone: document.getElementById('cad-telefone').value,
        cep: document.getElementById('cad-cep').value,
        inscricao_estadual: document.getElementById('cad-inscricao-estadual').value,
        logradouro: document.getElementById('cad-logradouro').value,
        bairro: document.getElementById('cad-bairro').value,
        cidade: document.getElementById('cad-cidade').value,
        estado: document.getElementById('cad-estado').value,
        numero: document.getElementById('cad-numero').value,
        observacoes: document.getElementById('cad-observacoes').value
    };

    fetch('/fornecedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fornecedor)
    })
    .then(res => {
        if (res.ok) {
            fecharCadastroFornecedor();
            Swal.fire('Fornecedor cadastrado com sucesso!', '', 'success').then(() => {
                // Atualiza a lista
                location.reload();
            });
        } else {
            res.text().then(msg => {
                Swal.fire('Erro ao cadastrar fornecedor', msg || '', 'error');
            });
        }
    })
    .catch(() => {
        Swal.fire('Erro ao cadastrar fornecedor', '', 'error');
    });
};