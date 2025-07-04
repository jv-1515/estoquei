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

function gerarCheckboxesTamanhoMulti(tamanhosValidos) {
    const checkboxesDiv = document.getElementById('checkboxes-tamanho-multi');
    checkboxesDiv.innerHTML = '';

    const temLetra = [...tamanhosValidos].some(v => ["ÚNICO","PP","P","M","G","GG","XG","XGG","XXG"].includes(v));
    const temNum = [...tamanhosValidos].some(v => /^_\d+$/.test(v));

    // "Todos" só aparece se tem letras E números
    if (temLetra && temNum) {
        checkboxesDiv.innerHTML += `<label><input type="checkbox" id="tamanho-multi-todas" class="tamanho-multi-check" value="" checked> Todos</label>`;
    }
    // "Todos em Letras"
    if (temLetra) {
        checkboxesDiv.innerHTML += `<label><input type="checkbox" id="tamanho-multi-todas-letra" class="tamanho-multi-check" value="LETRAS" checked> Todos em Letras</label>`;
    }
    // "Todos Numéricos"
    if (temNum) {
        checkboxesDiv.innerHTML += `<label><input type="checkbox" id="tamanho-multi-todas-num" class="tamanho-multi-check" value="NUMERICOS" checked> Todos Numéricos</label>`;
    }

    // Letras
    const letras = ["ÚNICO","PP","P","M","G","GG","XG","XGG","XXG"];
    letras.forEach(val => {
        if (tamanhosValidos.has(val)) {
            checkboxesDiv.innerHTML += `<label><input type="checkbox" class="tamanho-multi-check" value="${val}" checked> ${val === 'ÚNICO' ? 'Único' : val}</label>`;
        }
    });
    // Números
    for (let i = 36; i <= 56; i++) {
        const val = '_' + i;
        if (tamanhosValidos.has(val)) {
            checkboxesDiv.innerHTML += `<label><input type="checkbox" class="tamanho-multi-check" value="${val}" checked> ${i}</label>`;
        }
    }
}

function updateOptions() {
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
    let categorias = [];
    if (!checks[0].checked) {
        categorias = checks.slice(1).filter(cb => cb.checked).map(cb => cb.value.toUpperCase());
    }
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
    for (let i = 36; i <= 56; i++) tamNumero.push(i);

    let tamanhos = new Set();
    if (categorias.length === 0) {
        tamLetra.forEach(t => tamanhos.add(t.value));
        tamNumero.forEach(n => tamanhos.add('_' + n));
    } else {
        if (categorias.some(cat => cat === 'SAPATO' || cat === 'MEIA')) {
            for (let i = 36; i <= 44; i++) tamanhos.add('_' + i);
        }
        if (categorias.some(cat => cat === 'BERMUDA' || cat === 'CALÇA' || cat === 'SHORTS')) {
            for (let i = 36; i <= 56; i += 2) tamanhos.add('_' + i);
        }
        if (categorias.some(cat => cat === 'CAMISA' || cat === 'CAMISETA')) {
            tamLetra.forEach(t => tamanhos.add(t.value));
        }
    }

    // Atualiza o select de tamanho
    let options = '';
    const temLetra = [...tamanhos].some(v => ["ÚNICO","PP","P","M","G","GG","XG","XGG","XXG"].includes(v));
    const temNum = [...tamanhos].some(v => /^_\d+$/.test(v));

    // "Todos" só aparece se tem letras E números
    if (temLetra && temNum) {
        options += `<option id="tamanho-multi-placeholder" value="">Todos</option>`;
    } else if (temLetra) {
        options += `<option id="tamanho-multi-placeholder" value="">Todos em Letras</option>`;
    } else if (temNum) {
        options += `<option id="tamanho-multi-placeholder" value="">Todos Numéricos</option>`;
    }
    tamLetra.forEach(t => {
        if (tamanhos.has(t.value)) options += `<option value="${t.value}">${t.label}</option>`;
    });
    tamNumero.forEach(n => {
        if (tamanhos.has('_' + n)) options += `<option value="_${n}">${n}</option>`;
    });
    tamanho.innerHTML = options;
    if ([...tamanhos].includes(valorSelecionado)) {
        tamanho.value = valorSelecionado;
    } else {
        tamanho.selectedIndex = 0;
    }
    tamanho.style.color = tamanho.value ? 'black' : '#757575';

    // Atualiza a DIV de tamanhos dinamicamente
    gerarCheckboxesTamanhoMulti(tamanhos, categorias);

    // Adiciona listeners e lógica dos checkboxes de tamanho
    aplicarListenersTamanhoMulti();

    // Atualiza placeholder visual e do select
    atualizarPlaceholderTamanhoMulti();
}

