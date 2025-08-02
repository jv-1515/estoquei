function formatarPrecoInput(input) {
    if (!input) return;
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length > 0) {
            let floatValue = (parseInt(value) / 100).toFixed(2);
            // Adiciona pontos para milhares
            let partes = floatValue.split('.');
            let inteiro = partes[0];
            let decimal = partes[1];
            inteiro = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            e.target.value = 'R$' + inteiro + ',' + decimal;
        } else {
            e.target.value = '';
        }
    });
}

// Crie o aviso acima do campo quantidade-final
function criarAvisoLimite() {
    let avisoLimite = document.createElement('div');
    avisoLimite.id = 'aviso-limite';
    avisoLimite.style.color = 'red';
    avisoLimite.style.fontWeight = 'bold';
    avisoLimite.style.fontSize = '13px';
    avisoLimite.style.marginBottom = '2px';
    avisoLimite.style.display = 'none';
    return avisoLimite;
}

function exibirTamanho(tamanho) {
    if (tamanho === 'ÚNICO') return 'Único';
    if (typeof tamanho === 'string' && tamanho.startsWith('_')) return tamanho.substring(1);
    return tamanho;
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
    // Pega o id da URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const mainContainerPlaceholder = document.getElementById('main-container-placeholder');
    const codigoInput = document.getElementById('filter-codigo');
    let selectProdutos = null;
    let produtoSelecionado = {};
    // Se não houver produto selecionado, mostra o select SEMPRE e oculta o input
    // (não adiciona blur nem lógica para esconder o select)

    // Função para criar o main-container
    function criarMainContainer(tipo, produto) {
        // Determina o max do input de quantidade
        let maxQuantidade = 999;
        let qtdAtual = 0;
        if (produto && produto.quantidade) {
            qtdAtual = parseInt(produto.quantidade) || 0;
        }
        if (tipo === 'SAIDA') {
            maxQuantidade = qtdAtual;
        }
        mainContainerPlaceholder.innerHTML = `
            <form id="movimentacao-form">
            <div class="main-container">
            <div class="form-column">
            <label for="codigo-compra">${tipo === 'ENTRADA' ? 'Código da Compra*' : 'Código da Venda*'}</label>
            <input type="text" id="${tipo === 'ENTRADA' ? 'codigo-compra' : 'codigo-venda'}" name="${tipo === 'ENTRADA' ? 'codigo-compra' : 'codigo-venda'}" required placeholder="000000000" maxlength="9" minlength="9" pattern="\\d{9}">
            ${tipo === 'ENTRADA' ? `
            <label for="valor-compra">Valor da Compra*</label>
            <input type="text" id="valor-compra" name="valor-compra" required placeholder="R$1000,00" min="1">
            <label for="fornecedor">Fornecedor*</label>
            <input type="text" id="fornecedor" name="fornecedor" required placeholder="Fornecedor">
            ` : `
            <label for="valor-venda">Valor da Venda*</label>
            <input type="text" id="valor-venda" name="valor-venda" required placeholder="R$1000,00" min="1">
            <label for="comprador">Comprador*</label>
            <input type="text" id="comprador" name="comprador" required placeholder="Comprador">
            `}
            <div style="display: flex; gap: 10px;">
            <div style="display: flex; flex-direction: column; flex: 3;">
            <label for="quantidade">Quantidade*</label>
            <input type="number" id="quantidade" name="quantidade" required placeholder="10" min="1" max="${maxQuantidade}">
            </div>
            <div style="display: flex; flex-direction: column; flex: 2;">
            <label for="quantidade-final" style="font-weight: bold; color: #333;">Quantidade Final</label>
            <input type="number" id="quantidade-final" name="quantidade-final" placeholder="100" style="background:#f9f9f9" readonly>
            </div>
            </div>
            <label for="data-compra">${tipo === 'ENTRADA' ? 'Data da Compra*' : 'Data da Venda*'}</label>
            <input type="date" id="${tipo === 'ENTRADA' ? 'data-compra' : 'data-venda'}" name="${tipo === 'ENTRADA' ? 'data-compra' : 'data-venda'}" required>
            <button type="submit">Confirmar ${tipo === 'ENTRADA' ? 'Abastecimento' : 'Venda'}</button>
            </div>
            <div class="right-column">
            <label for="foto">Produto</label>
            <div id="image-preview" class="image-box">
            ${produto.url_imagem ? `<img src="${produto.url_imagem}" alt="Imagem do produto" style="max-width:100%;height:auto;">` : `<i class="fa-regular fa-image" style="font-size: 32px"></i>`}
            <input type="file" id="foto" name="foto" accept="image/*" style="display:none">
            </div>
            </div>
            </div>
            </form>
        `;

        // Máscara de preço
        const valorCompraInput = document.getElementById('valor-compra');
        const valorVendaInput = document.getElementById('valor-venda');
        
        if (valorCompraInput) formatarPrecoInput(valorCompraInput);
        if (valorVendaInput) formatarPrecoInput(valorVendaInput);

        // Preencher campos do produto
        if (produto && produto.codigo) preencherCampos(produto);

        // Cria aviso limite acima do campo quantidade-final
        const quantidadeFinalInput = document.getElementById('quantidade-final');
        if (quantidadeFinalInput && !document.getElementById('aviso-limite')) {
            const aviso = criarAvisoLimite();
            quantidadeFinalInput.parentNode.insertBefore(aviso, quantidadeFinalInput);
        }

        // Listeners para validação robusta
        const quantidadeInput = document.getElementById('quantidade');
        const quantidadeAtualInput = document.getElementById('filter-quantidade');
        if (quantidadeInput && quantidadeFinalInput && quantidadeAtualInput) {
            quantidadeInput.addEventListener('input', atualizarQuantidadeFinal);
            quantidadeAtualInput.addEventListener('input', atualizarQuantidadeFinal);
        }

        // Submit handler com SweetAlert
        const form = document.getElementById('movimentacao-form');
        if (form) {
            form.addEventListener('submit', function(event) {
                event.preventDefault();

                // Validação: impedir envio sem produto selecionado
                if (!produtoSelecionado.id || !produtoSelecionado.codigo) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Selecione um produto!',
                        text: 'Nenhum produto foi selecionado.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    return;
                }

                // Descobre o tipo de movimentação
                const tipoRadio = document.querySelector('input[name="tipo-movimentacao"]:checked');
                const tipoMovimentacao = tipoRadio ? tipoRadio.value : "ENTRADA";

                if (tipoMovimentacao === "ENTRADA") {
                    const entrada = {
                        codigo: produtoSelecionado.codigo,
                        nome: produtoSelecionado.nome,
                        codigoCompra: document.getElementById('codigo-compra').value,
                        dataEntrada: document.getElementById('data-compra').value,
                        fornecedor: document.getElementById('fornecedor').value,
                        quantidade: parseInt(document.getElementById('quantidade').value, 10),
                        valorCompra: parseFloat(document.getElementById('valor-compra').value.replace(/[^\d,]/g, '').replace(',', '.'))
                    };
                    console.log("Enviando entrada:", entrada); // Adicione este log para ver no navegador

                    fetch('/api/movimentacoes/entrada', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(entrada)
                    })
                    .then(response => {
                        if (!response.ok) throw new Error('Erro ao registrar entrada');
                        return response.json();
                    })
                    .then(data => {
                        Swal.fire({
                            title: "Entrada registrada!",
                            text: "Selecione uma opção",
                            icon: "success",
                            showCloseButton: true,
                            showCancelButton: true,
                            confirmButtonText: 'Acessar Baixo Estoque',
                            cancelButtonText: 'Acessar Movimentações',
                            allowOutsideClick: false,
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.href = "/baixo-estoque";
                            } else if (result.dismiss === Swal.DismissReason.cancel) {
                                window.location.href = "/movimentacoes";
                            } else if (result.dismiss === Swal.DismissReason.close) {
                                window.location.href = "/movimentar-produto";
                            }
                        });
                    })
                    .catch(error => {
                        Swal.fire('Erro!', error.message, 'error');
                    });
                } else if (tipoMovimentacao === "SAIDA") {
                    const saida = {
                        codigo: produtoSelecionado.codigo,
                        nome: produtoSelecionado.nome,
                        codigoVenda: document.getElementById('codigo-venda').value,    
                        dataSaida: document.getElementById('data-venda').value,          
                        comprador: document.getElementById('comprador').value,
                        quantidade: parseInt(document.getElementById('quantidade').value, 10),
                        valorVenda: parseFloat(document.getElementById('valor-venda').value.replace(/[^\d,]/g, '').replace(',', '.'))  // ✅ CORRIGIDO
                    };

                    console.log('Enviando saída:', saida);
                    
                    fetch('/api/movimentacoes/saida', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(saida)
                    })
                    .then(response => {
                        if (!response.ok) throw new Error('Erro ao registrar saída');
                        return response.json();
                    })
                    .then(data => {
                        Swal.fire({
                        title: "Saída registrada!",
                        text: "Selecione uma opção",
                        icon: "success",
                        showCloseButton: true,
                        showCancelButton: true,
                        confirmButtonText: 'Acessar Estoque',
                        cancelButtonText: 'Acessar Movimentações',
                        allowOutsideClick: false,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = "/estoque";
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            window.location.href = "/movimentacoes";
                        } else if (result.dismiss === Swal.DismissReason.close) {
                            window.location.href = "/movimentar-produto";
                        }
                    });
                    })
                    .catch(error => {
                        console.error('Erro completo:', error);
                        Swal.fire('Erro!', error.message, 'error');
                    });
                }
            });
        }
        setTimeout(atualizarQuantidadeFinal, 0);
    }

    // Função para preencher os campos do produto (robusta)
    function preencherCampos(produto) {
        const precoFormatado = produto.preco !== undefined
            ? 'R$ ' + Number(produto.preco).toFixed(2).replace('.', ',')
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
        document.getElementById('filter-quantidade').value = (produto.quantidade !== undefined && produto.quantidade !== null) ? produto.quantidade : '';
        document.getElementById('filter-limite').value = produto.limiteMinimo || '';
        document.getElementById('filter-preco').value = precoFormatado;
        document.getElementById('quantidade-final').value = (produto.quantidade !== undefined && produto.quantidade !== null) ? produto.quantidade : '';

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
                icon.style.fontSize = '32px';
                preview.appendChild(icon);
            }
        }
        atualizarQuantidadeFinal();
    }

    // Função robusta para atualizar quantidade final e validar
    function atualizarQuantidadeFinal() {
        const quantidadeInput = document.getElementById('quantidade');
        const quantidadeFinalInput = document.getElementById('quantidade-final');
        const quantidadeAtualInput = document.getElementById('filter-quantidade');
        if (!quantidadeInput || !quantidadeFinalInput || !quantidadeAtualInput) return;
        let atual = parseInt(quantidadeAtualInput.value) || 0;
        let tipo = 'ENTRADA';
        const tipoRadio = document.querySelector('input[name="tipo-movimentacao"]:checked');
        if (tipoRadio) tipo = tipoRadio.value;

        let maxPermitido;
        if (tipo === 'SAIDA') {
            maxPermitido = atual;
        } else {
            maxPermitido = 999 - atual;
        }
        if (maxPermitido < 0) maxPermitido = 0;

        let entrada = quantidadeInput.value.replace(/\D/g, '');
        if (entrada.length > 3) entrada = entrada.slice(0, 3);
        let entradaNum = parseInt(entrada) || 0;

        if (entradaNum > maxPermitido) {
            entradaNum = maxPermitido;
            quantidadeInput.value = entradaNum > 0 ? entradaNum : '';
            if (tipo === 'SAIDA' && maxPermitido > 0) {
                quantidadeFinalInput.value = atual - entradaNum;
                Swal.fire({
                    icon: 'warning',
                    title: 'Estoque insuficiente!',
                    text: `Você só pode vender até ${maxPermitido} unidades.`,
                    timer: 2500,
                    showConfirmButton: false
                });
            } else if (tipo === 'SAIDA' && maxPermitido === 0) {
                quantidadeFinalInput.value = atual - entradaNum;
                Swal.fire({
                    icon: 'warning',
                    title: 'Estoque insuficiente!',
                    text: `O produto precisa ser reabastecido.`,
                    timer: 1500,
                    showConfirmButton: false
                });
            } else if (tipo === 'ENTRADA' && maxPermitido === 0) {
                quantidadeFinalInput.value = atual;
                Swal.fire({
                    icon: 'warning',
                    title: 'Limite de estoque atingido!',
                    text: 'Este produto não pode ser abastecido.',
                    timer: 2500,
                    showConfirmButton: false
                });
            } else {
                quantidadeFinalInput.value = atual + entradaNum;
                Swal.fire({
                    icon: 'warning',
                    title: 'Limite atingido!',
                    text: `Você só pode abastecer até ${maxPermitido} unidades.`,
                    timer: 2500,
                    showConfirmButton: false
                });
            }
            return;
        } else {
            quantidadeInput.value = entradaNum > 0 ? entradaNum : '';
        }

        if (tipo === 'SAIDA') {
            quantidadeFinalInput.value = atual - entradaNum;
        } else {
            quantidadeFinalInput.value = atual + entradaNum;
        }
    }

    // Função para mostrar o select de produtos como padrão
    function mostrarSelectProdutosDefault() {
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
                    // Sempre redireciona para ?id=ID ao selecionar
                    window.location.search = '?id=' + opt.value;
                });
                // Não adiciona blur para esconder o select enquanto não houver id
            });
    }

    // Troca tipo de movimentação (sempre adiciona listeners)
    document.querySelectorAll('input[name="tipo-movimentacao"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (!produtoSelecionado) produtoSelecionado = {};
            criarMainContainer(this.value, produtoSelecionado);
            ultimoTipo = this.value;
        });
    });

    // Sempre mostrar o select como padrão se não tem id na URL
    if (!id) {
        mostrarSelectProdutosDefault();
        criarMainContainer("ENTRADA", {});
        // Máscara de preço para filtros
        formatarPrecoInput(document.getElementById('filter-preco'));
        return;
    }

    // Se tem id, input de código aparece normalmente e select só aparece ao mouseover
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
                    // Sempre redireciona para ?id=ID ao selecionar
                    window.location.search = '?id=' + opt.value;
                });

                selectProdutos.addEventListener('blur', function() {
                    selectProdutos.style.display = 'none';
                    codigoInput.style.display = '';
                });
            });
    });

    // Busca o produto (mantém apenas a lógica correta)
    if (id) {
        fetch(`/produtos/${id}`)
            .then(response => {
                if (!response.ok) throw new Error('Produto não encontrado');
                return response.json();
            })
            .then(produto => {
                produtoSelecionado = produto;
                const tipoSelecionado = document.querySelector('input[name="tipo-movimentacao"]:checked')?.value || "ENTRADA";
                criarMainContainer(tipoSelecionado, produto);
            })
            .catch(error => {
                Swal.fire('Erro!', error.message, 'error');
            });
    }
    // Máscara de preço para filtros
    formatarPrecoInput(document.getElementById('filter-preco'));
});
