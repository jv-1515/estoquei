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
            e.target.value = 'R$ ' + inteiro + ',' + decimal;
        } else {
            e.target.value = '';
        }
    });
}

function atualizarBadgeBaixoEstoque() {
    const badge = document.querySelector('.badge');
    if (!badge) return;

    badge.style.display = 'none';

    fetch('/produtos/baixo-estoque')
        .then(res => res.json())
        .then(produtos => {
            const qtd = produtos.length;
            if (qtd <= 0) {
                badge.style.display = 'none';
                return;
            }
            badge.textContent = qtd > 99 ? '99+' : qtd;
            badge.style.display = 'inline-block';
            if (qtd < 10) {
                badge.style.padding = '3px 6px';
            } else if (qtd < 99) {
                badge.style.padding = '4px 3px';
            } else if (qtd > 99) {
                badge.style.padding = '5px 0px 3px 2px';
            }
            const bellIcon = document.querySelector('.fa-bell');
            if (bellIcon) {
                bellIcon.classList.add('fa-shake');
                setTimeout(() => {
                    bellIcon.classList.remove('fa-shake');
                }, 2500);
            }
        });
}
document.addEventListener('DOMContentLoaded', atualizarBadgeBaixoEstoque);


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


if (codigoInput) {
    // Bloqueia Ctrl+J, Ctrl+Shift+J, Ctrl+W só no input (extra segurança)
    codigoInput.addEventListener('keydown', function(e) {
        if (e.ctrlKey && (e.key === 'j' || e.key === 'J')) {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.shiftKey && (e.key === 'j' || e.key === 'J')) {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && (e.key === 'w' || e.key === 'W')) {
            e.preventDefault();
            return false;
        }
    });

    // Detecta código válido automaticamente ao digitar
    codigoInput.addEventListener('input', function() {
        let match = codigoInput.value.match(/^(\d{9})/);
        let codigo = match ? match[1] : '';
        if (codigo.length === 9) {
            fetch('/produtos')
                .then(res => res.json())
                .then(produtos => {
                    const produto = produtos.find(p => p.codigo === codigo);
                    if (produto && produto.id) {
                        window.location.href = window.location.pathname + '?id=' + produto.id;
                    } else {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Produto não encontrado!',
                            text: 'Verifique o código digitado',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    }
                });
        }
    });

    // Mantém busca ao pressionar Enter (opcional)
    codigoInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            let codigo = codigoInput.value.replace(/\D/g, '');
            if (codigo.length === 9) {
                fetch(`/produtos/codigo/${encodeURIComponent(codigo)}`)
                    .then(res => res.ok ? res.json() : null)
                    .then(produto => {
                        if (produto && produto.id) {
                            window.location.href = window.location.pathname + '?id=' + produto.id;
                        } else {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Produto não encontrado!',
                                text: 'Verifique o código digitado',
                                timer: 1500,
                                showConfirmButton: false
                            });
                        }
                    })
                    .catch(() => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro ao buscar produto!',
                            text: 'Tente novamente',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    });
            }
            return false;
        }
    });
}

    let produtoSelecionado = {};

    const produtoInput = document.getElementById('filter-codigo');
    const radiosDivProduto = document.getElementById('radios-produto-multi');
    let todosProdutos = [];
    
    if (produtoInput && radiosDivProduto) {
        fetch('/produtos')
            .then(response => response.json())
            .then(produtos => {
                todosProdutos = produtos;
            });
    
        produtoInput.addEventListener('input', function() {
            const termo = produtoInput.value.trim().toLowerCase();
            let filtrados = todosProdutos.filter(p =>
                p.codigo.includes(termo) ||
                p.nome.toLowerCase().includes(termo)
            );
            if (filtrados.length === 0) {
                radiosDivProduto.innerHTML = `<div style="padding:8px;color:#888;">Nenhum produto encontrado</div>`;
            } else {
                radiosDivProduto.innerHTML = filtrados.map(prod => `
                    <label class="produto-radio-label" style="display:flex;align-items:center;gap:8px;padding:5px 10px;cursor:pointer;">
                        <input type="radio" name="produto-radio" value="${prod.id}">
                        ${prod.codigo} - ${prod.nome}
                    </label>
                `).join('');
            }
            radiosDivProduto.style.display = 'block';
        });
    
        produtoInput.addEventListener('focus', function() {
            if (!produtoInput.value.trim()) {
                radiosDivProduto.innerHTML = todosProdutos.map(prod => `
                    <label class="produto-radio-label" style="display:flex;align-items:center;gap:8px;padding:5px 10px;cursor:pointer;">
                        <input type="radio" name="produto-radio" value="${prod.id}">
                        ${prod.codigo} - ${prod.nome}
                    </label>
                `).join('');
                radiosDivProduto.style.display = 'block';
            }
        });
    
        radiosDivProduto.addEventListener('click', function(e) {
            const label = e.target.closest('label');
            if (!label) return;
            radiosDivProduto.querySelectorAll('label').forEach(l => l.classList.remove('selecionado'));
            label.classList.add('selecionado');
            const radio = label.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            produtoInput.value = label.textContent.trim();
            radiosDivProduto.style.display = 'none';
        
            // Redireciona para a rota do produto selecionado
            window.location.search = '?id=' + radio.value;
        });
    
        document.addEventListener('mousedown', function(e) {
            if (!produtoInput.contains(e.target) && !radiosDivProduto.contains(e.target)) {
                radiosDivProduto.style.display = 'none';
            }
        });
    }

    // Função para criar o main-container
    function criarMainContainer(tipo, produto) {
        const hoje = new Date(Date.now() - (3 * 60 * 60 * 1000)).toISOString().slice(0, 10);
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
                    <label for="valor-compra" style="display:block;">Valor da Compra*</label>
                    <input type="text" id="valor-compra" name="valor-compra" required placeholder="R$ 1.000,00" min="1">
                    <div class="multiselect input-group">
                    <label for="fornecedor-multi" style="display:block;">Fornecedor*</label>
                    <div style="position:relative;">
                        <input type="text" id="fornecedor-multi" placeholder="Selecionar" readonly style="cursor:pointer; padding-right: 20px; background: #fff;" />
                        <span class="chevron-fornecedor" style="position:absolute; right:6px; top:50%; transform:translateY(-50%); color:#888; pointer-events:none;">
                        <i class="fa fa-chevron-down"></i>
                        </span>
                        <div class="overSelect"></div>
                    </div>
                    <div id="radios-fornecedor-multi" style="display:none;">
                    </div>
                    </div>
                ` : `
                    <label for="valor-venda">Valor da Venda*</label>
                    <input type="text" id="valor-venda" name="valor-venda" required placeholder="R$ 1.000,00" min="1">
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
                    <input type="number" id="quantidade-final" name="quantidade-final" placeholder="100" style="background:#f1f1f1" readonly>
                    </div>
                </div>
                <label for="data-compra">${tipo === 'ENTRADA' ? 'Data da Compra*' : 'Data da Venda*'}</label>
                <input type="date" id="${tipo === 'ENTRADA' ? 'data-compra' : 'data-venda'}"
                name="${tipo === 'ENTRADA' ? 'data-compra' : 'data-venda'}"
                required value="${hoje}">
                <button type="submit">Confirmar ${tipo === 'ENTRADA' ? 'Abastecimento' : 'Venda'}</button>
                </div>
                <div class="right-column">
                <label for="foto">Produto</label>
                <div id="image-preview" class="image-box">
                    ${produto.url_imagem ? `<img src="${produto.url_imagem}" alt="Imagem do produto" style="max-width:100%;height:auto;" loading="lazy">` : `<i class="fa-regular fa-image" style="font-size: 32px"></i>`}
                </div>
                </div>
            </div>
            </form>
        `;

    const radiosDiv = document.getElementById('radios-fornecedor-multi');
    if (radiosDiv) {
        radiosDiv.addEventListener('click', function(e) {
            const label = e.target.closest('label');
            if (!label) return;
            radiosDiv.querySelectorAll('label').forEach(l => l.classList.remove('selecionado'));
            label.classList.add('selecionado');
            const radio = label.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            const fornecedorInput = document.getElementById('fornecedor-multi');
            fornecedorInput.value = label.textContent.trim();
            fornecedorInput.dataset.id = radio.value;
            radiosDiv.style.display = 'none';
        });
    }

        // Máscara de preço
        const valorCompraInput = document.getElementById('valor-compra');
        const valorVendaInput = document.getElementById('valor-venda');
        
        if (valorCompraInput) formatarPrecoInput(valorCompraInput);
        if (valorVendaInput) formatarPrecoInput(valorVendaInput);

        // Preencher campos do produto
        if (produto && produto.codigo) preencherCampos(produto);

            const fornecedorMultiGroup = fornecedorInput?.closest('.multiselect.input-group');
        
        // Validação ao digitar código da compra/venda
        
        const codigoCompraInput = document.getElementById('codigo-compra');
        if (codigoCompraInput) {
            codigoCompraInput.addEventListener('input', function() {
                if (fornecedorMultiGroup) {
                    fornecedorMultiGroup.style.pointerEvents = produtoValido ? 'auto' : 'none';
                    fornecedorMultiGroup.style.opacity = produtoValido ? '1' : '0.6';
                }
                this.value = this.value.replace(/\D/g, '');
                // Limite de estoque
                if (produto && produto.quantidade !== undefined && parseInt(produto.quantidade) >= 999) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Limite de estoque atingido!',
                        text: 'Este produto não pode ser abastecido',
                        timer: 1800,
                        timerProgressBar: true,
                        showConfirmButton: false,
                        allowOutsideClick: false
                    });
                    this.value = '';
                }
            });
        
            // validação de código duplicado ao perder o foco
            codigoCompraInput.addEventListener('blur', function() {
                const valor = this.value.trim();
                if (produto && produto.quantidade !== undefined && parseInt(produto.quantidade) < 999) {
                    if (valor.length > 0 && valor.length < 9) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Código inválido!',
                            text: 'O código deve ter 9 dígitos',
                            timer: 1500,
                            timerProgressBar: true,
                            showConfirmButton: false
                        });
                        setTimeout(() => this.focus(), 10);
                        return;
                    }
                }
                if (valor.length === 9) {
                    fetch(`/api/movimentacoes/existe-codigo?codigoMovimentacao=${valor}`)
                        .then(res => res.json())
                        .then(existe => {
                            if (existe) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Código já registrado!',
                                    text: 'Já existe uma movimentação com esse código',
                                    timer: 2000,
                                    showConfirmButton: false
                                });
                                this.value = '';
                                this.focus();
                            }
                        });
                }
            });
        }
        
        const codigoVendaInput = document.getElementById('codigo-venda');
        if (codigoVendaInput) {
            codigoVendaInput.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '');
                // Estoque zerado
                if (produto && produto.quantidade !== undefined && parseInt(produto.quantidade) === 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Estoque insuficiente!',
                        text: 'O produto precisa ser reabastecido antes de vender',
                        timer: 1800,
                        timerProgressBar: true,
                        showConfirmButton: false,
                        allowOutsideClick: false
                    });
                    this.value = '';
                    return;
                }
            });
        
            // validação de código duplicado ao perder o foco
            codigoVendaInput.addEventListener('blur', function() {
                const valor = this.value.trim();
                if (produto && produto.quantidade !== undefined && parseInt(produto.quantidade) > 0 && valor.length > 0 && valor.length < 9) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Código inválido!',
                        text: 'O código deve ter 9 dígitos',
                        timer: 1500,
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                    setTimeout(() => this.focus(), 10);
                    return;
                }
                if (valor.length === 9) {
                    fetch(`/api/movimentacoes/existe-codigo?codigoMovimentacao=${valor}`)
                        .then(res => res.json())
                        .then(existe => {
                            if (existe) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Código já registrado!',
                                    text: 'Já existe uma movimentação com esse código',
                                    timer: 2000,
                                    showConfirmButton: false
                                });
                                this.value = '';
                                this.focus();
                            }
                        });
                }
            });
        }
        

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
                        text: 'Nenhum produto foi selecionado',
                        timer: 1500,
                        timerProgressBar: true,
                        showConfirmButton: false,
                        allowOutsideClick: false
                    });
                    return;
                }

                if (!validarDatasMovimentacao()) {
                    return;
                }

                // Descobre o tipo de movimentação
                const tipoRadio = document.querySelector('input[name="tipo-movimentacao"]:checked');
                const tipoMovimentacao = tipoRadio ? tipoRadio.value : "ENTRADA";

                if (tipoMovimentacao === "ENTRADA") {
                    const codigoCompra = document.getElementById('codigo-compra').value.trim();
                    const valorCompra = document.getElementById('valor-compra').value.trim();
                    const fornecedorId = document.getElementById('fornecedor-multi').dataset.id;
                    if (!codigoCompra || !valorCompra || !fornecedorId) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Preencha todos os campos obrigatórios!',
                            timer: 1500,
                            timerProgressBar: true,
                            showConfirmButton: false
                        });
                        return;
                    }

                    const entrada = {
                        codigo: produtoSelecionado.codigo,
                        nome: produtoSelecionado.nome,
                        codigoCompra: document.getElementById('codigo-compra').value,
                        dataEntrada: document.getElementById('data-compra').value,
                        fornecedorId: document.getElementById('fornecedor-multi').dataset.id,
                        quantidade: parseInt(document.getElementById('quantidade').value, 10),
                        valorCompra: parseFloat(document.getElementById('valor-compra').value.replace(/[^\d,]/g, '').replace(',', '.'))
                    };

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
                        const codigoVenda = document.getElementById('codigo-venda').value.trim();
                        const valorVenda = document.getElementById('valor-venda').value.trim();
                        const comprador = document.getElementById('comprador').value.trim();
                        if (!codigoVenda || !valorVenda || !comprador) {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Preencha todos os campos obrigatórios!',
                                timer: 1500,
                                showConfirmButton: false
                            });
                            return;
                        }
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
        
        if (
            tipo === 'ENTRADA' &&
            produto &&
            produto.categoriaObj &&
            produto.categoriaObj.id !== undefined &&
            !isNaN(Number(produto.categoriaObj.id))
        ) {
            preencherRadiosFornecedorMulti(produto.categoriaObj.id);
        }

        setTimeout(() => {
            const fornecedorInput = document.getElementById('fornecedor-multi');
            const radiosDiv = document.getElementById('radios-fornecedor-multi');
            if (fornecedorInput && radiosDiv) {
                fornecedorInput.addEventListener('click', function() {
                    radiosDiv.style.display = radiosDiv.style.display === 'block' ? 'none' : 'block';
                });
                radiosDiv.addEventListener('click', function(e) {
                    const label = e.target.closest('label');
                    if (!label) return;
                    radiosDiv.querySelectorAll('label').forEach(l => l.classList.remove('selecionado'));
                    label.classList.add('selecionado');
                    const radio = label.querySelector('input[type="radio"]');
                    if (radio) radio.checked = true;
                    fornecedorInput.value = label.textContent.trim();
                    fornecedorInput.dataset.id = radio.value;
                    radiosDiv.style.display = 'none';
                });
            }
        }, 0);
        
        atualizarValorVenda(produto);
    }

    


    // Função para preencher os campos do produto
    function preencherCampos(produto) {
        const precoFormatado = produto.preco !== undefined
            ? 'R$ ' + Number(produto.preco).toFixed(2).replace('.', ',')
            : '';
        const tamanhoExibido = exibirTamanho(produto.tamanho);
        const generoFormatado = produto.genero
            ? produto.genero.charAt(0).toUpperCase() + produto.genero.slice(1).toLowerCase()
            : '';

        document.getElementById('filter-codigo').value = produto.codigo && produto.nome ? `${produto.codigo} - ${produto.nome}` : (produto.codigo || '');
        // document.getElementById('filter-nome').value = produto.nome || '';
        document.getElementById('filter-categoria').value = produto.categoria || '';
        document.getElementById('filter-tamanho').value = tamanhoExibido;
        document.getElementById('filter-genero').value = generoFormatado;
        document.getElementById('filter-quantidade').value = (produto.quantidade !== undefined && produto.quantidade !== null) ? produto.quantidade : '';
        document.getElementById('filter-limite').value = produto.limiteMinimo || '';
        document.getElementById('filter-preco').value = precoFormatado;
        document.getElementById('quantidade-final').value = (produto.quantidade !== undefined && produto.quantidade !== null) ? produto.quantidade : '';

        // Imagem
        const preview = document.getElementById('image-preview');
        if (preview) {
            // Limpa imagens antigas e ícones
            Array.from(preview.childNodes).forEach(node => {
                if (node.tagName === 'IMG' || node.tagName === 'I') {
                    preview.removeChild(node);
                }
            });
        
            if (produto.url_imagem) {
                // Mostra skeleton/spinner enquanto carrega
                preview.innerHTML = `
                    <div class="skeleton-img" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%);background-size:200% 100%;animation:skeleton-loading 1.2s infinite;">
                        <i class="fa fa-spinner fa-spin" style="font-size:32px;color:#aaa;" id="img-skeleton"></i>
                    </div>
                `;
                const img = document.createElement('img');
                img.src = produto.url_imagem;
                img.alt = 'Imagem do produto';
                img.style.maxWidth = '100%';
                img.style.height = '100%';
                img.loading = 'lazy';
                img.onload = function() {
                    preview.innerHTML = '';
                    preview.appendChild(img);
                };
                img.onerror = function() {
                    const skeleton = document.getElementById('img-skeleton');
                    if (skeleton) skeleton.outerHTML = '<i class="fa-regular fa-image" style="font-size:32px;color:#ccc;"></i>';
                };
            } else {
                // Mostra ícone padrão imediatamente
                preview.innerHTML = `
                    <i class="fa-regular fa-image" style="font-size:32px;color:#ccc;"></i>
                `;
            }
        }
        
        atualizarQuantidadeFinal();
        aplicarEstiloInputs();
    }

    // Função quantidade final e validar
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
                    text: `Você só pode vender até ${maxPermitido} unidades`,
                    timer: 2500,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    allowOutsideClick: false
                });
            } else if (tipo === 'SAIDA' && maxPermitido === 0) {
                quantidadeFinalInput.value = atual - entradaNum;
                Swal.fire({
                    icon: 'warning',
                    title: 'Estoque insuficiente!',
                    text: `O produto precisa ser reabastecido`,
                    timer: 1500,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    allowOutsideClick: false
                });
            } else if (tipo === 'ENTRADA' && maxPermitido === 0) {
                quantidadeFinalInput.value = atual;
                Swal.fire({
                    icon: 'warning',
                    title: 'Limite de estoque atingido!',
                    text: 'Este produto não pode ser abastecido',
                    timer: 1500,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    allowOutsideClick: false
                });
            } else {
                quantidadeFinalInput.value = atual + entradaNum;
                Swal.fire({
                    icon: 'warning',
                    title: 'Limite atingido!',
                    text: `Você só pode abastecer até ${maxPermitido} unidades`,
                    timer: 2500,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    allowOutsideClick: false
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
        criarMainContainer("ENTRADA", {});

        formatarPrecoInput(document.getElementById('filter-preco'));
        return;
    }

    // Se tem id, input de código aparece normalmente e select só aparece ao mouseover

    // Busca o produto
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

    const fornecedorInput = document.getElementById('fornecedor-multi');
    const radiosDiv = document.getElementById('radios-fornecedor-multi');

    if (fornecedorInput && radiosDiv) {
        fornecedorInput.addEventListener('click', function() {
            radiosDiv.style.display = radiosDiv.style.display === 'block' ? 'none' : 'block';
        });

        radiosDiv.addEventListener('click', function(e) {
            const label = e.target.closest('label');
            if (!label) return;
            // Remove seleção visual de todos
            radiosDiv.querySelectorAll('label').forEach(l => l.classList.remove('selecionado'));
            // Marca o clicado
            label.classList.add('selecionado');
            // Marca o radio (mesmo oculto)
            const radio = label.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            // Atualiza input
            fornecedorInput.value = label.textContent.trim();
            fornecedorInput.dataset.id = radio.value;
            radiosDiv.style.display = 'none';
        });
    }
});


function validarDatasMovimentacao() {
    const hoje = new Date().toISOString().slice(0, 10);
    const dataEntrada = document.getElementById('data-compra')?.value;
    const dataSaida = document.getElementById('data-venda')?.value;
    const tipoRadio = document.querySelector('input[name="tipo-movimentacao"]:checked');
    const tipo = tipoRadio ? tipoRadio.value : 'ENTRADA';
    const dataInput = document.getElementById(tipo === 'ENTRADA' ? 'data-compra' : 'data-venda');

    if (dataInput) {
        dataInput.addEventListener('change', function() {
            const hoje = new Date().toISOString().slice(0, 10);
            if (this.value > hoje) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Data inválida',
                    text: 'A data não pode ser posterior a hoje',
                    timer: 1500,
                    showConfirmButton: false
                });
                this.value = hoje;
                this.focus();
            }
        });
    }
    if (dataEntrada && dataEntrada > hoje) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida',
            text: 'A Data de Entrada não pode ser posterior a hoje',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return false;
    }
    if (dataSaida && dataSaida > hoje) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida',
            text: 'A Data de Saída não pode ser posterior a hoje',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return false;
    }
    return true;
}


function preencherRadiosFornecedorMulti(categoriaId) {
    categoriaId = Number(categoriaId);
    if (isNaN(categoriaId)) {
        Swal.fire('Erro', 'Categoria inválida!', 'error');
        return;
    }
    fetch(`/fornecedores/categoria-existe?categoriaId=${categoriaId}`)
        .then(res => res.json())
        .then(fornecedores => {
            const radiosDiv = document.getElementById('radios-fornecedor-multi');
            radiosDiv.innerHTML = '';
            fornecedores.forEach(f => {
                radiosDiv.innerHTML += `
                    <label>
                        <input type="radio" name="fornecedor_radio" value="${f.id}" />
                        ${f.nome_empresa}
                    </label>
                `;
            });
        });
}

// Seleção visual
// document.getElementById('radios-fornecedor-multi').addEventListener('click', function(e) {
//   const label = e.target.closest('label');
//   if (!label) return;
//   // Remove seleção de todos
//   this.querySelectorAll('label').forEach(l => l.classList.remove('selecionado'));
//   // Marca o clicado
//   label.classList.add('selecionado');
//   // Marca o radio (mesmo oculto)
//   const radio = label.querySelector('input[type="radio"]');
//   if (radio) radio.checked = true;
//   // Atualiza input
//   const fornecedorInput = document.getElementById('fornecedor-multi');
//   fornecedorInput.value = label.textContent.trim();
//   fornecedorInput.dataset.id = radio.value;
//   this.style.display = 'none';
// });


function atualizarValorVenda(produto) {
    const quantidadeInput = document.getElementById('quantidade');
    const valorVendaInput = document.getElementById('valor-venda');

    if (!quantidadeInput || !valorVendaInput || !produto || !produto.preco) return;

    let manual = false;

    valorVendaInput.addEventListener('input', () => {
        manual = true;
    });

    quantidadeInput.addEventListener('input', function() {
        if (manual) return;
        let qtd = parseInt(this.value, 10) || 0;
        let valor = qtd * parseFloat(produto.preco);
        if (!isNaN(valor) && valor > 0) {
            valorVendaInput.value = 'R$ ' + valor.toFixed(2).replace('.', ',');
        } else {
            valorVendaInput.value = '';
        }
    });

    quantidadeInput.addEventListener('blur', function() {
        manual = false;
    });
}



function aplicarEstiloInputs() {
        const inputs = document.querySelectorAll('.filters-group input');
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
        });
    }

    
    document.addEventListener('DOMContentLoaded', aplicarEstiloInputs);