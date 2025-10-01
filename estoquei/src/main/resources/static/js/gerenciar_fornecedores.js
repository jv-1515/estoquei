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
    if (!str) return '#f1f1f1';
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 60%, 80%)`;
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

function renderizarFornecedores(lista) {
    const registrosInput = document.getElementById('registros-multi');
    const radiosDiv = document.getElementById('radios-registros-multi');
    let totalItens = lista.length;
    let valorRadio = '';
    if (registrosInput) {
        valorRadio = radiosDiv.querySelector('input[type="radio"]:checked')?.value ?? '';
    }
    let itensPorPagina = valorRadio === "" ? totalItens : parseInt(valorRadio);

    const totalPaginas = Math.ceil(totalItens / itensPorPagina) || 1;
    if (paginaAtual > totalPaginas) paginaAtual = 1;
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = valorRadio === "" ? totalItens : inicio + itensPorPagina;
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
                    <td colspan="7" style="text-align: center; padding: 30px 0; background-color: white">
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
                    <td colspan="7" style="text-align: center; padding: 30px 0; background-color: white">
                        <div style="display: flex; flex-direction: column; align-items: center; font-size: 20px; color: #888;">
                            <span style="font-weight:bold;">Nenhum fornecedor encontrado</span>
                            <span>Selecione outros filtros</span>
                            <img src="/images/filtro_fornecedores.png" alt="Nenhum fornecedor encontrado" style="width:400px;">
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
                        onclick="abrirDetalhesFornecedor('${f.id}', '${f.nome_empresa}')"
                        title="Ver detalhes"
                    >
                        ${getIniciaisFornecedor(f.nome_empresa)}
                    </div>
                </td>
                <td>${f.codigo}</td>
                <td style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${f.nome_empresa}">${f.nome_empresa}</td>
                <td>${aplicarMascaraCNPJ(f.cnpj)}</td>
                <td>${f.nome_responsavel || 'Não informado'}</td>
                <td>${f.email}</td>
                <td>${formatarTelefoneExibicao(f.telefone) || 'Não informado'}</td>
                <td class="actions">
                    <a href="#" onclick="abrirDetalhesFornecedor('${f.id}', '${f.nome_empresa}')" title="Detalhes">
                        <i class="fa-solid fa-eye"></i>
                    </a>
                    <a href="#" onclick="event.preventDefault(); abrirEdicaoFornecedor('${f.id}')" title="Editar" tabindex="${pagina.length + idx + 1}">
                        <i class="fa-solid fa-pen"></i>
                    </a>
                    <button type="button" onclick="removerFornecedor('${f.id}', '${f.nome_empresa}')" title="Excluir" tabindex="${2 * pagina.length + idx + 1}">                        
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
            `
        )
        .join("");

    renderizarPaginacao(totalPaginas);
    atualizarSetasOrdenacao();
        if (window.aplicarPermissoesFornecedores) {
        window.aplicarPermissoesFornecedores();
    }
    


document.addEventListener('DOMContentLoaded', function() {
    carregarFornecedores();
    const registrosInput = document.getElementById('registros-multi');
    const radiosDiv = document.getElementById('radios-registros-multi');
    const chevron = document.querySelector('.chevron-registros');

    // Inicializa visual
    if (registrosInput && radiosDiv) {
        registrosInput.value = 'Todos';
        radiosDiv.querySelector('input[type="radio"][value=""]').checked = true;
    }

    // Abre/fecha lista ao clicar no input ou chevron
    function abrirLista() {
        radiosDiv.style.display = 'block';
    }
    function fecharLista() {
        radiosDiv.style.display = 'none';
    }
    if (registrosInput) registrosInput.addEventListener('click', abrirLista);
    if (chevron) chevron.addEventListener('click', abrirLista);

    // Fecha ao clicar fora
    document.addEventListener('mousedown', function(e) {
        if (!radiosDiv.contains(e.target) && e.target !== registrosInput && e.target !== chevron) {
            fecharLista();
        }
    });

    // Evento para atualizar input ao selecionar radio (label clicável)
    if (radiosDiv) {
        radiosDiv.addEventListener('click', function(e) {
            const radio = e.target.closest('input[type="radio"]');
            if (radio) {
                registrosInput.value = radio.value === '' ? 'Todos' : radio.value;
                radiosDiv.querySelectorAll('label').forEach(l => l.classList.remove('selecionado'));
                radio.parentElement.classList.add('selecionado');
                radio.checked = true;
                fecharLista();
                paginaAtual = 1;
                renderizarFornecedores(fornecedores);
            }
        });
    }
    
});

// Ao carregar a página, mostra todos os fornecedores
document.addEventListener('DOMContentLoaded', function() {
    carregarFornecedores();

});
}

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
            filtrarFornecedores();
        };
        paginacaoDiv.appendChild(btn);
    }
}

function getCategoriasArrayTexto(f) {
    const map = [
        ['Camisa', f.camisa],
        ['Camiseta', f.camiseta],
        ['Calça', f['calça'] ?? f.calca],
        ['Bermuda', f.bermuda],
        ['Vestido', f.vestido],
        ['Sapato', f.sapato],
        ['Meia', f.meia],
    ];
    return map.filter(([_, v]) => !!v).map(([k]) => k);
}

function normalizarCategoria(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}
// Busca e filtro
const buscaInput = document.getElementById('busca-fornecedor');
buscaInput.addEventListener('input', filtrarFornecedores);

