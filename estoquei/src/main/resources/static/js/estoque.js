let produtosFiltrados = [];

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
    atualizarBadgeBaixoEstoque();
    const btn = document.getElementById('btn-topo');
    if (btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

// Fecha dropdown de gêneros ao clicar fora
document.addEventListener('mousedown', function(e) {
    var checkboxes = document.getElementById("checkboxes-genero-multi");
    var overSelect = document.querySelector('.multiselect .overSelect, .multiselect-genero .overSelect');
    if (
        window.expandedGeneroMulti &&
        checkboxes &&
        !checkboxes.contains(e.target) &&
        (!overSelect || !overSelect.contains(e.target))
    ) {
        checkboxes.style.display = "none";
        window.expandedGeneroMulti = false;
        atualizarPlaceholderGeneroMulti();
    }
});
// Garante que ao desmarcar qualquer gênero individual, o "Todos" desmarca na hora
document.querySelectorAll('.genero-multi-check').forEach(cb => {
    if (cb.id !== 'genero-multi-todos') {
        cb.addEventListener('change', function() {
            const todas = document.getElementById('genero-multi-todos');
            if (!cb.checked) {
                todas.checked = false;
                todas.removeAttribute('checked');
            } else {
                // Se todos individuais marcados, marca o "Todos"
                const checks = Array.from(document.querySelectorAll('.genero-multi-check')).slice(1);
                if (checks.every(c => c.checked)) {
                    todas.checked = true;
                    todas.setAttribute('checked', 'checked');
                }
            }
            atualizarPlaceholderGeneroMulti();
            filtrar();
        });
    }
});
// Função para marcar/desmarcar todos os gêneros
function marcarOuDesmarcarTodosGeneros() {
    const todas = document.getElementById('genero-multi-todos');
    const checks = document.querySelectorAll('.genero-multi-check');
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
    atualizarPlaceholderGeneroMulti();
    filtrar();
}
// Função para aplicar máscara de preço (R$xx,xx)
function mascaraPreco(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 5) value = value.slice(0, 5);
    if (value.length > 0) {
        value = (parseInt(value) / 100).toFixed(2).replace('.', ',');
        input.value = 'R$ ' + value;
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
    let ativo = true;
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
            ativo = false;
        }
    } else {
        // Verifica se todos em letras estão marcados
        const todosLetrasMarcados = individuaisVisiveis
            .filter(cb => !/^_\d+$/.test(cb.value))
            .every(cb => cb.checked) &&
            individuaisVisiveis.some(cb => !/^_\d+$/.test(cb.value));
        // Verifica se todos numéricos estão marcados
        const todosNumericosMarcados = individuaisVisiveis
            .filter(cb => /^_\d+$/.test(cb.value))
            .every(cb => cb.checked) &&
            individuaisVisiveis.some(cb => /^_\d+$/.test(cb.value));
        if (todosLetrasMarcados && !todosNumericosMarcados) {
            texto = 'Todos em Letras, ' + selecionados.join(', ');
        } else if (todosNumericosMarcados && !todosLetrasMarcados) {
            texto = 'Todos Numéricos, ' + selecionados.join(', ');
        } else {
            texto = selecionados.join(', ');
        }
    }

    if (ativo) {
        select.style.border = '2px solid #1e94a3';
        select.style.color = '#1e94a3';
    } else {
        select.style.border = '';
        select.style.color = '';
    }

    const input = document.getElementById('filter-tamanho');

    const chevron = input.parentNode.querySelector('.chevron-tamanho');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';

    // Atualiza o texto da option placeholder
    if (placeholderOption) placeholderOption.textContent = texto;
    // Garante que a option placeholder está selecionada visualmente
    select.selectedIndex = 0;
    // Atualiza cor do select
    // select.style.color = texto === 'Todos' ? '#757575' : 'black';
}

// Atualiza placeholder da quantidade conforme seleção dos checkboxes
function atualizarPlaceholderQuantidade() {
    const chkTodos = document.getElementById('quantidade-todas-popup');
    const chkBaixo = document.getElementById('quantidade-baixo-estoque-popup');
    const chkZerados = document.getElementById('quantidade-zerados-popup');
    const minInput = document.getElementById('quantidade-min');
    const maxInput = document.getElementById('quantidade-max');
    const input = document.getElementById('filter-quantidade');

    let min = minInput.value;
    let max = maxInput.value;

    // Normaliza min/max (troca se min > max)
    if (min && max && Number(min) > Number(max)) [min, max] = [max, min];

    let texto = 'Todas';
    let ativo = false;

    // Caso especial: só zerados marcado e min/max = 0
    if (!chkTodos.checked && !chkBaixo.checked && chkZerados.checked && min == 0 && max == 0) {
        texto = 'Zerados';
        ativo = true;
    }
    // Todas as combinações possíveis SEM faixa
    else if (chkTodos.checked && chkBaixo.checked && chkZerados.checked && !min && !max) {
        texto = 'Todas';
        ativo = false;
    } else if (chkTodos.checked && chkBaixo.checked && !chkZerados.checked && !min && !max) {
        texto = 'Todas exceto zerados';
        ativo = true;
    } else if (chkTodos.checked && !chkBaixo.checked && chkZerados.checked && !min && !max) {
        texto = 'Todas exceto baixo estoque';
        ativo = true;
    } else if (!chkTodos.checked && chkBaixo.checked && chkZerados.checked && !min && !max) {
        texto = 'Baixo estoque e zerados';
        ativo = true;
    } else if (!chkTodos.checked && chkBaixo.checked && !chkZerados.checked && !min && !max) {
        texto = 'Baixo estoque';
        ativo = true;
    } else if (!chkTodos.checked && !chkBaixo.checked && chkZerados.checked && !min && !max) {
        texto = 'Zerados';
        ativo = true;
    } else {
        // Combinações com faixa
        let filtros = [];
        if (chkBaixo.checked) filtros.push('Baixo estoque');
        if (chkZerados.checked) filtros.push('Zerados');
        let faixa = '';
        if (min && max) {
            if (min == max) {
            faixa = `${min}`;
            } else {
            faixa = `${min} - ${max}`;
            }
        } else if (min) {
            faixa = `a partir de ${min}`;
        } else if (max) {
            faixa = `até ${max}`;
        }
        // Se só "Zerados" está marcado, não mostra faixa
        const apenasZerados = !chkTodos.checked && !chkBaixo.checked && chkZerados.checked;
        if (filtros.length > 0) {
            texto = filtros.join(', ');
            if (faixa && !apenasZerados) texto += ` (${faixa})`;
            ativo = true;
        } else if (faixa) {
            texto = faixa;
            ativo = true;
        } else {
            texto = "Todas";
            ativo = false;
        }
    }

    if (input) input.value = texto;

    if (ativo) {
        input.style.border = '2px solid #1e94a3';
        input.classList.add('quantidade-ativa');
    } else {
        input.style.border = '';
        input.classList.remove('quantidade-ativa');
    }
    const chevron = input.parentNode.querySelector('.chevron-quantidade');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';
}

