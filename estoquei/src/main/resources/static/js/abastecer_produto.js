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

formatarPrecoInput(document.getElementById('preco'));
formatarPrecoInput(document.getElementById('valor-compra'));

document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    document.querySelector('form').reset();
    Swal.fire({
        title: "Sucesso!",
        text: "Abastecimento registrado!",
        icon: "success",
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: 'Visualizar Estoque',
        cancelButtonText: 'Voltar para Início',
        allowOutsideClick: false,
        customClass: {
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "/baixo-estoque";
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            window.location.href = "/inicio";
        }
    });
});

window.addEventListener('DOMContentLoaded', function() {
    // Pega o id da URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) {
        Swal.fire('Erro!', 'ID do produto não encontrado na URL.', 'error');
        return;
    }

    // Busca o produto
    fetch(`/produtos/${id}`)
        .then(response => {
            if (!response.ok) throw new Error('Produto não encontrado');
            return response.json();
        })
        .then(produto => {
            const precoFormatado = 'R$ ' + Number(produto.preco).toFixed(2).replace('.', ',');
            const tamanhoExibido = exibirTamanho(produto.tamanho);
            const generoFormatado = produto.genero.charAt(0).toUpperCase() + produto.genero.slice(1).toLowerCase();
            const categoriaFormatada = produto.categoria.charAt(0).toUpperCase() + produto.categoria.slice(1).toLowerCase();

            document.getElementById('filter-codigo').value = produto.codigo || '';
            document.getElementById('filter-nome').value = produto.nome || '';
            document.getElementById('filter-categoria').value = categoriaFormatada;
            document.getElementById('filter-tamanho').value = tamanhoExibido;
            document.getElementById('filter-genero').value = generoFormatado;
            document.getElementById('filter-quantidade').value = produto.quantidade || '';
            document.getElementById('filter-limite').value = produto.limiteMinimo || '';
            document.getElementById('filter-preco').value = precoFormatado;
            document.getElementById('quantidade-final').value = produto.quantidade || '';

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
        })
        .catch(error => {
            Swal.fire('Erro!', error.message, 'error');
        });

    const quantidadeInput = document.getElementById('quantidade');
    const quantidadeFinalInput = document.getElementById('quantidade-final');
    const quantidadeAtualInput = document.getElementById('filter-quantidade');

    function limitarInput999(input) {
        input.addEventListener('input', function() {
            if (this.value.length > 3) this.value = this.value.slice(0, 3);
            if (parseInt(this.value) > 999) this.value = 999;
        });
    }

    if (quantidadeInput) limitarInput999(quantidadeInput);
    if (quantidadeFinalInput) limitarInput999(quantidadeFinalInput);

    function limitarSoma() {
        let quantidade = parseInt(quantidadeInput.value) || 0;
        let quantidadeFinal = parseInt(quantidadeFinalInput.value) || 0;
        let soma = quantidade + quantidadeFinal;

        if (soma > 999) {
            if (document.activeElement === quantidadeInput) {
                quantidade = 999 - quantidadeFinal;
                quantidadeInput.value = quantidade > 0 ? quantidade : 0;
            } else if (document.activeElement === quantidadeFinalInput) {
                quantidadeFinal = 999 - quantidade;
                quantidadeFinalInput.value = quantidadeFinal > 0 ? quantidadeFinal : 0;
            }
        }
    }

    if (quantidadeInput && quantidadeFinalInput) {
        quantidadeInput.addEventListener('input', limitarSoma);
        quantidadeFinalInput.addEventListener('input', limitarSoma);
    }

    const codigoInput = document.getElementById('filter-codigo');
    let selectProdutos = null;

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

    // Busca produto pelo código
    function buscarPorCodigo(codigo) {
        fetch(`/produtos?codigo=${encodeURIComponent(codigo)}`)
            .then(response => {
                if (!response.ok) throw new Error('Produto não encontrado');
                return response.json();
            })
            .then(produtos => {
                // Se a API retorna uma lista, pega o primeiro
                const produto = Array.isArray(produtos) ? produtos[0] : produtos;
                if (produto) {
                    preencherCampos(produto);
                } else {
                    Swal.fire('Atenção!', 'Produto não encontrado.', 'warning');
                }
            })
            .catch(() => {
                Swal.fire('Atenção!', 'Produto não encontrado.', 'warning');
            });
    }

    // Mostra select de produtos se código estiver vazio
    function mostrarSelectProdutos() {
        if (selectProdutos) {
            selectProdutos.style.display = '';
            return;
        }
        fetch('/produtos')
            .then(response => response.json())
            .then(produtos => {
                selectProdutos = document.createElement('select');
                selectProdutos.id = 'select-produtos';
                selectProdutos.innerHTML = '<option value="">Selecione um produto</option>';
                produtos.forEach(prod => {
                    selectProdutos.innerHTML += `<option value="${prod.id}">${prod.codigo} - ${prod.nome}</option>`;
                });
                codigoInput.parentNode.insertBefore(selectProdutos, codigoInput.nextSibling);

                selectProdutos.addEventListener('change', function() {
                    const id = this.value;
                    if (id) {
                        fetch(`/produtos/${id}`)
                            .then(response => response.json())
                            .then(produto => preencherCampos(produto));
                    }
                });
            });
    }

    // Evento ao sair do campo código
    codigoInput.addEventListener('blur', function() {
        const codigo = codigoInput.value.trim();
        if (codigo) {
            if (selectProdutos) selectProdutos.style.display = 'none';
            buscarPorCodigo(codigo);
        } else {
            mostrarSelectProdutos();
        }
    });

    // Evento ao digitar no campo código (opcional: esconde select)
    codigoInput.addEventListener('input', function() {
        if (selectProdutos) selectProdutos.style.display = 'none';
    });
});

