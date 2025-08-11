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
    // Botão topo
    const btn = document.getElementById('btn-topo');
    if (btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Filtros
    const buscaInput = document.getElementById('busca-movimentacao');
    const codigoMovInput = document.getElementById('filter-codigo-mov');
    const tipoMovInput = document.getElementById('filter-tipo-mov');
    const parteEnvolvidaInput = document.getElementById('filter-parte-envolvida');
    const btnLimpar = document.getElementById('btn-limpar-filtros');

    // PERÍODO
    const periodoInput = document.getElementById('filter-periodo');
    const periodoPopup = document.getElementById('periodo-popup');
    const dataInicio = document.getElementById('periodo-data-inicio');
    const dataFim = document.getElementById('periodo-data-fim');

    // Abre popup ao clicar no input
    periodoInput.addEventListener('click', function(e) {
        periodoPopup.style.display = 'block';
        dataInicio.focus();
        e.stopPropagation();
    });

    // Fecha popup ao clicar fora e atualiza placeholder/cor
document.addEventListener('mousedown', function(e) {
    function formatarDataBR(data) {
        if (!data) return '';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }
    let ativo = false;
    if (dataInicio.value && dataFim.value) {
        periodoInput.value = `${formatarDataBR(dataInicio.value)} - ${formatarDataBR(dataFim.value)}`;
        ativo = true;
    } else if (dataInicio.value) {
        periodoInput.value = `${formatarDataBR(dataInicio.value)}`;
        ativo = true;
    } else if (dataFim.value) {
        periodoInput.value = `${formatarDataBR(dataFim.value)}`;
        ativo = true;
    } else {
        periodoInput.value = '';
        ativo = false;
    }
    if (!periodoPopup.contains(e.target) && e.target !== periodoInput) {
        periodoPopup.style.display = 'none';
    }
    const chevron = periodoInput.parentNode.querySelector('.chevron-periodo');
    if (ativo) {
        periodoInput.style.border = '2px solid #1e94a3';
        periodoInput.style.color = '#1e94a3';
        if (chevron) chevron.style.color = '#1e94a3';
    } else {
        periodoInput.style.border = '';
        periodoInput.style.color = '';
        if (chevron) chevron.style.color = '#888';
    }
    filtrarMovimentacoes();
});
    // Validação: fim sem início
    dataInicio.addEventListener('change', function() {
        if (dataFim.value && !dataInicio.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Selecione a data de início!',
                text: 'Para filtrar por período, informe a data de início.',
                timer: 1800,
                showConfirmButton: false
            });
            dataFim.value = '';
        }
    });
    dataFim.addEventListener('change', function() {
        if (dataFim.value && !dataInicio.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Selecione a data de início!',
                text: 'Para filtrar por período, informe a data de início.',
                timer: 1800,
                showConfirmButton: false
            });
            dataFim.value = '';
        }
    });

    // Sugestões (igual estoque)
    buscaInput.addEventListener('input', function() {
        filtrarMovimentacoes();
    });

    codigoMovInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 9);
        filtrarMovimentacoes();
    });

    parteEnvolvidaInput.addEventListener('input', filtrarMovimentacoes);

    btnLimpar.addEventListener('click', function() {
        buscaInput.value = '';
        codigoMovInput.value = '';
        tipoMovInput.value = '';
        parteEnvolvidaInput.value = '';
        // Limpa o período
        dataInicio.value = '';
        dataFim.value = '';
        periodoInput.value = '';
        // Remove borda/cor do período
        periodoInput.style.border = '';
        periodoInput.style.color = '';
        const chevron = periodoInput.parentNode.querySelector('.chevron-periodo');
        if (chevron) chevron.style.color = '#888';
        // Limpa checkboxes de movimentação (marca "Todas")
        const todas = document.getElementById('tipo-mov-todas');
        const checks = document.querySelectorAll('.tipo-mov-check');
        if (todas && checks.length) {
            todas.checked = true;
            checks.forEach(cb => cb.checked = true);
            atualizarPlaceholderTipoMov();
        }
        filtrarMovimentacoes();
    });
});

