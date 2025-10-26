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




// lixeira
async function verificarLixeira() {
    const notificationLixeira = document.querySelector('.notification[onclick*="/produtos-removidos"]');
    if (!notificationLixeira) return;
    const containerLixeira = notificationLixeira.parentElement;

    fetch('/produtos/removidos')
        .then(res => res.json())
        .then(removidos => {
            if (removidos && removidos.length > 0) {
                containerLixeira.style.display = 'flex';
            } else {
                containerLixeira.style.display = 'none';
            }
        });
}

if (window.aplicarPermissoesEstoque) {
    window.aplicarPermissoesEstoque().then(() => {
        verificarLixeira();
    });
}



async function atualizarBadgeLixeira() {
    const badge = document.querySelector('.badge-lixeira');
    if (!badge) return;

    badge.style.display = 'none';

    if (window.aplicarPermissoesEstoque) {
        await window.aplicarPermissoesEstoque();
    }

    fetch('/produtos/removidos')
        .then(res => res.json())
        .then(removidos => {
            const qtd = removidos.length;
            if (qtd <= 0) {
                badge.style.display = 'none';
                return;
            }
            badge.textContent = qtd > 99 ? '99+' : qtd;
            badge.removeAttribute('style');
            badge.style.display = 'inline-block';

            if (qtd < 10) {
                badge.style.padding = '4px 6px';
            } else if (qtd < 99) {
                badge.style.padding = '3px';
            } else if (qtd > 99) {
                badge.style.padding = '5px 0px 3px 2px';
            }
        });
}

window.addEventListener('DOMContentLoaded', function() {
    atualizarBadgeLixeira();
});

//fim lixeira



// notificacao
async function atualizarBadgeBaixoEstoque() {
    const badge = document.querySelector('.badge-baixo-estoque');
    if (!badge) return;

    badge.style.display = 'none';

    if (window.aplicarPermissoesEstoque) {
        await window.aplicarPermissoesEstoque();
    }

    fetch('/produtos/baixo-estoque')
        .then(res => res.json())
        .then(produtos => {
            const qtd = produtos.length;
            if (qtd <= 0) {
                badge.style.display = 'none';
                return;
            }
            badge.textContent = qtd > 99 ? '99+' : qtd;
            badge.removeAttribute('style');
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
                }, 3000);
            }
        });
}

const bellIcon = document.querySelector('.fa-bell');
if (bellIcon) {
    bellIcon.classList.add('fa-shake');
    setTimeout(() => {
        bellIcon.classList.remove('fa-shake');
    }, 2500);

    bellIcon.addEventListener('mouseenter', () => {
        bellIcon.classList.add('fa-shake');
    });
    bellIcon.addEventListener('mouseleave', () => {
        bellIcon.classList.remove('fa-shake');
    });
}


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

// ao desmarcar qualquer gênero individual, o "Todos" desmarca
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

// mascara preco
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

//checkboxes tamanho
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

//Categorias
let categoriasBackend = [];

function renderCategoriaFilter() {
    const container = document.getElementById('checkboxes-categoria-multi');
    if (!container) return;
    container.innerHTML = '';

    // "Todas"
    container.insertAdjacentHTML('beforeend', `
      <label>
        <input type="checkbox" id="categoria-multi-todas" class="categoria-multi-check" value="" checked /> Todas
      </label>
    `);

    // adiciona checkboxes para cada categoria do backend
    categoriasBackend.forEach(cat => {
        const nome = (cat.nome || '').toString().trim();
        const value = nome.toUpperCase();
        const labelText = cat.nome || value;
        container.insertAdjacentHTML('beforeend', `
          <label>
            <input type="checkbox" class="categoria-multi-check" value="${value}" checked /> ${labelText}
          </label>
        `);
    });

    // placeholder visual
    atualizarPlaceholderCategoriaMulti();

    // Delegation: único listener para gerenciar "Todas" e individuais
    container.removeEventListener('change', categoriaContainerChange);
    container.addEventListener('change', categoriaContainerChange);

    function categoriaContainerChange(e) {
        const target = e.target;
        if (!target || !target.classList.contains('categoria-multi-check')) return;

        const todasEl = container.querySelector('#categoria-multi-todas');
        const individuais = Array.from(container.querySelectorAll('.categoria-multi-check')).filter(cb => cb.id !== 'categoria-multi-todas');

        // clicou em "Todas"
        if (target.id === 'categoria-multi-todas') {
            const checked = !!target.checked;
            container.querySelectorAll('.categoria-multi-check').forEach(cb => cb.checked = checked);
        } else {
            // atualiza "Todas" conforme estado dos individuais
            if (todasEl) todasEl.checked = individuais.every(cb => cb.checked);
        }

        // atualiza UI e filtros
        atualizarPlaceholderCategoriaMulti();
        updateOptions();
        filtrar();
    }
}

