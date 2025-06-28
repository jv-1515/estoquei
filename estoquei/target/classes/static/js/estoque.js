// Função para aplicar máscara de preço (R$xx,xx)
function mascaraPreco(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 5) value = value.slice(0, 5);
    if (value.length > 0) {
        value = (parseInt(value) / 100).toFixed(2).replace('.', ',');
        input.value = 'R$' + value;
    } else {
        input.value = '';
    }
}

function updateOptions() {
    const categoria = document.getElementById('filter-categoria').value;
    const tamanho = document.getElementById('filter-tamanho');
    const valorSelecionado = tamanho.value;
    const tamLetra = [
        { value: 'ÚNICO', label: 'Único' },
        { value: 'PP', label: 'PP' },
        { value: 'P', label: 'P' },
        { value: 'M', label: 'M' },
        { value: 'G', label: 'G' },
        { value: 'GG', label: 'GG' },
        { value: 'XG', label: 'XG' },
        { value: 'XGG', label: 'XGG' },
        { value: 'XXG', label: 'XXG' }
    ];
    const tamNumero = [];
    for (let i = 36; i <= 56; i++) {
        tamNumero.push(i);
    }

    let options = '<option value="" selected>Todos</option>';

    if (!categoria) {
        tamLetra.forEach(t => {
            options += `<option value="${t.value}">${t.label}</option>`;
        });
        tamNumero.forEach(n => {
            options += `<option value="_${n}">${n}</option>`;
        });
    } else {
        if (categoria === 'SAPATO' || categoria === 'MEIA') {
            for (let i = 36; i <= 44; i++) {
                options += `<option value="_${i}">${i}</option>`;
            }
        } else if (categoria === 'BERMUDA' || categoria === 'CALCA' || categoria === 'SHORTS') {
            for (let i = 36; i <= 56; i += 2) {
                options += `<option value="_${i}">${i}</option>`;
            }
        } else if (categoria === 'CAMISA' || categoria === 'CAMISETA') {
            tamLetra.forEach(t => {
                options += `<option value="${t.value}">${t.label}</option>`;
            });
        } else {
            tamLetra.forEach(t => {
                options += `<option value="${t.value}">${t.label}</option>`;
            });
            tamNumero.forEach(n => {
                options += `<option value="_${n}">${n}</option>`;
            });
        }
    }

    tamanho.innerHTML = options;
    tamanho.value = valorSelecionado;
}

window.addEventListener('DOMContentLoaded', function() {
    updateOptions();
    document.getElementById('filter-categoria').addEventListener('change', updateOptions);

    // Filtros automáticos: inputs normais (exceto popups) filtram ao blur, selects ao change
    document.querySelectorAll('.filters input').forEach(el => {
        if (!['filter-preco', 'preco-min', 'preco-max', 'filter-quantidade', 'qtd-min', 'qtd-max', 'filter-limite', 'limite-min', 'limite-max'].includes(el.id)) {
            el.addEventListener('blur', filtrar);
        }
    });
    document.querySelectorAll('.filters select').forEach(el => {
        el.addEventListener('change', filtrar);
    });

    // Limita quantidade e limite mínimo a 999
    ['filter-quantidade', 'filter-limite'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                if (this.value.length > 3) this.value = this.value.slice(0, 3);
                if (this.value > 999) this.value = 999;
            });
        }
    });
});

//var global e controle de paginação
let produtos = [];
let paginaAtual = 1;
let itensPorPagina = 10;

