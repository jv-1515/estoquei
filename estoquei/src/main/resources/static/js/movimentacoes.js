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

// FUNÇÃO PARA APLICAR MÁSCARA DE DINHEIRO
function aplicarMascaraDinheiro(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length === 0) {
            e.target.value = '';
            return;
        }
        value = (parseInt(value) / 100).toFixed(2);
        e.target.value = 'R$ ' + value.replace('.', ',');
    });
}

function renderizarMovimentacoes(movimentacoes) {
    const tbody = document.getElementById('movimentacao-table-body');
    
    // Mostra o loading imediatamente - 13 COLUNAS AGORA
    tbody.innerHTML = `<tr style="background-color: #fff">
        <td colspan="13" style="text-align: center; padding: 10px; color: #888; font-size: 16px;">
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
        tbody.innerHTML = `<tr><td colspan="13" style="text-align: center; padding: 10px; color: #888; font-size: 16px; background-color: white">Nenhuma movimentação encontrada.</td></tr>`;
        document.getElementById('paginacao').innerHTML = '';
        return;
    }

    setTimeout(() => {
        tbody.innerHTML = ''; // Limpa o loading
        movimentacoesPagina.forEach(m => {
            const tipoClass = m.tipoMovimentacao === 'ENTRADA' ? 'tipo-entrada' : 'tipo-saida';
            const valorClass = m.tipoMovimentacao === 'ENTRADA' ? 'valor-positivo' : 'valor-negativo';
            const tamanhoExibido = exibirTamanho(m.tamanho);
            
            // Formata gênero e categoria
            const genero = m.genero ? m.genero.charAt(0).toUpperCase() + m.genero.slice(1).toLowerCase() : '';
            const categoria = m.categoria ? m.categoria.charAt(0).toUpperCase() + m.categoria.slice(1).toLowerCase() : '';
            
            const tipoTexto = m.tipoMovimentacao === 'ENTRADA' ? 'Entrada' : 'Saída';
            
            const rowHtml = `
                <tr>
                    <td style="padding-left:20px;">${formatarData(m.data)}</td>
                    <td>${m.codigoProduto}</td>
                    <td style="max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${m.nome}">${m.nome}</td>
                    <td class="categoria">${categoria}</td>
                    <td>${tamanhoExibido}</td>
                    <td class="genero">${genero}</td>
                    <td><span class="${tipoClass}">${tipoTexto}</span></td>
                    <td>${m.codigoMovimentacao || '-'}</td>
                    <td>${m.quantidadeMovimentada}</td>
                    <td>${m.estoqueFinal}</td>
                    <td class="${valorClass}">${formatarMoeda(m.valorMovimentacao)}</td>
                    <td style="max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${m.parteEnvolvida || '-'}">${m.parteEnvolvida || '-'}</td>
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

// FUNÇÃO PARA ABRIR EDIÇÃO DE MOVIMENTAÇÃO
function abrirEdicaoMovimentacao(id) {
    const movimentacao = movimentacoes.find(m => m.id === id);
    if (!movimentacao) return;

    // Busca os dados do produto para preencher todos os campos
    fetch(`/produtos/codigo/${movimentacao.codigoProduto}`)
        .then(response => response.json())
        .then(produto => {
            // Preenche campos do produto (readonly)
            document.getElementById('edit-codigo-produto').value = movimentacao.codigoProduto;
            document.getElementById('edit-nome-produto').value = movimentacao.nome;
            document.getElementById('edit-categoria').value = capitalizar(movimentacao.categoria);
            document.getElementById('edit-tamanho').value = exibirTamanho(movimentacao.tamanho);
            document.getElementById('edit-genero').value = capitalizar(movimentacao.genero);
            document.getElementById('edit-quantidade-atual').value = produto.quantidade || 0;
            document.getElementById('edit-limite-minimo').value = produto.limiteMinimo || 0;
            document.getElementById('edit-preco-produto').value = produto.preco ? formatarMoeda(produto.preco) : 'R$ 0,00';

            // Configura tipo de movimentação (disabled)
            if (movimentacao.tipoMovimentacao === 'ENTRADA') {
                document.getElementById('edit-tipo-entrada').checked = true;
                document.getElementById('edit-titulo-detalhes').textContent = 'Detalhes da Compra';
                document.getElementById('edit-label-valor').textContent = 'Valor da Compra (R$)*';
                document.getElementById('edit-label-parte-envolvida').textContent = 'Fornecedor*';
                document.getElementById('edit-label-data').textContent = 'Data da Compra*';
                document.getElementById('edit-btn-confirmar').textContent = 'Salvar Alterações - Entrada';
            } else {
                document.getElementById('edit-tipo-saida').checked = true;
                document.getElementById('edit-titulo-detalhes').textContent = 'Detalhes da Venda';
                document.getElementById('edit-label-valor').textContent = 'Valor da Venda (R$)*';
                document.getElementById('edit-label-parte-envolvida').textContent = 'Comprador*';
                document.getElementById('edit-label-data').textContent = 'Data da Venda*';
                document.getElementById('edit-btn-confirmar').textContent = 'Salvar Alterações - Saída';
            }

            // Preenche campos editáveis
            document.getElementById('edit-data').value = movimentacao.data;
            document.getElementById('edit-codigo-movimentacao').value = movimentacao.codigoMovimentacao || '';
            document.getElementById('edit-quantidade').value = movimentacao.quantidadeMovimentada;
            document.getElementById('edit-valor').value = formatarMoeda(movimentacao.valorMovimentacao);
            document.getElementById('edit-parte-envolvida').value = movimentacao.parteEnvolvida || '';
            document.getElementById('edit-estoque-final').value = movimentacao.estoqueFinal;

            // Imagem do produto
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

            // Aplica máscara de dinheiro
            const inputValor = document.getElementById('edit-valor');
            aplicarMascaraDinheiro(inputValor);

            // Armazena o ID e mostra o modal
            document.getElementById('editar-movimentacao').dataset.movimentacaoId = id;
            document.getElementById('editar-movimentacao').style.display = 'flex';
        })
        .catch(error => {
            console.error('Erro ao buscar produto:', error);
            Swal.fire('Erro!', 'Erro ao carregar dados do produto', 'error');
        });
}

// Função para capitalizar (adicione se não existir)
function capitalizar(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// FUNÇÃO PARA FECHAR EDIÇÃO
function fecharEdicaoMovimentacao() {
    document.getElementById('editar-movimentacao').style.display = 'none';
}

// FUNÇÃO PARA SALVAR EDIÇÃO
function salvarEdicaoMovimentacao() {
    const id = document.getElementById('editar-movimentacao').dataset.movimentacaoId;
    
    const dadosAtualizados = {
        data: document.getElementById('edit-data').value,
        codigoMovimentacao: document.getElementById('edit-codigo-movimentacao').value,
        quantidadeMovimentada: parseInt(document.getElementById('edit-quantidade').value),
        valorMovimentacao: parseFloat(document.getElementById('edit-valor').value.replace('R$', '').replace(',', '.').trim()),
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
            title: 'Sucesso!',
            text: 'Movimentação atualizada com sucesso!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
        
        fecharEdicaoMovimentacao();
        carregarMovimentacoes(); // Recarrega a lista
    })
    .catch(error => {
        Swal.fire({
            title: 'Erro!',
            text: 'Erro ao atualizar movimentação: ' + error.message,
            icon: 'error'
        });
    });
}

// FUNÇÃO PARA REMOVER MOVIMENTAÇÃO
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
                
                carregarMovimentacoes(); // Recarrega a lista
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
            
            // Ordena por data (mais recente primeiro) por padrão
            movimentacoes.sort((a, b) => {
                const dataA = new Date(a.data);
                const dataB = new Date(b.data);
                return dataB - dataA;
            });
            
            renderizarMovimentacoes(movimentacoes);
            atualizarDetalhesInfo(movimentacoes);
        })
        .catch(error => {
            console.error('Erro na API:', error);
            const tbody = document.getElementById('movimentacao-table-body');
            tbody.innerHTML = `<tr><td colspan="13" style="text-align: center; color: red; padding: 10px; font-size: 16px;">Erro ao carregar movimentações. Verifique o console.</td></tr>`;
        });
}