async function carregarCategoriasEProdutos() {
    try {
        const catRes = await fetch('/categorias');
        const catData = await catRes.json();
        categoriasBackend = catData.map(c => ({
            nome: c.nome,
            tipoTamanho: c.tipoTamanho,
            tipoGenero: c.tipoGenero
        }));
    } catch {
        categoriasBackend = [];
    }
    renderCategoriaFilter();
    updateOptions();

    let url = '/produtos';
    try {
        const prodRes = await fetch(url);
        const prodData = await prodRes.json();
        produtos = prodData;
        produtosOriginais = [...produtos];
        produtosFiltrados = [...produtos];
        produtos.sort((a, b) => {
            const valorA = (a.codigo || '').toString().toLowerCase();
            const valorB = (b.codigo || '').toString().toLowerCase();
            return valorA.localeCompare(valorB, undefined, { numeric: true });
        });
    } catch {
        produtos = [];
        produtosOriginais = [];
        produtosFiltrados = [];
    }

    filtrar();
}
document.addEventListener('DOMContentLoaded', carregarCategoriasEProdutos);


//opcoes de tamanhos e generos
function updateOptions() {
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
    let categoriasSelecionadas = [];
    if (checks.length > 0 && !checks[0].checked) {
        categoriasSelecionadas = checks.slice(1).filter(cb => cb.checked).map(cb => cb.value.toString().trim().toUpperCase());
    }

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

    function computeAllowedSizes(selectedCategoryNames) {
        const tamanhosSet = new Set();
        if (!selectedCategoryNames || selectedCategoryNames.length === 0) {
            tamLetra.forEach(t => tamanhosSet.add(t.value));
            tamNumero.forEach(n => tamanhosSet.add('_' + n));
            return tamanhosSet;
        }

        selectedCategoryNames.forEach(catName => {
            const catObj = categoriasBackend.find(c => c.nome && c.nome.toString().trim().toUpperCase() === catName);
            if (!catObj) {
                return;
            }
            const tipo = (catObj.tipoTamanho || '').toUpperCase();
            if (tipo === 'L') {
                tamLetra.forEach(t => tamanhosSet.add(t.value));
            } else if (tipo === 'N') {
                tamNumero.forEach(n => tamanhosSet.add('_' + n));
            } else if (tipo === 'T') {
                tamLetra.forEach(t => tamanhosSet.add(t.value));
                tamNumero.forEach(n => tamanhosSet.add('_' + n));
            }
        });

        return tamanhosSet;
    }

    function computeAllowedGenders(selectedCategoryNames) {
        const generosSet = new Set();
        if (!selectedCategoryNames || selectedCategoryNames.length === 0) {
            generosSet.add('FEMININO');
            generosSet.add('MASCULINO');
            generosSet.add('UNISSEX');
            return generosSet;
        }

        selectedCategoryNames.forEach(catName => {
            const catObj = categoriasBackend.find(c => c.nome && c.nome.toString().trim().toUpperCase() === catName);
            if (!catObj) {
                return;
            }
            const tipo = (catObj.tipoGenero || '').toUpperCase();
            if (tipo === 'F') {
                generosSet.add('FEMININO');
            } else if (tipo === 'M') {
                generosSet.add('MASCULINO');
            } else if (tipo === 'U') {
                generosSet.add('UNISSEX');
            } else if (tipo === 'T') {
                generosSet.add('FEMININO');
                generosSet.add('MASCULINO');
                generosSet.add('UNISSEX');
            }
        });

        return generosSet;
    }

    const tamanhos = computeAllowedSizes(categoriasSelecionadas);
    const generos = computeAllowedGenders(categoriasSelecionadas);

    // Atualiza tamanhos
    const tamanhoSelect = document.getElementById('filter-tamanho');
    const valorSelecionado = tamanhoSelect.value;
    let options = '';
    const temLetra = [...tamanhos].some(v => ["ÚNICO","PP","P","M","G","GG","XG","XGG","XXG"].includes(v));
    const temNum = [...tamanhos].some(v => /^_\d+$/.test(v));

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
    tamanhoSelect.innerHTML = options;
    if ([...tamanhos].includes(valorSelecionado)) {
        tamanhoSelect.value = valorSelecionado;
    } else {
        tamanhoSelect.selectedIndex = 0;
    }
    tamanhoSelect.style.color = tamanhoSelect.value ? 'black' : '#757575';

    // Atualiza DIV de checkboxes de tamanhos e listeners
    gerarCheckboxesTamanhoMulti(tamanhos);
    aplicarListenersTamanhoMulti();
    atualizarPlaceholderTamanhoMulti();

    // Atualiza checkboxes de gêneros
    gerarCheckboxesGeneroMulti(generos);
    aplicarListenersGeneroMulti();
    atualizarPlaceholderGeneroMulti();
}