function filtrar() {
    let codigo = document.getElementById("filter-codigo").value.trim();
    let nome = document.getElementById("filter-nome").value.trim();
    let categoria = document.getElementById("filter-categoria").value;
    let tamanho = document.getElementById("filter-tamanho").value;
    let genero = document.getElementById("filter-genero").value;

    // Faixas
    let qtdMin = parseInt(document.getElementById("quantidade-min").value) || null;
    let qtdMax = parseInt(document.getElementById("quantidade-max").value) || null;
    let limiteMin = parseInt(document.getElementById("limite-min").value) || null;
    let limiteMax = parseInt(document.getElementById("limite-max").value) || null;

    // Preço faixa
    let precoMin = document.getElementById("preco-min").value.replace(/\D/g, '');
    let precoMax = document.getElementById("preco-max").value.replace(/\D/g, '');
    precoMin = precoMin ? parseInt(precoMin) / 100 : null;
    precoMax = precoMax ? parseInt(precoMax) / 100 : null;

    // Filtro em memória
    let filtrados = produtos.filter(p => {
        if (codigo && !p.codigo.includes(codigo)) return false;
        if (nome && !p.nome.toLowerCase().includes(nome.toLowerCase())) return false;
        if (categoria && p.categoria !== categoria) return false;
        if (tamanho && p.tamanho !== tamanho) return false;
        if (genero && p.genero !== genero) return false;
        if (qtdMin !== null && p.quantidade < qtdMin) return false;
        if (qtdMax !== null && p.quantidade > qtdMax) return false;
        if (limiteMin !== null && p.limiteMinimo < limiteMin) return false;
        if (limiteMax !== null && p.limiteMinimo > limiteMax) return false;
        if (precoMin !== null && p.preco < precoMin) return false;
        if (precoMax !== null && p.preco > precoMax) return false;
        return true;
    });

    paginaAtual = 1;
    renderizarProdutos(filtrados);
}    

function limpar() {
    document.querySelectorAll(".filters input, .filters select").forEach(el => {
        el.value = "";
        if (el.dataset) el.dataset.valor = "";
    });
    precoMin.value = "";
    precoMax.value = "";
    qtdMin.value = "";
    qtdMax.value = "";
    limiteMin.value = "";
    limiteMax.value = "";
    precoInput.value = "";
    qtdInput.value = "";
    limiteInput.value = "";
    carregarProdutos(document.getElementById('registros-select').value);
    setTimeout(filtrar, 100); // Garante que renderiza todos após carregar
}

function removerProduto(id) {
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

            fetch('/produtos/' + id, {
                method: 'DELETE'
            }).then(response => {
                if (response.ok) {
                    Swal.fire({
                        title: 'Removendo...',
                        text: 'Aguarde enquanto o produto é removido.',
                        icon: 'info',
                        showConfirmButton: true,
                        confirmButtonColor: '#1E94A3',
                        allowOutsideClick: false,
                        timer: 1500,
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        title: 'Erro!',
                        text: 'Não foi possível remover.',
                        icon: 'error',
                        confirmButtonColor: '#1E94A3'
                    });
                }
            });
        }
    });
}

function exibirTamanho(tamanho) {
    if (tamanho === 'ÚNICO') return 'Único';
    if (typeof tamanho === 'string' && tamanho.startsWith('_')) return tamanho.substring(1);
    return tamanho;
}