// Função filtro simples
function filtrarMovimentacoes() {
    const termo = document.getElementById('busca-movimentacao').value.trim().toLowerCase();
    const codigoMov = document.getElementById('filter-codigo-mov').value.trim();
    const dataInicio = document.getElementById('periodo-data-inicio').value;
    const dataFim = document.getElementById('periodo-data-fim').value;
    const parte = document.getElementById('filter-parte-envolvida').value.trim().toLowerCase();

    let filtradas = movimentacoes.filter(m => {
        let ok = true;
        // Nome ou código do produto
        if (termo && !(m.nome.toLowerCase().includes(termo) || (m.codigoProduto && m.codigoProduto.toString().includes(termo)))) ok = false;
        // Código da movimentação
        if (codigoMov && (!m.codigoMovimentacao || !m.codigoMovimentacao.toString().includes(codigoMov))) ok = false;
        // Data
        if (dataInicio && dataFim) {
            if (m.data < dataInicio || m.data > dataFim) ok = false;
        } else if (dataInicio) {
            if (m.data < dataInicio) ok = false;
        } else if (dataFim) {
            if (m.data > dataFim) ok = false;
        }
        // Tipo
        const tiposSelecionados = getTiposSelecionados();
        if (tiposSelecionados.length && !tiposSelecionados.includes(m.tipoMovimentacao)) ok = false;
        // Parte envolvida
        if (parte && (!m.parteEnvolvida || !m.parteEnvolvida.toLowerCase().includes(parte))) ok = false;
        return ok;
    });

    paginaAtual = 1;
    renderizarMovimentacoes(filtradas);
}


// Função tipo de movimentação
window.expandedTipoMov = false;
function showCheckboxesTipoMov() {
    var checkboxes = document.getElementById("checkboxes-tipo-mov");
    if (!window.expandedTipoMov) {
        checkboxes.style.display = "block";
        window.expandedTipoMov = true;
    } else {
        checkboxes.style.display = "none";
        window.expandedTipoMov = false;
        atualizarPlaceholderTipoMov();
        filtrarMovimentacoes();
    }
}

// Lógica de seleção "Todas"
function marcarOuDesmarcarTodosTipos() {
    const todas = document.getElementById('tipo-mov-todas');
    const checks = document.querySelectorAll('.tipo-mov-check');
    checks.forEach(cb => cb.checked = todas.checked);
    atualizarPlaceholderTipoMov();
    filtrarMovimentacoes();
}

// Atualiza "Todas" se ambos individuais marcados
document.addEventListener('DOMContentLoaded', function() {
    const checks = Array.from(document.querySelectorAll('.tipo-mov-check'));
    const todas = document.getElementById('tipo-mov-todas');
    checks.slice(1).forEach(cb => {
        cb.addEventListener('change', function() {
            todas.checked = checks.slice(1).every(c => c.checked);
            atualizarPlaceholderTipoMov();
            filtrarMovimentacoes();
        });
    });
    atualizarPlaceholderTipoMov();
});

// Atualiza placeholder do input
function atualizarPlaceholderTipoMov() {
    const checks = Array.from(document.querySelectorAll('.tipo-mov-check'));
    const todas = document.getElementById('tipo-mov-todas');
    const input = document.getElementById('filter-tipo-mov');
    const selecionados = checks.slice(1).filter(cb => cb.checked).map(cb => cb.parentNode.textContent.trim());
    todas.checked = checks.slice(1).every(cb => cb.checked);

    let texto = 'Todas';
    let ativo = true;
    if (selecionados.length === 0 || todas.checked) {
        texto = 'Todas';
        ativo = false;
    } else if (selecionados.length === 1) {
        texto = selecionados[0];
        ativo = true;
    } else {
        texto = selecionados.join(', ');
        ativo = true;
    }
    input.value = texto;
    input.style.border = ativo ? '2px solid #1e94a3' : '';
    input.style.color = ativo ? '#1e94a3' : '';
    const chevron = input.parentNode.querySelector('.chevron-tipo');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';
}