function aplicarListenersTamanhoMulti() {
    const checks = Array.from(document.querySelectorAll('.tamanho-multi-check'));
    const todas = document.getElementById('tamanho-multi-todas');
    const todasLetra = document.getElementById('tamanho-multi-todas-letra');
    const todasNum = document.getElementById('tamanho-multi-todas-num');
    const valoresLetra = ["ÚNICO","PP","P","M","G","GG","XG","XGG","XXG"];
    const valoresNum = [];
    for (let i = 36; i <= 56; i++) valoresNum.push('_' + i);

    // "Todos"
    if (todas) {
        todas.addEventListener('change', function() {
            checks.forEach(cb => cb.checked = todas.checked);
            if (todasLetra) todasLetra.checked = todas.checked;
            if (todasNum) todasNum.checked = todas.checked;
            atualizarPlaceholderTamanhoMulti();
            filtrar();
        });
    }
    // "Todos Letras"
    if (todasLetra) {
        todasLetra.addEventListener('change', function() {
            checks.forEach(cb => {
                if (valoresLetra.includes(cb.value)) cb.checked = todasLetra.checked;
            });
            todasLetra.checked = checks.filter(cb => valoresLetra.includes(cb.value)).every(cb => cb.checked);
            if (todasNum) todas.checked = todasLetra.checked && todasNum.checked;
            atualizarPlaceholderTamanhoMulti();
            filtrar();
        });
    }
    // "Todos Numéricos"
    if (todasNum) {
        todasNum.addEventListener('change', function() {
            checks.forEach(cb => {
                if (valoresNum.includes(cb.value)) cb.checked = todasNum.checked;
            });
            todasNum.checked = checks.filter(cb => valoresNum.includes(cb.value)).every(cb => cb.checked);
            if (todasLetra) todas.checked = todasLetra.checked && todasNum.checked;
            atualizarPlaceholderTamanhoMulti();
            filtrar();
        });
    }
    // Individuais
    checks.forEach(cb => {
        if (
            cb.id !== 'tamanho-multi-todas' &&
            cb.id !== 'tamanho-multi-todas-letra' &&
            cb.id !== 'tamanho-multi-todas-num'
        ) {
            cb.addEventListener('change', function() {
                if (!cb.checked) {
                    if (todas) todas.checked = false;
                    if (valoresLetra.includes(cb.value) && todasLetra) todasLetra.checked = false;
                    if (valoresNum.includes(cb.value) && todasNum) todasNum.checked = false;
                } else {
                    if (valoresLetra.includes(cb.value) && todasLetra)
                        todasLetra.checked = checks.filter(c => valoresLetra.includes(c.value)).every(c => c.checked);
                    if (valoresNum.includes(cb.value) && todasNum)
                        todasNum.checked = checks.filter(c => valoresNum.includes(c.value)).every(c => c.checked);
                    if (todas)
                        todas.checked = checks.filter(c =>
                            c.id !== 'tamanho-multi-todas' &&
                            c.id !== 'tamanho-multi-todas-letra' &&
                            c.id !== 'tamanho-multi-todas-num'
                        ).every(c => c.checked);
                }
                atualizarPlaceholderTamanhoMulti();
                filtrar();
            });
        }
    });
}

function atualizarPlaceholderTamanhoMulti() {
    const checks = Array.from(document.querySelectorAll('.tamanho-multi-check'));
    const select = document.getElementById('filter-tamanho');
    const placeholderOption = document.getElementById('tamanho-multi-placeholder');

    // Só conta os tamanhos individuais visíveis (não os grupos)
    const individuaisVisiveis = checks.filter(cb =>
        !['tamanho-multi-todas','tamanho-multi-todas-letra','tamanho-multi-todas-num'].includes(cb.id)
    );
    const selecionados = individuaisVisiveis.filter(cb => cb.checked)
        .map(cb => cb.parentNode.textContent.trim());

    let texto = 'Todos';
    if (selecionados.length === 0 || selecionados.length === individuaisVisiveis.length) {
        // Se só tem letras visíveis, mostra "Todos em Letras"
        if (individuaisVisiveis.every(cb => !/^_\d+$/.test(cb.value))) {
            texto = 'Todos em Letras';
        }
        // Se só tem números visíveis, mostra "Todos Numéricos"
        else if (individuaisVisiveis.every(cb => /^_\d+$/.test(cb.value))) {
            texto = 'Todos Numéricos';
        }
        // Se tem ambos, mostra "Todos"
        else {
            texto = 'Todos';
        }
    } else {
        texto = selecionados.join(', ');
    }
    // Atualiza o texto da option placeholder
    if (placeholderOption) placeholderOption.textContent = texto;
    // Garante que a option placeholder está selecionada visualmente
    select.selectedIndex = 0;
    // Atualiza cor do select
    select.style.color = texto === 'Todos' ? '#757575' : 'black';
}