function renderizarProdutos(produtos) {
    const tbody = document.getElementById('product-table-body');
    // Mostra o loading imediatamente
    tbody.innerHTML = `<tr>
        <td colspan="10" style="text-align: center; padding: 10px; color: #888; font-size: 16px;">
            <span id="loading-spinner" style="display: inline-block; vertical-align: middle;">
                <i class="fa fa-spinner fa-spin" style="font-size: 20px; margin-right: 8px;"></i>
            </span>
            <span id="loading-text">Carregando produtos</span>
        </td>
    </tr>`;

    const select = document.getElementById('registros-select');
    itensPorPagina = select.value === "" ? produtos.length : parseInt(select.value);

    const totalPaginas = Math.ceil(produtos.length / itensPorPagina);
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const produtosPagina = produtos.slice(inicio, fim);

    if (produtosPagina.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 10px; color: #888; font-size: 16px;">Nenhum produto encontrado</td></tr>`;
        document.getElementById('paginacao').innerHTML = '';
        return;
    }

    // Aguarda todas as imagens carregarem antes de renderizar as linhas
    const promessasImagens = produtosPagina.map(p => {
        return new Promise(resolve => {
            if (p.url_imagem) {
                const img = new Image();
                img.src = p.url_imagem;
                img.onload = () => resolve();
                img.onerror = () => resolve();
            } else {
                resolve();
            }
        });
    });

    Promise.all(promessasImagens).then(() => {
        tbody.innerHTML = ''; // Limpa o loading
        produtosPagina.forEach(p => {
            const imageUrl = p.url_imagem;
            const precoFormatado = p.preco.toFixed(2).replace('.', ',');        
            const precisaAbastecer = p.quantidade <= (2 * p.limiteMinimo);
            const tamanhoExibido = exibirTamanho(p.tamanho);
            p.genero = p.genero.charAt(0).toUpperCase() + p.genero.slice(1).toLowerCase();
            p.categoria = p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1).toLowerCase();

            const rowHtml = `
                <tr>
                    <td>
                        ${imageUrl 
                            ? `<img src="${imageUrl}" alt="Foto do produto" onclick="visualizarImagem('${imageUrl}', 'Produto: ${p.codigo}', \`${p.descricao ? p.descricao.replace(/`/g, '\\`') : ''}\`)" class="produto-img" loading="lazy" />` 
                            : `<span class="produto-img icon"><i class="fa-regular fa-image" style="padding-top:5px"></i></span>`
                        }
                    </td>
                    <td>${p.codigo}</td>
                    <td>${p.nome}</td>
                    <td class="categoria">${p.categoria}</td>
                    <td>${tamanhoExibido}</td>
                    <td class="genero">${p.genero}</td>
            <td style="position: relative; text-align: center;">
            <span style="display: inline-block;">${p.quantidade}</span>
            ${
            precisaAbastecer
            ? `<a href="/abastecer-produto?id=${p.id}" title="Abastecer produto" 
                style="
                    position: absolute;
                    top: 50%;
                    right: 0;
                    transform: translateY(-50%);
                    width: 20px;
                    height: 20px;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: auto;
                    padding-right: 23px;
                ">
                <span style="background:${p.quantidade <= p.limiteMinimo ? '#fff' : '#000'};width:5px;height:7px;position:absolute;left:23%;top:51%;transform:translate(-50%,-50%);border-radius:5px;z-index:0;"></span>
                <i class="fa-solid fa-triangle-exclamation" style="color:${p.quantidade <= p.limiteMinimo ? 'red' : '#fbc02d'};position:relative;z-index:1;"></i>
            </a>`
            : ''
            }
            </td>
                    <td>${p.limiteMinimo}</td>
                    <td>${precoFormatado}</td>
                    <td class="actions">
                        <a href="/editar-produto?id=${p.id}" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </a>
                        <button type="button" onclick="removerProduto('${p.id}')" title="Excluir">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += rowHtml;
        });

        renderizarPaginacao(totalPaginas);
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
            renderizarProdutos(produtos);
        };
        paginacaoDiv.appendChild(btn);
    }
}

function carregarProdutos(top) {
    let url = '/produtos';
    if (top && top !== "") {
        url += `?top=${top}`;
    }
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao buscar produtos. Status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            produtos = data;
            renderizarProdutos(produtos);
        })
        .catch(error => {
            console.error('Erro na API:', error);
            const tbody = document.getElementById('product-table-body');
            tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: red; padding: 10px; font-size: 16px;">Erro ao carregar produtos. Verifique o console.</td></tr>`;
        });
}

window.onload = function() {
    const select = document.getElementById('registros-select');
    carregarProdutos(select.value);
    select.addEventListener('change', function() {
        itensPorPagina = this.value === "" ? produtos.length : parseInt(this.value);
        paginaAtual = 1;
        renderizarProdutos(produtos);
    });

    //campos para ordenação
    const campos = [
        'codigo',   
        'nome',       
        'categoria',  
        'tamanho',    
        'genero',    
        'quantidade',
        'limiteMinimo',
        'preco'       
    ];

    //inicia com true (decrescente)
    let estadoOrdenacao = Array(campos.length).fill(true);

    document.querySelectorAll('th.ordenar').forEach((th, idx) => {
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

            const campo = campos[idx];
            produtos.sort((a, b) => {
                if (campo === 'quantidade' || campo === 'limiteMinimo' || campo === 'preco') {
                    // numérico
                    return estadoOrdenacao[idx]
                        ? b[campo] - a[campo]
                        : a[campo] - b[campo];
                } else {
                    // alfabético
                    return estadoOrdenacao[idx]
                        ? a[campo].localeCompare(b[campo], undefined, { numeric: true })
                        : b[campo].localeCompare(a[campo], undefined, { numeric: true });
                }
            });
            //altera o estado de ordenação
            estadoOrdenacao[idx] = !estadoOrdenacao[idx];
            icon.innerHTML = estadoOrdenacao[idx]
                // true seta para baixo (decrescente) false seta para cima (crescente)
                ? '<i class="fa-solid fa-arrow-down"></i>'
                : '<i class="fa-solid fa-arrow-up"></i>';
            renderizarProdutos(produtos);
            icon.style.display = 'inline-block';
        });
    });

}