function syncQuantidadeChecksAndInputs() {
    const chkTodos = document.getElementById('quantidade-todas-popup');
    const chkBaixo = document.getElementById('quantidade-baixo-estoque-popup');
    const chkZerados = document.getElementById('quantidade-zerados-popup');
    const minInput = document.getElementById('quantidade-min');
    const maxInput = document.getElementById('quantidade-max');

    // Se só zerados está marcado
    if (!chkTodos.checked && !chkBaixo.checked && chkZerados.checked) {
        minInput.value = 0;
        maxInput.value = 0;
        minInput.disabled = true;
        maxInput.disabled = true;
    } else {
        minInput.disabled = false;
        maxInput.disabled = false;
        // Se min/max estão ambos 0 e só zerados está marcado, ok
        // Se min/max estão 0 mas outros checks estão marcados, limpe min/max
        if ((chkTodos.checked || chkBaixo.checked) && minInput.value == 0 && maxInput.value == 0) {
            minInput.value = '';
            maxInput.value = '';
        }
    }

    atualizarPlaceholderQuantidade();
}
// Adiciona listeners para atualizar o placeholder ao mudar qualquer checkbox
['quantidade-todas-popup','quantidade-baixo-estoque-popup','quantidade-zerados-popup'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', function() {
        syncQuantidadeChecksAndInputs();
        atualizarPlaceholderQuantidade();
    });
});

document.addEventListener('DOMContentLoaded', atualizarPlaceholderQuantidade);

// Atualiza tamanhos ao mudar qualquer checkbox de categoria
document.querySelectorAll('.categoria-multi-check').forEach(cb => {
    cb.addEventListener('change', updateOptions);
});

// Atualiza ao carregar a página
// window.addEventListener('DOMContentLoaded', function() {
//     updateOptions();
// });

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
            btnExibirDetalhes.style.border = '1px solid #1e94a3';
            btnExibirDetalhes.style.background = '#fff';
            btnExibirDetalhes.style.color = '#1e94a3';
        } else {
            detalhesDiv.style.display = 'flex';
            window.atualizarDetalhesEstoque(produtos);
            btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-eye" style="margin-right:4px;"></i>Detalhes';
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
    // Filtros de categoria, tamanho, gênero, etc
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
    let categoriasSelecionadas = [];
    if (!checks[0].checked) {
        categoriasSelecionadas = checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
    }
    let tamanhosSelecionados = getTamanhosSelecionados ? getTamanhosSelecionados() : [];
    let generosSelecionados = getGenerosSelecionados ? getGenerosSelecionados() : [];

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

    const chkTodos = document.getElementById('quantidade-todas-popup');
    const chkBaixo = document.getElementById('quantidade-baixo-estoque-popup');
    const chkZerados = document.getElementById('quantidade-zerados-popup');

    // Filtro por busca (nome OU código)
    const termoBusca = buscaInput && buscaInput.value ? buscaInput.value.trim() : '';

    produtosFiltrados = produtos.filter(p => {
        // Busca por nome OU código
        if (termoBusca) {
            const termo = termoBusca.toLowerCase();
            const buscaCodigo = p.codigo && p.codigo.toString().toLowerCase().includes(termo);
            const buscaNome = p.nome && p.nome.toLowerCase().includes(termo);
            if (!buscaCodigo && !buscaNome) return false;
        }
        // Filtra pelas categorias selecionadas nos checkboxes
        if (categoriasSelecionadas.length) {
            if (!categoriasSelecionadas.includes((p.categoria || '').toString().trim().toUpperCase())) return false;
        }
        if (tamanhosSelecionados.length > 0 && !tamanhosSelecionados.includes(p.tamanho.toString().toUpperCase())) return false;
        if (generosSelecionados.length > 0 && !generosSelecionados.includes(p.genero.toString().toUpperCase())) return false;
        if (qtdMinVal !== null && p.quantidade < qtdMinVal) return false;
        if (qtdMaxVal !== null && p.quantidade > qtdMaxVal) return false;
        if (limiteMinVal !== null && p.limiteMinimo < limiteMinVal) return false;
        if (limiteMaxVal !== null && p.limiteMinimo > limiteMaxVal) return false;
        if (precoMin !== null && p.preco < precoMin) return false;
        if (precoMax !== null && p.preco > precoMax) return false;

        // Lógica de filtragem de quantidade
        // Todas as combinações possíveis
        if (chkTodos.checked && chkBaixo.checked && chkZerados.checked) {
            // Todas
            return true;
        } else if (chkTodos.checked && chkBaixo.checked && !chkZerados.checked) {
            // Todas exceto zerados
            return Number(p.quantidade) > 0;
        } else if (chkTodos.checked && !chkBaixo.checked && chkZerados.checked) {
            // Todas exceto baixo estoque: zerados OU acima do baixo estoque
            return Number(p.quantidade) === 0 || Number(p.quantidade) > 2 * Number(p.limiteMinimo);
        } else if (!chkTodos.checked && chkBaixo.checked && chkZerados.checked) {
            // Baixo estoque e zerados
            return Number(p.quantidade) === 0 || (Number(p.quantidade) > 0 && Number(p.quantidade) <= 2 * Number(p.limiteMinimo));
        } else if (!chkTodos.checked && chkBaixo.checked && !chkZerados.checked) {
            // Só baixo estoque
            return Number(p.quantidade) > 0 && Number(p.quantidade) <= 2 * Number(p.limiteMinimo);
        } else if (!chkTodos.checked && !chkBaixo.checked && chkZerados.checked) {
            // Só zerados
            return Number(p.quantidade) === 0;
        } else {
            return true;
        }
    });

    paginaAtual = 1;
    renderizarProdutos(produtosFiltrados);
    atualizarDetalhesInfo(produtosFiltrados);
    window.atualizarDetalhesEstoque(produtosFiltrados);
}