// Atualiza tamanhos ao mudar qualquer checkbox de categoria
document.querySelectorAll('.categoria-multi-check').forEach(cb => {
    cb.addEventListener('change', updateOptions);
});

// Atualiza ao carregar a página
window.addEventListener('DOMContentLoaded', function() {
    updateOptions();
});

window.addEventListener('DOMContentLoaded', function() {
    updateOptions();
    
    const btnExibirDetalhes = document.getElementById('btn-exibir-detalhes');
    const detalhesDiv = document.getElementById('detalhes-estoque');

    // Começa visível ou oculta conforme seu HTML
    btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-eye" style="margin-right:4px;"></i>Detalhes';

    btnExibirDetalhes.addEventListener('click', function() {
        const estaVisivel = window.getComputedStyle(detalhesDiv).display !== 'none';
        if (estaVisivel) {
            detalhesDiv.style.display = 'none';
            btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-eye-slash" style="margin-right:4px;"></i>Detalhes';
            // Ajuste visual quando desativado
            btnExibirDetalhes.style.border = '1px solid #1e94a3';
            btnExibirDetalhes.style.background = '#fff';
            btnExibirDetalhes.style.color = '#1e94a3';
        } else {
            detalhesDiv.style.display = 'flex';
            window.atualizarDetalhesEstoque(produtos);
            btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-eye" style="margin-right:4px;"></i>Detalhes';
            // Volta ao visual padrão (ajuste conforme seu tema)
            btnExibirDetalhes.style.border = '';
            btnExibirDetalhes.style.background = '';
            btnExibirDetalhes.style.color = '';
        }
    });
});


    // Atualiza tamanhos ao mudar qualquer checkbox de categoria
    document.querySelectorAll('.categoria-multi-check').forEach(cb => {
        cb.addEventListener('change', updateOptions);
    document.querySelectorAll('.categoria-multi-check').forEach(cb => {
        cb.addEventListener('change', atualizarPlaceholderCategoriaMulti);
    });

    // Atualiza ao mudar qualquer select/input (exceto faixas)
    document.querySelectorAll('#filtros-avancados input:not([readonly]):not(#filter-quantidade):not(#filter-limite):not(#filter-preco), #filtros-avancados select').forEach(el => {
        el.addEventListener('change', filtrar);
        el.addEventListener('input', filtrar);
    });

    // Mantém listeners das faixas como estão
    // ...restante do código...

    const btnExibirDetalhes = document.getElementById('btn-exibir-detalhes');
    const detalhesDiv = document.getElementById('detalhes-estoque');

    btnExibirDetalhes.addEventListener('click', function() {
        if (detalhesDiv.style.display === 'none') {
            detalhesDiv.style.display = 'flex';
            btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-eye" style="margin-right:4px;"></i>Detalhes';
        } else {
            detalhesDiv.style.display = 'none';
            btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-eye-slash" style="margin-right:4px;"></i>Detalhes';
        }
    });
});

//var global e controle de paginação
let produtos = [];
let paginaAtual = 1;
let itensPorPagina = 10;