// --- PREÇO FAIXA SEM SETINHAS ---
const precoInput = document.getElementById('filter-preco');
const precoPopup = document.getElementById('preco-faixa-popup');
const precoMin = document.getElementById('preco-min');
const precoMax = document.getElementById('preco-max');

// Máscara para 000,00 até 999,99
function mascaraPrecoFaixa(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 5) value = value.slice(0, 5);
    if (value.length > 0) {
        value = (parseInt(value) / 100).toFixed(2).replace('.', ',');
        input.value = 'R$ ' + value;
    } else {
        input.value = '';
    }
}

precoMin.addEventListener('input', function() { mascaraPrecoFaixa(this); });
precoMax.addEventListener('input', function() { mascaraPrecoFaixa(this); });

precoInput.addEventListener('click', function(e) {
    precoPopup.style.display = 'block';
    precoMin.focus();
    e.stopPropagation();
});

// Função para aplicar o filtro só ao fechar o popup
function aplicarFiltroPrecoFaixa() {
    let min = precoMin.value;
    let max = precoMax.value;

    // Se só "de" preenchido, assume até 999,99
    if (min && !max) max = '999,99';
    // Se só "até" preenchido, assume de 000,00
    if (!min && max) min = '000,00';

    if (min || max) {
        precoInput.value = `R$ ${min || '000,00'} - R$ ${max || '999,99'}`;
    } else {
        precoInput.value = '';
    }
    precoPopup.style.display = 'none';
    // Só dispara filtro se algum campo foi preenchido
    if (min || max) filtrar();
}

// Fecha popup ao clicar fora e aplica filtro
document.addEventListener('mousedown', function(e) {
    if (precoPopup.style.display === 'block' && !precoPopup.contains(e.target) && e.target !== precoInput) {
        aplicarFiltroPrecoFaixa();
    }
});

// Limpa campos ao limpar filtros
function limparFaixaPreco() {
    precoMin.value = '';
    precoMax.value = '';
    precoInput.value = '';
}

// --- SELECT DO CÓDIGO ---
window.addEventListener('DOMContentLoaded', function() {
    const codigoInput = document.getElementById('filter-codigo');
    let selectProdutos = null;

    codigoInput.addEventListener('mouseenter', function() {
        // Cria o select só uma vez
        if (!selectProdutos) {
            selectProdutos = document.createElement('select');
            // Copia id, name, class e style do input
            selectProdutos.id = codigoInput.id;
            selectProdutos.name = codigoInput.name || '';
            selectProdutos.className = codigoInput.className;
            selectProdutos.setAttribute('style', codigoInput.getAttribute('style') || '');
            // Copia atributos de acessibilidade se houver
            if (codigoInput.hasAttribute('aria-label')) {
                selectProdutos.setAttribute('aria-label', codigoInput.getAttribute('aria-label'));
            }
            // Copia largura real computada
            const computed = window.getComputedStyle(codigoInput);
            selectProdutos.style.width = computed.width;
            selectProdutos.style.height = computed.height;
            selectProdutos.style.fontSize = computed.fontSize;
            selectProdutos.style.boxSizing = computed.boxSizing;
            selectProdutos.style.padding = computed.padding;
            selectProdutos.style.border = computed.border;
            selectProdutos.style.borderRadius = computed.borderRadius;

            selectProdutos.innerHTML = '<option value="" disabled selected hidden>Selecionar</option>';
            codigoInput.parentNode.insertBefore(selectProdutos, codigoInput.nextSibling);

            // Ao selecionar, apenas armazena o valor selecionado
            let ultimoSelecionado = "";

            selectProdutos.addEventListener('change', function() {
                ultimoSelecionado = this.value;
            });

            // Ao sair do select, preenche o input se algo foi selecionado
            selectProdutos.addEventListener('mouseleave', function() {
                if (ultimoSelecionado) {
                    codigoInput.value = ultimoSelecionado;
                    codigoInput.style.color = 'black';
                }
                ultimoSelecionado = "";
                selectProdutos.selectedIndex = 0; // volta para o placeholder
                selectProdutos.style.display = 'none';
                codigoInput.style.display = '';
                codigoInput.focus();
            });
        }

        // Preenche o select com os produtos
        fetch('/produtos')
            .then(res => res.json())
            .then(produtos => {
                selectProdutos.innerHTML = '<option value="" disabled selected hidden>Selecionar</option>';
                produtos.forEach(prod => {
                    selectProdutos.innerHTML += `<option value="${prod.codigo}">${prod.codigo} - ${prod.nome}</option>`;
                });
                // Troca input por select
                codigoInput.style.display = 'none';
                selectProdutos.style.display = '';
                selectProdutos.focus();
            });
    });
});