function removerProduto(id, nome) {
    nomeProduto = nome || 'produto';
    Swal.fire({
        title: `Remover "${nomeProduto}"?`,
        text: 'Esta ação não poderá ser desfeita.',
        icon: 'warning',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonText: 'Remover',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'swal2-remove-custom',
            cancelButton: 'swal2-cancel-custom'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/produtos/' + id, {
                method: 'DELETE'
            }).then(response => {
                if (response.ok) {
                    Swal.fire({
                        title: `Removendo ${nomeProduto}...`,
                        text: 'Aguarde enquanto o produto é removido.',
                        icon: 'info',
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        timer: 1500,
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        title: 'Erro!',
                        text: `Não foi possível remover ${nomeProduto}. Tente novamente.`,
                        icon: 'error',
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        timer: 1500,
                    });
                }
            }).catch(error => {
                console.error('Erro ao remover produto:', error);
                Swal.fire({
                    title: 'Erro de Conexão!',
                    text: `Não foi possível se conectar ao servidor para remover "${nomeProduto}"`,
                    icon: 'error',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    timer: 1500
                });
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
        <td colspan="14" style="text-align: center; padding: 10px; color: #888; font-size: 16px;">
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
        tbody.innerHTML = `<tr><td colspan="14" style="text-align: center; padding: 10px; color: #888; font-size: 16px; background-color: white">Nenhum produto encontrado.</td></tr>`;
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
            let iconeAbastecer = '';
            if (precisaAbastecer) {
                const corIcone = quantidadeVermelha ? 'red' : '#fbc02d';
                const corFundo = quantidadeVermelha ? '#fff' : '#000';
                iconeAbastecer = `
                    <a href="/movimentar-produto?id=${p.id}" title="Abastecer produto" 
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
                            padding-right: 12px;
                        ">
                        <span style="background:${corFundo};width:5px;height:7px;position:absolute;left:32%;top:54%;transform:translate(-50%,-50%);border-radius:5px;z-index:0;"></span>
                        <i class="fa-solid fa-triangle-exclamation" style="color:${corIcone};position:relative;z-index:1;"></i>
                    </a>
                `;
            }
            // Formatação das datas
            let ultimaEntrada = formatarData(p.dtUltimaEntrada);
            if (ultimaEntrada === '-') {
                ultimaEntrada = `
                    <a href="/movimentar-produto?id=${p.id}" title="Abastecer produto" style="text-decoration:none;">
                        <span style="
                            display:inline-block;
                            padding:2px 10px;
                            border-radius:12px;
                            font-size:12px;
                            color:#fff;
                            background:#888;
                        ">Pendente</span>
                    </a>
                `;
            }
            let ultimaSaida = '-';
            if (p.dtUltimaSaida) {
                ultimaSaida = formatarData(p.dtUltimaSaida);
            }

            let entradasHoje = p.entradasHoje !== undefined ? p.entradasHoje : 0;
            let saidasHoje = p.saidasHoje !== undefined ? p.saidasHoje : 0;

            const produtoObj = {
                id: p.id,
                codigo: p.codigo,
                nome: p.nome,
                categoria: p.categoria,
                tamanho: p.tamanho,
                genero: p.genero,
                preco: p.preco,
                quantidade: p.quantidade,
                limiteMinimo: p.limiteMinimo,
                descricao: p.descricao,
                url_imagem: imageUrl
            };
            const movimentacaoObj = {
                entrada: ultimaEntrada ? {
                    data: ultimaEntrada.data,
                    quantidadeMovimentada: ultimaEntrada.quantidadeMovimentada,
                    valorMovimentacao: ultimaEntrada.valorMovimentacao,
                    parteEnvolvida: ultimaEntrada.parteEnvolvida,
                    responsavel: ultimaEntrada.responsavel
                } : {},
                saida: ultimaSaida ? {
                    data: ultimaSaida.data,
                    quantidadeMovimentada: ultimaSaida.quantidadeMovimentada,
                    valorMovimentacao: ultimaSaida.valorMovimentacao,
                    parteEnvolvida: ultimaSaida.parteEnvolvida,
                    responsavel: ultimaSaida.responsavel
                } : {}
            };

            const rowHtml = `
                <tr>
                    <td style="width: 30px; max-width: 30px; padding-left:20px">
                        ${imageUrl 
                            ? `<img src="${imageUrl}" alt="Foto do produto" class="produto-img" onclick='abrirDetalhesProduto(${JSON.stringify(produtoObj)}, ${JSON.stringify(movimentacaoObj)})' />`
                            : `<span class="produto-img icon" onclick='abrirDetalhesProduto(${JSON.stringify(produtoObj)}, ${JSON.stringify(movimentacaoObj)})'><i class="fa-regular fa-image"></i></span>`
                        }
                    </td>
                    <td>${p.codigo}</td>
                    <td style="max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${p.nome}">${p.nome}</td>
                    <td class="categoria">${p.categoria}</td>
                    <td>${tamanhoExibido}</td>
                    <td class="genero">${p.genero}</td>
                    <td>${precoFormatado}</td>
                    <td style="position: relative; text-align: center;">
                        <span style="display: inline-block;${quantidadeVermelha ? 'color:red;font-weight:bold;' : ''}">${p.quantidade}</span>
                        ${iconeAbastecer}
                    </td>
                    <td>${p.limiteMinimo}</td>
                    <td>${entradasHoje}</td>
                    <td>${saidasHoje}</td>
                    <td>${ultimaEntrada}</td>
                    <td>${ultimaSaida}</td>
                    <td style="padding-right:20px" class="actions">
                        <button type="button" title="Detalhes" onclick='abrirDetalhesProduto(${JSON.stringify(produtoObj)}, ${JSON.stringify(movimentacaoObj)})'>
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <a href="/editar-produto?id=${p.id}" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </a>
                        <button type="button" onclick="removerProduto('${p.id}', '${p.nome.replace(/'/g, "\\'")}')" title="Excluir">
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
            renderizarProdutos(produtosFiltrados);
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
            produtosFiltrados = [...produtos]; 
        
            produtos.sort((a, b) => {
                const valorA = (a.codigo || '').toString().toLowerCase();
                const valorB = (b.codigo || '').toString().toLowerCase();
                return valorA.localeCompare(valorB, undefined, { numeric: true });
            });
            renderizarProdutos(produtosFiltrados); 
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
            tbody.innerHTML = `<tr><td colspan="14" style="text-align: center; color: red; padding: 10px; font-size: 16px;">Erro ao carregar produtos. Verifique o console.</td></tr>`;
        });
}

function parseDataQualquerFormato(dataStr) {
    if (!dataStr || dataStr === '-') return null;
    // yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
        return new Date(dataStr + 'T00:00:00');
    }
    // dd/MM/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
        const [dia, mes, ano] = dataStr.split('/');
        return new Date(`${ano}-${mes}-${dia}T00:00:00`);
    }
    // fallback
    return new Date(dataStr);
}

window.onload = function() {
    const select = document.getElementById('registros-select');
    carregarProdutos(select.value);
    select.addEventListener('change', function() {
        itensPorPagina = this.value === "" ? produtos.length : parseInt(this.value);
        paginaAtual = 1;
        renderizarProdutos(produtosFiltrados);
    });

    const campos = [
        null,               
        'codigo',          
        'nome',            
        'categoria',       
        'tamanho',         
        'genero',          
        'preco',           
        'quantidade',      
        'limiteMinimo',    
        'entradasHoje',    
        'saidasHoje',      
        'dtUltimaEntrada', 
        'dtUltimaSaida',   
        null               
    ];
    
    //inicia com true (decrescente)
    let estadoOrdenacao = Array(campos.length).fill(true);
    
    document.querySelectorAll('th.ordenar').forEach((th, idx) => {
        // Pega o índice real da coluna na tabela
        const realIdx = Array.from(th.parentNode.children).indexOf(th);
        const campo = campos[realIdx];
        
        if (!campo) return; // Pula colunas não ordenáveis (imagem e ações)
        
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
    
            produtosFiltrados.sort((a, b) => {
                let valorA, valorB;
                
                if (campo === 'quantidade' || campo === 'limiteMinimo' || campo === 'preco' || campo === 'entradasHoje' || campo === 'saidasHoje') {
                    // numérico
                    valorA = Number(a[campo]) || 0;
                    valorB = Number(b[campo]) || 0;
                    return estadoOrdenacao[realIdx] ? valorB - valorA : valorA - valorB;
                } else if (campo === 'dtUltimaEntrada' || campo === 'dtUltimaSaida') {
                    valorA = parseDataQualquerFormato(a[campo]);
                    valorB = parseDataQualquerFormato(b[campo]);
                    if (!valorA && !valorB) return 0;
                    if (!valorA) return 1;
                    if (!valorB) return -1;
                    return estadoOrdenacao[realIdx] ? valorB - valorA : valorA - valorB;
                } else {
                    // alfabético
                    valorA = (a[campo] || '').toString().toLowerCase();
                    valorB = (b[campo] || '').toString().toLowerCase();
                    return estadoOrdenacao[realIdx]
                        ? valorA.localeCompare(valorB, undefined, { numeric: true })
                        : valorB.localeCompare(valorA, undefined, { numeric: true });
                }
            });
            
            //altera o estado de ordenação
            estadoOrdenacao[realIdx] = !estadoOrdenacao[realIdx];
            icon.innerHTML = estadoOrdenacao[realIdx]
                // true seta para baixo (decrescente) false seta para cima (crescente)
                ? '<i class="fa-solid fa-arrow-down"></i>'
                : '<i class="fa-solid fa-arrow-up"></i>';
            renderizarProdutos(produtosFiltrados);
            icon.style.display = 'inline-block';
        });
    });

    const btnFiltrarProdutos = document.getElementById('btn-filtrar-produtos');
    const filtrosAvancados = document.getElementById('filtros-avancados');
    const btnLimparFiltros = document.getElementById('btn-limpar-filtros');

    // Sempre começa oculto
    filtrosAvancados.style.display = 'none';

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

        // Limpa todos os inputs e selects dos filtros avançados
        filtrosAvancados.querySelectorAll('input, select').forEach(el => {
            if (el.type === 'select-one') el.selectedIndex = 0;
            else if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
            else el.value = '';
        });

        // Limpa faixas (preço, quantidade, limite)
        precoMin.value = "";
        precoMax.value = "";
        precoInput.value = "";
        qtdMin.value = "";
        qtdMax.value = "";
        qtdInput.value = "";
        limiteMin.value = "";
        limiteMax.value = "";
        limiteInput.value = "";

        //remover a border dos inputs de faixa
        precoInput.style.border = '';
        limiteInput.style.border = '';
        qtdInput.style.border = '';


        // Limpa categorias: marca "Todas"
        // Marca "Todas" nas categorias

        // Marca todos os checkboxes de quantidade como true
        const quantidadeChecks = document.querySelectorAll('#quantidade-faixa-popup input[type="checkbox"]');
        if (quantidadeChecks) {
            quantidadeChecks.forEach(cb => cb.checked = true);
            atualizarPlaceholderQuantidade();
        }

        const categoriaChecks = document.querySelectorAll('.categoria-multi-check');
        if (categoriaChecks) {
            categoriaChecks.forEach(cb => cb.checked = true);
            categoriaChecks[0].checked = true; // "Todas"
            atualizarPlaceholderCategoriaMulti();
            updateOptions();
            atualizarPlaceholderTamanhoMulti();
        }

        // Marca "Todos" nos gêneros
        const generoChecks = document.querySelectorAll('.genero-multi-check');
        if (generoChecks) {
            generoChecks.forEach(cb => cb.checked = true);
            generoChecks[0].checked = true; // "Todos"
            atualizarPlaceholderGeneroMulti();
        }

        // Limpa faixas de preço, quantidade e limite
        limparFaixaPreco();
        qtdMin.value = '';
        qtdMax.value = '';
        qtdInput.value = '';
        limiteMin.value = '';
        limiteMax.value = '';
        limiteInput.value = '';

        filtrar(); // Atualiza lista
    });

    // Clicou fora, esconde

}

// --- PREÇO FAIXA ---
const precoInput = document.getElementById('filter-preco');
const precoPopup = document.getElementById('preco-faixa-popup');
const precoMin = document.getElementById('preco-min');
const precoMax = document.getElementById('preco-max');

// Máscara para 0,00 até 999,99
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
    let ativo = true;

    // Se ambos vazios, limpa o input para mostrar o placeholder
    if (!min && !max) {
        precoInput.value = '';
        precoPopup.style.display = 'none';
        ativo = false;
        filtrar();
        return;
    }

    // Se só "de" preenchido, assume até 999,99
    if (min && !max) max = '999.99';
    // Se só "até" preenchido, assume de 0,00
    if (!min && max) min = '0.00';

    // Converte para número para comparar
    let minNum = parseFloat(min) || 0;
    let maxNum = parseFloat(max) || 999.99;
    
    // Inverte se min > max
    if (minNum > maxNum) [minNum, maxNum] = [maxNum, minNum];

    // Formata de volta para string
    min = minNum.toFixed(2).replace('.', ',');
    max = maxNum.toFixed(2).replace('.', ',');

    if (min === max) {
        precoInput.value = `R$ ${min}`;
    } else {
        precoInput.value = `R$ ${min} - R$ ${max}`;
    }
    if (precoInput.value === "R$ 0,00 - R$ 999,99") {
        precoInput.value = 'Todos';
        ativo = false;
    }

    precoPopup.style.display = 'none';

    if (ativo) {
        precoInput.style.border = '2px solid #1e94a3';
        precoInput.style.color = '#1e94a3';
    } else {
        precoInput.style.border = '';
        precoInput.style.color = '';
    }
    const chevron = input.parentNode.querySelector('.chevron-categoria');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';

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
    this.value = this.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 3);
});
qtdMax.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 3);
});
// function aplicarFiltroQtdFaixa() {
//     let min = qtdMin.value;
//     let max = qtdMax.value;
//     let ativo = true;

//     // Se ambos vazios, limpa o input para mostrar o placeholder
//     if (min === "" && max === "") {
//         qtdInput.value = '';
//         qtdPopup.style.display = 'none';
//         ativo = false;
//         filtrar();
//         return;
//     }

//     min = min === "" ? 0 : parseInt(min);
//     max = max === "" ? 999 : parseInt(max);

//     if (min > max) [min, max] = [max, min];
//     qtdMin.value = min;
//     qtdMax.value = max;
//     qtdInput.value = `${min} - ${max}`;
//     if (qtdInput.value === "0 - 999") {
//         qtdInput.value = "Todas";
//         ativo = false;
//     }
//     qtdPopup.style.display = 'none';

//     if (ativo) {
//         qtdInput.style.border = '2px solid #1e94a3';
//         qtdInput.style.color = '#1e94a3';
//     } else {
//         qtdInput.style.border = '';
//         qtdInput.style.color = '';
//     }
//     filtrar();
// }
document.addEventListener('mousedown', function(e) {
    if (qtdPopup.style.display === 'block' && !qtdPopup.contains(e.target) && e.target !== qtdInput) {
        atualizarPlaceholderQuantidade();
        // aplicarFiltroQtdFaixa();
        qtdPopup.style.display = 'none';
        filtrar();
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
    let ativo = true;

    // Se ambos vazios, limpa o input para mostrar o placeholder
    if (!min && !max) {
        limiteInput.value = '';
        limitePopup.style.display = 'none';
        ativo = false;
        filtrar();
        return;
    }

    min = parseInt(min) || 1;
    max = parseInt(max) || 999;
    if (min > max) [min, max] = [max, min];
    limiteMin.value = min;
    limiteMax.value = max;
    if (min === max) {
        limiteInput.value = `Apenas com ${min}`;
    } else {
        limiteInput.value = `${min} - ${max}`;
    }
    if (limiteInput.value === "1 - 999") {
        limiteInput.value = "Todos";
        ativo = false;
    }
    limitePopup.style.display = 'none';

    if (ativo) {
        limiteInput.style.border = '2px solid #1e94a3';
        limiteInput.style.color = '#1e94a3';
    } else {
        limiteInput.style.border = '';
        limiteInput.style.color = '';
    }
    const chevron = limiteInput.parentNode.querySelector('.chevron-categoria');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';
    filtrar();
}
document.addEventListener('mousedown', function(e) {
    if (limitePopup.style.display === 'block' && !limitePopup.contains(e.target) && e.target !== limiteInput) {
        aplicarFiltroLimiteFaixa();
    }
});


const buscaInput = document.getElementById('busca-produto');
const buscaSugestoes = document.getElementById('busca-sugestoes');

buscaInput.addEventListener('input', function() {
    const termo = this.value.trim();
    buscaSugestoes.innerHTML = '';
    if (!termo) {
        buscaSugestoes.style.display = 'none';
        filtrar(); // Atualiza a lista para mostrar todos se o campo está vazio
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
            filtrar(); // Filtra ao selecionar sugestão
        });
        buscaSugestoes.appendChild(div);
    });
    buscaSugestoes.style.display = encontrados.length > 0 ? 'block' : 'none';

    // Filtra produtos conforme digita
    filtrar();
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

function abrirDetalhesProduto(produto) {
    document.body.style.overflow = 'hidden';

    document.getElementById('detalhe-codigo').value = produto.codigo || '-';
    document.getElementById('detalhe-nome').value = produto.nome || '-';
    document.getElementById('detalhe-categoria').value = produto.categoria || '-';
    const tamanhoExibido = exibirTamanho(produto.tamanho);
    document.getElementById('detalhe-tamanho').value = tamanhoExibido;
    document.getElementById('detalhe-genero').value = produto.genero || '-';
    document.getElementById('detalhe-quantidade').value = (produto.quantidade === 0 ? '0' : (produto.quantidade || '-'));
    document.getElementById('detalhe-limite').value = produto.limiteMinimo || '-';
    const precoFormatado = produto.preco ? produto.preco.toFixed(2).replace('.', ',') : '-';
    document.getElementById('detalhe-preco').value = precoFormatado ? `R$ ${precoFormatado}` : '-';
    document.getElementById('detalhe-descricao').value = produto.descricao || '';

    // Busca todas as movimentações e filtra pelo código do produto
    fetch('/api/movimentacoes')
        .then(response => response.json())
        .then(movs => {
            // Filtra movimentações do produto correto
            const movsProduto = movs.filter(m => m.codigoProduto === produto.codigo);

            const entradas = movsProduto.filter(m => m.tipoMovimentacao === 'ENTRADA');
            const saidas = movsProduto.filter(m => m.tipoMovimentacao === 'SAIDA');

            const entrada = entradas.sort((a, b) => new Date(b.data) - new Date(a.data))[0];
            const saida = saidas.sort((a, b) => new Date(b.data) - new Date(a.data))[0];

            // ENTRADA
            document.getElementById('detalhe-ultima-entrada').value = entrada ? formatarData(entrada.data) : '-';
            document.getElementById('detalhe-qtd-entrada').value = entrada ? entrada.quantidadeMovimentada : '-';
            const valorEntrada = entrada && entrada.valorMovimentacao != null
                ? Number(String(entrada.valorMovimentacao).replace(/\./g, '').replace(',', '.'))
                : null;
            document.getElementById('detalhe-valor-compra').value = valorEntrada != null
                ? valorEntrada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : '-';
            
            const valorSaida = saida && saida.valorMovimentacao != null
                ? Number(String(saida.valorMovimentacao).replace(/\./g, '').replace(',', '.'))
                : null;
            document.getElementById('detalhe-valor-venda').value = valorSaida != null
                ? valorSaida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : '-';            
                document.getElementById('detalhe-fornecedor').value = entrada ? entrada.parteEnvolvida : '-';
            if (document.getElementById('detalhe-resp-entrada'))
                document.getElementById('detalhe-resp-entrada').value = entrada ? entrada.responsavel : '-';

            // SAÍDA
            document.getElementById('detalhe-ultima-saida').value = saida ? formatarData(saida.data) : '-';
            document.getElementById('detalhe-qtd-saida').value = saida ? saida.quantidadeMovimentada : '-';
            document.getElementById('detalhe-valor-venda').value = saida ? saida.valorMovimentacao : '-';
            document.getElementById('detalhe-cliente').value = saida ? saida.parteEnvolvida : '-';
            if (document.getElementById('detalhe-resp-saida'))
                document.getElementById('detalhe-resp-saida').value = saida ? saida.responsavel : '-';
        });

    // Imagem
    const img = document.getElementById('detalhe-imagem');
    if (produto.url_imagem) {
        img.src = produto.url_imagem;
        img.style.display = 'block';
    } else {
        img.src = '';
        img.style.display = 'none';
        img.outerHTML = `<span style="display: flex; justify-content: center; align-items: center; font-size: 32px; color:#777"><i class="fa-regular fa-image"></i></span>`;
    }

    document.getElementById('detalhes-produto-popup').style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Editar
    const editLink = document.getElementById('detalhes-edit-link');
    if (editLink) {
        editLink.href = `/editar-produto?id=${produto.id}`;
    }

    // Remover
    const removeBtn = document.getElementById('detalhes-remove-btn');
    if (removeBtn) {
        removeBtn.onclick = function() {
            removerProduto(produto.id);
        };
    }
}

document.addEventListener('mousedown', function(e) {
    const modalBg = document.getElementById('detalhes-produto-popup');
    const modal = modalBg && modalBg.querySelector('.detalhes-modal');
    if (modalBg && modalBg.style.display !== 'none') {
        if (e.target === modalBg) {
            fecharDetalhesProdutoPopup();
        }
    }
});

function fecharDetalhesProduto() {
    document.getElementById('detalhes-produto-popup').style.display = 'none';
    document.body.style.overflow = '';
}

function atualizarDetalhesInfo(produtos) {
    // Soma a coluna quantidade dos produtos recebidos (filtrados)
    const total = produtos.reduce((soma, p) => soma + (Number(p.quantidade) || 0), 0);
    document.getElementById('detalhe-total-produtos').textContent = total;

    // Baixo estoque: quantidade > 0 e <= 2 * limiteMinimo
    const baixoEstoque = produtos.filter(p => (Number(p.quantidade) > 0) && (Number(p.quantidade) <= 2 * Number(p.limiteMinimo))).length;
    document.getElementById('detalhe-baixo-estoque').textContent = baixoEstoque;

    // Estoque zerado: quantidade == 0
    const zerados = produtos.filter(p => Number(p.quantidade) === 0).length;
    document.getElementById('detalhe-estoque-zerado').textContent = zerados;

    // Total de produtos cadastrados
    document.getElementById('detalhe-produtos-cadastrados').textContent = produtos.length;

    // Entradas hoje - usando endpoint específico para totais
    fetch('/entradas/total-hoje')
        .then(response => response.json())
        .then(total => {
            document.getElementById('detalhe-entradas-hoje').textContent = total;
        })
        .catch(error => {
            document.getElementById('detalhe-entradas-hoje').textContent = '0';
        });

    // Saídas hoje - usando endpoint específico para totais
    fetch('/saidas/total-hoje')
        .then(response => response.json())
        .then(total => {
            document.getElementById('detalhe-saidas-hoje').textContent = total;
        })
        .catch(error => {
            document.getElementById('detalhe-saidas-hoje').textContent = '0';
        });

    renderizarProdutos(produtos);
}

window.expandedCategoriaMulti = false;

function showCheckboxesCategoriaMulti() {
    var checkboxes = document.getElementById("checkboxes-categoria-multi");
    if (!window.expandedCategoriaMulti) {
        checkboxes.style.display = "block";
        window.expandedCategoriaMulti = true;
        const overSelect = document.querySelector('.multiselect-categoria .overSelect');
        if (overSelect) {
            overSelect.style.position = 'unset';
        }


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
                const overSelect = document.querySelector('.multiselect-categoria .overSelect');
                if (overSelect) {
                    overSelect.style.position = 'absolute';
                }
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
    const input = document.getElementById('filter-categoria');
    const selecionados = checks.slice(1)
        .filter(cb => cb.checked)
        .map(cb => cb.parentNode.textContent.trim());
    todas.checked = checks.slice(1).every(cb => cb.checked);

    let ativo = true;
    if (todas.checked || selecionados.length === 0) {
        input.value = 'Todas';
        ativo = false;
    } else if (selecionados.length === 1) {
        input.value = selecionados[0];
    } else {
        input.value = selecionados.join(', ');
    }

    if (ativo) {
        input.style.border = '2px solid #1e94a3';
        input.style.color = '#1e94a3';
    } else {
        input.style.border = '';
        input.style.color = '';
    }
    // Atualiza o chevron junto
    const chevron = input.parentNode.querySelector('.chevron-categoria');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';
}

function showCheckboxesTamanhoMulti() {
    var checkboxes = document.getElementById("checkboxes-tamanho-multi");
    if (!window.expandedTamanhoMulti) {
        checkboxes.style.display = "block";
        window.expandedTamanhoMulti = true;
        const overSelect = document.querySelector('.multiselect-tamanho .overSelect');
        if (overSelect) {
            overSelect.style.position = 'unset';
        }

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
                const overSelect = document.querySelector('.multiselect-tamanho .overSelect');
                if (overSelect) {
                    overSelect.style.position = 'absolute';
                }
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
    const input = document.getElementById('filter-tamanho');

    // Só conta os tamanhos individuais visíveis (não os grupos)
    const individuaisVisiveis = checks.filter(cb =>
        !['tamanho-multi-todas','tamanho-multi-todas-letra','tamanho-multi-todas-num'].includes(cb.id)
    );
    const selecionados = individuaisVisiveis.filter(cb => cb.checked)
        .map(cb => cb.parentNode.textContent.trim());

    let texto = 'Todos';
    let ativo = true;
    if (selecionados.length === 0 || selecionados.length === individuaisVisiveis.length) {
        if (individuaisVisiveis.every(cb => !/^_\d+$/.test(cb.value))) {
            texto = 'Todos em Letras';
        } else if (individuaisVisiveis.every(cb => /^_\d+$/.test(cb.value))) {
            texto = 'Todos Numéricos';
        } else {
            texto = 'Todos';
            ativo = false;
        }
    } else {
        const todosLetrasMarcados = individuaisVisiveis
            .filter(cb => !/^_\d+$/.test(cb.value))
            .every(cb => cb.checked) &&
            individuaisVisiveis.some(cb => !/^_\d+$/.test(cb.value));
        const todosNumericosMarcados = individuaisVisiveis
            .filter(cb => /^_\d+$/.test(cb.value))
            .every(cb => cb.checked) &&
            individuaisVisiveis.some(cb => /^_\d+$/.test(cb.value));
        if (todosLetrasMarcados && !todosNumericosMarcados) {
            // Mostra só os numéricos selecionados
            const selecionadosNumericos = individuaisVisiveis
            .filter(cb => /^_\d+$/.test(cb.value) && cb.checked)
            .map(cb => cb.parentNode.textContent.trim());
            texto = 'Todos em Letras' + (selecionadosNumericos.length ? ', ' + selecionadosNumericos.join(', ') : '');
        } else if (todosNumericosMarcados && !todosLetrasMarcados) {
            // Mostra só os de letras selecionados
            const selecionadosLetras = individuaisVisiveis
            .filter(cb => !/^_\d+$/.test(cb.value) && cb.checked)
            .map(cb => cb.parentNode.textContent.trim());
            texto = 'Todos Numéricos' + (selecionadosLetras.length ? ', ' + selecionadosLetras.join(', ') : '');
        } else {
            texto = selecionados.join(', ');
        }
    }

    input.value = texto;

    if (ativo) {
        input.style.border = '2px solid #1e94a3';
        input.style.color = '#1e94a3';
    } else {
        input.style.border = '';
        input.style.color = '';
    }
    // Atualiza o chevron junto
    const chevron = input.parentNode.querySelector('.chevron-tamanho');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';
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

// function showCheckboxesTamanhoMulti() {
//     var checkboxes = document.getElementById("checkboxes-tamanho-multi");
//     if (!window.expandedTamanhoMulti) {
//         checkboxes.style.display = "block";
//         window.expandedTamanhoMulti = true;

//         // ATUALIZA O PLACEHOLDER AGORA QUE OS CHECKBOXES ESTÃO VISÍVEIS
//         atualizarPlaceholderTamanhoMulti();

//         // Fecha ao clicar fora
//         function handleClickOutside(e) {
//             if (
//                 checkboxes &&
//                 !checkboxes.contains(e.target) &&
//                 !document.querySelector('.multiselect .overSelect').contains(e.target)
//             ) {
//                 checkboxes.style.display = "none";
//                 window.expandedTamanhoMulti = false;
//                 document.removeEventListener('mousedown', handleClickOutside);
//             }
//         }
//         document.addEventListener('mousedown', handleClickOutside);
//     } else {
//         checkboxes.style.display = "none";
//         window.expandedTamanhoMulti = false;
//     }
// }

window.expandedGeneroMulti = false;

function showCheckboxesGeneroMulti() {
    var checkboxes = document.getElementById("checkboxes-genero-multi");
    if (!window.expandedGeneroMulti) {
        checkboxes.style.display = "block";
        window.expandedGeneroMulti = true;
        const overSelect = document.querySelector('.multiselect .overSelect');
        if (overSelect) {
            overSelect.style.position = 'unset';
        }

        // Fecha ao clicar fora
        function handleClickOutside(e) {
            if (
                checkboxes &&
                !checkboxes.contains(e.target) &&
                !document.querySelector('.multiselect-genero .overSelect').contains(e.target)
            ) {
                checkboxes.style.display = "none";
                window.expandedGeneroMulti = false;
                document.removeEventListener('mousedown', handleClickOutside);
                const overSelect = document.querySelector('.multiselect .overSelect');
                if (overSelect) {
                    overSelect.style.position = 'absolute';
                }
                atualizarPlaceholderGeneroMulti();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
    } else {
        checkboxes.style.display = "none";
        window.expandedGeneroMulti = false;
        atualizarPlaceholderGeneroMulti();
    }
}

function atualizarPlaceholderGeneroMulti() {
    const checks = Array.from(document.querySelectorAll('.genero-multi-check'));
    const todas = checks[0];
    const input = document.getElementById('filter-genero');
    const selecionados = checks.slice(1)
        .filter(cb => cb.checked)
        .map(cb => cb.parentNode.textContent.trim());
    todas.checked = checks.slice(1).every(cb => cb.checked);

    let ativo = true;
    if (todas.checked || selecionados.length === 0) {
        input.value = 'Todos';
        ativo = false;
    } else if (selecionados.length === 1) {
        input.value = selecionados[0];
    } else {
        input.value = selecionados.join(', ');
    }

    if (ativo) {
        input.style.border = '2px solid #1e94a3';
        input.style.color = '#1e94a3';
    } else {
        input.style.border = '';
        input.style.color = '';
    }
    // Atualiza o chevron junto
    const chevron = input.parentNode.querySelector('.chevron-genero');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';
}
function getGenerosSelecionados() {
    const checks = Array.from(document.querySelectorAll('.genero-multi-check'));
    const todas = checks[0];
    if (todas.checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
}

// Listeners de seleção para generos
window.addEventListener('DOMContentLoaded', function() {
    const checks = Array.from(document.querySelectorAll('.genero-multi-check'));
    const todas = checks[0];
    // const placeholder = document.getElementById('genero-multi-placeholder');

    // "Todos" marca/desmarca todos
    todas.addEventListener('change', function() {
        checks.forEach(cb => cb.checked = todas.checked);
        atualizarPlaceholderGeneroMulti();
        filtrar();
    });

    // Se todos individuais marcados, marca "Todos". Se algum desmarcado, desmarca "Todos"
    checks.slice(1).forEach(cb => {
        cb.addEventListener('change', function() {
            todas.checked = checks.slice(1).every(c => c.checked);
            atualizarPlaceholderGeneroMulti();
            filtrar();
        });
    });

    atualizarPlaceholderGeneroMulti();
});

function formatarData(data) {
    if (!data) return '-';
    const dataObj = new Date(data + 'T00:00:00');
    const dia = dataObj.getDate().toString().padStart(2, '0');
    const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
}



function atualizarBadgeBaixoEstoque() {
    const badge = document.querySelector('.badge');
    if (!badge) return;

    badge.style.display = 'none';

    fetch('/produtos/baixo-estoque')
        .then(res => res.json())
        .then(produtos => {
            const qtd = produtos.length;
            if (qtd < 0) {
                const bellIcon = document.querySelector('.fa-regular.fa-bell');
                const notification = document.querySelector('.notification');
                const nots = document.getElementById('nots');
                if (bellIcon && notification && nots) {
                    bellIcon.style.display = 'none';
                    notification.style.display = 'none';
                    nots.style.display = 'none';
                }
                return;
            }

            badge.textContent = qtd > 99 ? '99+' : qtd;
            badge.removeAttribute('style');
            badge.style.display = 'inline-block';

            if (qtd < 10) {
                badge.style.padding = '3px 6px';

            } else if (qtd < 99) {
                badge.style.padding = '3px';

            } else if (qtd > 99) {
                badge.style.padding = '5px 0px 3px 2px';
            }
        });
}