function filtrar() {
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
    let categoriasSelecionadas = [];
    if (!checks[0].checked) {
        categoriasSelecionadas = checks.slice(1)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
    }

    let tamanhosSelecionados = getTamanhosSelecionados();
    let genero = document.getElementById("filter-genero").value;

    // Faixas
    let qtdMinVal = document.getElementById("quantidade-min").value;
    let qtdMaxVal = document.getElementById("quantidade-max").value;
    qtdMinVal = qtdMinVal === "" ? null : parseInt(qtdMinVal);
    qtdMaxVal = qtdMaxVal === "" ? null : parseInt(qtdMaxVal);
    if (qtdMinVal > qtdMaxVal) [qtdMinVal, qtdMaxVal] = [qtdMaxVal, qtdMinVal];

    let limiteMinVal = parseInt(document.getElementById("limite-min").value) || 1;
    let limiteMaxVal = parseInt(document.getElementById("limite-max").value) || 999;
    if (limiteMinVal > limiteMaxVal) [limiteMinVal, limiteMaxVal] = [limiteMaxVal, limiteMinVal];

    // Preço faixa
    let precoMin = document.getElementById("preco-min").value.replace(/\D/g, '');
    let precoMax = document.getElementById("preco-max").value.replace(/\D/g, '');
    precoMin = precoMin ? parseInt(precoMin) / 100 : null;
    precoMax = precoMax ? parseInt(precoMax) / 100 : null;
    if (precoMin !== null && precoMax !== null && precoMin > precoMax) [precoMin, precoMax] = [precoMax, precoMin];

    // Filtro em memória
    let produtosFiltrados = produtos.filter(p => {
        // Filtra pelas categorias selecionadas nos checkboxes
        if (categoriasSelecionadas.length) {
            if (!categoriasSelecionadas.includes((p.categoria || '').toString().trim().toUpperCase())) return false;
        }
        if (tamanhosSelecionados.length > 0 && !tamanhosSelecionados.includes(p.tamanho.toString().toUpperCase())) return false;
        if (genero && p.genero.toString().toUpperCase() !== genero.toUpperCase()) return false;
        if (qtdMinVal !== null && p.quantidade < qtdMinVal) return false;
        if (qtdMaxVal !== null && p.quantidade > qtdMaxVal) return false;
        if (limiteMinVal !== null && p.limiteMinimo < limiteMinVal) return false;
        if (limiteMaxVal !== null && p.limiteMinimo > limiteMaxVal) return false;
        if (precoMin !== null && p.preco < precoMin) return false;
        if (precoMax !== null && p.preco > precoMax) return false;
        return true;
    });

    paginaAtual = 1;
    renderizarProdutos(produtosFiltrados);
    atualizarDetalhesInfo(produtosFiltrados);
    window.atualizarDetalhesEstoque(produtosFiltrados);
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
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 10px; color: #888; font-size: 16px; background-color: white">Nenhum produto encontrado.</td></tr>`;
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

            const quantidadeVermelha = p.quantidade <= p.limiteMinimo;
            const rowHtml = `
                <tr>
                    <td>
                        ${imageUrl 
                            ? `<img src="${imageUrl}" alt="Foto do produto" class="produto-img" style="cursor:pointer;" onclick="visualizarImagem('${imageUrl}', '${p.nome.replace(/'/g, "\\'")}', '${(p.descricao || '').replace(/'/g, "\\'")}', '${p.codigo}')" />` 
                            : `<span class="produto-img icon" style="cursor:pointer;" onclick="visualizarImagem('', '${p.nome.replace(/'/g, "\\'")}', '${(p.descricao || '').replace(/'/g, "\\'")}', '${p.codigo}')"><i class="fa-regular fa-image"></i></span>`
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
            atualizarDetalhesInfo(produtos);
            window.atualizarDetalhesEstoque(produtos);
            const buscaInput = document.getElementById('busca-produto');
            const buscaSugestoes = document.getElementById('busca-sugestoes');
            buscaInput.addEventListener('input', function() {
                const termo = this.value.trim();
                buscaSugestoes.innerHTML = '';
                if (!termo) {
                    buscaSugestoes.style.display = 'none';
                    return;
                }
                let encontrados;
                let mostrarCodigoPrimeiro = /^\d+$/.test(termo);
                if (mostrarCodigoPrimeiro) {
                    encontrados = produtos.filter(p => p.codigo.includes(termo));
                } else {
                    encontrados = produtos.filter(p => p.nome.toLowerCase().includes(termo.toLowerCase()));
                }
                encontrados.forEach(p => {
                    const div = document.createElement('div');
                    div.textContent = mostrarCodigoPrimeiro
                        ? `${p.codigo} - ${p.nome}`
                        : `${p.nome} - ${p.codigo}`;
                    div.style.padding = '6px 12px';
                    div.style.cursor = 'pointer';
                    div.addEventListener('mousedown', function(e) {
                        e.preventDefault();
                        buscaInput.value = mostrarCodigoPrimeiro ? p.codigo : p.nome;
                        buscaSugestoes.style.display = 'none';
                    });
                    buscaSugestoes.appendChild(div);
                });
                buscaSugestoes.style.display = encontrados.length > 0 ? 'block' : 'none';
            });
            document.addEventListener('mousedown', function(e) {
                if (!buscaSugestoes.contains(e.target) && e.target !== buscaInput) {
                    buscaSugestoes.style.display = 'none';
                }
            });
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

    const btnFiltrarProdutos = document.getElementById('btn-filtrar-produtos');
    const filtrosAvancados = document.getElementById('filtros-avancados');
    const btnLimparFiltros = document.getElementById('btn-limpar-filtros');

    // Sempre começa oculto
    filtrosAvancados.style.display = 'none';

    // Botão "Filtrar Produtos"
    // Botão "Filtrar Produtos" inicia com fundo branco, borda e cor #1e94a3, ícone -circle-xmark
    btnFiltrarProdutos.innerHTML = '<i class="fa-solid fa-filter-circle-xmark"></i> Filtros';
    btnFiltrarProdutos.style.border = '1px solid #1e94a3';
    btnFiltrarProdutos.style.background = '#fff';
    btnFiltrarProdutos.style.color = '#1e94a3';

    btnFiltrarProdutos.addEventListener('click', function() {
        if (filtrosAvancados.style.display === 'flex') {
            filtrosAvancados.style.display = 'none';
            btnFiltrarProdutos.innerHTML = '<i class="fa-solid fa-filter-circle-xmark"></i> Filtros';
            btnFiltrarProdutos.style.border = '1px solid #1e94a3';
            btnFiltrarProdutos.style.background = '#fff';
            btnFiltrarProdutos.style.color = '#1e94a3';
        } else {
            filtrosAvancados.style.display = 'flex';
            btnFiltrarProdutos.innerHTML = '<i class="fa-solid fa-filter"></i> Filtros';
            btnFiltrarProdutos.style.border = '';
            btnFiltrarProdutos.style.background = '#1e94a3';
            btnFiltrarProdutos.style.color = '#fff';
        }
    });

    // Botão "Limpar Filtros"
    btnLimparFiltros.addEventListener('click', function(e) {
        e.preventDefault();
        filtrosAvancados.querySelectorAll('input, select').forEach(el => {
            if (el.type === 'select-one') el.selectedIndex = 0;
            else el.value = '';
        });
        filtrar(); // Atualiza lista
    });

    // Clicou fora, esconde

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
    let min = precoMin.value.replace(/^R\$ ?/, '').replace(',', '.');
    let max = precoMax.value.replace(/^R\$ ?/, '').replace(',', '.');

    // Se ambos vazios, limpa o input para mostrar o placeholder
    if (!min && !max) {
        precoInput.value = '';
        precoPopup.style.display = 'none';
        filtrar();
        return;
    }

    // Se só "de" preenchido, assume até 999,99
    if (min && !max) max = '999.99';
    // Se só "até" preenchido, assume de 000,00
    if (!min && max) min = '0.00';

    // Converte para número para comparar
    let minNum = parseFloat(min) || 0;
    let maxNum = parseFloat(max) || 999.99;

    // Inverte se min > max
    if (minNum > maxNum) [minNum, maxNum] = [maxNum, minNum];

    // Formata de volta para string
    min = minNum.toFixed(2).replace('.', ',');
    max = maxNum.toFixed(2).replace('.', ',');

    precoInput.value = `R$ ${min} - R$ ${max}`;
    precoPopup.style.display = 'none';
    filtrar();
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

    // Se ambos vazios, limpa o input para mostrar o placeholder
    if (min === "" && max === "") {
        qtdInput.value = '';
        qtdPopup.style.display = 'none';
        filtrar();
        return;
    }

    min = min === "" ? 0 : parseInt(min);
    max = max === "" ? 999 : parseInt(max);

    if (min > max) [min, max] = [max, min];
    qtdMin.value = min;
    qtdMax.value = max;
    qtdInput.value = `${min} - ${max}`;
    qtdPopup.style.display = 'none';
    filtrar();
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

    // Se ambos vazios, limpa o input para mostrar o placeholder
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
document.addEventListener('mousedown', function(e) {
    if (limitePopup.style.display === 'block' && !limitePopup.contains(e.target) && e.target !== limiteInput) {
        aplicarFiltroLimiteFaixa();
    }
});