function filtrarFornecedores() {
    const termo = document.getElementById('busca-fornecedor').value.trim().toLowerCase();
    const cnpj = document.getElementById('filter-cnpj').value.trim().replace(/\D/g, '');
    const categoriasSelecionadas = Array.from(document.querySelectorAll('.categoria-multi-check-filtro'))
        .slice(1)
        .filter(cb => cb.checked)
        .map(cb => cb.parentNode.textContent.trim());

    let filtrados = fornecedoresOriginais.filter(f => {
        const categoriasFornecedor = getCategoriasArrayTexto(f).map(normalizarCategoria);
        return (
            (!termo ||
                (f.codigo && f.codigo.toLowerCase().includes(termo)) ||
                (f.nome_empresa && f.nome_empresa.toLowerCase().includes(termo)) ||
                (f.email && f.email.toLowerCase().includes(termo))
            ) &&
            (!cnpj || (f.cnpj && f.cnpj.replace(/\D/g, '').includes(cnpj))) &&
            (
                categoriasSelecionadas.length === 0 ||
                categoriasSelecionadas
                    .map(normalizarCategoria)
                    .every(cat => categoriasFornecedor.includes(cat))
            )
        );
    });

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
    document.getElementById('busca-fornecedor').value = '';
    document.getElementById('filter-cnpj').value = '';
    todasFiltro.checked = false;
    checksFiltro.forEach(cb => cb.checked = false);
    atualizarPlaceholderCategoriaMulti();
    atualizarEstiloCnpjFiltro();
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


// Carregar fornecedores do backend com skeleton loader
function carregarFornecedores() {
        const tbody = document.getElementById('fornecedor-list');
        const skeletonRow = () => {
        return `<tr class='skeleton-table-row'>${Array(8).fill('').map(() => `<td class='skeleton-cell'><div class='skeleton-bar'></div></td>`).join('')}</tr>`;
    };
    
    tbody.innerHTML = Array(10).fill('').map(skeletonRow).join('');
    
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
}

document.addEventListener('DOMContentLoaded', function() {
    carregarFornecedores();
    // Adaptação para radios customizados
    const registrosInput = document.getElementById('registros-multi');
    const radiosDiv = document.getElementById('radios-registros-multi');
    const chevron = document.querySelector('.chevron-registros');

    function abrirLista() {
        if (radiosDiv) radiosDiv.style.display = radiosDiv.style.display === 'none' ? 'block' : 'none';
    }
    if (registrosInput) registrosInput.addEventListener('click', abrirLista);
    if (chevron) chevron.addEventListener('click', abrirLista);

    document.addEventListener('mousedown', function(e) {
        if (radiosDiv && !radiosDiv.contains(e.target) && e.target !== registrosInput && e.target !== chevron) {
            radiosDiv.style.display = 'none';
        }
    });

    if (radiosDiv) {
        radiosDiv.addEventListener('click', function(e) {
            if (e.target && e.target.matches('input[type="radio"]')) {
                radiosDiv.querySelectorAll('label').forEach(label => label.classList.remove('selecionado'));
                e.target.parentElement.classList.add('selecionado');
                registrosInput.value = e.target.value === '' ? 'Todos' : e.target.value;
                radiosDiv.style.display = 'none';
                paginaAtual = 1;
                renderizarFornecedores(fornecedores);
            }
        });
    }
});


function abrirDetalhesFornecedor(id, nomeEmpresa) {
    window.detalhesFornecedorId = id;
    window.detalhesFornecedorNome = nomeEmpresa || '';
    const f = fornecedoresOriginais.find(x => String(x.id) === String(id));
    if (f) {
        renderDetalhesFornecedor(f);
        return;
    }
    fetch(`/fornecedores/${id}`)
        .then(res => res.json())
        .then(f => renderDetalhesFornecedor(f))
        .catch(() => Swal.fire('Erro', 'Não foi possível carregar os detalhes do fornecedor.', 'error'));
}

function fecharDetalhesFornecedor() {
    const popup = document.getElementById('detalhes-fornecedor-popup');
    if (popup) popup.style.display = 'none';
    document.body.style.overflow = '';
}

function renderDetalhesFornecedor(f) {
    // Avatar
    const avatar = document.getElementById('detalhes-forn-avatar');
    const iniciaisEl = document.getElementById('detalhes-forn-avatar-iniciais');
    const nome = f.nome_empresa || '';
    if (avatar) avatar.style.background = corAvatarFornecedor(nome);
    if (iniciaisEl) iniciaisEl.textContent = getIniciaisFornecedor(nome);

    // CNPJ e nome
    const cnpjEl = document.getElementById('detalhes-forn-cnpj');
    if (cnpjEl) cnpjEl.textContent = `CNPJ: ${f.cnpj ? aplicarMascaraCNPJ(f.cnpj) : '-'}`;
    document.getElementById('detalhes-forn-nome').textContent = f.nome_empresa || '';

    // Responsável
    const respDiv = document.getElementById('detalhes-forn-responsavel');
    const respTxt = document.getElementById('detalhes-forn-responsavel-txt');
    if (f.nome_responsavel && f.nome_responsavel.trim()) {
        respDiv.style.display = 'flex';
        respTxt.textContent = `Responsável: ${f.nome_responsavel}`;
    } else {
        respDiv.style.display = 'none';
        respTxt.textContent = '';
    }
    // Telefone
    document.getElementById('detalhes-forn-telefone-txt').textContent = formatarTelefoneExibicao(f.telefone) || 'Não informado';

    // Email principal
    const email = f.email || '';
    const emailLink = document.getElementById('detalhes-forn-email-link');
    if (emailLink) {
        emailLink.textContent = email;
        emailLink.href = email ? `mailto:${email}` : '#';
    }

    // Email extra
    const email2Div = document.getElementById('detalhes-forn-email2');
    const email2Link = document.getElementById('detalhes-forn-email2-link');
    if (f.email_responsavel) {
        email2Div.style.display = 'flex';
        email2Link.textContent = f.email_responsavel;
        email2Link.href = `mailto:${f.email_responsavel}`;
    } else {
        email2Div.style.display = 'none';
        email2Link.textContent = '';
        email2Link.href = '#';
    }
    
    // Categorias como input readonly
    document.getElementById('detalhes-forn-categorias-input').value = getCategoriasTexto(f) || '-';
    
    // Observações
    document.getElementById('detalhes-forn-observacoes').value = f.observacoes || '';
    
    // Endereço
    const endDiv = document.getElementById('detalhes-forn-endereco');
    const endTxt = document.getElementById('detalhes-forn-endereco-txt');
    const endereco = montarEnderecoFornecedor(f);
    if (endereco) {
        endDiv.style.display = 'flex';
        endTxt.textContent = endereco;
    } else {
        endDiv.style.display = 'none';
        endTxt.textContent = '';
    }
    
    // Inscrição Estadual
    const inscDiv = document.getElementById('detalhes-forn-inscricao-estadual');
    const inscTxt = document.getElementById('detalhes-forn-inscricao-estadual-txt');
    if (f.inscricao_estadual) {
        inscDiv.style.display = 'flex';
        inscTxt.textContent = `Inscrição Estadual: ${f.inscricao_estadual}`;
    } else {
        inscDiv.style.display = 'none';
        inscTxt.textContent = '';
    }    // Exibir modal
    const popup = document.getElementById('detalhes-fornecedor-popup');
    if (popup) {
        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function getCategoriasTexto(f) {
    const map = [
        ['Camisa', f.camisa],
        ['Camiseta', f.camiseta],
        ['Calça', f['calça'] ?? f.calca],
        ['Bermuda', f.bermuda],
        ['Vestido', f.vestido],
        ['Sapato', f.sapato],
        ['Meia', f.meia],
    ];
    return map.filter(([_, v]) => !!v).map(([k]) => k).join(', ');
}

function montarEnderecoFornecedor(f) {
    const cep = f.cep ? f.cep : '';
    const log = f.logradouro || '';
    const num = f.numero || '';
    const bai = f.bairro || '';
    const cid = f.cidade || '';
    const uf = f.estado || '';
    const partes = [];
    if (log) partes.push(log + (num ? `, ${num}` : ''));
    if (bai) partes.push(bai);
    if (cid || uf) partes.push([cid, uf].filter(Boolean).join(' - '));
    if (cep) partes.push(`CEP ${cep}`);
    return partes.join(' | ');
}
function abrirEdicaoFornecedor(id) {
    fecharDetalhesFornecedor();
    window.editarFornecedorId = id;
    // Preenche imediatamente do array local
    const f = fornecedoresOriginais.find(x => String(x.id) === String(id));
    if (f) {
        preencherCamposEdicaoFornecedor(f);
    }
    // Depois busca do backend para garantir dados atualizados
    fetch(`/fornecedores/${id}`)
        .then(res => res.json())
        .then(f => preencherCamposEdicaoFornecedor(f));
}


function aplicarMascaraCEP(cep) {
    cep = (cep || '').replace(/\D/g, '').slice(0, 8);
    if (cep.length > 5) {
        return cep.slice(0,5) + '-' + cep.slice(5);
    }
    return cep;
}
function preencherCamposEdicaoFornecedor(f) {

    window.dadosOriginaisEdicaoFornecedor = {
        codigo: f.codigo || '',
        categorias: getCategoriasTexto(f) || '',
        nome_empresa: f.nome_empresa || '',
        cnpj: f.cnpj || '',
        email: f.email || '',
        nome_responsavel: f.nome_responsavel || '',
        email_responsavel: f.email_responsavel || '',
        telefone: f.telefone || '',
        cep: f.cep || '',
        inscricao_estadual: f.inscricao_estadual || '',
        logradouro: f.logradouro || '',
        bairro: f.bairro || '',
        cidade: f.cidade || '',
        estado: f.estado || '',
        numero: f.numero || '',
        observacoes: f.observacoes || ''
    };

    // ETAPA 1 - obrigatórios
    document.getElementById('edit-codigo').value = f.codigo || '';
    document.getElementById('edit-nome-empresa').value = f.nome_empresa || '';
    document.getElementById('edit-cnpj').value = f.cnpj ? aplicarMascaraCNPJ(f.cnpj) : '';
    document.getElementById('edit-email').value = f.email || '';

    // Categorias (pode ser vazio)
    document.getElementById('edit-categorias').value = getCategoriasTexto(f) || '';

    // ETAPA 2 e 3 - opcionais
    document.getElementById('edit-nome-responsavel').value = f.nome_responsavel || '';
    document.getElementById('edit-email-responsavel').value = f.email_responsavel || '';
    document.getElementById('edit-telefone').value = f.telefone ? aplicarMascaraTelefone(f.telefone) : '';
    document.getElementById('edit-cep').value = f.cep ? aplicarMascaraCEP(f.cep) : '';
    document.getElementById('edit-inscricao-estadual').value = f.inscricao_estadual || '';
    document.getElementById('edit-logradouro').value = f.logradouro || '';
    document.getElementById('edit-bairro').value = f.bairro || '';
    document.getElementById('edit-cidade').value = f.cidade || '';
    document.getElementById('edit-estado').value = f.estado || '';
    document.getElementById('edit-numero').value = f.numero || '';
    document.getElementById('edit-observacoes').value = f.observacoes || '';

    // Avatar
    const avatarDiv = document.getElementById('edit-avatar');
    const iniciaisSpan = document.getElementById('edit-avatar-iniciais');
    const icon = avatarDiv ? avatarDiv.querySelector('i.fa-user') : null;
    const nomeEmpresa = f.nome_empresa || '';
    if (avatarDiv && iniciaisSpan) {
        avatarDiv.style.background = corAvatarFornecedor(nomeEmpresa);
        iniciaisSpan.textContent = getIniciaisFornecedor(nomeEmpresa);
        if (icon) icon.style.display = nomeEmpresa.trim() ? 'none' : '';
    }
    document.getElementById('edit-nome-empresa').addEventListener('input', function() {
        const nomeEmpresa = this.value || '';
        avatarDiv.style.background = corAvatarFornecedor(nomeEmpresa);
        iniciaisSpan.textContent = getIniciaisFornecedor(nomeEmpresa);
        if (icon) icon.style.display = nomeEmpresa.trim() ? 'none' : '';
    });

    // Contador observações
    const obsInput = document.getElementById('edit-observacoes');
    const obsContador = document.getElementById('contador-edit-observacoes');
    const maxObs = obsInput.maxLength || 200;
    obsContador.textContent = `${obsInput.value.length}/${maxObs}`;
    obsInput.addEventListener('input', function() {
        obsContador.textContent = `${this.value.length}/${maxObs}`;
    });

    // Máscaras
    mascaraCNPJ(document.getElementById('edit-cnpj'));
    mascaraTelefone(document.getElementById('edit-telefone'));
    document.getElementById('edit-cep').addEventListener('input', function() {
        let v = this.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 5) {
            this.value = v.slice(0,5) + '-' + v.slice(5);
        } else {
            this.value = v;
        }
    });
    document.getElementById('edit-inscricao-estadual').addEventListener('input', function() {
        let v = this.value.replace(/\D/g, '').slice(0, 12);
        let out = '';
        if (v.length > 0) out = v.slice(0,3);
        if (v.length >= 4) out += '.' + v.slice(3,6);
        if (v.length >= 7) out += '.' + v.slice(6,9);
        if (v.length >= 10) out += '.' + v.slice(9,12);
        this.value = out;
    });

    document.getElementById('editar-fornecedor-bg').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
// Fechar edição
function fecharEditarFornecedor() {
    const orig = window.dadosOriginaisEdicaoFornecedor || {};
    const codigo = document.getElementById('edit-codigo').value.trim();
    const nome_empresa = document.getElementById('edit-nome-empresa').value.trim();
    const cnpj = document.getElementById('edit-cnpj').value.replace(/\D/g, '');
    const email = document.getElementById('edit-email').value.trim();

    const houveMudanca =
        document.getElementById('edit-codigo').value.trim() !== (orig.codigo || '') ||
        document.getElementById('edit-categorias').value.trim() !== (orig.categorias || '') ||
        document.getElementById('edit-nome-empresa').value.trim() !== (orig.nome_empresa || '') ||
        document.getElementById('edit-cnpj').value.replace(/\D/g, '') !== (orig.cnpj || '') ||
        document.getElementById('edit-email').value.trim() !== (orig.email || '') ||
        document.getElementById('edit-nome-responsavel').value.trim() !== (orig.nome_responsavel || '') ||
        document.getElementById('edit-email-responsavel').value.trim() !== (orig.email_responsavel || '') ||
        document.getElementById('edit-telefone').value.replace(/\D/g, '') !== (orig.telefone || '') ||
        document.getElementById('edit-cep').value.replace(/\D/g, '') !== (orig.cep || '') ||
        document.getElementById('edit-inscricao-estadual').value.replace(/\D/g, '') !== (orig.inscricao_estadual || '') ||
        document.getElementById('edit-logradouro').value.trim() !== (orig.logradouro || '') ||
        document.getElementById('edit-bairro').value.trim() !== (orig.bairro || '') ||
        document.getElementById('edit-cidade').value.trim() !== (orig.cidade || '') ||
        document.getElementById('edit-estado').value.trim() !== (orig.estado || '') ||
        document.getElementById('edit-numero').value.trim() !== (orig.numero || '') ||
        document.getElementById('edit-observacoes').value.trim() !== (orig.observacoes || '');


    if (houveMudanca) {
        Swal.fire({
            icon: 'warning',
            title: 'Descartar alterações?',
            text: 'As alterações não serão salvas',
            showCancelButton: true,
            confirmButtonText: 'Descartar',
            cancelButtonText: 'Voltar',
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                document.getElementById('editar-fornecedor-bg').style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    } else {
        document.getElementById('editar-fornecedor-bg').style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Remover fornecedor
function removerFornecedor(id, nomeFornecedor) {
    Swal.fire({
        icon: 'warning',
        title: `Esta ação é irreversível!`,
        html: 'Digite <strong>EXCLUIR</strong> para confirmar:',
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
                input.style.textAlign = 'center';
            }
            const btn = Swal.getConfirmButton();
            if (btn) {
                btn.style.maxWidth = '80px';
            }
        }
    }).then((res) => {
        if (res.isConfirmed) {
            Swal.fire({
                title: `Excluindo "${nomeFornecedor}"...`,
                text: 'Aguarde enquanto o fornecedor é excluído',
                icon: 'info',
                showConfirmButton: false,
                allowOutsideClick: false,
                timer: 1500,
                didOpen: () => {
                    Swal.showLoading();
                    fetch('/fornecedores/' + id, { method: 'DELETE' })
                        .then(response => {
                            if (response.ok) {
                                setTimeout(() => location.reload(), 1500);
                            } else {
                                Swal.fire({
                                    title: 'Erro!',
                                    text: `Não foi possível excluir ${nomeFornecedor}. Tente novamente`,
                                    icon: 'error',
                                    showConfirmButton: false,
                                    allowOutsideClick: false,
                                    timer: 1500,
                                });
                            }
                        });
                }
            });
        }
    });
}

// Validações ao salvar edição
document.getElementById('form-editar-fornecedor').onsubmit = async function(e) {
    e.preventDefault();

       const fornecedorAtual = {
        codigo: document.getElementById('edit-codigo').value.trim(),
        categorias: document.getElementById('edit-categorias').value.trim(),
        nome_empresa: document.getElementById('edit-nome-empresa').value.trim(),
        cnpj: document.getElementById('edit-cnpj').value.replace(/\D/g, ''),
        email: document.getElementById('edit-email').value.trim(),
        nome_responsavel: document.getElementById('edit-nome-responsavel').value.trim(),
        email_responsavel: document.getElementById('edit-email-responsavel').value.trim(),
        telefone: document.getElementById('edit-telefone').value.replace(/\D/g, ''),
        cep: document.getElementById('edit-cep').value.replace(/\D/g, ''),
        inscricao_estadual: document.getElementById('edit-inscricao-estadual').value.replace(/\D/g, ''),
        logradouro: document.getElementById('edit-logradouro').value.trim(),
        bairro: document.getElementById('edit-bairro').value.trim(),
        cidade: document.getElementById('edit-cidade').value.trim(),
        estado: document.getElementById('edit-estado').value.trim(),
        numero: document.getElementById('edit-numero').value.trim(),
        observacoes: document.getElementById('edit-observacoes').value.trim()
    };

    // VALIDAÇÃO SEM ALTERAÇÕES
    if (JSON.stringify(fornecedorAtual) === JSON.stringify(window.dadosOriginaisEdicaoFornecedor)) {
        Swal.fire({
            icon: 'info',
            title: 'Sem alterações',
            text: 'Nenhuma alteração foi feita',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        document.getElementById('editar-fornecedor-bg').style.display = 'none';
        document.body.style.overflow = '';
        return;
    }

    if (!(await validarFornecedorEdit())) return;

    const fornecedor = {
        codigo: document.getElementById('edit-codigo').value,
        nome_empresa: document.getElementById('edit-nome-empresa').value,
        cnpj: document.getElementById('edit-cnpj').value.replace(/\D/g, ''),
        categorias: document.getElementById('edit-categorias').value,
        email: document.getElementById('edit-email').value,
        nome_responsavel: document.getElementById('edit-nome-responsavel').value,
        email_responsavel: document.getElementById('edit-email-responsavel').value,
        telefone: document.getElementById('edit-telefone').value.replace(/\D/g, ''),
        cep: document.getElementById('edit-cep').value.replace(/\D/g, ''),
        inscricao_estadual: document.getElementById('edit-inscricao-estadual').value.replace(/\D/g, ''),
        logradouro: document.getElementById('edit-logradouro').value,
        bairro: document.getElementById('edit-bairro').value,
        cidade: document.getElementById('edit-cidade').value,
        estado: document.getElementById('edit-estado').value,
        numero: document.getElementById('edit-numero').value,
        observacoes: document.getElementById('edit-observacoes').value
    };

    Swal.fire({
        title: 'Tem certeza?',
        text: 'As alterações não poderão ser desfeitas',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Voltar',
        allowOutsideClick: false,
        timerProgressBar: true
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/fornecedores/${window.editarFornecedorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fornecedor)
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
                    fetch('/fornecedores')
                        .then(res => res.json())
                        .then(data => {
                            fornecedoresOriginais = [...data];
                            fornecedores = [...data];
                            renderizarFornecedores(fornecedores);
                        });
                    document.getElementById('editar-fornecedor-bg').style.display = 'none';
                    document.body.style.overflow = '';
                    window.location.reload();

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
};
async function validarFornecedorEdit() {
    // Campos obrigatórios
    const codigo = document.getElementById('edit-codigo').value.trim();
    const nome = document.getElementById('edit-nome-empresa').value.trim();
    const cnpjMasked = document.getElementById('edit-cnpj').value.trim();
    const cnpj = cnpjMasked.replace(/\D/g, '');
    const email = document.getElementById('edit-email').value.trim();
    const categorias = document.getElementById('edit-categorias').value.trim();

    // Campos opcionais
    const nome_responsavel = document.getElementById('edit-nome-responsavel').value.trim();
    const email_responsavel = document.getElementById('edit-email-responsavel').value.trim();
    const telefoneMasked = document.getElementById('edit-telefone').value.trim();
    const telefone = telefoneMasked.replace(/\D/g, '');
    const cepMasked = document.getElementById('edit-cep').value.trim();
    const cep = cepMasked.replace(/\D/g, '');
    const inscricao_estadual = document.getElementById('edit-inscricao-estadual').value.replace(/\D/g, '');
    const logradouro = document.getElementById('edit-logradouro').value.trim();
    const bairro = document.getElementById('edit-bairro').value.trim();
    const cidade = document.getElementById('edit-cidade').value.trim();
    const estado = document.getElementById('edit-estado').value.trim();
    const numero = document.getElementById('edit-numero').value.trim();
    const observacoes = document.getElementById('edit-observacoes').value.trim();

    // Validações obrigatórias
    if (!codigo) {
        Swal.fire({
            icon: 'warning',
            title: 'Código obrigatório!',
            text: 'Preencha o código',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }
    if (!/^\d{9}$/.test(codigo)) {
        Swal.fire({
            icon: 'warning',
            title: 'Código inválido!',
            text: 'O código deve ter 9 dígitos',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }
    // Código único
    let existeCodigo = false;
    try {
        existeCodigo = await fetch(`/fornecedores/codigo-existe?codigo=${encodeURIComponent(codigo)}`).then(r => r.json());
    } catch {}
    if (existeCodigo && String(codigo) !== String(window.dadosOriginaisEdicaoFornecedor.codigo)) {
        Swal.fire({
            icon: 'warning',
            title: 'Código já cadastrado!',
            text: 'Informe outro código',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }

    if (!nome) {
        Swal.fire({
            icon: 'warning',
            title: 'Nome obrigatório!',
            text: 'Preencha o nome da empresa',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }

    if (!cnpj) {
        Swal.fire({
            icon: 'warning',
            title: 'CNPJ obrigatório!',
            text: 'Preencha o CNPJ',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }
    if (cnpj.length !== 14) {
        Swal.fire({
            icon: 'warning',
            title: 'CNPJ inválido!',
            text: 'O CNPJ deve ter 14 dígitos',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }
    if (!cnpjValido(cnpj)) {
        Swal.fire({
            icon: 'warning',
            title: 'CNPJ inválido!',
            text: 'Verifique o número digitado',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }
    // CNPJ único
    let existeCnpj = false;
    try {
        existeCnpj = await fetch(`/fornecedores/cnpj-existe?cnpj=${encodeURIComponent(cnpj)}`).then(r => r.json());
    } catch {}
    if (existeCnpj && String(cnpj) !== String(window.dadosOriginaisEdicaoFornecedor.cnpj)) {
        Swal.fire({
            icon: 'warning',
            title: 'CNPJ já cadastrado!',
            text: 'Informe outro CNPJ',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }

    if (!email) {
        Swal.fire({
            icon: 'warning',
            title: 'Email obrigatório!',
            text: 'Preencha o email',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
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
        return false;
    }

    // Categorias
    if (!categorias || categorias === 'Nenhuma') {
        Swal.fire({
            icon: 'warning',
            title: 'Categorias obrigatórias!',
            text: 'Selecione pelo menos uma categoria',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }

    // Email extra (opcional, mas se preenchido deve ser válido)
    if (email_responsavel && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_responsavel)) {
        Swal.fire({
            icon: 'warning',
            title: 'Email extra inválido!',
            text: 'Informe um email válido',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        document.getElementById('edit-email-responsavel').focus();
        return false;
    }

    // Telefone (opcional, mas se preenchido deve ter pelo menos 10 dígitos)
    if (telefone && telefone.length < 10) {
        Swal.fire({
            icon: 'warning',
            title: 'Telefone inválido!',
            text: 'Informe um telefone válido',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        document.getElementById('edit-telefone').focus();
        return false;
    }

    // CEP (opcional, mas se preenchido deve ter 8 dígitos)
    if (cep && cep.length !== 8) {
        Swal.fire({
            icon: 'warning',
            title: 'CEP inválido!',
            text: 'Informe um CEP válido',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        document.getElementById('edit-cep').focus();
        return false;
    }

    // Se CEP preenchido, logradouro, bairro, cidade e estado devem estar preenchidos
    if (cep && (!logradouro || !bairro || !cidade || !estado)) {
        Swal.fire({
            icon: 'warning',
            title: 'Endereço incompleto!',
            text: 'Preencha logradouro, bairro, cidade e estado',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        if (!logradouro) document.getElementById('edit-logradouro').focus();
        else if (!bairro) document.getElementById('edit-bairro').focus();
        else if (!cidade) document.getElementById('edit-cidade').focus();
        else document.getElementById('edit-estado').focus();
        return false;
    }

    // Número (se CEP preenchido e número vazio, preenche com S/N)
    if (cep && !numero) {
        document.getElementById('edit-numero').value = 'S/N';
    }

    // Inscrição estadual (opcional, se preenchido deve ter pelo menos 9 dígitos)
    if (inscricao_estadual && inscricao_estadual.length < 9) {
        Swal.fire({
            icon: 'warning',
            title: 'Inscrição Estadual inválida!',
            text: 'Informe uma inscrição estadual válida',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        document.getElementById('edit-inscricao-estadual').focus();
        return false;
    }

    // Cidade (opcional, mas se preenchido não pode ter números)
    if (cidade && /\d/.test(cidade)) {
        Swal.fire({
            icon: 'warning',
            title: 'Cidade inválida!',
            text: 'A cidade não pode conter números',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        document.getElementById('edit-cidade').focus();
        return false;
    }

    // Observações (opcional, limite de caracteres)
    if (observacoes.length > 200) {
        Swal.fire({
            icon: 'warning',
            title: 'Observações muito longas!',
            text: 'Limite de 200 caracteres',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        document.getElementById('edit-observacoes').focus();
        return false;
    }

    return true;
}

// Cadastro novo fornecedor
let etapaCadastroFornecedor = 1;
const totalEtapasFornecedor = 4;

function abrirCadastroFornecedor() {
    etapaCadastroFornecedor = 1;
    document.getElementById('modal-cadastro-fornecedor-bg').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    mostrarEtapaCadastroFornecedor();
    limparFormularioCadastroFornecedor();
    atualizarAvatarFornecedor();
    atualizarCategoriasInput();
}

function fecharCadastroFornecedor() {

    if (etapaCadastroFornecedor === 1) {
        const campos = [
            'cad-codigo',
            'cad-nome-empresa',
            'cad-cnpj',
            'cad-email'
        ];
        const algumPreenchido = campos.some(id => {
            const el = document.getElementById(id);
            return el && el.value && el.value.trim() !== '';
        });
        if (!algumPreenchido) {
            document.getElementById('modal-cadastro-fornecedor-bg').style.display = 'none';
            return;
        }
    }
    // se estiver em qualquer outra etapa, sempre alerta
    Swal.fire({
        icon: 'warning',
        title: 'Tem certeza?',
        text: 'As informações preenchidas serão descartadas',
        showCancelButton: true,
        confirmButtonText: 'Descartar',
        cancelButtonText: 'Voltar',
        customClass: {
            confirmButton: 'swal2-remove-custom',
            cancelButton: 'swal2-cancel-custom'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('modal-cadastro-fornecedor-bg').style.display = 'none';
        }
    });

    document.body.style.overflow = '';
}

function mostrarEtapaCadastroFornecedor() {
    document.querySelectorAll('#form-cadastro-fornecedor .etapa-cadastro').forEach(div => {
        div.style.display = div.getAttribute('data-etapa') == etapaCadastroFornecedor ? '' : 'none';
    });
    atualizarBulletsFornecedor();

    const form = document.querySelector('.form-container');
    if (form) {
        form.classList.toggle('etapa4', etapaCadastroFornecedor === 4);
    }

    atualizarAvatarFornecedor();

    const h2 = document.getElementById('titulo-cadastro');
    const h3 = document.getElementById('subtitulo-cadastro');
    const aviso = document.getElementById('aviso-cadastro');

    // h2 só aparece fora da etapa 4
    if (h2) h2.style.display = (etapaCadastroFornecedor === 4) ? 'none' : '';

    // h3 e aviso mudam conforme a etapa
    if (h3) {
        if (etapaCadastroFornecedor === 1) {
            h3.textContent = 'Informações Básicas';
            h3.style.fontSize = '16px';
            h3.style.margin = '0 0 4px 0';
        } else if (etapaCadastroFornecedor === 2) {
            h3.textContent = 'Informações do Responsável';
            h3.style.fontSize = '16px';
            h3.style.margin = '0 0 4px 0';
        } else if (etapaCadastroFornecedor === 3) {
            h3.textContent = 'Informações Complementares';
            h3.style.fontSize = '16px';
            h3.style.margin = '0 0 4px 0';
        } else if (etapaCadastroFornecedor === 4) {
            h3.textContent = 'Revisar Informações do Fornecedor';
            h3.style.fontSize = '20px';
            h3.style.margin = '0';
        }
    }
    if (aviso) {
        if (etapaCadastroFornecedor === 1) {
            aviso.style.display = '';
            aviso.innerHTML = '<i class="fa-solid fa-circle-info"></i> Obrigatórias';
        } else if (etapaCadastroFornecedor === 2 || etapaCadastroFornecedor === 3) {
            aviso.style.display = '';
            aviso.innerHTML = '<i class="fa-solid fa-circle-info"></i> Você poderá completar mais tarde';
        } else if (etapaCadastroFornecedor === 4) {
            aviso.style.display = 'none';
        }
    }

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
    const nome = document.getElementById('cad-nome-empresa').value || '';
    const iniciais = getIniciaisFornecedor(nome);

    // ETAPA 1
    const avatar1 = document.getElementById('cad-avatar');
    const iniciais1 = document.getElementById('cad-avatar-iniciais');
    const icon1 = avatar1 ? avatar1.querySelector('i.fa-user') : null;
    if (avatar1) avatar1.style.background = corAvatarFornecedor(nome);
    if (iniciais1) iniciais1.textContent = iniciais;
    if (icon1) icon1.style.display = nome.trim() ? 'none' : '';

    // ETAPA 2
    const avatar2 = document.getElementById('cad-avatar-2');
    const iniciais2 = document.getElementById('cad-avatar-iniciais-2');
    const icon2 = avatar2 ? avatar2.querySelector('i.fa-user') : null;
    if (avatar2) avatar2.style.background = corAvatarFornecedor(nome);
    if (iniciais2) iniciais2.textContent = iniciais;
    if (icon2) icon2.style.display = nome.trim() ? 'none' : '';

    // ETAPA 4 (revisão)
    const avatar4 = document.getElementById('rev-avatar');
    const iniciais4 = document.getElementById('rev-avatar-iniciais');
    const icon4 = avatar4 ? avatar4.querySelector('i.fa-user') : null;
    if (avatar4) avatar4.style.background = corAvatarFornecedor(nome);
    if (iniciais4) iniciais4.textContent = iniciais;
    if (icon4) icon4.style.display = nome.trim() ? 'none' : '';
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
document.getElementById('btn-proximo-1').onclick = async function() {
    if (!(await validarEtapa1Fornecedor())) return;
    etapaCadastroFornecedor = 2;
    mostrarEtapaCadastroFornecedor();
    atualizarContadorEtapaFornecedor(etapaCadastroFornecedor);
};
document.getElementById('btn-proximo-2').onclick = function() {
    if (!validarEtapa2Fornecedor()) return;
    etapaCadastroFornecedor = 3;
    mostrarEtapaCadastroFornecedor();
    atualizarContadorEtapaFornecedor(etapaCadastroFornecedor);
};
document.getElementById('btn-proximo-3').onclick = function() {
    if (!validarEtapa3Fornecedor()) return;
    etapaCadastroFornecedor = 4;
    mostrarEtapaCadastroFornecedor();
    atualizarContadorEtapaFornecedor(etapaCadastroFornecedor);
};
document.getElementById('btn-voltar-2').onclick = function() {
    etapaCadastroFornecedor = 1;
    mostrarEtapaCadastroFornecedor();
    atualizarContadorEtapaFornecedor(etapaCadastroFornecedor);
};
document.getElementById('btn-voltar-3').onclick = function() {
    etapaCadastroFornecedor = 2;
    mostrarEtapaCadastroFornecedor();
    atualizarContadorEtapaFornecedor(etapaCadastroFornecedor);
};
document.getElementById('btn-voltar-4').onclick = function() {
    etapaCadastroFornecedor = 3;
    mostrarEtapaCadastroFornecedor();
    atualizarContadorEtapaFornecedor(etapaCadastroFornecedor);
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
    // Preenche os campos readonly da etapa 4
    document.getElementById('rev-codigo').value = document.getElementById('cad-codigo').value || '';
    document.getElementById('rev-categorias').value = document.getElementById('cad-categorias-input').value || 'Todas';
    document.getElementById('rev-nome-empresa').value = document.getElementById('cad-nome-empresa').value || '';
    document.getElementById('rev-cnpj').value = document.getElementById('cad-cnpj').value || '';
    document.getElementById('rev-email').value = document.getElementById('cad-email').value || '';
    document.getElementById('rev-nome-responsavel').value = document.getElementById('cad-nome-responsavel').value || '';
    document.getElementById('rev-email-responsavel').value = document.getElementById('cad-email-responsavel').value || '';
    document.getElementById('rev-telefone').value = document.getElementById('cad-telefone').value || '';
    document.getElementById('rev-cep').value = document.getElementById('cad-cep').value || '';
    document.getElementById('rev-inscricao-estadual').value = document.getElementById('cad-inscricao-estadual').value || '';
    document.getElementById('rev-logradouro').value = document.getElementById('cad-logradouro').value || '';
    document.getElementById('rev-bairro').value = document.getElementById('cad-bairro').value || '';
    document.getElementById('rev-cidade').value = document.getElementById('cad-cidade').value || '';
    document.getElementById('rev-estado').value = document.getElementById('cad-estado').value || '';
    document.getElementById('rev-numero').value = document.getElementById('cad-numero').value || '';
    document.getElementById('rev-observacoes').value = document.getElementById('cad-observacoes').value || '';

    // Avatar
    // const nome = document.getElementById('cad-nome-empresa').value || '';
    // const iniciais = getIniciaisFornecedor(nome);
    // const avatarDiv = document.getElementById('rev-avatar');
    // const iniciaisSpan = document.getElementById('rev-avatar-iniciais');
    // const icon = avatarDiv ? avatarDiv.querySelector('i.fa-user') : null;
    // if (avatarDiv) avatarDiv.style.background = corAvatarFornecedor(nome);
    // if (iniciaisSpan) iniciaisSpan.textContent = iniciais;
    // if (icon) icon.style.display = nome.trim() ? 'none' : '';
}


//validacoes de caracteres validos
document.getElementById('cad-codigo').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '').slice(0, 9); // só números, máx 9 dígitos
});

document.getElementById('cad-nome-responsavel').addEventListener('input', function() {
    this.value = this.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
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
//mascara cep
document.getElementById('cad-cep').addEventListener('input', function() {
    let v = this.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) {
        this.value = v.slice(0,5) + '-' + v.slice(5);
    } else {
        this.value = v;
    }
});

//mascara inscricao estadual
document.getElementById('cad-inscricao-estadual').addEventListener('input', function() {
    let v = this.value.replace(/\D/g, '').slice(0, 12);
    let out = '';
    if (v.length > 0) out = v.slice(0,3);
    if (v.length >= 4) out += '.' + v.slice(3,6);
    if (v.length >= 7) out += '.' + v.slice(6,9);
    if (v.length >= 10) out += '.' + v.slice(9,12);
    this.value = out;
});

document.getElementById('cad-cidade').addEventListener('input', function() {
    this.value = this.value.replace(/[\d]/g, '');
});

document.getElementById('cad-telefone').addEventListener('blur', function() {
    const tel = this.value.replace(/\D/g, '');
    if (tel && tel.length < 10) {
        Swal.fire({
            icon: 'warning',
            title: 'Telefone inválido!',
            text: 'Informe outro telefone',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        this.focus();
    }
});

mascaraTelefone(document.getElementById('cad-telefone'));


//mascara telefone
function aplicarMascaraTelefone(num) {
    const v = (num || '').replace(/\D/g, '').slice(0, 11);
    if (v.length <= 10) {
        // (00) 0000-0000
        const p1 = v.slice(0, 2);
        const p2 = v.slice(2, 6);
        const p3 = v.slice(6, 10);
        return v.length > 6 ? `(${p1}) ${p2}-${p3}` :
               v.length > 2 ? `(${p1}) ${p2}` :
               p1 ? `(${p1}` : '';
    } else {
        // (00) 00000-0000
        const p1 = v.slice(0, 2);
        const p2 = v.slice(2, 7);
        const p3 = v.slice(7, 11);
        return `(${p1}) ${p2}-${p3}`;
    }
}

function aplicarMascaraCNPJ(num) {
    const v = (num || '').replace(/\D/g, '').slice(0, 14);
    const p1 = v.slice(0, 2);
    const p2 = v.slice(2, 5);
    const p3 = v.slice(5, 8);
    const p4 = v.slice(8, 12);
    const p5 = v.slice(12, 14);
    let out = '';
    if (p1) out = p1;
    if (p2) out += '.' + p2;
    if (p3) out += '.' + p3;
    if (p4) out += '/' + p4;
    if (p5) out += '-' + p5;
    return out;
}

function cnpjValido(cnpjNum) {
    const c = (cnpjNum || '').replace(/\D/g, '');
    if (c.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(c)) return false; // rejeita repetidos

    const calcDV = (base) => {
        let soma = 0, pos = base.length - 7;
        for (let i = 0; i < base.length; i++) {
            soma += parseInt(base[i], 10) * pos--;
            if (pos < 2) pos = 9;
        }
        const res = soma % 11;
        return res < 2 ? 0 : 11 - res;
    };

    const nums = c.slice(0, 12);
    const dv1 = calcDV(nums);
    const dv2 = calcDV(nums + dv1);
    return c.endsWith(`${dv1}${dv2}`);
}

// máscara do CNPJ
function mascaraCNPJ(input) {
    function formatarCNPJ(v) {
        v = v.replace(/\D/g, '').slice(0, 14);
        let mask = '__.___.___/____-__';
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
        let raw = old.replace(/\D/g, '').slice(0, 14);

        input.value = formatarCNPJ(raw);

        let newCaret = caret;
        if (e.inputType === 'deleteContentBackward') {
            while (newCaret > 0 && /[^\d_]/.test(input.value[newCaret - 1])) newCaret--;
        } else if (e.inputType === 'insertText') {
            while (newCaret < input.value.length && /[^\d_]/.test(input.value[newCaret])) newCaret++;
        }
        setCaret(newCaret);
    });

    input.value = formatarCNPJ(input.value.replace(/\D/g, ''));
    let pos = input.value.indexOf('_');
    if (pos === -1) pos = input.value.length;
    setCaret(pos);
}
mascaraCNPJ(document.getElementById('cad-cnpj'));


document.getElementById('cad-cnpj').addEventListener('blur', function () {
    const c = this.value.replace(/\D/g, '');
    if (c && !cnpjValido(c)) {
        Swal.fire({
            icon: 'warning',
            title: 'CNPJ inválido!',
            text: 'Verifique o número digitado',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        this.focus();
    }
});

// Validação da etapa 1 (padrão igual funcionários)
async function validarEtapa1Fornecedor() {
    const codigo = document.getElementById('cad-codigo').value.trim();
    const nome = document.getElementById('cad-nome-empresa').value.trim();
    const cnpjMasked = document.getElementById('cad-cnpj').value.trim();
    const cnpj = cnpjMasked.replace(/\D/g, '');
    const email = document.getElementById('cad-email').value.trim();

    // Código obrigatório
    if (!codigo) {
        Swal.fire({
            icon: 'warning',
            title: 'Código obrigatório!',
            text: 'Preencha o código',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }
    // Código só números, 9 dígitos
    if (!/^\d{9}$/.test(codigo)) {
        Swal.fire({
            icon: 'warning',
            title: 'Código inválido!',
            text: 'O código deve ter 9 dígitos',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }
    // Código único (consulta backend)
    let existeCodigo = false;
    try {
        existeCodigo = await fetch(`/fornecedores/codigo-existe?codigo=${encodeURIComponent(codigo)}`).then(r => r.json());
    } catch {}
    if (existeCodigo) {
        Swal.fire({
            icon: 'warning',
            title: 'Código já cadastrado!',
            text: 'Informe outro código',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }

    // Nome obrigatório
    if (!nome) {
        Swal.fire({
            icon: 'warning',
            title: 'Nome obrigatório!',
            text: 'Preencha o nome da empresa',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }

    // CNPJ obrigatório
    if (!cnpj) {
        Swal.fire({
            icon: 'warning',
            title: 'CNPJ obrigatório!',
            text: 'Preencha o CNPJ',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }
    // CNPJ só números, 14 dígitos
    if (cnpj.length !== 14) {
        Swal.fire({
            icon: 'warning',
            title: 'CNPJ inválido!',
            text: 'O CNPJ deve ter 14 dígitos',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }
    if (!cnpjValido(cnpj)) {
        Swal.fire({
            icon: 'warning',
            title: 'CNPJ inválido!',
            text: 'Verifique o número digitado',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }
    // CNPJ único (consulta backend)
    let existeCnpj = false;
    try {
        existeCnpj = await fetch(`/fornecedores/cnpj-existe?cnpj=${encodeURIComponent(cnpj)}`).then(r => r.json());
    } catch {}
    if (existeCnpj) {
        Swal.fire({
            icon: 'warning',
            title: 'CNPJ já cadastrado!',
            text: 'Informe outro CNPJ',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }

    // Email obrigatório
    if (!email) {
        Swal.fire({
            icon: 'warning',
            title: 'Email obrigatório!',
            text: 'Preencha o email',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }
    // Email formato válido
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Swal.fire({
            icon: 'warning',
            title: 'Email inválido!',
            text: 'Informe outro email',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }

    return true;
}

function validarEtapa2Fornecedor() {
    const emailExtra = document.getElementById('cad-email-responsavel').value.trim();
    if (emailExtra && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailExtra)) {
        Swal.fire({
            icon: 'warning',
            title: 'Email extra inválido!',
            text: 'Informe um email válido',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        document.getElementById('cad-email-responsavel').focus();
        return false;
    }
    return true;
}


function validarEtapa3Fornecedor() {
    const cep = document.getElementById('cad-cep').value.replace(/\D/g, '');
    const numeroInput = document.getElementById('cad-numero');
    let numero = numeroInput.value.trim();

    if (cep && cep.length === 8 && !numero) {
        numeroInput.value = 'S/N';
    }
    return true;
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
        cnpj: document.getElementById('cad-cnpj').value.replace(/\D/g, ''),        
        email: document.getElementById('cad-email').value,
        camisa: categorias.includes('CAMISA'),
        camiseta: categorias.includes('CAMISETA'),
        calça: categorias.includes('CALÇA'),
        bermuda: categorias.includes('BERMUDA'),
        vestido: categorias.includes('VESTIDO'),
        sapato: categorias.includes('SAPATO'),
        meia: categorias.includes('MEIA'),
        nome_responsavel: document.getElementById('cad-nome-responsavel').value,
        email_responsavel: document.getElementById('cad-email-responsavel').value,
        telefone: document.getElementById('cad-telefone').value.replace(/\D/g, ''),
        cep: document.getElementById('cad-cep').value.replace(/\D/g, ''),
        inscricao_estadual: document.getElementById('cad-inscricao-estadual').value.replace(/\D/g, ''),
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
            document.getElementById('modal-cadastro-fornecedor-bg').style.display = 'none';
            document.body.style.overflow = '';
            fecharCadastroFornecedor();
            Swal.fire({
                text: `Fornecedor "${fornecedor.nome_empresa}" cadastrado!`,
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                allowOutsideClick: false
            }).then(() => {
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


document.getElementById('cad-cep').addEventListener('blur', buscarCepFornecedor);

async function buscarCepFornecedor() {
    const cepInput = document.getElementById('cad-cep');
    let cep = cepInput.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    cepInput.style.background = '#e0e7ef';

    try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (data.erro) throw new Error('CEP não encontrado');

        document.getElementById('cad-logradouro').value = data.logradouro || '';
        document.getElementById('cad-bairro').value = data.bairro || '';
        document.getElementById('cad-cidade').value = data.localidade || '';
        document.getElementById('cad-estado').value = data.uf || '';

        // Foco automático no número
        setTimeout(() => {
            document.getElementById('cad-numero').focus();
        }, 100);
    } catch {
        Swal.fire({
            icon: 'warning',
            title: 'CEP inválido!',
            text: 'Não foi possível encontrar o endereço para este CEP',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        document.getElementById('cad-logradouro').value = '';
        document.getElementById('cad-bairro').value = '';
        document.getElementById('cad-cidade').value = '';
        document.getElementById('cad-estado').value = '';
    } finally {
        cepInput.style.background = '';
    }
}

document.getElementById('edit-cep').addEventListener('blur', async function() {
    const cep = this.value.replace(/\D/g, '');
    if (cep.length !== 8) return;
    this.style.background = '#e0e7ef';
    try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (data.erro) throw new Error('CEP não encontrado');
        document.getElementById('edit-logradouro').value = data.logradouro || '';
        document.getElementById('edit-bairro').value = data.bairro || '';
        document.getElementById('edit-cidade').value = data.localidade || '';
        document.getElementById('edit-estado').value = data.uf || '';
        setTimeout(() => {
            document.getElementById('edit-numero').focus();
        }, 100);
    } catch {
        Swal.fire({
            icon: 'warning',
            title: 'CEP inválido!',
            text: 'Não foi possível encontrar o endereço para este CEP',
            timer: 1500,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        document.getElementById('edit-logradouro').value = '';
        document.getElementById('edit-bairro').value = '';
        document.getElementById('edit-cidade').value = '';
        document.getElementById('edit-estado').value = '';
    } finally {
        this.style.background = '';
    }
});

function atualizarContadorEtapaFornecedor(etapa) {
    const total = 4;
    const percent = etapa / total;
    const graus = percent * 360;
    const contador = document.querySelector('.etapa-contador');
    const texto = document.getElementById('etapa-contador-text');
    if (contador) {
        contador.style.background = `conic-gradient(
            #1e94a3 0deg ${graus}deg,
            #e0e0e0 ${graus}deg 360deg
        )`;
        if (etapa === 4) {
            contador.style.margin = '0';
        } else {
            contador.style.margin = '';
        }
    }
    if (texto) {
        texto.textContent = `${etapa}/${total}`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('cad-observacoes');
    const contador = document.getElementById('contador-observacoes');
    if (textarea && contador) {
        const max = textarea.maxLength || 200;
        contador.textContent = `${textarea.value.length}/${max}`;
        textarea.addEventListener('input', function() {
            contador.textContent = `${this.value.length}/${max}`;
        });
    }
});

function showCheckboxesCategoriaMultiFiltro() {
    const checkboxes = document.getElementById("checkboxes-categoria-multi-filtro");
    checkboxes.style.display = checkboxes.style.display === 'block' ? 'none' : 'block';
}
document.getElementById('filter-categoria').addEventListener('click', showCheckboxesCategoriaMultiFiltro);
document.addEventListener('mousedown', function(e) {
    const checkboxes = document.getElementById("checkboxes-categoria-multi-filtro");
    if (checkboxes && !checkboxes.contains(e.target) && e.target.id !== 'filter-categoria') {
        checkboxes.style.display = 'none';
    }
});

function atualizarPlaceholderCategoriaMulti() {
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check-filtro'));
    const todas = checks[0];
    const input = document.getElementById('filter-categoria');
    const chevron = input.parentNode.querySelector('.chevron-categoria');
    const individuais = checks.slice(1);
    const selecionados = individuais.filter(cb => cb.checked).map(cb => cb.parentNode.textContent.trim());
    let ativo = selecionados.length > 0;

    input.value = selecionados.length === 0 ? 'Selecionar' : selecionados.join(', ');

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
document.querySelectorAll('.categoria-multi-check-filtro').forEach(cb => {
    cb.addEventListener('change', atualizarPlaceholderCategoriaMulti);
});
atualizarPlaceholderCategoriaMulti();

document.getElementById('busca-fornecedor').addEventListener('input', filtrarFornecedores);
document.getElementById('filter-cnpj').addEventListener('input', filtrarFornecedores);
document.querySelectorAll('.categoria-multi-check-filtro').forEach(cb => {
    cb.addEventListener('change', filtrarFornecedores);
});

const todasFiltro = document.getElementById('categoria-multi-todas-filtro');
const checksFiltro = Array.from(document.querySelectorAll('.categoria-multi-check-filtro')).slice(1);

todasFiltro.addEventListener('change', function() {
    checksFiltro.forEach(cb => cb.checked = todasFiltro.checked);
    atualizarPlaceholderCategoriaMulti();
    filtrarFornecedores();
});

checksFiltro.forEach(cb => {
    cb.addEventListener('change', function() {
        todasFiltro.checked = checksFiltro.every(c => c.checked);
        atualizarPlaceholderCategoriaMulti();
        filtrarFornecedores();
    });
});


function atualizarEstiloCnpjFiltro() {
    const cnpjInput = document.getElementById('filter-cnpj');
    let ativo = !!cnpjInput.value.trim();
    if (ativo) {
        cnpjInput.style.border = '2px solid #1e94a3';
        cnpjInput.style.color = '#1e94a3';
    } else {
        cnpjInput.style.border = '';
        cnpjInput.style.color = '';
    }
}

document.getElementById('filter-cnpj').addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, '');
    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
    e.target.value = v.slice(0, 18);
});

document.getElementById('filter-cnpj').addEventListener('input', atualizarEstiloCnpjFiltro);
document.querySelectorAll('.categoria-multi-check-filtro').forEach(cb => {
    cb.addEventListener('change', atualizarPlaceholderCategoriaMulti);
});
document.addEventListener('DOMContentLoaded', function() {
    atualizarPlaceholderCategoriaMulti();
    atualizarEstiloCnpjFiltro();
});