function atualizarDetalhesInfo(movimentacoes) {    
    Promise.all([
        fetch('/entradas/total-hoje?_t=' + Date.now()).then(r => r.json()),
        fetch('/saidas/total-hoje?_t=' + Date.now()).then(r => r.json())
    ]).then(([entradasHoje, saidasHoje]) => {
        const totalMovimentacoes = movimentacoes.length;
        
        // Atualiza a interface com os dados do backend
        document.getElementById('detalhe-total-movimentacoes').textContent = totalMovimentacoes;
        document.getElementById('detalhe-entradas-hoje').textContent = entradasHoje;
        document.getElementById('detalhe-saidas-hoje').textContent = saidasHoje;
        
    }).catch(error => {
        console.error('Erro ao carregar totais:', error);
        atualizarDetalhesInfoLocal(movimentacoes);
    });
}

function atualizarDetalhesInfoLocal(movimentacoes) {
    const hoje = new Date().toISOString().split('T')[0];
    const totalMovimentacoes = movimentacoes.length;
    const entradasHoje = movimentacoes.filter(m => m.data === hoje && m.tipoMovimentacao === 'ENTRADA').length;
    const saidasHoje = movimentacoes.filter(m => m.data === hoje && m.tipoMovimentacao === 'SAIDA').length;
    
    document.getElementById('detalhe-total-movimentacoes').textContent = totalMovimentacoes;
    document.getElementById('detalhe-entradas-hoje').textContent = entradasHoje;
    document.getElementById('detalhe-saidas-hoje').textContent = saidasHoje;
}

window.onload = function() {
    const select = document.getElementById('registros-select');
    carregarMovimentacoes(select.value);
    
    select.addEventListener('change', function() {
        itensPorPagina = this.value === "" ? movimentacoes.length : parseInt(this.value);
        paginaAtual = 1;
        renderizarMovimentacoes(movimentacoes);
    });

    // Ordenação - SEM AÇÕES NA ORDENAÇÃO
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

    // Botão detalhes
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
            btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-eye" style="margin-right:4px;"></i>Detalhes';
            btnExibirDetalhes.style.border = '';
            btnExibirDetalhes.style.background = '';
            btnExibirDetalhes.style.color = '';
        }
    });
};

// Atualiza sempre que volta para a página
window.addEventListener('pageshow', function() {
    carregarMovimentacoes();
});