// Crie o aviso acima do campo quantidade-final
let avisoLimite = document.createElement('div');
avisoLimite.id = 'aviso-limite';
avisoLimite.style.color = 'red';
avisoLimite.style.fontWeight = 'bold';
avisoLimite.style.fontSize = '13px';
avisoLimite.style.marginBottom = '2px';
avisoLimite.style.display = 'none';

// Insere o aviso acima do campo quantidade-final
const qtdFinalDiv = document.getElementById('quantidade-final')?.parentNode;
if (qtdFinalDiv && !document.getElementById('aviso-limite')) {
    qtdFinalDiv.insertBefore(avisoLimite, qtdFinalDiv.firstChild);
}

function exibirTamanho(tamanho) {
    if (tamanho === 'ÚNICO') return 'Único';
    if (typeof tamanho === 'string' && tamanho.startsWith('_')) return tamanho.substring(1);
    return tamanho;
}

const quantidadeInput = document.getElementById('quantidade');
const quantidadeFinalInput = document.getElementById('quantidade-final');
const quantidadeAtualInput = document.getElementById('filter-quantidade');

function atualizarQuantidadeFinal() {
    let atual = parseInt(quantidadeAtualInput.value) || 0;
    let maxPermitido = 999 - atual;
    if (maxPermitido < 0) maxPermitido = 0;

    let entrada = quantidadeInput.value.replace(/\D/g, '');
    if (entrada.length > 3) entrada = entrada.slice(0, 3);
    let entradaNum = parseInt(entrada) || 0;

    if (entradaNum > maxPermitido) {
        entradaNum = maxPermitido;
        quantidadeInput.value = entradaNum > 0 ? entradaNum : '';
        quantidadeFinalInput.value = atual + entradaNum;
        Swal.fire({
            icon: 'warning',
            title: 'Limite atingido!',
            text: `Você só pode abastecer até ${maxPermitido} unidades.`,
            timer: 3000,
            showConfirmButton: false
        });
        return;
    } else {
        quantidadeInput.value = entradaNum > 0 ? entradaNum : '';
    }

    quantidadeFinalInput.value = atual + entradaNum;
}

if (quantidadeInput && quantidadeFinalInput && quantidadeAtualInput) {
    quantidadeInput.addEventListener('input', atualizarQuantidadeFinal);
    quantidadeAtualInput.addEventListener('input', atualizarQuantidadeFinal);
}
