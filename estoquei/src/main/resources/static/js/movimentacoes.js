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
    const btn = document.getElementById('btn-topo');
    if (btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
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
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length === 0) {
            e.target.value = '';
            return;
        }
        value = (parseInt(value) / 100).toFixed(2);
        e.target.value = value.replace('.', ',');
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
            const valorClass = m.tipoMovimentacao === 'ENTRADA' ? 'valor-positivo' : 'valor-negativo';
            const tamanhoExibido = exibirTamanho(m.tamanho);
            
            const genero = m.genero ? m.genero.charAt(0).toUpperCase() + m.genero.slice(1).toLowerCase() : '';
            const categoria = m.categoria ? m.categoria.charAt(0).toUpperCase() + m.categoria.slice(1).toLowerCase() : '';
            
            const tipoTexto = m.tipoMovimentacao === 'ENTRADA' ? 'Entrada' : 'Saída';
            
            const valorFormatado = m.valorMovimentacao ? 
                new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(m.valorMovimentacao) : 
                '0,00';
            
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
                    <td class="${valorClass}">${valorFormatado}</td>
                    <td style="max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${m.parteEnvolvida || '-'}">${m.parteEnvolvida || '-'}</td>
                    <td>${m.responsavel || '-'}</td>
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

            document.getElementById('editar-movimentacao').dataset.movimentacaoId = id;
            document.getElementById('editar-movimentacao').style.display = 'flex';
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
}

function salvarEdicaoMovimentacao() {
    const btnConfirmar = document.getElementById('edit-btn-confirmar');
    const textoOriginal = btnConfirmar.textContent;
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = 'Salvando <i class="fa-solid fa-spinner fa-spin"></i>';

    Swal.fire({
        title: 'Tem certeza?',
        text: 'As alterações não poderão ser desfeitas.',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        allowOutsideClick: false,
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom'
        }
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
                    title: "Alterações salvas!",
                    icon: "success",
                    showCloseButton: true,
                    showCancelButton: true,
                    showConfirmButton: true,
                    confirmButtonText: 'Visualizar Movimentações',
                    cancelButtonText: 'Voltar para Início',
                    allowOutsideClick: false,
                    customClass: {
                        confirmButton: 'swal2-confirm-custom',
                        cancelButton: 'swal2-cancel-custom'
                    }
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
                    text: error.message || 'Não foi possível salvar as alterações.',
                    icon: 'error',
                    confirmButtonColor: '#1E94A3'
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
        confirmButtonColor: '#d33',
        cancelButtonColor: '#1E94A3',
        confirmButtonText: 'Remover',
        cancelButtonText: 'Cancelar'
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
                    showConfirmButton: false
                });
                
                carregarMovimentacoes();
            })
            .catch(error => {
                Swal.fire({
                    title: 'Erro!',
                    text: 'Erro ao remover movimentação: ' + error.message,
                    icon: 'error'
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