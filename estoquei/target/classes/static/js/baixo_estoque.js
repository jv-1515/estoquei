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

let produtos = [];
let paginaAtual = 1;
let itensPorPagina = 10;

function filtrar() {
    let codigo = document.getElementById("filter-codigo").value;
    let nome = document.getElementById("filter-nome").value;
    let categoria = document.getElementById("filter-categoria").value;
    let tamanho = document.getElementById("filter-tamanho").value;
    let genero = document.getElementById("filter-genero").value;

    let qtdMinVal = parseInt(document.getElementById("quantidade-min").value) || 0;
    let qtdMaxVal = parseInt(document.getElementById("quantidade-max").value) || 999;
    if (qtdMinVal > qtdMaxVal) [qtdMinVal, qtdMaxVal] = [qtdMaxVal, qtdMinVal];

    let limiteMinVal = parseInt(document.getElementById("limite-min").value) || 1;
    let limiteMaxVal = parseInt(document.getElementById("limite-max").value) || 999;
    if (limiteMinVal > limiteMaxVal) [limiteMinVal, limiteMaxVal] = [limiteMaxVal, limiteMinVal];

    let precoMinVal = document.getElementById("preco-min").value.replace(/\D/g, '');
    let precoMaxVal = document.getElementById("preco-max").value.replace(/\D/g, '');
    precoMinVal = precoMinVal ? parseInt(precoMinVal) / 100 : null;
    precoMaxVal = precoMaxVal ? parseInt(precoMaxVal) / 100 : null;
    if (precoMinVal !== null && precoMaxVal !== null && precoMinVal > precoMaxVal) [precoMinVal, precoMaxVal] = [precoMaxVal, precoMinVal];

    if (codigo === "") codigo = null;
    if (nome === "") nome = null;
    if (categoria === "") categoria = null;
    if (tamanho === "") tamanho = null;
    if (genero === "") genero = null;

    fetch('/produtos/baixo-estoque/filtrar', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nome, codigo, categoria, tamanho, genero,
            quantidadeMin: qtdMinVal,
            quantidadeMax: qtdMaxVal,
            limiteMin: limiteMinVal,
            limiteMax: limiteMaxVal,
            precoMin: precoMinVal,
            precoMax: precoMaxVal
        })
    })
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
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: red; padding: 10px; font-size:16px">Erro ao carregar produtos. Verifique o console.</td></tr>`;
    });
}    