// Cor dos selects
function aplicarCorSelectFiltro(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        // Atualiza cor ao carregar
        el.style.color = el.value ? 'black' : '#757575';
        // Atualiza cor ao mudar
        el.addEventListener('change', function() {
            this.style.color = this.value ? 'black' : '#757575';
        });
    });
}
aplicarCorSelectFiltro(['filter-codigo', 'filter-categoria', 'filter-genero', 'filter-tamanho']);

// --- QUANTIDADE FAIXA ---
const qtdInput = document.getElementById('filter-quantidade');
const qtdPopup = document.getElementById('quantidade-faixa-popup');
const qtdMin = document.getElementById('quantidade-min');
const qtdMax = document.getElementById('quantidade-max');

qtdInput.addEventListener('click', function(e) {
    qtdPopup.style.display = 'block';
    qtdMin.focus();
    e.stopPropagation();
});
qtdMin.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').slice(0, 3);
});
qtdMax.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').slice(0, 3);
});
function aplicarFiltroQtdFaixa() {
    let min = qtdMin.value;
    let max = qtdMax.value;
    if (min && !max) max = '999';
    if (!min && max) min = '0';

    // Mostra o texto no input para o usuário
    if (min || max) {
        qtdInput.value = `${min || '0'} - ${max || '999'}`;
    } else {
        qtdInput.value = '';
    }
    qtdPopup.style.display = 'none';

    qtdInput.dataset.valor = min || max || '';
    if (min || max) filtrar();
}
document.addEventListener('mousedown', function(e) {
    if (qtdPopup.style.display === 'block' && !qtdPopup.contains(e.target) && e.target !== qtdInput) {
        aplicarFiltroQtdFaixa();
    }
});

// --- LIMITE MÍNIMO FAIXA ---
const limiteInput = document.getElementById('filter-limite');
const limitePopup = document.getElementById('limite-faixa-popup');
const limiteMin = document.getElementById('limite-min');
const limiteMax = document.getElementById('limite-max');

limiteInput.addEventListener('click', function(e) {
    limitePopup.style.display = 'block';
    limiteMin.focus();
    e.stopPropagation();
});
limiteMin.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').slice(0, 3);
});
limiteMax.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').slice(0, 3);
});
function aplicarFiltroLimiteFaixa() {
    let min = limiteMin.value;
    let max = limiteMax.value;
    if (min && !max) max = '999';
    if (!min && max) min = '1';

    if (min || max) {
        limiteInput.value = `${min || '1'} - ${max || '999'}`;
    } else {
        limiteInput.value = '';
    }
    limitePopup.style.display = 'none';

    limiteInput.dataset.valor = min || max || '';
    if (min || max) filtrar();
}
document.addEventListener('mousedown', function(e) {
    if (limitePopup.style.display === 'block' && !limitePopup.contains(e.target) && e.target !== limiteInput) {
        aplicarFiltroLimiteFaixa();
    }
});