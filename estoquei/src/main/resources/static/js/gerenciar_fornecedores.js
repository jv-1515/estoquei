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
                        onclick="abrirDetalhesFornecedor('${f.id}')"
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
    document.body.style.overflow = 'hidden';
    mostrarEtapaCadastroFornecedor();
    limparFormularioCadastroFornecedor();
    atualizarAvatarFornecedor();
    atualizarCategoriasInput();
}

function fecharCadastroFornecedor() {
    //na etapa um se tiver algo valida, se nao ja fecha
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
        confirmButtonText: 'Sim, descartar',
        cancelButtonText: 'Não, voltar'
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

document.getElementById('cad-telefone').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
});

document.getElementById('cad-cep').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').slice(0, 8);
});

document.getElementById('cad-inscricao-estadual').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
});

document.getElementById('cad-cidade').addEventListener('input', function() {
    this.value = this.value.replace(/[\d]/g, '');
});

document.getElementById('cad-numero').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
});


// ===== Máscaras/validações CNPJ e Telefone =====
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

// Troca listener do telefone (com máscara)
document.getElementById('cad-telefone').removeEventListener?.('input', () => {});
document.getElementById('cad-telefone').addEventListener('input', function () {
    this.value = aplicarMascaraTelefone(this.value);
});

// Máscara do CNPJ + validação ao sair do campo
document.getElementById('cad-cnpj').addEventListener('input', function () {
    this.value = aplicarMascaraCNPJ(this.value);
});
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