// Função para pegar tipos selecionados
function getTiposSelecionados() {
    const checks = Array.from(document.querySelectorAll('.tipo-mov-check'));
    const todas = document.getElementById('tipo-mov-todas');
    if (todas.checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
}

document.addEventListener('mousedown', function(e) {
    var checkboxes = document.getElementById("checkboxes-tipo-mov");
    var overSelect = document.querySelector('.multiselect-tipo .overSelect');
    if (
        window.expandedTipoMov &&
        checkboxes &&
        !checkboxes.contains(e.target) &&
        (!overSelect || !overSelect.contains(e.target))
    ) {
        checkboxes.style.display = "none";
        window.expandedTipoMov = false;
        atualizarPlaceholderTipoMov();
        filtrarMovimentacoes();
    }
});

//var global e controle de paginação
let movimentacoes = [];
let paginaAtual = 1;
let itensPorPagina = 10;

// Formatação de data
function formatarData(data) {
    if (!data) return '-';
    const dataObj = new Date(data + 'T00:00:00');
    const dia = dataObj.getDate().toString().padStart(2, '0');
    const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Formatação de moeda
function formatarMoeda(valor) {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Exibir tamanho
function exibirTamanho(tamanho) {
    if (tamanho === 'ÚNICO') return 'Único';
    if (typeof tamanho === 'string' && tamanho.startsWith('_')) return tamanho.substring(1);
    return tamanho;
}

function aplicarMascaraDinheiro(input) {
    if (!input) return;
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length > 0) {
            let floatValue = (parseInt(value) / 100).toFixed(2);

            let partes = floatValue.split('.');
            let inteiro = partes[0];
            let decimal = partes[1];
            inteiro = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            e.target.value = 'R$ ' + inteiro + ',' + decimal;
        } else {
            e.target.value = '';
        }
    });
}