function gerarCheckboxesGeneroMulti(generosValidos) {
    const checkboxesDiv = document.getElementById('checkboxes-genero-multi');
    checkboxesDiv.innerHTML = '';

    const temTodos = generosValidos.size === 3;
    if (temTodos) {
        checkboxesDiv.innerHTML += `<label><input type="checkbox" id="genero-multi-todos" class="genero-multi-check" value="" checked> Todos</label>`;
    }

    if (generosValidos.has('FEMININO')) {
        checkboxesDiv.innerHTML += `<label><input type="checkbox" class="genero-multi-check" value="FEMININO" checked> Feminino</label>`;
    }
    if (generosValidos.has('MASCULINO')) {
        checkboxesDiv.innerHTML += `<label><input type="checkbox" class="genero-multi-check" value="MASCULINO" checked> Masculino</label>`;
    }
    if (generosValidos.has('UNISSEX')) {
        checkboxesDiv.innerHTML += `<label><input type="checkbox" class="genero-multi-check" value="UNISSEX" checked> Unissex</label>`;
    }
}

function aplicarListenersGeneroMulti() {
    const checks = Array.from(document.querySelectorAll('.genero-multi-check'));
    const todos = document.getElementById('genero-multi-todos');

    if (todos) {
        todos.addEventListener('change', function() {
            checks.forEach(cb => cb.checked = todos.checked);
            atualizarPlaceholderGeneroMulti();
            filtrar();
        });
    }

    checks.forEach(cb => {
        if (cb.id !== 'genero-multi-todos') {
            cb.addEventListener('change', function() {
                if (!cb.checked && todos) {
                    todos.checked = false;
                } else {
                    const individuais = checks.filter(c => c.id !== 'genero-multi-todos');
                    if (todos && individuais.every(c => c.checked)) {
                        todos.checked = true;
                    }
                }
                atualizarPlaceholderGeneroMulti();
                filtrar();
            });
        }
    });
    atualizarPlaceholderGeneroMulti();
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

    // Só conta os tamanhos individuais visíveis
    const individuaisVisiveis = checks.filter(cb =>
        !['tamanho-multi-todas','tamanho-multi-todas-letra','tamanho-multi-todas-num'].includes(cb.id)
    );
    const selecionados = individuaisVisiveis.filter(cb => cb.checked)
        .map(cb => cb.parentNode.textContent.trim());

    let texto = 'Todos';
    let ativo = true;
    if (selecionados.length === 0 || selecionados.length === individuaisVisiveis.length) {
        // apenas letras
        if (individuaisVisiveis.every(cb => !/^_\d+$/.test(cb.value))) {
            texto = 'Todos em Letras';
        }
        // apenas numericos
        else if (individuaisVisiveis.every(cb => /^_\d+$/.test(cb.value))) {
            texto = 'Todos Numéricos';
        }
        // todos
        else {
            texto = 'Todos';
            ativo = false;
        }
    } else {
        // verifica se todos em letras estão marcados
        const todosLetrasMarcados = individuaisVisiveis
            .filter(cb => !/^_\d+$/.test(cb.value))
            .every(cb => cb.checked) &&
            individuaisVisiveis.some(cb => !/^_\d+$/.test(cb.value));

        // verifica se todos numéricos estão marcados
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

    if (placeholderOption) placeholderOption.textContent = texto;
    select.selectedIndex = 0;
}

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

['quantidade-todas-popup','quantidade-baixo-estoque-popup','quantidade-zerados-popup'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', function() {
        syncQuantidadeChecksAndInputs();
        atualizarPlaceholderQuantidade();
    });
});

