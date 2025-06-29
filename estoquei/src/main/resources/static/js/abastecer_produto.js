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

// Capitaliza primeira letra
function capitalizar(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Exibe tamanho corretamente
function exibirTamanho(tamanho) {
    if (!tamanho) return '';
    if (tamanho === 'ÚNICO') return 'Único';
    if (typeof tamanho === 'string' && tamanho.startsWith('_')) return tamanho.substring(1);
    return tamanho;
}

window.addEventListener('DOMContentLoaded', function() {
    const movimentacaoPlaceholder = document.getElementById('movimentacao-placeholder');
    const mainContainerPlaceholder = document.getElementById('main-container-placeholder');
    const codigoInput = document.getElementById('filter-codigo');
    let produtoSelecionado = null;

    // 1. Sempre mostra o tipo de movimentação
    movimentacaoPlaceholder.innerHTML = `
        <div id="movimentacao-tipo-container" class="filters-container" style="display:flex;gap:5px;align-items:center;">
            <label style="font-weight:bold;">Tipo de Movimentação:</label>
            <label><input type="radio" name="tipo-movimentacao" value="ENTRADA"> Entrada</label>
            <label><input type="radio" name="tipo-movimentacao" value="SAIDA"> Saída</label>
        </div>
    `;

    // 2. Select de código ao passar mouse (AJAX, sem sobrescrever array)
    let selectProdutos = null;
    codigoInput.addEventListener('mouseover', function() {
        if (selectProdutos) {
            selectProdutos.style.display = '';
            codigoInput.style.display = 'none';
            return;
        }
        fetch('/produtos')
            .then(response => response.json())
            .then(produtos => {
                selectProdutos = document.createElement('select');
                selectProdutos.id = 'select-produtos';
                selectProdutos.className = 'filter-select';
                selectProdutos.innerHTML = '<option value="" disabled hidden selected>Selecionar Produto</option>';
                produtos.forEach(prod => {
                    selectProdutos.innerHTML += `<option value="${prod.id}" 
                        data-codigo="${prod.codigo}" 
                        data-nome="${prod.nome}" 
                        data-categoria="${prod.categoria}" 
                        data-tamanho="${prod.tamanho}" 
                        data-genero="${prod.genero}" 
                        data-quantidade="${prod.quantidade}" 
                        data-limite="${prod.limiteMinimo}" 
                        data-preco="${prod.preco}" 
                        data-url_imagem="${prod.url_imagem || ''}"
                    >${prod.codigo} - ${prod.nome}</option>`;
                });
                codigoInput.parentNode.insertBefore(selectProdutos, codigoInput.nextSibling);
                codigoInput.style.display = 'none';

                selectProdutos.addEventListener('change', function() {
                    const opt = this.selectedOptions[0];
                    if (!opt.value) return;
                    // Monta objeto produto a partir dos data-attributes
                    const produto = {
                        id: opt.value,
                        codigo: opt.dataset.codigo,
                        nome: opt.dataset.nome,
                        categoria: opt.dataset.categoria,
                        tamanho: opt.dataset.tamanho,
                        genero: opt.dataset.genero,
                        quantidade: opt.dataset.quantidade,
                        limiteMinimo: opt.dataset.limite,
                        preco: opt.dataset.preco,
                        url_imagem: opt.dataset.url_imagem
                    };
                    window.preencherCampos(produto);
                    selectProdutos.style.display = 'none';
                    codigoInput.style.display = '';
                });

                selectProdutos.addEventListener('blur', function() {
                    selectProdutos.style.display = 'none';
                    codigoInput.style.display = '';
                });
            });
    });

    // 3. Ao selecionar tipo, cria o main-container dinâmico
    document.querySelectorAll('input[name="tipo-movimentacao"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (!produtoSelecionado) {
                mainContainerPlaceholder.innerHTML = '';
                return;
            }
            criarMainContainer(this.value, produtoSelecionado);
        });
    });

    // 4. Função para criar o main-container dinâmico (mantendo layout e imagem)
    function criarMainContainer(tipo, produto) {
        mainContainerPlaceholder.innerHTML = `
            <div class="filters-container" style="align-items: center; justify-content: space-between; display: flex; margin: 0 auto 0 auto; border-radius: 10px 10px 0 0;padding: 10px 25px 10px 20px;">
            <h2 style="text-align: left; margin: 0; padding:10px 25px 0px 0px;">
            ${tipo === 'ENTRADA' ? 'Detalhes da Compra' : 'Detalhes da Venda'}
            </h2>
            </div>
            <form>
            <div class="main-container">
            <div class="form-column">
            <label for="codigo-compra">${tipo === 'ENTRADA' ? 'Código da Compra*:' : 'Código da Venda*:'}</label>
            <input type="text" id="codigo-compra" name="codigo-compra" required placeholder="000000000" maxlength="9" minlength="9" pattern="\\d{9}">
            ${tipo === 'ENTRADA' ? `
            <label for="valor-compra">Valor da Compra (R$)*:</label>
            <input type="text" id="valor-compra" name="valor-compra" required placeholder="R$10,00" min="1">
            <label for="fornecedor">Fornecedor*:</label>
            <input type="text" id="fornecedor" name="fornecedor" required placeholder="Fornecedor">
            ` : `
            <label for="valor-compra">Valor da Venda (R$)*:</label>
            <input type="text" id="valor-compra" name="valor-compra" required placeholder="R$10,00" min="1">
            <label for="comprador">Comprador*:</label>
            <input type="text" id="comprador" name="comprador" required placeholder="Comprador">
            `}
            <div style="display: flex; gap: 10px;">
            <div style="display: flex; flex-direction: column; flex: 3;">
                <label for="quantidade">Quantidade*:</label>
                <input type="number" id="quantidade" name="quantidade" required placeholder="10" min="1" max="999">
            </div>
            <div style="display: flex; flex-direction: column; flex: 2;">
                <label for="quantidade-final" style="font-weight: bold; color: #333;">Quantidade Final:</label>
                <input type="number" id="quantidade-final" name="quantidade-final" placeholder="100" readonly>
            </div>
            </div>
            <label for="data-compra">${tipo === 'ENTRADA' ? 'Data da Compra*:' : 'Data da Venda*:'}</label>
            <input type="date" id="data-compra" name="data-compra" required>
            <button type="submit">Confirmar ${tipo === 'ENTRADA' ? 'Abastecimento' : 'Saída'}</button>
            </div>
            <div class="right-column">
            <div id="image-preview" class="image-box" style="background-color: #f9f9f9; overflow: hidden; justify-content: center; align-items: center;">
            ${produto.url_imagem ? `<img src="${produto.url_imagem}" alt="Imagem do produto" style="max-width:100%;height:auto;">` : `<i class="fa-regular fa-image" style="font-size: 30px"></i>`}
            <input type="file" id="foto" name="foto" accept="image/*" style="display:none">
            </div>
            </div>
            </div>
            </form>
        `;

        // Lógica de quantidade e máscara de preço
        const quantidadeInput = document.getElementById('quantidade');
        const quantidadeFinalInput = document.getElementById('quantidade-final');
        const valorCompraInput = document.getElementById('valor-compra');
        if (valorCompraInput) formatarPrecoInput(valorCompraInput);

        quantidadeInput.addEventListener('input', function() {
            let atual = parseInt(produto.quantidade) || 0;
            let entradaNum = parseInt(quantidadeInput.value) || 0;
            if (tipo === 'SAIDA' && entradaNum > atual) {
                quantidadeInput.value = atual;
                entradaNum = atual;
            }
            quantidadeFinalInput.value = tipo === 'SAIDA'
                ? atual - entradaNum
                : atual + entradaNum;
        });
    }

    // 5. Função para preencher os campos do produto (chame ao selecionar produto)
    window.preencherCampos = function(produto) {
        produtoSelecionado = produto;
        // Preencha os campos do filtro com capitalização correta
        document.getElementById('filter-codigo').value = produto.codigo || '';
        document.getElementById('filter-nome').value = produto.nome || '';
        document.getElementById('filter-categoria').value = capitalizar(produto.categoria);
        document.getElementById('filter-tamanho').value = exibirTamanho(produto.tamanho);
        document.getElementById('filter-genero').value = capitalizar(produto.genero);
        document.getElementById('filter-quantidade').value = produto.quantidade || '';
        document.getElementById('filter-limite').value = produto.limiteMinimo || '';
        document.getElementById('filter-preco').value = produto.preco || '';
        document.getElementById('quantidade-final').value = produto.quantidade || '';

        // Limpa main-container e tipo de movimentação
        mainContainerPlaceholder.innerHTML = '';
        document.querySelectorAll('input[name="tipo-movimentacao"]').forEach(r => r.checked = false);
    };

    // Máscara de preço para filtros
    formatarPrecoInput(document.getElementById('filter-preco'));
});