function renderizarMovimentacoes(movimentacoes) {
    const tbody = document.getElementById('movimentacao-table-body');
    
    tbody.innerHTML = `<tr style="background-color: #fff">
        <td colspan="14" style="text-align: center; padding: 10px; color: #888; font-size: 16px;">
            <span id="loading-spinner" style="display: inline-block; vertical-align: middle;">
                <i class="fa fa-spinner fa-spin" style="font-size: 20px; margin-right: 8px;"></i>
            </span>
            <span id="loading-text">Carregando movimentações</span>
        </td>
    </tr>`;

    const select = document.getElementById('registros-select');
    itensPorPagina = select.value === "" ? movimentacoes.length : parseInt(select.value);

    const totalPaginas = Math.ceil(movimentacoes.length / itensPorPagina);
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const movimentacoesPagina = movimentacoes.slice(inicio, fim);

    if (movimentacoesPagina.length === 0) {
        tbody.innerHTML = `<tr><td colspan="14" style="text-align: center; padding: 10px; color: #888; font-size: 16px; background-color: white">Nenhuma movimentação encontrada.</td></tr>`;
        document.getElementById('paginacao').innerHTML = '';
        return;
    }

    setTimeout(() => {
        tbody.innerHTML = '';
        movimentacoesPagina.forEach(m => {
            const tipoClass = m.tipoMovimentacao === 'ENTRADA' ? 'tipo-entrada' : 'tipo-saida';
            const tamanhoExibido = exibirTamanho(m.tamanho);
            
            const genero = m.genero ? m.genero.charAt(0).toUpperCase() + m.genero.slice(1).toLowerCase() : '';
            const categoria = m.categoria ? m.categoria.charAt(0).toUpperCase() + m.categoria.slice(1).toLowerCase() : '';
            
            const tipoTexto = m.tipoMovimentacao === 'ENTRADA' ? 'Entrada' : 'Saída';
            
            const valorFormatado = m.valorMovimentacao ? 
                new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(m.valorMovimentacao) : 
                '0,00';
            
            const responsavelHtml = m.responsavel
                ? `<td style="text-align:left;">${m.responsavel}</td>`
                : `<td>${m.responsavel || '-'}</td>`;

            const rowHtml = `
                <tr>
                    <td style="padding-left:10px;">${formatarData(m.data)}</td>
                    <td>${m.codigoProduto}</td>
                    <td style="max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${m.nome}">${m.nome}</td>
                    <td class="categoria">${categoria}</td>
                    <td>${tamanhoExibido}</td>
                    <td class="genero">${genero}</td>
                    <td><span class="${tipoClass}">${tipoTexto}</span></td>
                    <td>${m.codigoMovimentacao || '-'}</td>
                    <td>${m.quantidadeMovimentada}</td>
                    <td>${m.estoqueFinal}</td>
                    <td>${valorFormatado}</td>
                    <td style="max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${m.parteEnvolvida || '-'}">${m.parteEnvolvida || '-'}</td>
                    ${responsavelHtml}
                    <td style="width:35px; max-width: 35px; padding-right:20px" class="actions">
                        <button type="button" onclick="abrirEdicaoMovimentacao(${m.id})" title="Editar" style="background:none; border:none; cursor:pointer;">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button type="button" onclick="removerMovimentacao(${m.id})" title="Excluir" style="background:none; border:none; cursor:pointer;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += rowHtml;
        });

        renderizarPaginacao(totalPaginas);
    }, 300);
}

function abrirEdicaoMovimentacao(id) {
    const movimentacao = movimentacoes.find(m => m.id === id);
    if (!movimentacao) return;

    fetch(`/produtos/codigo/${movimentacao.codigoProduto}`)
        .then(response => response.json())
        .then(produto => {
            if (movimentacao.tipoMovimentacao === 'ENTRADA') {
                document.getElementById('edit-label-valor').textContent = 'Valor da Compra (R$)*';
                document.getElementById('edit-label-parte-envolvida').textContent = 'Fornecedor*';
                document.getElementById('edit-label-data').textContent = 'Data da Compra*';
            } else {
                document.getElementById('edit-label-valor').textContent = 'Valor da Venda (R$)*';
                document.getElementById('edit-label-parte-envolvida').textContent = 'Comprador*';
                document.getElementById('edit-label-data').textContent = 'Data da Venda*';
            }

            document.getElementById('edit-data').value = movimentacao.data;
            document.getElementById('edit-codigo-movimentacao').value = movimentacao.codigoMovimentacao || '';
            document.getElementById('edit-quantidade').value = movimentacao.quantidadeMovimentada;
            document.getElementById('edit-valor').value = formatarMoeda(movimentacao.valorMovimentacao);
            document.getElementById('edit-parte-envolvida').value = movimentacao.parteEnvolvida || '';
            document.getElementById('edit-estoque-final').value = movimentacao.estoqueFinal;

            const preview = document.getElementById('edit-image-preview');
            preview.innerHTML = '';
            if (produto.url_imagem) {
                const img = document.createElement('img');
                img.src = produto.url_imagem;
                img.alt = 'Imagem do produto';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                preview.appendChild(img);
            } else {
                const icon = document.createElement('i');
                icon.className = 'fa-regular fa-image';
                icon.style.fontSize = '30px';
                preview.appendChild(icon);
            }

            const inputValor = document.getElementById('edit-valor');
            aplicarMascaraDinheiro(inputValor);

            const inputQuantidade = document.getElementById('edit-quantidade');
            if (inputQuantidade) {
                inputQuantidade.addEventListener('input', function() {
                    if (this.value.length > 3) this.value = this.value.slice(0, 3);
                    if (this.value > 999) this.value = 999;
                });
            }

            aplicarEstiloInputsMovimentacao();
            document.getElementById('editar-movimentacao').dataset.movimentacaoId = id;
            document.getElementById('editar-movimentacao').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        })
        .catch(error => {
            console.error('Erro ao buscar produto:', error);
            Swal.fire('Erro!', 'Erro ao carregar dados do produto', 'error');
        });
}

function capitalizar(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function fecharEdicaoMovimentacao() {
    document.getElementById('editar-movimentacao').style.display = 'none';
    document.body.style.overflow = '';
}

function salvarEdicaoMovimentacao() {
    if (!validarDataEdicaoMovimentacao()) return;
    const btnConfirmar = document.getElementById('edit-btn-confirmar');
    const textoOriginal = btnConfirmar.textContent;
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = 'Salvando <i class="fa-solid fa-spinner fa-spin"></i>';

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
            const id = document.getElementById('editar-movimentacao').dataset.movimentacaoId;
            
            const dadosAtualizados = {
                data: document.getElementById('edit-data').value,
                codigoMovimentacao: document.getElementById('edit-codigo-movimentacao').value,
                quantidadeMovimentada: parseInt(document.getElementById('edit-quantidade').value),
                valorMovimentacao: parseFloat(document.getElementById('edit-valor').value.replace('R$ ', '').replace('.', '').replace(',', '.').trim()),
                parteEnvolvida: document.getElementById('edit-parte-envolvida').value
            };

            fetch(`/api/movimentacoes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosAtualizados)
            })
            .then(response => {
                if (!response.ok) throw new Error('Erro ao atualizar movimentação');
                return response.json();
            })
            .then(data => {
                Swal.fire({
                    title: "Sucesso",
                    text: "Alterações salvas!",
                    icon: "success",
                    timer: 1500,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                }).then((result) => {
                    btnConfirmar.disabled = false;
                    btnConfirmar.textContent = textoOriginal;
                    
                    fecharEdicaoMovimentacao();
                    carregarMovimentacoes();
                    
                    if (result.isConfirmed) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        window.location.href = "/inicio";
                    }
                });
            })
            .catch(error => {
                console.error('Erro ao salvar alterações:', error);
                Swal.fire({
                    title: 'Erro!',
                    text: error.message || 'Não foi possível salvar as alterações',
                    icon: 'error',
                    timer: 1500,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    allowOutsideClick: false
                });
                
                btnConfirmar.disabled = false;
                btnConfirmar.textContent = textoOriginal;
            });
        } else {
            btnConfirmar.disabled = false;
            btnConfirmar.textContent = textoOriginal;
        }
    });
}