//quantidade
document.addEventListener('DOMContentLoaded', atualizarPlaceholderQuantidade);

//listener categoria
document.querySelectorAll('.categoria-multi-check').forEach(cb => {
    cb.addEventListener('change', updateOptions);
});




window.addEventListener('DOMContentLoaded', function() {
    updateOptions();
    
    const btnExibirDetalhes = document.getElementById('btn-exibir-detalhes');
    const detalhesDiv = document.getElementById('detalhes-estoque');

    // começa visível
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
let produtosOriginais = [];
let produtos = [];
let paginaAtual = 1;
let itensPorPagina = 10;


function filtrar() {
    // Mostra skeleton antes de processar filtros
    const tbody = document.getElementById('product-table-body');
    const skeletonRow = () => `<tr class='skeleton-table-row'>${Array(14).fill('').map(() => `<td class='skeleton-cell'><div class='skeleton-bar'></div></td>`).join('')}</tr>`;
    tbody.innerHTML = Array(10).fill('').map(skeletonRow).join('');

    // Filtros por categorias
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
    let categoriasSelecionadas = [];
    if (checks.length) {
        const todasChecked = !!checks[0].checked;
        if (!todasChecked) {
            categoriasSelecionadas = checks.slice(1)
                .filter(cb => cb.checked)
                .map(cb => cb.value.toString().trim().toUpperCase());
        }
    } else {
        // sem controles de categoria no DOM -> permite todas
        categoriasSelecionadas = [];
    }

    // tamanhos / generos normalizados
    let tamanhosSelecionados = getTamanhosSelecionados ? getTamanhosSelecionados().map(t => t.toString().trim().toUpperCase()) : [];
    let generosSelecionados = getGenerosSelecionados ? getGenerosSelecionados().map(g => g.toString().trim().toUpperCase()) : [];

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
        // CATEGORIAS
        if (categoriasSelecionadas && categoriasSelecionadas.length > 0) {
            const catProd = (p.categoria || '').toString().trim().toUpperCase();
            if (!categoriasSelecionadas.includes(catProd)) return false;
        }

        // TAMANHOS (tamanhosSelecionados tem valores tipo 'P' ou '_36')
        if (tamanhosSelecionados && tamanhosSelecionados.length > 0) {
            const tamProd = (p.tamanho || '').toString().trim().toUpperCase();
            if (!tamanhosSelecionados.includes(tamProd)) return false;
        }

        // GÊNEROS (generosSelecionados)
        if (generosSelecionados && generosSelecionados.length > 0) {
            const genProd = (p.genero || '').toString().trim().toUpperCase();
            if (!generosSelecionados.includes(genProd)) return false;
        }
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


//remover produto
function removerProduto(id, nome, quantidade) {
    const nomeProduto = nome || 'produto';

    if (quantidade === 0) {
        let cancelado = false;
        Swal.fire({
            title: `Removendo "${nomeProduto}"`,
            text: 'O produto será movido para a lixeira',
            icon: 'info',
            showCancelButton: true,
            showConfirmButton: false,
            cancelButtonText: 'Cancelar',
            customClass: {
            cancelButton: 'swal2-remove-custom'
            },
            allowOutsideClick: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: () => {
            const cancelBtn = Swal.getCancelButton();
            if (cancelBtn) {
                cancelBtn.style.width = '90px';
                cancelBtn.style.maxWidth = '90px';
                cancelBtn.style.border = 'none';
            }

            const swalTimer = setTimeout(() => {
                if (!cancelado) {
                fetch('/produtos/' + id, { method: 'DELETE' })
                    .then(response => {
                    if (response.ok) {
                        Swal.fire({
                        title: `"${nomeProduto}" removido!`,
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                        timerProgressBar: true
                        }).then(() => location.reload());
                    } else {
                        Swal.fire({
                        title: 'Erro!',
                        text: `Não foi possível remover ${nomeProduto}. Tente novamente`,
                        icon: 'error',
                        showConfirmButton: false,
                        timer: 1500,
                        timerProgressBar: true
                        });
                    }
                    });
                }
            }, 3000);

            Swal.getCancelButton().onclick = () => {
                cancelado = true;
                clearTimeout(swalTimer);
                Swal.close();
            };
            }
        });
    } else {
            const unidadeTexto = quantidade === 1 ? 'unidade' : 'unidades';
            Swal.fire({
            title: `Excluir "${nomeProduto}"?`,
            html: `Este produto possui <b>${quantidade} ${unidadeTexto}</b><br>Esta ação é permanente`,
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
                Swal.fire({
                    title: `Removendo "${nomeProduto}"`,
                    text: 'O produto será movido para a lixeira',
                    icon: 'info',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    timer: 1800,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                        setTimeout(() => {
                            fetch('/produtos/' + id, { method: 'DELETE' })
                                .then(response => {
                                    if (response.ok) {
                                        Swal.fire({
                                            title: `Produto "${nomeProduto}" removido!`,
                                            icon: 'success',
                                            showConfirmButton: false,
                                            timer: 1500,
                                            timerProgressBar: true
                                        }).then(() => location.reload());
                                    } else {
                                        Swal.fire({
                                            title: 'Erro!',
                                            text: `Não foi possível remover "${nomeProduto}". Tente novamente`,
                                            icon: 'error',
                                            showConfirmButton: false,
                                            timer: 1500,
                                            timerProgressBar: true
                                        });
                                    }
                                });
                        }, 1500);
                    }
                });
            }
        });
    }
}
//formatar tamanho
function exibirTamanho(tamanho) {
    if (tamanho === 'ÚNICO') return 'Único';
    if (typeof tamanho === 'string' && tamanho.startsWith('_')) return tamanho.substring(1);
    return tamanho;
}

//listagem produtos
function renderizarProdutos(produtos) {
    const tbody = document.getElementById('product-table-body');
    const thead = tbody.parentNode.querySelector('thead');
    const registrosPagina = document.getElementById('registros-pagina');
    const registrosInput = document.getElementById('registros-multi');
    // Usa o valor do radio personalizado
    let valorRadio = '10';
    const radioSelecionado = document.querySelector('input[name="registros-radio"]:checked');
    if (radioSelecionado) {
        valorRadio = radioSelecionado.value;
    }
    itensPorPagina = valorRadio === '' ? produtos.length : parseInt(valorRadio);

    const totalPaginas = Math.ceil(produtos.length / itensPorPagina);
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const produtosPagina = produtos.slice(inicio, fim);

    if (produtosPagina.length === 0) {
        if (thead) thead.style.display = 'none';

        if (registrosPagina) registrosPagina.style.display = 'none';

        if (produtosOriginais.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="14" style="text-align: center; padding: 0 0 30px 0; background-color: white">
                        <div style="display: flex; flex-direction: column; align-items: center; font-size: 20px; color: #888;">
                            <span style="font-weight:bold;">Nenhum produto no estoque</span>
                            <span>Cadastre o primeiro produto</span>
                            <img src="/images/sem_estoque.png" alt="Sem estoque" style="width:400px;">
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="14" style="text-align: center; padding: 0 0 30px 0; background-color: white">
                        <div style="display: flex; flex-direction: column; align-items: center; font-size: 20px; color: #888;">
                            <span style="font-weight:bold;">Nenhum produto encontrado</span>
                            <span>Selecione outros filtros</span>
                            <img src="/images/filtro_estoque.png" alt="Nenhum produto encontrado" style="width:400px;">
                        </div>
                    </td>
                </tr>
            `;
        }
        document.getElementById('paginacao').innerHTML = '';
        return;
    } else {
        if (thead) thead.style.display = '';
        if (registrosPagina) registrosPagina.style.display = '';
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
                            padding:4px 10px;
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
                // Teve saída: verifica se faz mais de 1 mês
                const dSaida = new Date(p.dtUltimaSaida + 'T00:00:00');
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                if (!isNaN(dSaida)) {
                    const diffDias = (hoje - dSaida) / (1000 * 60 * 60 * 24);
                    const dataFormatada = formatarData(p.dtUltimaSaida);
                    if (diffDias >= 30) {
                        ultimaSaida = `<span style="color:red;font-weight:bold;" title="Há mais de 30 dias">${dataFormatada}</span>`;
                    } else {
                        ultimaSaida = dataFormatada;
                    }
                } else {
                    ultimaSaida = formatarData(p.dtUltimaSaida);
                }
            } else {
                // Não teve saída ainda: mostra relógio
                if (p.dtUltimaEntrada) {
                    const dEntrada = new Date(p.dtUltimaEntrada + 'T00:00:00');
                    const hoje = new Date();
                    hoje.setHours(0, 0, 0, 0);
                    if (!isNaN(dEntrada)) {
                        const diffDias = (hoje - dEntrada) / (1000 * 60 * 60 * 24);
                        if (diffDias >= 30 && p.quantidade === 0) {
                            ultimaSaida = `<span style="color:red;" title="Nenhuma venda">-</span>`;
                        } else {
                            ultimaSaida = `<span title="Nenhuma venda">-</span>`;
                        }
                    } else {
                        ultimaSaida = `<span title="Nenhuma venda">-</i></span>`;
                    }
                } else {
                    ultimaSaida = `<span title="Nenhuma venda">-</span>`;
                }
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
                            ? `<img src="${imageUrl}" alt="${p.descricao || 'Foto do produto'}" class="produto-img" onclick='abrirDetalhesProduto(${JSON.stringify(produtoObj)}, ${JSON.stringify(movimentacaoObj)})' />`
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
                    <td>
                        <span style="${entradasHoje > 0 ? 'font-weight:bold;color:#43b04a;' : ''}">${entradasHoje}</span>
                    </td>
                    <td>
                        <span style="${saidasHoje > 0 ? 'font-weight:bold;color:#ff5722;' : ''}">${saidasHoje}</span>
                    </td>
                    <td>${ultimaEntrada}</td>
                    <td>${ultimaSaida}</td>
                    <td style="padding-right:20px" class="actions">
                        <button type="button" title="Detalhes" onclick='abrirDetalhesProduto(${JSON.stringify(produtoObj)}, ${JSON.stringify(movimentacaoObj)})'>
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <a href="/editar-produto?id=${p.id}" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </a>
                        <button type="button" onclick="removerProduto('${p.id}', '${p.nome.replace(/'/g, "\\'")}', ${p.quantidade})" title="Remover">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += rowHtml;
        });

        if (window.aplicarPermissoesEstoque) window.aplicarPermissoesEstoque();
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
    const tbody = document.getElementById('product-table-body');
    
    // Skeleton loading: 3 linhas, 14 colunas
    const skeletonRow = () => {
        return `<tr class='skeleton-table-row'>${Array(14).fill('').map(() => `<td class='skeleton-cell'><div class='skeleton-bar'></div></td>`).join('')}</tr>`;
    };
    tbody.innerHTML = Array(10).fill('').map(skeletonRow).join('');

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
            produtosOriginais = [...produtos];
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


//formata datas
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

let btnFiltrarProdutos;

window.onload = function() {
    // Inicializa radios personalizados de registros por página
    const registrosInput = document.getElementById('registros-multi');
    const radiosDiv = document.getElementById('radios-registros-multi');
    const chevron = document.querySelector('.chevron-registros');

    // Inicializa visual
    registrosInput.value = '10';
    radiosDiv.querySelector('input[type="radio"][value="10"]').checked = true;

    // Abre/fecha lista ao clicar no input ou chevron
    function abrirLista() {
        radiosDiv.style.display = 'block';
    }
    function fecharLista() {
        radiosDiv.style.display = 'none';
    }
    registrosInput.addEventListener('click', abrirLista);
    if (chevron) chevron.addEventListener('click', abrirLista);

    // Fecha ao clicar fora
    document.addEventListener('mousedown', function(e) {
        if (!radiosDiv.contains(e.target) && e.target !== registrosInput && e.target !== chevron) {
            fecharLista();
        }
    });

    // Evento para atualizar input ao selecionar radio (label clicável)
    radiosDiv.addEventListener('click', function(e) {
        const label = e.target.closest('label');
        if (label) {
            const radio = label.querySelector('input[type="radio"]');
            if (radio) {
                registrosInput.value = label.textContent.trim();
                radiosDiv.querySelectorAll('label').forEach(lbl => lbl.classList.remove('selecionado'));
                label.classList.add('selecionado');
                radio.checked = true;
                fecharLista();
                // Atualiza paginação
                itensPorPagina = radio.value === '' ? produtosOriginais.length : parseInt(radio.value);
                paginaAtual = 1;
                renderizarProdutos(produtosFiltrados);
            }
        }
    });

    // Inicializa carregamento com valor do radio
    let valorRadio = '10';
    const radioSelecionado = document.querySelector('input[name="registros-radio"]:checked');
    if (radioSelecionado) {
        valorRadio = radioSelecionado.value;
    }
    carregarProdutos(valorRadio === '10' ? '10' : valorRadio);

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
        
        if (!campo) return; // Pula imagem e ações
        
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

        filtrar();
    });



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



// busca
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
// btnFiltrarProdutos.addEventListener('click', function() {
//     filtrosAvancados.style.display = 'flex';
// });

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





// exibir detalhes
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
            removerProduto(produto.id, produto.nome, produto.quantidade);
        };
    }

    if (window.aplicarPermissoesEstoque) {
        window.aplicarPermissoesEstoque();
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

    // Entradas hoje
    fetch('/entradas/total-hoje')
        .then(response => response.json())
        .then(total => {
            document.getElementById('detalhe-entradas-hoje').textContent = total;
        })
        .catch(error => {
            document.getElementById('detalhe-entradas-hoje').textContent = '0';
        });

    // Saídas hoje
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
// window.addEventListener('DOMContentLoaded', function() {
//   const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
//   const todas = checks[0]; // O primeiro é "Todas"

//   // "Todas" marca/desmarca todos
//   todas.addEventListener('change', function() {
//     checks.forEach(cb => cb.checked = todas.checked);
//     atualizarPlaceholderCategoriaMulti();
//     filtrar();
//   });

//   // Se todos individuais marcados, marca "Todas". Se algum desmarcado, desmarca "Todas"
//   checks.slice(1).forEach(cb => {
//     cb.addEventListener('change', function() {
//       todas.checked = checks.slice(1).every(c => c.checked);
//       atualizarPlaceholderCategoriaMulti();
//       filtrar();
//     });
//   });

//   // Função global para pegar categorias selecionadas do multiselect
//   window.getCategoriasMultiSelecionadas = function() {
//     if (todas.checked) return [];
//     return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
//   };
// });

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
    return Array.from(document.querySelectorAll('.categoria-multi-check'))
        .filter(cb => cb.id !== 'categoria-multi-todas' && cb.checked)
        .map(cb => cb.value.toString().trim().toUpperCase());
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



//tamanho
function showCheckboxesTamanhoMulti() {
    var checkboxes = document.getElementById("checkboxes-tamanho-multi");
    if (!window.expandedTamanhoMulti) {
        checkboxes.style.display = "block";
        window.expandedTamanhoMulti = true;
        const overSelect = document.querySelector('.multiselect-tamanho .overSelect');
        if (overSelect) {
            overSelect.style.position = 'unset';
        }

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

document.addEventListener('DOMContentLoaded', function() {
    if (window.aplicarPermissoesEstoque) window.aplicarPermissoesEstoque();
});

function renderizarCategoriasDinamicas(produtos) {
    const ul = document.getElementById('lista-categorias');
    ul.innerHTML = '';
    const categorias = categoriasBackend;
    categorias.forEach((cat, i) => {
        // Conta produtos da categoria
        const qtd = produtos.filter(p => (p.categoria || '').toUpperCase() === cat.nome.toUpperCase()).length;
        const cor = cat.cor || "#1e94a3";
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.marginBottom = '2px';
        li.innerHTML = `
            <span style="
                display:inline-block;
                min-width:2ch;
                text-align:right;
                font-weight:bold;
                color:#fff;
                background:${cor};
                border-radius:4px;
                padding:2px 5px 2px 10px;
                margin-right:5px;
                font-size:10px;
            ">${qtd}</span>
            <span style="font-size:10px;">${cat.nome}</span>
        `;
        ul.appendChild(li);
    });
    atualizarCategoriaListaSetas();
}

function atualizarCategoriaListaSetas() {
    const scrollDiv = document.getElementById('categoria-lista-scroll');
    const btnPrev = document.getElementById('cat-prev');
    const btnNext = document.getElementById('cat-next');

    function updateButtons() {
        btnPrev.style.display = scrollDiv.scrollTop > 0 ? 'flex' : 'none';
        btnNext.style.display = (scrollDiv.scrollTop + scrollDiv.clientHeight < scrollDiv.scrollHeight) ? 'flex' : 'none';
    }

    btnPrev.onclick = () => {
        scrollDiv.scrollBy({ top: -60, behavior: 'smooth' });
        setTimeout(updateButtons, 200);
    };
    btnNext.onclick = () => {
        scrollDiv.scrollBy({ top: 60, behavior: 'smooth' });
        setTimeout(updateButtons, 200);
    };

    scrollDiv.addEventListener('scroll', updateButtons);
    setTimeout(updateButtons, 50);
}

document.addEventListener('DOMContentLoaded', function() {
    // Chame renderizarCategoriasDinamicas após carregar produtos
    fetch('/produtos')
        .then(res => res.json())
        .then(produtos => {
            renderizarCategoriasDinamicas(produtos);
        });
});



function atualizarCategoriaListaSetas() {
    const scrollDiv = document.getElementById('categoria-lista-scroll');
    const btnPrev = document.getElementById('cat-prev');
    const btnNext = document.getElementById('cat-next');

    function updateButtons() {
        btnPrev.style.display = scrollDiv.scrollTop > 0 ? 'flex' : 'none';
        btnNext.style.display = (scrollDiv.scrollTop + scrollDiv.clientHeight < scrollDiv.scrollHeight) ? 'flex' : 'none';
    }

    btnPrev.onclick = () => {
        scrollDiv.scrollBy({ top: -60, behavior: 'smooth' });
        setTimeout(updateButtons, 200);
    };
    btnNext.onclick = () => {
        scrollDiv.scrollBy({ top: 60, behavior: 'smooth' });
        setTimeout(updateButtons, 200);
    };

    scrollDiv.addEventListener('scroll', updateButtons);
    setTimeout(updateButtons, 50);
}

document.addEventListener('DOMContentLoaded', function() {
    atualizarCategoriaListaSetas();
});