function limpar() {
    document.querySelectorAll(".filters input, .filters select").forEach(el => el.value = "");
    // Limpa popups de faixa
    ['quantidade-min','quantidade-max','limite-min','limite-max','preco-min','preco-max'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    filtrar();
}

function carregarProdutos(top) {
fetch('/produtos/baixo-estoque')
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
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: red; padding: 10px; font-size:16px">Erro ao carregar produtos. Verifique o console.</td></tr>`;
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
    tbody.innerHTML = `<tr style="background-color: #fff">
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
            const tamanhoExibido = exibirTamanho(p.tamanho);
            p.genero = p.genero.charAt(0).toUpperCase() + p.genero.slice(1).toLowerCase();
            p.categoria = p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1).toLowerCase();

            const quantidadeVermelha = p.quantidade <= p.limiteMinimo;
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
                        <span style="display: inline-block;${quantidadeVermelha ? 'color:red;font-weight:bold;' : ''}">${p.quantidade}</span>
                        <a href="/abastecer-produto?id=${p.id}" title="Abastecer produto" 
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
                        </a>
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

    //inicia como true (decrescente)
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
        //ao clicar remover todos os outros campos e add o ícone de ordenação
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
            //inverte o estado de ordenação
            estadoOrdenacao[idx] = !estadoOrdenacao[idx];
            icon.innerHTML = estadoOrdenacao[idx]
                // se for true, seta o ícone de descrescente, senão crescente
                ? '<i class="fa-solid fa-arrow-down"></i>'
                : '<i class="fa-solid fa-arrow-up"></i>';
            renderizarProdutos(produtos);
            icon.style.display = 'inline-block';
        });
    });
};

window.addEventListener('DOMContentLoaded', function() {
    function limitarInput999(input) {
        input.addEventListener('input', function() {
            if (this.value.length > 3) this.value = this.value.slice(0, 3);
            if (this.value > 999) this.value = 999;
        });
    }

    ['filter-quantidade', 'filter-limite'].forEach(id => {
        const input = document.getElementById(id);
        if (input) limitarInput999(input);
    });
});

function visualizarImagem(url, titulo, descricao) {
    Swal.fire({
        title: titulo,
        html: `
            <img src="${url}" alt="Imagem do Produto" style="max-width: 100%; max-height: 80vh;"/>
            ${descricao ? `<div style="margin-top:10px; text-align:left;"><strong>Descrição:</strong> ${descricao}</div>` : ''}
        `,
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-popup'
        }
    });

    const closeBtn = document.querySelector('.swal2-close');
    if (closeBtn) {
        closeBtn.style.boxShadow = 'none';
    }
}

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



window.addEventListener('DOMContentLoaded', function() {
    const codigoInput = document.getElementById('filter-codigo');

    // Cria o container das sugestões
    let sugestaoContainer = document.createElement('div');
    sugestaoContainer.id = 'codigo-sugestoes';

    codigoInput.parentNode.appendChild(sugestaoContainer);

    codigoInput.addEventListener('input', function() {
        // Permite apenas números
        this.value = this.value.replace(/\D/g, '');
        const termo = this.value.trim();
        sugestaoContainer.innerHTML = '';
        if (!termo) {
            sugestaoContainer.style.display = 'none';
            filtrar();
            return;
        }
        // Busca códigos que contenham o termo digitado
        const encontrados = produtos.filter(p => p.codigo.includes(termo));
        if (encontrados.length === 0) {
            sugestaoContainer.style.display = 'none';
            filtrar();
            return;
        }
        encontrados.forEach(p => {
            const div = document.createElement('div');
            div.textContent = `${p.codigo} - ${p.nome}`;
            div.style.padding = '4px 8px';
            div.style.cursor = 'pointer';
            div.addEventListener('mousedown', function(e) {
                e.preventDefault();
                codigoInput.value = p.codigo;
                sugestaoContainer.style.display = 'none';
                filtrar();
            });
            sugestaoContainer.appendChild(div);
        });
        // Posiciona o container logo abaixo do input
        const rect = codigoInput.getBoundingClientRect();
        sugestaoContainer.style.top = (codigoInput.offsetTop + codigoInput.offsetHeight) + 'px';
        sugestaoContainer.style.left = codigoInput.offsetLeft + 'px';
        sugestaoContainer.style.display = 'block';
        filtrar();
    });

    // Esconde sugestões ao clicar fora
    document.addEventListener('mousedown', function(e) {
        if (!sugestaoContainer.contains(e.target) && e.target !== codigoInput) {
            sugestaoContainer.style.display = 'none';
        }
    });
});

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

// Use para os filtros desejados
aplicarCorSelectFiltro(['filter-codigo', 'filter-categoria', 'filter-genero', 'filter-tamanho']);

// Para voltar ao cinza ao limpar, adicione no seu método limpar():
function limpar() {
    document.querySelectorAll(".filters input, .filters select").forEach(el => {
        el.value = "";
        if (['filter-codigo', 'filter-categoria', 'filter-genero', 'filter-tamanho'].includes(el.id)) {
            el.style.color = '#757575';
        }
    });
    // Limpa popups de faixa
    ['quantidade-min','quantidade-max','limite-min','limite-max','preco-min','preco-max'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    filtrar();
}

// Quantidade
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
    if (!min && !max) {
        qtdInput.value = '';
        qtdPopup.style.display = 'none';
        filtrar();
        return;
    }
    min = parseInt(min) || 0;
    max = parseInt(max) || 999;
    if (min > max) [min, max] = [max, min];
    qtdMin.value = min;
    qtdMax.value = max;
    qtdInput.value = `${min} - ${max}`;
    qtdPopup.style.display = 'none';
    filtrar();
}
qtdPopup.addEventListener('focusout', function(e) {
    if (!qtdPopup.contains(e.relatedTarget)) {
        aplicarFiltroQtdFaixa();
    }
});

// Limite Mínimo
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
    if (!min && !max) {
        limiteInput.value = '';
        limitePopup.style.display = 'none';
        filtrar();
        return;
    }
    min = parseInt(min) || 1;
    max = parseInt(max) || 999;
    if (min > max) [min, max] = [max, min];
    limiteMin.value = min;
    limiteMax.value = max;
    limiteInput.value = `${min} - ${max}`;
    limitePopup.style.display = 'none';
    filtrar();
}
limitePopup.addEventListener('focusout', function(e) {
    if (!limitePopup.contains(e.relatedTarget)) {
        aplicarFiltroLimiteFaixa();
    }
});

// Preço
const precoInput = document.getElementById('filter-preco');
const precoPopup = document.getElementById('preco-faixa-popup');
const precoMin = document.getElementById('preco-min');
const precoMax = document.getElementById('preco-max');

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
function aplicarFiltroPrecoFaixa() {
    let min = precoMin.value.replace(/^R\$ ?/, '').replace(',', '.');
    let max = precoMax.value.replace(/^R\$ ?/, '').replace(',', '.');
    if (!min && !max) {
        precoInput.value = '';
        precoPopup.style.display = 'none';
        filtrar();
        return;
    }
    if (min && !max) max = '999.99';
    if (!min && max) min = '0.00';
    let minNum = parseFloat(min) || 0;
    let maxNum = parseFloat(max) || 999.99;
    if (minNum > maxNum) [minNum, maxNum] = [maxNum, minNum];
    min = minNum.toFixed(2).replace('.', ',');
    max = maxNum.toFixed(2).replace('.', ',');
    precoInput.value = `R$ ${min} - R$ ${max}`;
    precoPopup.style.display = 'none';
    filtrar();
}
precoPopup.addEventListener('focusout', function(e) {
    if (!precoPopup.contains(e.relatedTarget)) {
        aplicarFiltroPrecoFaixa();
    }
});

// Fecha popups ao clicar fora
document.addEventListener('mousedown', function(e) {
    if (qtdPopup.style.display === 'block' && !qtdPopup.contains(e.target) && e.target !== qtdInput) {
        aplicarFiltroQtdFaixa();
    }
    if (limitePopup.style.display === 'block' && !limitePopup.contains(e.target) && e.target !== limiteInput) {
        aplicarFiltroLimiteFaixa();
    }
    if (precoPopup.style.display === 'block' && !precoPopup.contains(e.target) && e.target !== precoInput) {
        aplicarFiltroPrecoFaixa();
    }
});