function removerMovimentacao(id) {
    Swal.fire({
        title: 'Tem certeza?',
        text: 'Esta ação não poderá ser desfeita.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Remover',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'swal2-remove-custom',
            cancelButton: 'swal2-cancel-custom'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/api/movimentacoes/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) throw new Error('Erro ao remover movimentação');
                
                Swal.fire({
                    title: 'Removido!',
                    text: 'Movimentação removida com sucesso.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    allowOutsideClick: false
                });
                carregarMovimentacoes();
            })
            .catch(error => {
                Swal.fire({
                    title: 'Erro!',
                    text: 'Erro ao remover movimentação: ' + error.message,
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    allowOutsideClick: false
                });
            });
        }
    });
}

function renderizarPaginacao(totalPaginas) {
    const paginacaoDiv = document.getElementById('paginacao');
    paginacaoDiv.innerHTML = '';
    if (totalPaginas <= 1) return;
    
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = (i === paginaAtual) ? 'pagina-ativa' : '';
        btn.onclick = function() {
            paginaAtual = i;
            renderizarMovimentacoes(movimentacoes);
        };
        paginacaoDiv.appendChild(btn);
    }
}

function carregarMovimentacoes(top) {
    let url = '/api/movimentacoes';
    if (top && top !== "") {
        url += `?top=${top}`;
    }
    
    url += (url.includes('?') ? '&' : '?') + '_t=' + Date.now();

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao buscar movimentações. Status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            movimentacoes = data;
            
            movimentacoes.sort((a, b) => {
                const dataA = new Date(a.data);
                const dataB = new Date(b.data);
                return dataB - dataA;
            });
            
            renderizarMovimentacoes(movimentacoes);
            atualizarDetalhesInfo(movimentacoes);
            atualizarCardsMovimentacoes(movimentacoes);
        })
        .catch(error => {
            console.error('Erro na API:', error);
            const tbody = document.getElementById('movimentacao-table-body');
            tbody.innerHTML = `<tr><td colspan="14" style="text-align: center; color: red; padding: 10px; font-size: 16px;">Erro ao carregar movimentações. Verifique o console.</td></tr>`;
        });
}

function atualizarDetalhesInfo(movimentacoes) {
    Promise.all([
        fetch('/produtos?_t=' + Date.now()).then(r => r.json()),
        fetch('/entradas/total-hoje?_t=' + Date.now()).then(r => r.json()),
        fetch('/saidas/total-hoje?_t=' + Date.now()).then(r => r.json())
    ]).then(([produtos, entradasHoje, saidasHoje]) => {
        
        const hoje = new Date().toISOString().split('T')[0];
        const totalMovimentacoes = movimentacoes.filter(m => m.data === hoje).length;
        const estoqueAtual = produtos.reduce((soma, p) => soma + (Number(p.quantidade) || 0), 0);
        const baixoEstoque = produtos.filter(p => (Number(p.quantidade) > 0) && (Number(p.quantidade) <= 2 * Number(p.limiteMinimo))).length;
        const zerados = produtos.filter(p => Number(p.quantidade) === 0).length;
        // const totalProdutos = produtos.length;
        
        document.getElementById('detalhe-total-movimentacoes').textContent = totalMovimentacoes;
        document.getElementById('detalhe-entradas-hoje').textContent = entradasHoje;
        document.getElementById('detalhe-saidas-hoje').textContent = saidasHoje;
        document.getElementById('detalhe-produtos-cadastrados').textContent = estoqueAtual;
        document.getElementById('detalhe-baixo-estoque').textContent = baixoEstoque;
        document.getElementById('detalhe-estoque-zerado').textContent = zerados;
        
    }).catch(error => {
        console.error('Erro ao carregar detalhes:', error);
        atualizarDetalhesInfoLocal(movimentacoes);
    });
}