// --- SUGESTÃO DE CÓDIGOS "LIKE" ---
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

const buscaInput = document.getElementById('busca-produto');
const buscaSugestoes = document.getElementById('busca-sugestoes');

buscaInput.addEventListener('input', function() {
    const termo = this.value.trim();
    buscaSugestoes.innerHTML = '';
    if (!termo) {
        buscaSugestoes.style.display = 'none';
        return;
    }
    let encontrados;
    let mostrarCodigoPrimeiro = /^\d+$/.test(termo);
    if (mostrarCodigoPrimeiro) {
        encontrados = produtos.filter(p => p.codigo.includes(termo));
    } else {
        encontrados = produtos.filter(p => p.nome.toLowerCase().includes(termo.toLowerCase()));
    }
    encontrados.forEach(p => {
        const div = document.createElement('div');
        div.textContent = mostrarCodigoPrimeiro
            ? `${p.codigo} - ${p.nome}`
            : `${p.nome} - ${p.codigo}`;
        div.style.padding = '6px 12px';
        div.style.cursor = 'pointer';
        div.addEventListener('mousedown', function(e) {
            e.preventDefault();
            buscaInput.value = mostrarCodigoPrimeiro ? p.codigo : p.nome;
            buscaSugestoes.style.display = 'none';
        });
        buscaSugestoes.appendChild(div);
    });
    buscaSugestoes.style.display = encontrados.length > 0 ? 'block' : 'none';
});

