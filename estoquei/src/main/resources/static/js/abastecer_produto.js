function formatarPrecoInput(input) {
    if (!input) return;
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 7) value = value.slice(0, 7);
        if (value.length > 0) {
            value = (parseInt(value) / 100).toFixed(2).replace('.', ',');
            e.target.value = 'R$' + value;
        } else {
            e.target.value = '';
        }
    });
}

window.addEventListener('DOMContentLoaded', function() {
    // Elementos principais
    const mainContainer = document.querySelector('.main-container');
    const movimentacaoPlaceholder = document.getElementById('movimentacao-placeholder');
    const quantidadeInput = document.getElementById('quantidade');
    const quantidadeAtualInput = document.getElementById('filter-quantidade');
    const quantidadeFinalInput = document.getElementById('quantidade-final');
    const detalhesLabel = document.querySelector('.filters-container h2[style*="Detalhes"]');
    const valorCompraDiv = document.getElementById('valor-compra').parentElement;
    const fornecedorDiv = document.getElementById('fornecedor').parentElement;

    // Formatação de preço
    formatarPrecoInput(document.getElementById('preco'));
    formatarPrecoInput(document.getElementById('valor-compra'));

    // Esconde main-container e movimentação ao carregar
    mainContainer.style.display = 'none';
    movimentacaoPlaceholder.innerHTML = '';

    // Cria aviso acima do campo quantidade-final (apenas uma vez)
    let avisoLimite = document.getElementById('aviso-limite');
    if (!avisoLimite) {
        avisoLimite = document.createElement('div');
        avisoLimite.id = 'aviso-limite';
        avisoLimite.style.color = 'red';
        avisoLimite.style.fontWeight = 'bold';
        avisoLimite.style.fontSize = '13px';
        avisoLimite.style.marginBottom = '2px';
        avisoLimite.style.display = 'none';
        const qtdFinalDiv = quantidadeFinalInput?.parentNode;
        if (qtdFinalDiv) {
            qtdFinalDiv.insertBefore(avisoLimite, qtdFinalDiv.firstChild);
        }
    }

    // Função para criar a div de movimentação
    function criarDivMovimentacao() {
        movimentacaoPlaceholder.innerHTML = `
            <div id="movimentacao-tipo-container" class="filters-container" style="display:flex;gap:20px;align-items:center;margin-bottom:10px;">
                <label style="font-weight:bold;">Tipo de Movimentação:</label>
                <label><input type="radio" name="tipo-movimentacao" value="ENTRADA"> Entrada</label>
                <label><input type="radio" name="tipo-movimentacao" value="SAIDA"> Saída</label>
            </div>
        `;
        // Adiciona listeners
        document.querySelectorAll('input[name="tipo-movimentacao"]').forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'ENTRADA') {
                    mainContainer.style.display = '';
                    detalhesLabel.textContent = 'Detalhes da Compra';
                    valorCompraDiv.style.display = '';
                    fornecedorDiv.style.display = '';
                    quantidadeInput.value = '';
                    quantidadeInput.max = 999;
                } else if (this.value === 'SAIDA') {
                    mainContainer.style.display = '';
                    detalhesLabel.textContent = 'Detalhes da Venda';
                    valorCompraDiv.style.display = 'none';
                    fornecedorDiv.style.display = 'none';
                    quantidadeInput.value = '';
                    quantidadeInput.max = quantidadeAtualInput.value;
                }
            });
        });
        // Esconde o form até escolher
        mainContainer.style.display = 'none';
    }

    // Chame essa função ao selecionar um produto
    function aoSelecionarProduto() {
        criarDivMovimentacao();
        mainContainer.style.display = 'none';
    }

    // Validação: quantidade não pode ser maior que a atual na saída
    quantidadeInput.addEventListener('input', function() {
        const tipo = document.querySelector('input[name="tipo-movimentacao"]:checked');
        if (tipo && tipo.value === 'SAIDA') {
            const max = parseInt(quantidadeAtualInput.value) || 0;
            if (parseInt(this.value) > max) this.value = max;
        }
        if (parseInt(this.value) > parseInt(this.max)) this.value = this.max;
    });

    // Limitar quantidade e quantidade-final a 999
    function limitarInput999(input) {
        input.addEventListener('input', function() {
            if (this.value.length > 3) this.value = this.value.slice(0, 3);
            if (parseInt(this.value) > 999) this.value = 999;
        });
    }
    if (quantidadeInput) limitarInput999(quantidadeInput);
    if (quantidadeFinalInput) limitarInput999(quantidadeFinalInput);

    // Atualizar quantidade final
    function atualizarQuantidadeFinal() {
        let atual = parseInt(quantidadeAtualInput.value) || 0;
        let maxPermitido = 999 - atual;
        if (maxPermitido < 0) maxPermitido = 0;

        let entrada = quantidadeInput.value.replace(/\D/g, '');
        if (entrada.length > 3) entrada = entrada.slice(0, 3);
        let entradaNum = parseInt(entrada) || 0;

        const tipo = document.querySelector('input[name="tipo-movimentacao"]:checked');
        if (tipo && tipo.value === 'SAIDA') {
            maxPermitido = atual;
            if (entradaNum > atual) entradaNum = atual;
            quantidadeFinalInput.value = atual - entradaNum;
        } else {
            if (entradaNum > maxPermitido) entradaNum = maxPermitido;
            quantidadeFinalInput.value = atual + entradaNum;
        }
        quantidadeInput.value = entradaNum > 0 ? entradaNum : '';
    }
    if (quantidadeInput && quantidadeFinalInput && quantidadeAtualInput) {
        quantidadeInput.addEventListener('input', atualizarQuantidadeFinal);
        quantidadeAtualInput.addEventListener('input', atualizarQuantidadeFinal);
    }

    // Exemplo de integração: se já tem produto selecionado na URL, já mostra a div
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('id')) {
        aoSelecionarProduto();
    }

    // Função para preencher os campos com um produto
    function preencherCampos(produto) {
        const precoFormatado = produto.preco !== undefined
            ? 'R$' + Number(produto.preco).toFixed(2).replace('.', ',')
            : '';
        const tamanhoExibido = exibirTamanho(produto.tamanho);
        const generoFormatado = produto.genero
            ? produto.genero.charAt(0).toUpperCase() + produto.genero.slice(1).toLowerCase()
            : '';
        const categoriaFormatada = produto.categoria
            ? produto.categoria.charAt(0).toUpperCase() + produto.categoria.slice(1).toLowerCase()
            : '';

        document.getElementById('filter-codigo').value = produto.codigo || '';
        document.getElementById('filter-nome').value = produto.nome || '';
        document.getElementById('filter-categoria').value = categoriaFormatada;
        document.getElementById('filter-tamanho').value = tamanhoExibido;
        document.getElementById('filter-genero').value = generoFormatado;
        document.getElementById('filter-quantidade').value = produto.quantidade || '';
        document.getElementById('filter-limite').value = produto.limiteMinimo || '';
        document.getElementById('filter-preco').value = precoFormatado;
        document.getElementById('quantidade-final').value = produto.quantidade || '';

        // Imagem
        const preview = document.getElementById('image-preview');
        if (preview) {
            Array.from(preview.childNodes).forEach(node => {
                if (node.tagName !== 'INPUT' && node.nodeType === Node.ELEMENT_NODE) {
                    preview.removeChild(node);
                }
            });
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
        }
        atualizarQuantidadeFinal();
    }

    // Função para mostrar o select e ocultar o input
    function mostrarSelectProdutos() {
        fetch('/produtos')
            .then(response => response.json())
            .then(produtos => {
                let selectProdutos = document.getElementById('select-produtos');
                if (!selectProdutos) {
                    selectProdutos = document.createElement('select');
                    selectProdutos.id = 'select-produtos';
                    selectProdutos.className = 'filter-select';
                    selectProdutos.innerHTML = '<option value="" disabled hidden selected>Selecionar Produto</option>';
                    produtos.forEach(prod => {
                        selectProdutos.innerHTML += `<option value="${prod.id}">${prod.codigo} - ${prod.nome}</option>`;
                    });

                    // Insere o select logo após o input
                    const codigoInput = document.getElementById('filter-codigo');
                    codigoInput.parentNode.insertBefore(selectProdutos, codigoInput.nextSibling);

                    // Evento: ao selecionar, atualiza a URL
                    selectProdutos.addEventListener('change', function() {
                        const id = this.value;
                        if (id) {
                            window.location.search = '?id=' + id;
                        }
                    });

                    // Evento: ao sair do select, volta o input de código
                    selectProdutos.addEventListener('blur', function() {
                        const codigoInput = document.getElementById('filter-codigo');
                        codigoInput.style.display = '';
                        selectProdutos.style.display = 'none';
                        codigoInput.focus();
                        const urlParams = new URLSearchParams(window.location.search);
                        if (!urlParams.get('id')) {
                            setTimeout(mostrarSelectProdutos, 100);
                        }
                    });

                    selectProdutos.addEventListener('mouseleave', function() {
                        const urlParams = new URLSearchParams(window.location.search);
                        if (urlParams.get('id')) {
                            const codigoInput = document.getElementById('filter-codigo');
                            codigoInput.style.display = '';
                            selectProdutos.style.display = 'none';
                            codigoInput.focus();
                        }
                    });
                } else {
                    selectProdutos.style.display = '';
                }
                document.getElementById('filter-codigo').style.display = 'none';
            });
    }

    // Mostra o select ao passar o mouse sobre o input de código
    const codigoInput = document.getElementById('filter-codigo');
    codigoInput.addEventListener('mouseover', function() {
        mostrarSelectProdutos();
    });

    // Quando recarregar a página (após selecionar), mostre o input normalmente
    window.addEventListener('DOMContentLoaded', function() {
        document.getElementById('filter-codigo').style.display = '';
        const selectProdutos = document.getElementById('select-produtos');
        if (selectProdutos) selectProdutos.style.display = 'none';
    });

    // Exemplo de integração: sempre que preencherCampos(produto) for chamado, chame aoSelecionarProduto()
    // function preencherCampos(produto) { ... aoSelecionarProduto(); ... }

    // Se já tem produto selecionado na URL, já mostra a div
    const urlParams2 = new URLSearchParams(window.location.search);
    if (urlParams2.get('id')) {
        aoSelecionarProduto();
    }
});

// Função utilitária
function exibirTamanho(tamanho) {
    if (tamanho === 'ÚNICO') return 'Único';
    if (typeof tamanho === 'string' && tamanho.startsWith('_')) return tamanho.substring(1);
    return tamanho;
}