function atualizarDetalhesInfoLocal(movimentacoes) {
    const hoje = new Date().toISOString().split('T')[0];
    const totalMovimentacoes = movimentacoes.filter(m => m.data === hoje).length;
    const entradasHoje = movimentacoes.filter(m => m.data === hoje && m.tipoMovimentacao === 'ENTRADA').length;
    const saidasHoje = movimentacoes.filter(m => m.data === hoje && m.tipoMovimentacao === 'SAIDA').length;
    
    document.getElementById('detalhe-total-movimentacoes').textContent = totalMovimentacoes;
    document.getElementById('detalhe-entradas-hoje').textContent = entradasHoje;
    document.getElementById('detalhe-saidas-hoje').textContent = saidasHoje;
}

const agora = new Date();
agora.setHours(agora.getHours() - 3);
const hoje = agora.toISOString().split('T')[0];

function atualizarCardsMovimentacoes(movimentacoes) {
    const categorias = ['CAMISA', 'CAMISETA', 'BERMUDA', 'CALÇA', 'SHORTS', 'SAPATO', 'MEIA'];
    const categoriasIds = ['camisa', 'camiseta', 'bermuda', 'calca', 'shorts', 'sapato', 'meia'];
    
    categorias.forEach((categoria, index) => {
        const entradasFiltradas = movimentacoes.filter(m => 
            m.categoria === categoria && 
            m.tipoMovimentacao === 'ENTRADA' &&
            m.data === hoje
        );
        
        const entradas = entradasFiltradas.reduce((sum, m) => sum + m.quantidadeMovimentada, 0);
        
        const saidasFiltradas = movimentacoes.filter(m => 
            m.categoria === categoria && 
            m.tipoMovimentacao === 'SAIDA' &&
            m.data === hoje
        );
        
        const saidas = saidasFiltradas.reduce((sum, m) => sum + m.quantidadeMovimentada, 0);
        
        const categoriaId = categoriasIds[index];
        const elementoEntradas = document.getElementById(`${categoriaId}-entradas`);
        const elementoSaidas = document.getElementById(`${categoriaId}-saidas`);
        
        if (elementoEntradas) {
            elementoEntradas.textContent = entradas;
        }
        
        if (elementoSaidas) {
            elementoSaidas.textContent = saidas;
        }
    });
    
    fetch('/produtos?_t=' + Date.now())
        .then(response => response.json())
        .then(produtos => {
            categorias.forEach((categoria, index) => {
                const estoqueAtual = produtos
                    .filter(p => p.categoria && p.categoria.toUpperCase() === categoria)
                    .reduce((soma, p) => soma + (Number(p.quantidade) || 0), 0);
                
                const categoriaId = categoriasIds[index];
                const elementoEstoque = document.getElementById(`${categoriaId}-estoque`);
                
                if (elementoEstoque) {
                    elementoEstoque.textContent = estoqueAtual;
                }
            });
        })
        .catch(error => {
            console.error('Erro ao buscar produtos para estoque:', error);
        });
}