document.addEventListener('mousedown', function(e) {
    if (!buscaSugestoes.contains(e.target) && e.target !== buscaInput) {
        buscaSugestoes.style.display = 'none';
    }
});

// Botão "Filtrar Produtos" mostra filtros avançados
btnFiltrarProdutos.addEventListener('click', function() {
    filtrosAvancados.style.display = 'flex';
});

// Botão "Limpar Filtros" limpa só os filtros avançados e esconde a div
btnLimparFiltros.addEventListener('click', function(e) {
    e.preventDefault();
    filtrosAvancados.querySelectorAll('input, select').forEach(el => {
        if (el.type === 'select-one') el.selectedIndex = 0;
        else el.value = '';
    });
    filtrosAvancados.style.display = 'none';
    filtrar(); // Atualiza lista
});

// Botão "Exibir Detalhes"
let detalhesVisiveis = true; // começa visível

btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-circle-info" style="margin-right:4px;"></i>Ocultar Detalhes';

btnExibirDetalhes.addEventListener('click', function() {
    const detalhesDiv = document.getElementById('detalhes-estoque');
    const estaVisivel = window.getComputedStyle(detalhesDiv).display !== 'none';
    if (estaVisivel) {
        detalhesDiv.style.display = 'none';
        btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-circle-info" style="margin-right:4px;"></i>Exibir Detalhes';
    } else {
        detalhesDiv.style.display = 'flex';
        window.atualizarDetalhesEstoque(produtos);
        btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-circle-info" style="margin-right:4px;"></i>Ocultar Detalhes';
        detalhesDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

function visualizarImagem(url, nome, descricao, codigo) {
    Swal.fire({
        title: nome + (codigo ? `<br><small style='font-weight:normal;'>Código: ${codigo}</small>` : ''),
        html: `
            ${url ? `<img src="${url}" alt="Imagem do Produto" style="max-width: 100%; max-height: 80vh;"/>` : ''}
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

function atualizarDetalhesInfo(produtos) {
    // Soma a coluna quantidade dos produtos recebidos (filtrados)
    const total = produtos.reduce((soma, p) => soma + (Number(p.quantidade) || 0), 0);
    document.getElementById('detalhe-total-produtos').textContent = total;

    // Baixo estoque: quantidade > 0 e <= limiteMinimo
    const baixoEstoque = produtos.filter(p => (Number(p.quantidade) > 0) && (Number(p.quantidade) <= Number(p.limiteMinimo))).length;
    document.getElementById('detalhe-baixo-estoque').textContent = baixoEstoque;

    // Estoque zerado: quantidade == 0
    const zerados = produtos.filter(p => Number(p.quantidade) === 0).length;
    document.getElementById('detalhe-estoque-zerado').textContent = zerados;
}

window.expandedCategoriaMulti = false;

function showCheckboxesCategoriaMulti() {
    var checkboxes = document.getElementById("checkboxes-categoria-multi");
    if (!window.expandedCategoriaMulti) {
        checkboxes.style.display = "block";
        window.expandedCategoriaMulti = true;

        // Fecha ao clicar fora
        function handleClickOutside(e) {
            if (
                checkboxes &&
                !checkboxes.contains(e.target) &&
                !document.querySelector('.multiselect .overSelect').contains(e.target)
            ) {
                checkboxes.style.display = "none";
                window.expandedCategoriaMulti = false;
                document.removeEventListener('mousedown', handleClickOutside);

                // ATUALIZA O PLACEHOLDER DOS TAMANHOS AO FECHAR O SELECT DE CATEGORIAS
                atualizarPlaceholderTamanhoMulti();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
    } else {
        checkboxes.style.display = "none";
        window.expandedCategoriaMulti = false;

        // ATUALIZA O PLACEHOLDER DOS TAMANHOS AO FECHAR O SELECT DE CATEGORIAS
        atualizarPlaceholderTamanhoMulti();
    }
}

// Fecha dropdown ao clicar fora
document.addEventListener('mousedown', function(e) {
  var checkboxes = document.getElementById("checkboxes-categoria-multi");
  var overSelect = document.querySelector('.multiselect .overSelect');  
if (
  window.expandedCategoriaMulti &&
  checkboxes &&
  !checkboxes.contains(e.target) &&
  !overSelect.contains(e.target)
) {
  checkboxes.style.display = "none";
  window.expandedCategoriaMulti = false;
}
});

// Lógica de seleção "Todas" e integração com filtro
window.addEventListener('DOMContentLoaded', function() {
  const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
  const todas = checks[0]; // O primeiro é "Todas"
  const placeholder = document.getElementById('categoria-multi-placeholder');

  // "Todas" marca/desmarca todos
  todas.addEventListener('change', function() {
    checks.forEach(cb => cb.checked = todas.checked);
    atualizarPlaceholderCategoriaMulti();
    filtrar();
  });

  // Se todos individuais marcados, marca "Todas". Se algum desmarcado, desmarca "Todas"
  checks.slice(1).forEach(cb => {
    cb.addEventListener('change', function() {
      todas.checked = checks.slice(1).every(c => c.checked);
      atualizarPlaceholderCategoriaMulti();
      filtrar();
    });
  });

  // Função global para pegar categorias selecionadas do multiselect
  window.getCategoriasMultiSelecionadas = function() {
    if (todas.checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
  };
});

function marcarOuDesmarcarTodasCategorias() {
    const todas = document.getElementById('categoria-multi-todas');
    const checks = document.querySelectorAll('.categoria-multi-check');
    if (todas.checked) {
        checks.forEach(cb => {
            cb.checked = true;
            cb.setAttribute('checked', 'checked');
        });
    } else {
        checks.forEach(cb => {
            cb.checked = false;
            cb.removeAttribute('checked');
        });
    }
    filtrar();
}

function getCategoriasSelecionadas() {
    // Pega todos os checkboxes de categoria, exceto o "Todas"
    return Array.from(document.querySelectorAll('.categoria-multi-check'))
        .filter(cb => cb.id !== 'categoria-multi-todas' && cb.checked)
        .map(cb => cb.value);
}

function atualizarPlaceholderCategoriaMulti() {
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
    const todas = checks[0];
    const placeholder = document.getElementById('categoria-multi-placeholder');
    const selecionados = checks.slice(1)
        .filter(cb => cb.checked)
        .map(cb => cb.parentNode.textContent.trim());

    if (todas.checked || selecionados.length === 0) {
        placeholder.textContent = 'Todas';
    } else {
        placeholder.textContent = selecionados.join(', ');
    }
}

function showCheckboxesTamanhoMulti() {
    var checkboxes = document.getElementById("checkboxes-tamanho-multi");
    if (!window.expandedTamanhoMulti) {
        checkboxes.style.display = "block";
        window.expandedTamanhoMulti = true;

        // ATUALIZA O PLACEHOLDER AGORA QUE OS CHECKBOXES ESTÃO VISÍVEIS
        atualizarPlaceholderTamanhoMulti();

        // Fecha ao clicar fora
        function handleClickOutside(e) {
            if (
                checkboxes &&
                !checkboxes.contains(e.target) &&
                !document.querySelector('.multiselect .overSelect').contains(e.target)
            ) {
                checkboxes.style.display = "none";
                window.expandedTamanhoMulti = false;
                document.removeEventListener('mousedown', handleClickOutside);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
    } else {
        checkboxes.style.display = "none";
        window.expandedTamanhoMulti = false;
    }
}

function marcarOuDesmarcarTodosTamanhos() {
    const todas = document.getElementById('tamanho-multi-todas');
    const todasLetra = document.getElementById('tamanho-multi-todas-letra');
    const todasNum = document.getElementById('tamanho-multi-todas-num');
    const checks = document.querySelectorAll('.tamanho-multi-check');
    checks.forEach(cb => {
        cb.checked = todas.checked;
    });
    // Atualiza "Todos Letras" e "Todos Numéricos" conforme o estado de "Todos"
    todasLetra.checked = todas.checked;
    todasNum.checked = todas.checked;
    atualizarPlaceholderTamanhoMulti();
    filtrar();
}

// Atualiza "Todos" se ambos "Todos Letras" e "Todos Numéricos" estiverem marcados
function atualizarTodosTamanhosCheck() {
    const todas = document.getElementById('tamanho-multi-todas');
    const todasLetra = document.getElementById('tamanho-multi-todas-letra');
    const todasNum = document.getElementById('tamanho-multi-todas-num');
    todas.checked = todasLetra.checked && todasNum.checked;
}

// Adiciona listeners para manter sincronização
document.addEventListener('DOMContentLoaded', function() {
    const todasLetra = document.getElementById('tamanho-multi-todas-letra');
    const todasNum = document.getElementById('tamanho-multi-todas-num');
    if (todasLetra && todasNum) {
        todasLetra.addEventListener('change', atualizarTodosTamanhosCheck);
        todasNum.addEventListener('change', atualizarTodosTamanhosCheck);
    }
});

function marcarOuDesmarcarLetras() {
    const todasLetras = document.getElementById('tamanho-multi-todas-letra');
    const todasNum = document.getElementById('tamanho-multi-todas-num');
    const todas = document.getElementById('tamanho-multi-todas');
    const valoresLetra = ["ÚNICO","PP","P","M","G","GG","XG","XGG","XXG"];
    const checks = document.querySelectorAll('.tamanho-multi-check');

    checks.forEach(cb => {
        if (valoresLetra.includes(cb.value)) cb.checked = todasLetras.checked;
    });
    const checksLetra = Array.from(checks).filter(cb => valoresLetra.includes(cb.value));
    todasLetras.checked = checksLetra.every(cb => cb.checked);

    // Atualiza "Todos" corretamente
    todas.checked = todasLetras.checked && todasNum.checked;

    atualizarPlaceholderTamanhoMulti();
    filtrar();
}

function marcarOuDesmarcarNumericos() {
    const todasNum = document.getElementById('tamanho-multi-todas-num');
    const todasLetras = document.getElementById('tamanho-multi-todas-letra');
    const todas = document.getElementById('tamanho-multi-todas');
    const valoresNum = ["_36","_37","_38","_39","_40","_41","_42","_43","_44","_45","_46","_47","_48","_49","_50","_51","_52","_53","_54","_55","_56"];
    const checks = document.querySelectorAll('.tamanho-multi-check');
    checks.forEach(cb => {
        if (valoresNum.includes(cb.value)) cb.checked = todasNum.checked;
    });
    const checksNum = Array.from(checks).filter(cb => valoresNum.includes(cb.value));
    todasNum.checked = checksNum.every(cb => cb.checked);

    // Atualiza "Todos" corretamente
    todas.checked = todasLetras.checked && todasNum.checked;

    atualizarPlaceholderTamanhoMulti();
    filtrar();
}

function atualizarPlaceholderTamanhoMulti() {
    const checks = Array.from(document.querySelectorAll('.tamanho-multi-check'));
    const select = document.getElementById('filter-tamanho');
    const placeholderOption = document.getElementById('tamanho-multi-placeholder');

    // Só conta os tamanhos individuais visíveis (não os grupos)
    const individuaisVisiveis = checks.filter(cb =>
        !['tamanho-multi-todas','tamanho-multi-todas-letra','tamanho-multi-todas-num'].includes(cb.id)
    );
    const selecionados = individuaisVisiveis.filter(cb => cb.checked)
        .map(cb => cb.parentNode.textContent.trim());

    let texto = 'Todos';
    if (selecionados.length === 0 || selecionados.length === individuaisVisiveis.length) {
        // Se só tem letras visíveis, mostra "Todos em Letras"
        if (individuaisVisiveis.every(cb => !/^_\d+$/.test(cb.value))) {
            texto = 'Todos em Letras';
        }
        // Se só tem números visíveis, mostra "Todos Numéricos"
        else if (individuaisVisiveis.every(cb => /^_\d+$/.test(cb.value))) {
            texto = 'Todos Numéricos';
        }
        // Se tem ambos, mostra "Todos"
        else {
            texto = 'Todos';
        }
    } else {
        texto = selecionados.join(', ');
    }
    // Atualiza o texto da option placeholder
    if (placeholderOption) placeholderOption.textContent = texto;
    // Garante que a option placeholder está selecionada visualmente
    select.selectedIndex = 0;
    // Atualiza cor do select
    select.style.color = texto === 'Todos' ? '#757575' : 'black';
}

// Função para pegar tamanhos selecionados
function getTamanhosSelecionados() {
    const checks = Array.from(document.querySelectorAll('.tamanho-multi-check'));
    const todas = checks[0];
    if (todas.checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
}

// Controle de expansão do multiselect de tamanhos
window.expandedTamanhoMulti = false;

function showCheckboxesTamanhoMulti() {
    var checkboxes = document.getElementById("checkboxes-tamanho-multi");
    if (!window.expandedTamanhoMulti) {
        checkboxes.style.display = "block";
        window.expandedTamanhoMulti = true;

        // ATUALIZA O PLACEHOLDER AGORA QUE OS CHECKBOXES ESTÃO VISÍVEIS
        atualizarPlaceholderTamanhoMulti();

        // Fecha ao clicar fora
        function handleClickOutside(e) {
            if (
                checkboxes &&
                !checkboxes.contains(e.target) &&
                !document.querySelector('.multiselect .overSelect').contains(e.target)
            ) {
                checkboxes.style.display = "none";
                window.expandedTamanhoMulti = false;
                document.removeEventListener('mousedown', handleClickOutside);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
    } else {
        checkboxes.style.display = "none";
        window.expandedTamanhoMulti = false;
    }
}