window.onload = function() {
    const select = document.getElementById('registros-select');
    carregarMovimentacoes(select.value);
    
    select.addEventListener('change', function() {
        itensPorPagina = this.value === "" ? movimentacoes.length : parseInt(this.value);
        paginaAtual = 1;
        renderizarMovimentacoes(movimentacoes);
    });

    const campos = [
        'data', 'codigoProduto', 'nome', 'categoria', 'tamanho', 
        'genero', 'tipoMovimentacao', 'codigoMovimentacao', 
        'quantidadeMovimentada', 'estoqueFinal', 'valorMovimentacao', 'parteEnvolvida'
    ];
    
    let estadoOrdenacao = Array(campos.length).fill(true);
    
    document.querySelectorAll('th.ordenar').forEach((th, idx) => {
        const campo = campos[idx];
        const icon = th.querySelector('.sort-icon');
        
        th.addEventListener('mouseenter', function() {
            icon.style.display = 'inline-block';
        });
        
        th.addEventListener('mouseleave', function() {
            if (!th.classList.contains('sorted')) {
                icon.style.display = 'none';
            }
        });
        
        th.addEventListener('click', function() {
            document.querySelectorAll('th.ordenar').forEach(t => t.classList.remove('sorted'));
            th.classList.add('sorted');
            
            movimentacoes.sort((a, b) => {
                let valorA, valorB;
                
                if (campo === 'data') {
                    valorA = new Date(a[campo]);
                    valorB = new Date(b[campo]);
                    return estadoOrdenacao[idx] ? valorB - valorA : valorA - valorB;
                } else if (campo === 'quantidadeMovimentada' || campo === 'estoqueFinal' || campo === 'valorMovimentacao') {
                    valorA = Number(a[campo]) || 0;
                    valorB = Number(b[campo]) || 0;
                    return estadoOrdenacao[idx] ? valorB - valorA : valorA - valorB;
                } else {
                    valorA = (a[campo] || '').toString().toLowerCase();
                    valorB = (b[campo] || '').toString().toLowerCase();
                    return estadoOrdenacao[idx]
                        ? valorA.localeCompare(valorB, undefined, { numeric: true })
                        : valorB.localeCompare(valorA, undefined, { numeric: true });
                }
            });
            
            estadoOrdenacao[idx] = !estadoOrdenacao[idx];
            icon.innerHTML = estadoOrdenacao[idx]
                ? '<i class="fa-solid fa-arrow-down"></i>'
                : '<i class="fa-solid fa-arrow-up"></i>';
            
            renderizarMovimentacoes(movimentacoes);
            icon.style.display = 'inline-block';
        });
    });

    const btnExibirDetalhes = document.getElementById('btn-exibir-detalhes');
    const detalhesDiv = document.getElementById('detalhes-estoque');

    btnExibirDetalhes.addEventListener('click', function() {
        const estaVisivel = window.getComputedStyle(detalhesDiv).display !== 'none';
        if (estaVisivel) {
            detalhesDiv.style.display = 'none';
            btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-eye-slash" style="margin-right:4px;"></i>Detalhes';
            btnExibirDetalhes.style.border = '1px solid #1e94a3';
            btnExibirDetalhes.style.background = '#fff';
            btnExibirDetalhes.style.color = '#1e94a3';
        } else {
            detalhesDiv.style.display = 'flex';
            atualizarDetalhesInfo(movimentacoes);
            atualizarCardsMovimentacoes(movimentacoes);
            btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-eye" style="margin-right:4px;"></i>Detalhes';
            btnExibirDetalhes.style.border = '';
            btnExibirDetalhes.style.background = '';
            btnExibirDetalhes.style.color = '';
        }
    });
};

function validarDataEdicaoMovimentacao() {
    const hoje = new Date().toISOString().slice(0, 10);
    const dataInput = document.getElementById('edit-data');
    if (dataInput && dataInput.value && dataInput.value > hoje) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida',
            text: 'A data não pode ser posterior a hoje',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        dataInput.focus();
        return false;
    }
    return true;
}

function aplicarEstiloInputsMovimentacao() {
    const inputs = document.querySelectorAll('#editar-movimentacao input:not([readonly]), #editar-movimentacao select');
    inputs.forEach(input => {
        
        if (input.value.trim() === '') {
            input.style.backgroundColor = 'white';
        } else {
            input.style.backgroundColor = '#f1f1f1';
        }
        input.addEventListener('blur', () => {
            if (input.value.trim() === '') {
                input.style.backgroundColor = 'white';
            } else {
                input.style.backgroundColor = '#f1f1f1';
            }
        });
        input.addEventListener('focus', () => {
            input.style.backgroundColor = 'white';
        });
    });
}