let filtradas = [];

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

document.addEventListener('DOMContentLoaded', function() {
    atualizarBadgeBaixoEstoque();
    if (window.aplicarPermissoesMovimentacoes) {
        window.aplicarPermissoesMovimentacoes();
    }
});

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
    // Botão topo
    const btn = document.getElementById('btn-topo');
    if (btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Filtros
    const tipoMovInput = document.getElementById('filter-tipo-mov');
    const parteEnvolvidaInput = document.getElementById('filter-parte-envolvida');
    const btnLimpar = document.getElementById('btn-limpar-filtros');

    // PERÍODO
    const periodoInput = document.getElementById('filter-periodo');
    const periodoPopup = document.getElementById('periodo-popup');
    const dataInicio = document.getElementById('periodo-data-inicio');
    const dataFim = document.getElementById('periodo-data-fim');

    // Abre popup ao clicar no input
    periodoInput.addEventListener('click', function(e) {
        periodoPopup.style.display = 'block';
        dataInicio.focus();
        e.stopPropagation();
    });

    // Fecha popup ao clicar fora e atualiza placeholder/cor
document.addEventListener('mousedown', function(e) {
    function formatarDataBR(data) {
        if (!data) return '';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }
    let ativo = false;
    if (dataInicio.value && dataFim.value) {
        if (dataInicio.value === dataFim.value) {
            periodoInput.value = `${formatarDataBR(dataInicio.value)}`;
        } else {
            periodoInput.value = `${formatarDataBR(dataInicio.value)} - ${formatarDataBR(dataFim.value)}`;
        }
        ativo = true;
    } else if (dataInicio.value) {
        periodoInput.value = `${formatarDataBR(dataInicio.value)}`;
        ativo = true;
    } else if (dataFim.value) {
        periodoInput.value = `${formatarDataBR(dataFim.value)}`;
        ativo = true;
    } else {
        periodoInput.value = '';
        ativo = false;
    }
    if (!periodoPopup.contains(e.target) && e.target !== periodoInput) {
        periodoPopup.style.display = 'none';
        // filtrarMovimentacoes();
    }
    const chevron = periodoInput.parentNode.querySelector('.chevron-periodo');
    if (ativo) {
        periodoInput.style.border = '2px solid #1e94a3';
        periodoInput.style.color = '#1e94a3';
        if (chevron) chevron.style.color = '#1e94a3';
    } else {
        periodoInput.style.border = '';
        periodoInput.style.color = '';
        if (chevron) chevron.style.color = '#888';
    }
    // filtrarMovimentacoes();
});
    // Validação: fim sem início
    dataInicio.addEventListener('change', function() {
        if (dataFim.value && !dataInicio.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Selecione a data de início!',
                text: 'Para filtrar por período, informe a data de início',
                timer: 1800,
                showConfirmButton: false,
                allowOutsideClick: false
            });
            dataFim.value = '';
        }
        filtrarMovimentacoes();
    });
    dataFim.addEventListener('change', function() {
        if (dataFim.value && !dataInicio.value) {
            Swal.fire({
                icon: 'warning',
                title: 'Selecione a data de início!',
                text: 'Para filtrar por período, informe a data de início',
                timer: 1800,
                showConfirmButton: false
            });
            dataFim.value = '';
        }
        filtrarMovimentacoes();
    });


    parteEnvolvidaInput.addEventListener('input', filtrarMovimentacoes);

    btnLimpar.addEventListener('click', function() {
        tipoMovInput.value = '';
        parteEnvolvidaInput.value = '';
        // Limpa o período
        dataInicio.value = '';
        dataFim.value = '';
        periodoInput.value = '';
        // Remove borda/cor do período
        periodoInput.style.border = '';
        periodoInput.style.color = '';
        const chevron = periodoInput.parentNode.querySelector('.chevron-periodo');
        if (chevron) chevron.style.color = '#888';

        // Limpa checkboxes de movimentação (marca "Todas")
        const todas = document.getElementById('tipo-mov-todas');
        const checks = document.querySelectorAll('.tipo-mov-check');
        if (todas && checks.length) {
            todas.checked = true;
            checks.forEach(cb => cb.checked = true);
            atualizarPlaceholderTipoMov();
        }

        filtrarMovimentacoes();
    });

    const btnFiltrosAvancados = document.getElementById('btn-filtros-avancados');
    const filtrosAvancados = document.getElementById('filtros-avancados');

    if (btnFiltrosAvancados) {
        btnFiltrosAvancados.innerHTML = '<i class="fa-solid fa-filter-circle-xmark" style="margin-right:4px;"></i>Mais Filtros';
        btnFiltrosAvancados.style.border = '1px solid #1e94a3';
        btnFiltrosAvancados.style.background = '#fff';
        btnFiltrosAvancados.style.color = '#1e94a3';
    }

    if (btnFiltrosAvancados && filtrosAvancados) {
        btnFiltrosAvancados.addEventListener('click', function() {
            if (filtrosAvancados.style.display === 'none' || filtrosAvancados.style.display === '') {
                filtrosAvancados.style.display = 'flex';
                btnFiltrosAvancados.innerHTML = '<i class="fa-solid fa-filter" style="margin-right:4px;"></i>Mais Filtros';
                btnFiltrosAvancados.style.border = '';
                btnFiltrosAvancados.style.background = '';
                btnFiltrosAvancados.style.color = '';
            } else {
                filtrosAvancados.style.display = 'none';
                btnFiltrosAvancados.innerHTML = '<i class="fa-solid fa-filter-circle-xmark" style="margin-right:4px;"></i>Mais Filtros';
                btnFiltrosAvancados.style.border = '1px solid #1e94a3';
                btnFiltrosAvancados.style.background = '#fff';
                btnFiltrosAvancados.style.color = '#1e94a3';
            }
        });
    }

    // --- QUANTIDADE FAIXA ---
    const qtdInput = document.getElementById('filter-quantidade');
    const qtdPopup = document.getElementById('quantidade-faixa-popup');
    const qtdMin = document.getElementById('quantidade-min');
    const qtdMax = document.getElementById('quantidade-max');

    // Abrir popup ao clicar no input
    if (qtdInput && qtdPopup) {
        qtdInput.addEventListener('click', function(e) {
            qtdPopup.style.display = 'block';
            qtdMin.focus();
            e.stopPropagation();
        });
        // Fecha popup ao clicar fora e aplica filtro
        document.addEventListener('mousedown', function(e) {
            if (qtdPopup.style.display === 'block' && !qtdPopup.contains(e.target) && e.target !== qtdInput) {
                qtdPopup.style.display = 'none';
                aplicarFiltroQtdFaixa();
            }
        });
    }

    // Fecha popup de período ao clicar fora e aplica filtro
    document.addEventListener('mousedown', function(e) {
        if (periodoPopup && periodoPopup.style.display === 'block' && !periodoPopup.contains(e.target) && e.target !== periodoInput) {
            periodoPopup.style.display = 'none';
            filtrarMovimentacoes(); // ao fechar o popup de período
        }
    });

    // Máscara para min/max
    if (qtdMin) qtdMin.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 3);
    });
    if (qtdMax) qtdMax.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 3);
    });

    // Listeners para checkboxes e inputs
    ['quantidade-min','quantidade-max'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', aplicarFiltroQtdFaixa);
        if (el && (id === 'quantidade-min' || id === 'quantidade-max')) el.addEventListener('input', aplicarFiltroQtdFaixa);
    });

    // Atualiza placeholder ao carregar
    atualizarPlaceholderQuantidade();
});




// --- VALOR FAIXA ---
const valorInput = document.getElementById('filter-valor');
const valorPopup = document.getElementById('valor-faixa-popup');
const valorMin = document.getElementById('valor-min');
const valorMax = document.getElementById('valor-max');

// Abrir popup ao clicar no input
if (valorInput && valorPopup) {
    valorInput.addEventListener('click', function(e) {
        valorPopup.style.display = 'block';
        valorMin.focus();
        e.stopPropagation();
    });
    // Fecha popup ao clicar fora e aplica filtro
    document.addEventListener('mousedown', function(e) {
        if (valorPopup.style.display === 'block' && !valorPopup.contains(e.target) && e.target !== valorInput) {
            valorPopup.style.display = 'none';
            aplicarFiltroValorFaixa();
        }
    });
}

// Máscara para min/max
function mascaraValorFaixa(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 9) value = value.slice(0, 9); // até 999.999,99
    if (value.length > 0) {
        let floatValue = (parseInt(value) / 100).toFixed(2);
        let partes = floatValue.split('.');
        let inteiro = partes[0];
        let decimal = partes[1];
        inteiro = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        input.value = 'R$ ' + inteiro + ',' + decimal;
    } else {
        input.value = '';
    }
}
if (valorMin) valorMin.addEventListener('input', function() { mascaraValorFaixa(this); });
if (valorMax) valorMax.addEventListener('input', function() { mascaraValorFaixa(this); });

// Função para aplicar o filtro e atualizar placeholder
function aplicarFiltroValorFaixa() {
    let min = valorMin.value.replace(/\D/g, '');
    let max = valorMax.value.replace(/\D/g, '');
    let ativo = true;

    // Se ambos vazios, limpa o input para mostrar o placeholder
    if (!min && !max) {
        valorInput.value = '';
        ativo = false;
        atualizarPlaceholderValor();
        filtrarMovimentacoes();
        return;
    }

    // Se só "de" preenchido, assume até 99999999 (R$ 999.999,99)
    if (min && !max) max = '99999999';
    if (!min && max) min = '0';

    let minNum = min ? parseFloat(min) / 100 : 0;
    let maxNum = max ? parseFloat(max) / 100 : 999999.99;

    if (minNum > maxNum) [minNum, maxNum] = [maxNum, minNum];

    // Formata para o input principal
    let minStr = minNum.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    let maxStr = maxNum.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    if (minNum === maxNum) {
        valorInput.value = `R$ ${minStr}`;
    } else {
        valorInput.value = `R$ ${minStr} - R$ ${maxStr}`;
    }
    if (valorInput.value === "R$ 0,00 - R$ 999.999,99") {
        valorInput.value = "Todos";
        ativo = false;
    }

    atualizarPlaceholderValor();
    filtrarMovimentacoes();
}

// Atualiza placeholder e cor
function atualizarPlaceholderValor() {
    const valorInput = document.getElementById('filter-valor');
    const valorMin = document.getElementById('valor-min');
    const valorMax = document.getElementById('valor-max');
    let min = valorMin.value;
    let max = valorMax.value;
    let ativo = false;

    if ((min && min !== "R$ 0,00") || (max && max !== "R$ 999.999,99")) ativo = true;

    if (valorInput) {
        valorInput.style.border = ativo ? '2px solid #1e94a3' : '';
        valorInput.style.color = ativo ? '#1e94a3' : '';
    }
    const chevron = valorInput.parentNode.querySelector('.chevron-valor');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';
}





// --- RESPONSÁVEL MULTISELECT ---
function montarCheckboxesResponsavel(responsaveis) {
    const divResp = document.getElementById('checkboxes-responsavel-multi');
    divResp.innerHTML = `<label><input type="checkbox" id="responsavel-multi-todos" class="responsavel-multi-check" value="" checked> Todos</label>`;
    responsaveis.forEach(r => {
        divResp.innerHTML += `<label><input type="checkbox" class="responsavel-multi-check" value="${r}" checked> ${r}</label>`;
    });

    const checks = Array.from(divResp.querySelectorAll('.responsavel-multi-check'));
    const todos = checks[0];

    // "Todos" marca/desmarca todos
    todos.addEventListener('change', function() {
        checks.slice(1).forEach(cb => cb.checked = todos.checked);
        atualizarPlaceholderResponsavelMulti();
        filtrarMovimentacoes();
    });

    // Individuais: se todos marcados, marca "Todos". Se algum desmarcado, desmarca "Todos"
    checks.slice(1).forEach(cb => {
        cb.addEventListener('change', function() {
            todos.checked = checks.slice(1).every(cb2 => cb2.checked);
            atualizarPlaceholderResponsavelMulti();
            filtrarMovimentacoes();
        });
    });

    atualizarPlaceholderResponsavelMulti();

    const respInput = document.getElementById('filter-responsavel');
    const respPopup = document.getElementById('checkboxes-responsavel-multi');
    if (respInput && respPopup) {
        respInput.onclick = function(e) {
            respPopup.style.display = 'block';
            window.expandedResponsavelMulti = true;
            e.stopPropagation();
        };
    }
}

document.addEventListener('mousedown', function(e) {
    const respInput = document.getElementById('filter-responsavel');
    const respPopup = document.getElementById('checkboxes-responsavel-multi');
    if (
        respPopup &&
        respPopup.style.display === 'block' &&
        !respPopup.contains(e.target) &&
        e.target !== respInput
    ) {
        respPopup.style.display = 'none';
        window.expandedResponsavelMulti = false;
        atualizarPlaceholderResponsavelMulti();
        filtrarMovimentacoes();
    }
});

// Função para mostrar/ocultar o popup
window.expandedResponsavelMulti = false;
function showCheckboxesResponsavelMulti() {
    var checkboxes = document.getElementById("checkboxes-responsavel-multi");
    if (!window.expandedResponsavelMulti) {
        checkboxes.style.display = "block";
        window.expandedResponsavelMulti = true;
    } else {
        checkboxes.style.display = "none";
        window.expandedResponsavelMulti = false;
        atualizarPlaceholderResponsavelMulti();
        filtrarMovimentacoes();
    }
}

// Atualiza placeholder do input
function atualizarPlaceholderResponsavelMulti() {
    const checks = Array.from(document.querySelectorAll('.responsavel-multi-check'));
    const todos = checks[0];
    const individuais = checks.slice(1);
    const input = document.getElementById('filter-responsavel');
    const selecionados = individuais.filter(cb => cb.checked).map(cb => cb.parentNode.textContent.trim());
    todos.checked = individuais.every(cb => cb.checked);

    let texto = 'Todos';
    let ativo = true;
    if (todos.checked || selecionados.length === 0) {
        texto = 'Todos';
        ativo = false;
    } else if (selecionados.length === 1) {
        texto = selecionados[0];
        ativo = true;
    } else {
        texto = `${selecionados.length} selecionados`;
        ativo = true;
    }
    input.value = texto;
    input.style.border = ativo ? '2px solid #1e94a3' : '';
    input.style.color = ativo ? '#1e94a3' : '';
    const chevron = input.parentNode.querySelector('.chevron-responsavel');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';
}

// Pega responsáveis selecionados
function getResponsaveisSelecionados() {
    const checks = Array.from(document.querySelectorAll('.responsavel-multi-check'));
    const todos = checks[0];
    if (todos.checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
}



// Produtos
function montarCheckboxesProduto(produtos) {
    const divProd = document.getElementById('checkboxes-produto-multi');
    divProd.innerHTML = `<label><input type="checkbox" id="produto-multi-todos" class="produto-multi-check" value="" checked> Todos</label>`;
    produtos.forEach(p => {
        divProd.innerHTML += `<label><input type="checkbox" class="produto-multi-check" value="${p.codigo}" checked> ${p.codigo} - ${p.nome}</label>`;
    });

    const checks = Array.from(divProd.querySelectorAll('.produto-multi-check'));
    const todos = checks[0];

    // "Todos" marca/desmarca todos
    todos.addEventListener('change', function() {
        checks.slice(1).forEach(cb => cb.checked = todos.checked);
        atualizarPlaceholderProdutoMulti();
        filtrarMovimentacoes();
    });

    // Individuais: se todos marcados, marca "Todos". Se algum desmarcado, desmarca "Todos"
    checks.slice(1).forEach(cb => {
        cb.addEventListener('change', function() {
            todos.checked = checks.slice(1).every(cb2 => cb2.checked);
            atualizarPlaceholderProdutoMulti();
            filtrarMovimentacoes();
        });
    });

    atualizarPlaceholderProdutoMulti();

    const prodInput = document.getElementById('filter-produto');
    const prodPopup = document.getElementById('checkboxes-produto-multi');
    if (prodInput && prodPopup) {
        prodInput.onclick = function(e) {
            prodPopup.style.display = 'block';
            e.stopPropagation();
        };
    }
}

// Fecha popup ao clicar fora
document.addEventListener('mousedown', function(e) {
    const prodInput = document.getElementById('filter-produto');
    const prodPopup = document.getElementById('checkboxes-produto-multi');
    if (
        prodPopup &&
        prodPopup.style.display === 'block' &&
        !prodPopup.contains(e.target) &&
        e.target !== prodInput
    ) {
        prodPopup.style.display = 'none';
        atualizarPlaceholderProdutoMulti();
        filtrarMovimentacoes();
    }
});

// Atualiza placeholder do input
function atualizarPlaceholderProdutoMulti() {
    const checks = Array.from(document.querySelectorAll('.produto-multi-check'));
    const todos = checks[0];
    const individuais = checks.slice(1);
    const input = document.getElementById('filter-produto');
    const selecionados = individuais.filter(cb => cb.checked).map(cb => cb.parentNode.textContent.trim());
    todos.checked = individuais.every(cb => cb.checked);

    let texto = 'Todos';
    let ativo = true;
    if (todos.checked || selecionados.length === 0) {
        texto = 'Todos';
        ativo = false;
    } else if (selecionados.length === 1) {
        texto = selecionados[0];
        ativo = true;
    } else {
        texto = `${selecionados.length} selecionados`;
        ativo = true;
    }
    input.value = texto;
    input.style.border = ativo ? '2px solid #1e94a3' : '';
    input.style.color = ativo ? '#1e94a3' : '';
    const chevron = input.parentNode.querySelector('.chevron-produto');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';
}

// Função para pegar produtos selecionados
function getProdutosSelecionados() {
    const checks = Array.from(document.querySelectorAll('.produto-multi-check'));
    const todos = checks[0];
    if (todos.checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
}





function montarCheckboxesCategoria(categorias) {
    const divCat = document.getElementById('checkboxes-categoria-multi');
    divCat.innerHTML = `<label><input type="checkbox" id="categoria-multi-todas" class="categoria-multi-check" value="" checked> Todas</label>`;
    categorias.forEach(cat => {
        const catCap = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
        divCat.innerHTML += `<label><input type="checkbox" class="categoria-multi-check" value="${cat}" checked> ${catCap}</label>`;
    });

    const checks = Array.from(divCat.querySelectorAll('.categoria-multi-check'));
    const todas = checks[0];

    // "Todas" marca/desmarca todos
    todas.addEventListener('change', function() {
        checks.slice(1).forEach(cb => cb.checked = todas.checked);
        atualizarPlaceholderCategoriaMulti();
        filtrarMovimentacoes();
    });

    // Individuais: se todos marcados, marca "Todas". Se algum desmarcado, desmarca "Todas"
    checks.slice(1).forEach(cb => {
        cb.addEventListener('change', function() {
            todas.checked = checks.slice(1).every(cb2 => cb2.checked);
            atualizarPlaceholderCategoriaMulti();
            filtrarMovimentacoes();
        });
    });

    atualizarPlaceholderCategoriaMulti();

    const catInput = document.getElementById('filter-categoria');
    const catPopup = document.getElementById('checkboxes-categoria-multi');
    if (catInput && catPopup) {
        catInput.onclick = function(e) {
            catPopup.style.display = 'block';
            e.stopPropagation();
        };
    }
}

function atualizarPlaceholderCategoriaMulti() {
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
    const todas = checks[0];
    const individuais = checks.slice(1);
    const input = document.getElementById('filter-categoria');
    const selecionados = individuais.filter(cb => cb.checked).map(cb => cb.parentNode.textContent.trim());
    todas.checked = individuais.every(cb => cb.checked);

    let texto = 'Todas';
    let ativo = true;
    if (todas.checked || selecionados.length === 0) {
        texto = 'Todas';
        ativo = false;
    } else if (selecionados.length === 1) {
        texto = selecionados[0];
        ativo = true;
    } else {
        texto = selecionados.join(', ');
        ativo = true;
    }
    input.value = texto;
    input.style.border = ativo ? '2px solid #1e94a3' : '';
    input.style.color = ativo ? '#1e94a3' : '';
    const chevron = input.parentNode.querySelector('.chevron-categoria');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';
}


function getCategoriasSelecionadas() {
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
    const todas = checks[0];
    if (todas.checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
}

document.addEventListener('mousedown', function(e) {
    const catInput = document.getElementById('filter-categoria');
    const catPopup = document.getElementById('checkboxes-categoria-multi');
    if (
        catPopup &&
        catPopup.style.display === 'block' &&
        !catPopup.contains(e.target) &&
        e.target !== catInput
    ) {
        catPopup.style.display = 'none';
        atualizarPlaceholderCategoriaMulti();
        filtrarMovimentacoes();
    }
});




// Tamanho
function montarCheckboxesTamanho(tamanhos) {
    const divTam = document.getElementById('checkboxes-tamanho-multi');
    divTam.innerHTML = `<label><input type="checkbox" id="tamanho-multi-todos" class="tamanho-multi-check" value="" checked> Todos</label>`;

    // Ordem desejada
    const ordem = ["ÚNICO","PP","P","M","G","GG","XG","XGG","XXG"];
    const letras = ordem.filter(t => tamanhos.includes(t));
    const numeros = tamanhos.filter(t => /^_\d+$/.test(t)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

    // Adiciona letras na ordem
    letras.forEach(tam => {
        divTam.innerHTML += `<label><input type="checkbox" class="tamanho-multi-check" value="${tam}" checked> ${exibirTamanho(tam)}</label>`;
    });
    // Adiciona números em ordem crescente
    numeros.forEach(tam => {
        divTam.innerHTML += `<label><input type="checkbox" class="tamanho-multi-check" value="${tam}" checked> ${exibirTamanho(tam)}</label>`;
    });

    const checks = Array.from(divTam.querySelectorAll('.tamanho-multi-check'));
    const todos = checks[0];

    todos.addEventListener('change', function() {
        checks.slice(1).forEach(cb => cb.checked = todos.checked);
        atualizarPlaceholderTamanhoMulti();
        filtrarMovimentacoes();
    });

    checks.slice(1).forEach(cb => {
        cb.addEventListener('change', function() {
            todos.checked = checks.slice(1).every(cb2 => cb2.checked);
            atualizarPlaceholderTamanhoMulti();
            filtrarMovimentacoes();
        });
    });

    atualizarPlaceholderTamanhoMulti();

    const tamInput = document.getElementById('filter-tamanho');
    const tamPopup = document.getElementById('checkboxes-tamanho-multi');
    if (tamInput && tamPopup) {
        tamInput.onclick = function(e) {
            tamPopup.style.display = 'block';
            e.stopPropagation();
        };
    }
}
function exibirGenero(genero) {
    if (!genero) return '';
    return genero.charAt(0).toUpperCase() + genero.slice(1).toLowerCase();
}

// Montar checkboxes de Gênero
function montarCheckboxesGenero(generos) {
    const divGen = document.getElementById('checkboxes-genero-multi');
    divGen.innerHTML = `<label><input type="checkbox" id="genero-multi-todos" class="genero-multi-check" value="" checked> Todos</label>`;
    generos.forEach(gen => {
        divGen.innerHTML += `<label><input type="checkbox" class="genero-multi-check" value="${gen}" checked> ${exibirGenero(gen)}</label>`;
    });

    const checks = Array.from(divGen.querySelectorAll('.genero-multi-check'));
    const todos = checks[0];

    todos.addEventListener('change', function() {
        checks.slice(1).forEach(cb => cb.checked = todos.checked);
        atualizarPlaceholderGeneroMulti();
        filtrarMovimentacoes();
    });

    checks.slice(1).forEach(cb => {
        cb.addEventListener('change', function() {
            todos.checked = checks.slice(1).every(cb2 => cb2.checked);
            atualizarPlaceholderGeneroMulti();
            filtrarMovimentacoes();
        });
    });

    atualizarPlaceholderGeneroMulti();

    const genInput = document.getElementById('filter-genero');
    const genPopup = document.getElementById('checkboxes-genero-multi');
    if (genInput && genPopup) {
        genInput.onclick = function(e) {
            genPopup.style.display = 'block';
            e.stopPropagation();
        };
    }
}


function atualizarPlaceholderTamanhoMulti() {
    const checks = Array.from(document.querySelectorAll('.tamanho-multi-check'));
    const todos = checks[0];
    const individuais = checks.slice(1);
    const input = document.getElementById('filter-tamanho');
    const selecionados = individuais.filter(cb => cb.checked).map(cb => cb.parentNode.textContent.trim());
    todos.checked = individuais.every(cb => cb.checked);

    let texto = 'Todos';
    let ativo = true;
    if (todos.checked || selecionados.length === 0) {
        texto = 'Todos';
        ativo = false;
    } else if (selecionados.length === 1) {
        texto = selecionados[0];
        ativo = true;
    } else {
        texto = selecionados.join(', ');
        ativo = true;
    }
    input.value = texto;
    input.style.border = ativo ? '2px solid #1e94a3' : '';
    input.style.color = ativo ? '#1e94a3' : '';
    const chevron = input.parentNode.querySelector('.chevron-tamanho');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';
}

function atualizarPlaceholderGeneroMulti() {
    const checks = Array.from(document.querySelectorAll('.genero-multi-check'));
    const todos = checks[0];
    const individuais = checks.slice(1);
    const input = document.getElementById('filter-genero');
    const selecionados = individuais.filter(cb => cb.checked).map(cb => cb.parentNode.textContent.trim());
    todos.checked = individuais.every(cb => cb.checked);

    let texto = 'Todos';
    let ativo = true;
    if (todos.checked || selecionados.length === 0) {
        texto = 'Todos';
        ativo = false;
    } else if (selecionados.length === 1) {
        texto = selecionados[0];
        ativo = true;
    } else {
        texto = selecionados.join(', ');
        ativo = true;
    }
    input.value = texto;
    input.style.border = ativo ? '2px solid #1e94a3' : '';
    input.style.color = ativo ? '#1e94a3' : '';
    const chevron = input.parentNode.querySelector('.chevron-genero');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';
}




function getTamanhosSelecionados() {
    const checks = Array.from(document.querySelectorAll('.tamanho-multi-check'));
    const todos = checks[0];
    if (todos.checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
}

function getGenerosSelecionados() {
    const checks = Array.from(document.querySelectorAll('.genero-multi-check'));
    const todos = checks[0];
    if (todos.checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
}


document.addEventListener('mousedown', function(e) {
    // Tamanho
    const tamInput = document.getElementById('filter-tamanho');
    const tamPopup = document.getElementById('checkboxes-tamanho-multi');
    if (
        tamPopup &&
        tamPopup.style.display === 'block' &&
        !tamPopup.contains(e.target) &&
        e.target !== tamInput
    ) {
        tamPopup.style.display = 'none';
        atualizarPlaceholderTamanhoMulti();
        filtrarMovimentacoes();
    }

    // Gênero
    const genInput = document.getElementById('filter-genero');
    const genPopup = document.getElementById('checkboxes-genero-multi');
    if (
        genPopup &&
        genPopup.style.display === 'block' &&
        !genPopup.contains(e.target) &&
        e.target !== genInput
    ) {
        genPopup.style.display = 'none';
        atualizarPlaceholderGeneroMulti();
        filtrarMovimentacoes();
    }
});


// Função filtro
function filtrarMovimentacoes() {
    const termo = document.getElementById('filter-parte-envolvida').value.trim().toLowerCase();
    const dataInicio = document.getElementById('periodo-data-inicio').value;
    const dataFim = document.getElementById('periodo-data-fim').value;
    const tiposSelecionados = getTiposSelecionados();
    const qtdMin = document.getElementById('quantidade-min').value ? parseInt(document.getElementById('quantidade-min').value) : 0;
    const qtdMax = document.getElementById('quantidade-max').value ? parseInt(document.getElementById('quantidade-max').value) : 999;

    const valorMinRaw = document.getElementById('valor-min').value.replace(/\D/g, '');
    const valorMaxRaw = document.getElementById('valor-max').value.replace(/\D/g, '');
    const minValor = valorMinRaw ? parseFloat(valorMinRaw) / 100 : 0;
    const maxValor = valorMaxRaw ? parseFloat(valorMaxRaw) / 100 : 999999.99;

    const responsaveisSelecionados = getResponsaveisSelecionados();

    const produtosSelecionados = getProdutosSelecionados();

    const categoriasSelecionadas = getCategoriasSelecionadas();

    const tamanhosSelecionados = getTamanhosSelecionados();

    const generosSelecionados = getGenerosSelecionados();


    filtradas = movimentacoes.filter(m => {
        let ok = true;

        // Busca por parte envolvida OU código da movimentação
        if (termo) {
            const parte = m.parteEnvolvida ? m.parteEnvolvida.toLowerCase() : '';
            const codigoMov = m.codigoMovimentacao ? m.codigoMovimentacao.toString() : '';
            if (!parte.includes(termo) && !codigoMov.includes(termo)) ok = false;
        }

        // Período
        if (dataInicio && dataFim) {
            if (m.data < dataInicio || m.data > dataFim) ok = false;
        } else if (dataInicio) {
            if (m.data < dataInicio) ok = false;
        } else if (dataFim) {
            if (m.data > dataFim) ok = false;
        }

        // Tipo de movimentação
        if (tiposSelecionados.length && !tiposSelecionados.includes(m.tipoMovimentacao)) ok = false;

        if (m.quantidadeMovimentada < qtdMin || m.quantidadeMovimentada > qtdMax) ok = false;

        // Filtro de valor
        if (m.valorMovimentacao < minValor || m.valorMovimentacao > maxValor) ok = false;

        if (responsaveisSelecionados.length && !responsaveisSelecionados.includes(m.responsavel)) ok = false;

        // Produtos
        if (produtosSelecionados.length && !produtosSelecionados.includes(m.produto)) ok = false;

        if (categoriasSelecionadas.length && !categoriasSelecionadas.includes(m.categoria)) ok = false;

        if (tamanhosSelecionados.length && !tamanhosSelecionados.includes(m.tamanho)) ok = false;

        if (generosSelecionados.length && !generosSelecionados.includes(m.genero)) ok = false;

        return ok;
    });

    paginaAtual = 1;
    renderizarMovimentacoes(filtradas);
    atualizarDetalhesInfo(filtradas);
    atualizarCardsMovimentacoes(filtradas);
}


// Função tipo de movimentação
window.expandedTipoMov = false;
function showCheckboxesTipoMov() {
    var checkboxes = document.getElementById("checkboxes-tipo-mov");
    if (!window.expandedTipoMov) {
        checkboxes.style.display = "block";
        window.expandedTipoMov = true;
    } else {
        checkboxes.style.display = "none";
        window.expandedTipoMov = false;
        atualizarPlaceholderTipoMov();
        filtrarMovimentacoes();
    }
}

// Lógica de seleção "Todas"
function marcarOuDesmarcarTodosTipos() {
    const todas = document.getElementById('tipo-mov-todas');
    const checks = document.querySelectorAll('.tipo-mov-check');
    checks.forEach(cb => cb.checked = todas.checked);
    atualizarPlaceholderTipoMov();
    filtrarMovimentacoes();
}

// Atualiza "Todas" se ambos individuais marcados
document.addEventListener('DOMContentLoaded', function() {
    const checks = Array.from(document.querySelectorAll('.tipo-mov-check'));
    const todas = document.getElementById('tipo-mov-todas');
    checks.slice(1).forEach(cb => {
        cb.addEventListener('change', function() {
            todas.checked = checks.slice(1).every(c => c.checked);
            atualizarPlaceholderTipoMov();
            filtrarMovimentacoes();
        });
    });
    atualizarPlaceholderTipoMov();
});

// Atualiza placeholder do input
function atualizarPlaceholderTipoMov() {
    const checks = Array.from(document.querySelectorAll('.tipo-mov-check'));
    const todas = document.getElementById('tipo-mov-todas');
    const input = document.getElementById('filter-tipo-mov');
    const selecionados = checks.slice(1).filter(cb => cb.checked).map(cb => cb.parentNode.textContent.trim());
    todas.checked = checks.slice(1).every(cb => cb.checked);

    let texto = 'Todas';
    let ativo = true;
    if (selecionados.length === 0 || todas.checked) {
        texto = 'Todas';
        ativo = false;
    } else if (selecionados.length === 1) {
        texto = selecionados[0];
        ativo = true;
    } else {
        texto = selecionados.join(', ');
        ativo = true;
    }
    input.value = texto;
    input.style.border = ativo ? '2px solid #1e94a3' : '';
    input.style.color = ativo ? '#1e94a3' : '';
    const chevron = input.parentNode.querySelector('.chevron-tipo');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';
}

// Função para pegar tipos selecionados
function getTiposSelecionados() {
    const checks = Array.from(document.querySelectorAll('.tipo-mov-check'));
    const todas = document.getElementById('tipo-mov-todas');
    if (todas.checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
}

document.addEventListener('mousedown', function(e) {
    var checkboxes = document.getElementById("checkboxes-tipo-mov");
    var overSelect = document.querySelector('.multiselect-tipo .overSelect');
    if (
        window.expandedTipoMov &&
        checkboxes &&
        !checkboxes.contains(e.target) &&
        (!overSelect || !overSelect.contains(e.target))
    ) {
        checkboxes.style.display = "none";
        window.expandedTipoMov = false;
        atualizarPlaceholderTipoMov();
        filtrarMovimentacoes();
    }
});

//var global e controle de paginação
let movimentacoes = [];
let movimentacoesOriginais = [];
let paginaAtual = 1;
let itensPorPagina = 10;

// Formatação de data
function formatarData(data) {
    if (!data) return '-';
    const dataObj = new Date(data + 'T00:00:00');
    const dia = dataObj.getDate().toString().padStart(2, '0');
    const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Formatação de moeda
function formatarMoeda(valor) {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Exibir tamanho
function exibirTamanho(tamanho) {
    if (tamanho === 'ÚNICO') return 'Único';
    if (typeof tamanho === 'string' && tamanho.startsWith('_')) return tamanho.substring(1);
    return tamanho;
}

function aplicarMascaraDinheiro(input) {
    if (!input) return;
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length > 0) {
            let floatValue = (parseInt(value) / 100).toFixed(2);

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

function renderizarMovimentacoes(movimentacoes) {
    const tbody = document.getElementById('movimentacao-table-body');
    const thead = tbody.parentNode.querySelector('thead');
    const registrosPagina = document.getElementById('registros-pagina');
    
    const skeletonRow = () => {
        return `<tr class='skeleton-table-row'>${Array(14).fill('').map((_,i) => `<td class='skeleton-cell'><div class='skeleton-bar'></div></td>`).join('')}</tr>`;
    };
    tbody.innerHTML = Array(10).fill('').map(skeletonRow).join('');


    // Adaptação para radio customizado igual ESTOQUE
    const registrosInput = document.getElementById('registros-multi');
    let valorRadio = '';
    const radioSelecionado = document.querySelector('input[name="registros-radio"]:checked');
    if (radioSelecionado) {
        valorRadio = radioSelecionado.value;
    }
    itensPorPagina = valorRadio === '' ? movimentacoes.length : parseInt(valorRadio);

    const totalPaginas = Math.ceil(movimentacoes.length / itensPorPagina);
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const movimentacoesPagina = movimentacoes.slice(inicio, fim);

    if (movimentacoesPagina.length === 0) {
        if (thead) thead.style.display = 'none';
        if (registrosPagina) registrosPagina.style.display = 'none';

        if (movimentacoesOriginais.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="14" style="text-align: center; padding: 30px 0; background-color: white">
                        <div style="display: flex; flex-direction: column; align-items: center; font-size: 20px; color: #888;">
                            <span style="font-weight:bold;">Nenhuma movimentação cadastrada</span>
                            <span>Registre a primeira movimentação</span>
                            <img src="/images/sem_movimentacoes.png" alt="Sem movimentações" style="width:400px;">
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="14" style="text-align: center; padding: 30px 0; background-color: white">
                        <div style="display: flex; flex-direction: column; align-items: center; font-size: 20px; color: #888;">
                            <span style="font-weight:bold;">Nenhuma movimentação encontrada</span>
                            <span>Selecione outros filtros</span>
                            <img src="/images/filtro_movimentacoes.png" alt="Nenhuma movimentação encontrada" style="width:400px;">
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

    setTimeout(() => {
        tbody.innerHTML = '';
        movimentacoesPagina.forEach(m => {
            const tipoClass = m.tipoMovimentacao === 'ENTRADA' ? 'tipo-entrada' : 'tipo-saida';
            const tamanhoExibido = exibirTamanho(m.tamanho);
            
            const genero = m.genero ? m.genero.charAt(0).toUpperCase() + m.genero.slice(1).toLowerCase() : '';
            const categoria = m.categoria ? m.categoria.charAt(0).toUpperCase() + m.categoria.slice(1).toLowerCase() : '';
            
            const tipoTexto = m.tipoMovimentacao === 'ENTRADA' ? 'Entrada' : 'Saída';
            
            const valorFormatado = m.valorMovimentacao ? 
                new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(m.valorMovimentacao) : 
                '0,00';
            
            // const responsavelHtml = m.responsavel
            //     ? `<td style="text-align:left;">${m.responsavel}</td>`
            //     : `<td>${m.responsavel || '-'}</td>`;

            const rowHtml = `
                <tr>
                    <td style="padding-left:10px;">${formatarData(m.data)}</td>
                    <td><span class="${tipoClass}">${tipoTexto}</span></td>
                    <td>${m.codigoMovimentacao || '-'}</td>
                    <td>${m.quantidadeMovimentada}</td>
                    <td>${m.estoqueFinal}</td>
                    <td>${valorFormatado}</td>
                    <td style="max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${m.parteEnvolvida || '-'}">
                        ${m.parteEnvolvida ? `
                            <div style="display: flex; align-items: center; gap: 8px; padding-left:10px;">
                                <div style="
                                    width: 30px; height: 30px; border-radius: 50%;
                                    background: ${corAvatar(m.parteEnvolvida)};
                                    display: flex; align-items: center; justify-content: center;
                                    font-weight: bold; font-size: 12px; color: #333333b3;
                                    flex-shrink: 0;
                                ">
                                    ${getPrimeiraInicial(m.parteEnvolvida)}
                                </div>
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    ${m.parteEnvolvida}
                                </span>
                            </div>
                        ` : '-'}
                    </td>
                    <td style="max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${m.responsavel || '-'}">
                        ${m.responsavel ? `
                            <div style="display: flex; align-items: center; gap: 8px; justify-content: center;">
                                <div style="
                                    width: 30px; height: 30px; border-radius: 50%;
                                    background: ${corAvatar(m.responsavel)};
                                    display: flex; align-items: center; justify-content: center;
                                    font-weight: bold; font-size: 12px; color: #333333b3;
                                    flex-shrink: 0;
                                ">
                                    ${getIniciais(m.responsavel)}
                                </div>
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    ${getCodigoResponsavel(m.responsavel)}
                                </span>
                            </div>
                        ` : '-'}
                    </td>
                    <td>${m.codigoProduto}</td>
                    <td style="max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${m.nome}">${m.nome}</td>
                    <td class="categoria">${categoria}</td>
                    <td>${tamanhoExibido}</td>
                    <td class="genero">${genero}</td>
                    <td style="width:35px; max-width: 35px; padding-right:20px" class="actions">
                        <button type="button" onclick="abrirEdicaoMovimentacao(${m.id})" title="Editar" style="background:none; border:none; cursor:pointer;">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button type="button" onclick="removerMovimentacao(${m.id})" title="Excluir" style="background:none; border:none; cursor:pointer;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += rowHtml;
        });

        renderizarPaginacao(totalPaginas);

        if (window.aplicarPermissoesMovimentacoes) {
            window.aplicarPermissoesMovimentacoes();
        }
    }, 300);
}

function abrirEdicaoMovimentacao(id) {
    const movimentacao = movimentacoes.find(m => m.id === id);
    if (!movimentacao) return;

    fetch(`/produtos/codigo/${movimentacao.codigoProduto}`)
        .then(response => response.json())
        .then(produto => {
            if (movimentacao.tipoMovimentacao === 'ENTRADA') {
                document.getElementById('edit-label-valor').textContent = 'Valor da Compra (R$)*';
                document.getElementById('edit-label-parte-envolvida').textContent = 'Fornecedor*';
                document.getElementById('edit-label-data').textContent = 'Data da Compra*';
            } else {
                document.getElementById('edit-label-valor').textContent = 'Valor da Venda (R$)*';
                document.getElementById('edit-label-parte-envolvida').textContent = 'Comprador*';
                document.getElementById('edit-label-data').textContent = 'Data da Venda*';
            }

            document.getElementById('edit-data').value = movimentacao.data;
            document.getElementById('edit-codigo-movimentacao').value = movimentacao.codigoMovimentacao || '';
            document.getElementById('edit-quantidade').value = movimentacao.quantidadeMovimentada;
            document.getElementById('edit-valor').value = formatarMoeda(movimentacao.valorMovimentacao);
            document.getElementById('edit-parte-envolvida').value = movimentacao.parteEnvolvida || '';
            document.getElementById('edit-estoque-final').value = movimentacao.estoqueFinal;

            const preview = document.getElementById('edit-image-preview');
            preview.innerHTML = '';
            if (produto.url_imagem) {
                const img = document.createElement('img');
                img.src = produto.url_imagem;
                img.alt = produto.nome ? `Imagem do produto: ${produto.nome}` : 'Imagem do produto';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                preview.appendChild(img);
            } else {
                const icon = document.createElement('i');
                icon.className = 'fa-regular fa-image';
                icon.style.fontSize = '30px';
                preview.appendChild(icon);
            }

            const inputValor = document.getElementById('edit-valor');
            aplicarMascaraDinheiro(inputValor);

            const inputQuantidade = document.getElementById('edit-quantidade');
            if (inputQuantidade) {
                inputQuantidade.addEventListener('input', function() {
                    if (this.value.length > 3) this.value = this.value.slice(0, 3);
                    if (this.value > 999) this.value = 999;
                });
            }

            aplicarEstiloInputsMovimentacao();
            document.getElementById('editar-movimentacao').dataset.movimentacaoId = id;
            document.getElementById('editar-movimentacao').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        })
        .catch(error => {
            console.error('Erro ao buscar produto:', error);
            Swal.fire('Erro!', 'Erro ao carregar dados do produto', 'error');
        });
}

function capitalizar(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function fecharEdicaoMovimentacao() {
    document.getElementById('editar-movimentacao').style.display = 'none';
    document.body.style.overflow = '';
}

function salvarEdicaoMovimentacao() {
    if (!validarDataEdicaoMovimentacao()) return;
    const btnConfirmar = document.getElementById('edit-btn-confirmar');
    const textoOriginal = btnConfirmar.textContent;
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = 'Salvando <i class="fa-solid fa-spinner fa-spin"></i>';

    Swal.fire({
        title: 'Tem certeza?',
        text: 'As alterações não poderão ser desfeitas',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Voltar',
        allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
            const id = document.getElementById('editar-movimentacao').dataset.movimentacaoId;
            
            const dadosAtualizados = {
                data: document.getElementById('edit-data').value,
                codigoMovimentacao: document.getElementById('edit-codigo-movimentacao').value,
                quantidadeMovimentada: parseInt(document.getElementById('edit-quantidade').value),
                valorMovimentacao: parseFloat(document.getElementById('edit-valor').value.replace('R$ ', '').replace('.', '').replace(',', '.').trim()),
                parteEnvolvida: document.getElementById('edit-parte-envolvida').value
            };

            fetch(`/api/movimentacoes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosAtualizados)
            })
            .then(response => {
                if (!response.ok) throw new Error('Erro ao atualizar movimentação');
                return response.json();
            })
            .then(data => {
                Swal.fire({
                    title: "Sucesso!",
                    text: "Alterações salvas!",
                    icon: "success",
                    timer: 1500,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                }).then((result) => {
                    btnConfirmar.disabled = false;
                    btnConfirmar.textContent = textoOriginal;
                    
                    fecharEdicaoMovimentacao();
                    carregarMovimentacoes();
                    
                    if (result.isConfirmed) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        window.location.href = "/inicio";
                    }
                });
            })
            .catch(error => {
                console.error('Erro ao salvar alterações:', error);
                Swal.fire({
                    title: 'Erro!',
                    text: error.message || 'Não foi possível salvar as alterações',
                    icon: 'error',
                    timer: 1500,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    allowOutsideClick: false
                });
                
                btnConfirmar.disabled = false;
                btnConfirmar.textContent = textoOriginal;
            });
        } else {
            btnConfirmar.disabled = false;
            btnConfirmar.textContent = textoOriginal;
        }
    });
}

function removerMovimentacao(id) {
    Swal.fire({
        icon: 'warning',
        title: `Esta ação é irreversível!`,
        html: 'Digite <strong>EXCLUIR</strong> para confirmar:',
        input: 'text',
        inputPlaceholder: 'EXCLUIR',
        inputValidator: (value) => {
            if (value !== 'EXCLUIR') return 'Digite exatamente: EXCLUIR';
        },
        showCloseButton: true,
        showConfirmButton: true,
        allowOutsideClick: false,
        didOpen: () => {
            const input = Swal.getInput();
            if (input) {
                input.style.fontSize = '12px';
                input.style.margin = '10px 20px';
                input.style.border = 'solid 1px #aaa';
                input.style.borderRadius = '4px';
                input.style.background = '#fff';
                input.style.textAlign = 'center';
            }
            const btn = Swal.getConfirmButton();
            if (btn) {
                btn.style.maxWidth = '80px';
                // btn.style.minWidth = '60px';
                // btn.style.paddingLeft = '0';
                // btn.style.paddingRight = '0';
                // btn.style.textAlign = 'center';
            }
        }
    }).then((res) => {
        if (res.isConfirmed) {
            Swal.fire({
                title: `Excluindo movimentação...`,
                text: 'Aguarde enquanto a movimentação é excluída',
                icon: 'info',
                showConfirmButton: false,
                allowOutsideClick: false,
                timer: 1500,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                    fetch(`/api/movimentacoes/${id}`, { method: 'DELETE' })
                        .then(response => {
                            if (response.ok) {
                                setTimeout(() => location.reload(), 1200);
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Erro!',
                                    text: 'Não foi possível excluir a movimentação',
                                    showConfirmButton: false,
                                    timer: 1500,
                                    timerProgressBar: true,
                                    allowOutsideClick: false
                                });
                            }
                        });
                }
            });
        }
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
            renderizarMovimentacoes(filtradas);
        };
        paginacaoDiv.appendChild(btn);
    }
}

function carregarMovimentacoes(top) {
    let url = '/api/movimentacoes';
    if (top && top !== "") {
        url += `?top=${top}`;
    }
    
    url += (url.includes('?') ? '&' : '?') + '_t=' + Date.now();

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao buscar movimentações. Status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            movimentacoes = data;
            movimentacoesOriginais = [...movimentacoes];

            const nomes = [...new Set(movimentacoes.map(m => m.responsavel).filter(Boolean))];
            montarCheckboxesResponsavel(nomes);            
            
            const produtosUnicos = [];
            const codigosSet = new Set();
            movimentacoes.forEach(m => {
                if (m.codigoProduto && !codigosSet.has(m.codigoProduto)) {
                    produtosUnicos.push({
                        codigo: m.codigoProduto,
                        nome: m.nome
                    });
                    codigosSet.add(m.codigoProduto);
                }
            });
            montarCheckboxesProduto(produtosUnicos);


            const categoriasUnicas = [...new Set(movimentacoes.map(m => m.categoria).filter(Boolean))];
            montarCheckboxesCategoria(categoriasUnicas);

            const tamanhosUnicos = [...new Set(movimentacoes.map(m => m.tamanho).filter(Boolean))];
            montarCheckboxesTamanho(tamanhosUnicos);
            
            const generosUnicos = [...new Set(movimentacoes.map(m => m.genero).filter(Boolean))];
            montarCheckboxesGenero(generosUnicos);
            

            movimentacoes.sort((a, b) => {
                const dataA = new Date(a.data);
                const dataB = new Date(b.data);
                return dataB - dataA;
            });
            
            filtradas = [...movimentacoes];
            renderizarMovimentacoes(filtradas);
            atualizarDetalhesInfo(filtradas);
            atualizarCardsMovimentacoes(filtradas);
        })
        .catch(error => {
            console.error('Erro na API:', error);
            const tbody = document.getElementById('movimentacao-table-body');
            tbody.innerHTML = `<tr><td colspan="14" style="text-align: center; color: red; padding: 10px; font-size: 16px;">Erro ao carregar movimentações. Verifique o console.</td></tr>`;
        });
}

function atualizarDetalhesInfo(movimentacoes) {
    Promise.all([
        fetch('/produtos?_t=' + Date.now()).then(r => r.json()),
        fetch('/entradas/total-hoje?_t=' + Date.now()).then(r => r.json()),
        fetch('/saidas/total-hoje?_t=' + Date.now()).then(r => r.json())
    ]).then(([produtos, entradasHoje, saidasHoje]) => {
        
        const hoje = new Date().toISOString().split('T')[0];
        const totalMovimentacoes = movimentacoes.filter(m => m.data === hoje).length;
        const produtosCadastrados = produtos.length;
        const baixoEstoque = produtos.filter(p => (Number(p.quantidade) > 0) && (Number(p.quantidade) <= 2 * Number(p.limiteMinimo))).length;
        const zerados = produtos.filter(p => Number(p.quantidade) === 0).length;
        // const totalProdutos = produtos.length;
        
        document.getElementById('detalhe-total-movimentacoes').textContent = totalMovimentacoes;
        document.getElementById('detalhe-entradas-hoje').textContent = entradasHoje;
        document.getElementById('detalhe-saidas-hoje').textContent = saidasHoje;
        document.getElementById('detalhe-produtos-cadastrados').textContent = produtosCadastrados;
        document.getElementById('detalhe-baixo-estoque').textContent = baixoEstoque;
        document.getElementById('detalhe-estoque-zerado').textContent = zerados;
        
    }).catch(error => {
        console.error('Erro ao carregar detalhes:', error);
        atualizarDetalhesInfoLocal(movimentacoes);
    });
}

function atualizarDetalhesInfoLocal(movimentacoes) {
    const hoje = new Date().toISOString().split('T')[0];
    const totalMovimentacoes = movimentacoes.filter(m => m.data === hoje).length;
    const entradasHoje = movimentacoes.filter(m => m.data === hoje && m.tipoMovimentacao === 'ENTRADA').length;
    const saidasHoje = movimentacoes.filter(m => m.data === hoje && m.tipoMovimentacao === 'SAIDA').length;
    
    document.getElementById('detalhe-total-movimentacoes').textContent = totalMovimentacoes;
    document.getElementById('detalhe-entradas-hoje').textContent = entradasHoje;
    document.getElementById('detalhe-saidas-hoje').textContent = saidasHoje;
}

const agora = new Date();
agora.setHours(agora.getHours() - 3);
const hoje = agora.toISOString().split('T')[0];

function atualizarCardsMovimentacoes(movimentacoes) {
    const categorias = ['CAMISA', 'CAMISETA', 'BERMUDA', 'CALÇA', 'VESTIDO', 'SAPATO', 'MEIA'];
    const categoriasIds = ['camisa', 'camiseta', 'bermuda', 'calca', 'vestido', 'sapato', 'meia'];
    
    categorias.forEach((categoria, index) => {
        const entradasFiltradas = movimentacoes.filter(m => 
            m.categoria === categoria && 
            m.tipoMovimentacao === 'ENTRADA' &&
            m.data === hoje
        );
        
        const entradas = entradasFiltradas.reduce((sum, m) => sum + m.quantidadeMovimentada, 0);
        
        const saidasFiltradas = movimentacoes.filter(m => 
            m.categoria === categoria && 
            m.tipoMovimentacao === 'SAIDA' &&
            m.data === hoje
        );
        
        const saidas = saidasFiltradas.reduce((sum, m) => sum + m.quantidadeMovimentada, 0);
        
        const categoriaId = categoriasIds[index];
        const elementoEntradas = document.getElementById(`${categoriaId}-entradas`);
        const elementoSaidas = document.getElementById(`${categoriaId}-saidas`);
        
        if (elementoEntradas) {
            elementoEntradas.textContent = entradas !== 0 ? `+${entradas}` : '0';
        }
        
        if (elementoSaidas) {
            elementoSaidas.textContent = saidas !== 0 ? `-${saidas}` : '0';
        }
    });
    
    fetch('/produtos?_t=' + Date.now())
        .then(response => response.json())
        .then(produtos => {
            categorias.forEach((categoria, index) => {
                const estoqueAtual = produtos
                    .filter(p => p.categoria && p.categoria.toUpperCase() === categoria)
                    .reduce((soma, p) => soma + (Number(p.quantidade) || 0), 0);
                
                const categoriaId = categoriasIds[index];
                const elementoEstoque = document.getElementById(`${categoriaId}-estoque`);
                
                if (elementoEstoque) {
                    elementoEstoque.textContent = estoqueAtual;
                }
                
                montarResumoCategoriasEgerarCards(produtos, movimentacoes);    
            });
        })
        .catch(error => {
            console.error('Erro ao buscar produtos para estoque:', error);
        });
}

window.onload = function() {
    // Inicializa radios personalizados de registros por página (igual estoque.js)
    const registrosInput = document.getElementById('registros-multi');
    const radiosDiv = document.getElementById('radios-registros-multi');
    const chevron = document.querySelector('.chevron-registros');

    // Inicializa visual
    if (registrosInput && radiosDiv) {
        registrosInput.value = 'Todos';
        const radioTodos = radiosDiv.querySelector('input[type="radio"][value=""]');
        if (radioTodos) radioTodos.checked = true;
    }

    // Abre/fecha lista ao clicar no input ou chevron
    function abrirLista() {
        if (radiosDiv) radiosDiv.style.display = 'block';
    }
    function fecharLista() {
        if (radiosDiv) radiosDiv.style.display = 'none';
    }
    if (registrosInput) registrosInput.addEventListener('click', abrirLista);
    if (chevron) chevron.addEventListener('click', abrirLista);

    // Fecha ao clicar fora
    document.addEventListener('mousedown', function(e) {
        if (radiosDiv && !radiosDiv.contains(e.target) && e.target !== registrosInput && e.target !== chevron) {
            fecharLista();
        }
    });

    // Evento para atualizar input ao selecionar radio (label clicável)
    if (radiosDiv && registrosInput) {
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
                    itensPorPagina = radio.value === '' ? movimentacoes.length : parseInt(radio.value);
                    paginaAtual = 1;
                    renderizarMovimentacoes(filtradas);
                }
            }
        });
    }

    // Inicializa carregamento com valor do radio
    let valorRadio = '';
    const radioSelecionado = document.querySelector('input[name="registros-radio"]:checked');
    if (radioSelecionado) {
        valorRadio = radioSelecionado.value;
    }
    carregarMovimentacoes(valorRadio);

const campos = [
    'data',
    'tipoMovimentacao',
    'codigoMovimentacao',
    'quantidadeMovimentada',
    'estoqueFinal',
    'valorMovimentacao',
    'parteEnvolvida',
    'responsavel',
    'codigoProduto',
    'nome',
    'categoria',
    'tamanho',
    'genero'
];
    
    let estadoOrdenacao = Array(campos.length).fill(true);
    
    document.querySelectorAll('th.ordenar').forEach((th, idx) => {
        const campo = campos[idx];
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
            
            filtradas.sort((a, b) => {
                let valorA, valorB;
                
                if (campo === 'data') {
                    valorA = new Date(a[campo]);
                    valorB = new Date(b[campo]);
                    return estadoOrdenacao[idx] ? valorB - valorA : valorA - valorB;
                } else if (campo === 'quantidadeMovimentada' || campo === 'estoqueFinal' || campo === 'valorMovimentacao') {
                    valorA = Number(a[campo]) || 0;
                    valorB = Number(b[campo]) || 0;
                    return estadoOrdenacao[idx] ? valorB - valorA : valorA - valorB;
                } else {
                    valorA = (a[campo] || '').toString().toLowerCase();
                    valorB = (b[campo] || '').toString().toLowerCase();
                    return estadoOrdenacao[idx]
                        ? valorA.localeCompare(valorB, undefined, { numeric: true })
                        : valorB.localeCompare(valorA, undefined, { numeric: true });
                }
            });
            
            estadoOrdenacao[idx] = !estadoOrdenacao[idx];
            icon.innerHTML = estadoOrdenacao[idx]
                ? '<i class="fa-solid fa-arrow-down"></i>'
                : '<i class="fa-solid fa-arrow-up"></i>';
            
            renderizarMovimentacoes(filtradas);
            icon.style.display = 'inline-block';
        });
    });

    const btnExibirDetalhes = document.getElementById('btn-exibir-detalhes');
    const detalhesDiv = document.getElementById('detalhes-estoque');

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
            atualizarDetalhesInfo(filtradas);
            atualizarCardsMovimentacoes(filtradas);
            btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-eye" style="margin-right:4px;"></i>Detalhes';
            btnExibirDetalhes.style.border = '';
            btnExibirDetalhes.style.background = '';
            btnExibirDetalhes.style.color = '';
        }
    });

    // Carrega todos os funcionários para o filtro de responsável
    // fetch('/movimentacoes')
    //     .then(res => res.json())
    //     .then(movimentacoes => {
    //         const nomes = [...new Set(movimentacoes.map(m => m.responsavel).filter(Boolean))];
    //         montarCheckboxesResponsavel(nomes);
    //     })
    //     .catch(() => {
    //         const responsaveisUnicos = [...new Set(movimentacoes.map(m => m.responsavel).filter(Boolean))];
    //         montarCheckboxesResponsavel(responsaveisUnicos);
    //     });
};

function validarDataEdicaoMovimentacao() {
    const hoje = new Date().toISOString().slice(0, 10);
    const dataInput = document.getElementById('edit-data');
    if (dataInput && dataInput.value && dataInput.value > hoje) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida',
            text: 'A data não pode ser posterior a hoje',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        dataInput.focus();
        return false;
    }
    return true;
}

function aplicarEstiloInputsMovimentacao() {
    const inputs = document.querySelectorAll('#editar-movimentacao input:not([readonly]), #editar-movimentacao select');
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
        input.addEventListener('focus', () => {
            input.style.backgroundColor = 'white';
        });
    });
}

// Função para aplicar o filtro e atualizar placeholder
function aplicarFiltroQtdFaixa() {
    const qtdInput = document.getElementById('filter-quantidade');
    const qtdMin = document.getElementById('quantidade-min');
    const qtdMax = document.getElementById('quantidade-max');
    let min = qtdMin.value;
    let max = qtdMax.value;
    let ativo = true;

    // Se ambos vazios, limpa o input para mostrar o placeholder
    if (min === "" && max === "") {
        qtdInput.value = '';
        ativo = false;
        atualizarPlaceholderQuantidade();
        filtrarMovimentacoes();
        return;
    }

    min = min === "" ? 0 : parseInt(min);
    max = max === "" ? 999 : parseInt(max);

    if (min > max) [min, max] = [max, min];
    qtdMin.value = min;
    qtdMax.value = max;

    if (min === max) {
        qtdInput.value = `${min}`;
    } else {
        qtdInput.value = `${min} - ${max}`;
    }
    if (qtdInput.value === "0 - 999") {
        qtdInput.value = "Todas";
        ativo = false;
    }

    atualizarPlaceholderQuantidade();
    filtrarMovimentacoes();
}

// Atualiza placeholder e cor
function atualizarPlaceholderQuantidade() {
    const qtdInput = document.getElementById('filter-quantidade');
    const qtdMin = document.getElementById('quantidade-min');
    const qtdMax = document.getElementById('quantidade-max');
    let min = qtdMin.value;
    let max = qtdMax.value;
    let ativo = false;

    if ((min && min !== "0") || (max && max !== "999")) ativo = true;

    if (qtdInput) {
        qtdInput.style.border = ativo ? '2px solid #1e94a3' : '';
        qtdInput.style.color = ativo ? '#1e94a3' : '';
    }
    const chevron = qtdInput.parentNode.querySelector('.chevron-quantidade');
    if (chevron) chevron.style.color = ativo ? '#1e94a3' : '#888';
}



const btnLimparFiltrosExtras = document.getElementById('btn-limpar-filtros-extras');
if (btnLimparFiltrosExtras) {
    btnLimparFiltrosExtras.addEventListener('click', function() {
        // Limpa quantidade
        document.getElementById('quantidade-min').value = '';
        document.getElementById('quantidade-max').value = '';
        document.getElementById('filter-quantidade').value = '';
        atualizarPlaceholderQuantidade();
        
        
        // Limpa valor
        document.getElementById('valor-min').value = '';
        document.getElementById('valor-max').value = '';
        document.getElementById('filter-valor').value = '';
        atualizarPlaceholderValor();

        const respTodos = document.getElementById('responsavel-multi-todos');
        const respChecks = document.querySelectorAll('.responsavel-multi-check');
        if (respTodos && respChecks.length) {
            respTodos.checked = true;
            respChecks.forEach(cb => cb.checked = true);
            atualizarPlaceholderResponsavelMulti();
        }

        const prodTodos = document.getElementById('produto-multi-todos');
        const prodChecks = document.querySelectorAll('.produto-multi-check');
        if (prodTodos && prodChecks.length) {
            prodTodos.checked = true;
            prodChecks.forEach(cb => cb.checked = true);
            atualizarPlaceholderProdutoMulti();
        }

        const catTodos = document.getElementById('categoria-multi-todas');
        const catChecks = document.querySelectorAll('.categoria-multi-check');
        if (catTodos && catChecks.length) {
            catTodos.checked = true;
            catChecks.forEach(cb => cb.checked = true);
            atualizarPlaceholderCategoriaMulti();
        }

        const tamTodos = document.getElementById('tamanho-multi-todos');
        const tamChecks = document.querySelectorAll('.tamanho-multi-check');
        if (tamTodos && tamChecks.length) {
            tamTodos.checked = true;
            tamChecks.forEach(cb => cb.checked = true);
            atualizarPlaceholderTamanhoMulti();
        }

        const genTodos = document.getElementById('genero-multi-todos');
        const genChecks = document.querySelectorAll('.genero-multi-check');
        if (genTodos && genChecks.length) {
            genTodos.checked = true;
            genChecks.forEach(cb => cb.checked = true);
            atualizarPlaceholderGeneroMulti();
        }

        filtrarMovimentacoes();
    });
}


function getIniciais(nome) {
    if (!nome || typeof nome !== 'string' || !nome.trim()) return '';
    
    // Para responsável, pega a parte depois do hífen se existir
    const parteNome = nome.includes(' - ') ? nome.split(' - ')[1] : nome;
    const partes = parteNome.trim().split(' ');
    
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function corAvatar(str) {
    if (!str) return '#f1f1f1';
    
    // Para responsável, usa a parte depois do hífen para o hash
    const parteHash = str.includes(' - ') ? str.split(' - ')[1] : str;
    
    let hash = 0;
    for (let i = 0; i < parteHash.length; i++) hash = parteHash.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 60%, 80%)`;
}

function getPrimeiraInicial(nome) {
    if (!nome || typeof nome !== 'string' || !nome.trim()) return '';
    return nome.trim()[0].toUpperCase();
}

// Função para extrair código do funcionário do campo responsável
function getCodigoResponsavel(responsavel) {
    if (!responsavel || !responsavel.includes(' - ')) return 'N/A';
    return responsavel.split(' - ')[0]; // Parte antes do hífen é o código
}


const CAT_PAGE_SIZE = 7;
let catPageIndex = 0;
let catTotalPages = 1;
const CORES_CATEGORIAS = ["30,148,163","39,117,128","191,161,0","192,57,43","230,103,34","142,68,173","22,160,133","63,106,179","59,69,138","190,148,84","242,109,141","255,152,86","52,152,219","46,204,113","241,196,15","155,89,182","52,73,94","127,140,141","231,76,60","45,166,196"];

function getCategoriasDoLocalStorage(){
  try{
    const raw = localStorage.getItem('categoriasModal');
    if(!raw) return null;
    const arr = JSON.parse(raw);
    if(!Array.isArray(arr)) return null;
    return arr.filter(c=>c && (c.nome||c.name)).map((c,idx)=>({ id:c.id||(idx+1), nome:c.nome||c.name }));
  }catch(e){ return null; }
}

function numberFormatInt(n){ return n==null ? '0' : String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';'); }

// ...existing code...
// controle de início/offset (mantém CAT_PAGE_SIZE)
let catStartIndex = 0;

function renderCategoriaCards(summaryArray){
  const wrapper = document.getElementById('categoria-cards');
  const btnPrev = document.getElementById('cat-prev');
  const btnNext = document.getElementById('cat-next');
  if(!wrapper) return;

  // ordena por estoque e id (estável)
  summaryArray.sort((a,b)=>{ const d=(b.estoque||0)-(a.estoque||0); return d!==0?d:((a.id||0)-(b.id||0)); });
  const n = summaryArray.length;
  if(n === 0){ wrapper.innerHTML=''; if(btnPrev) btnPrev.style.display='none'; if(btnNext) btnNext.style.display='none'; return; }

  // Renderiza TODOS os cards (uma única vez)
  wrapper.innerHTML = '';
  summaryArray.forEach((c, idx) => {
    const color = CORES_CATEGORIAS[idx % CORES_CATEGORIAS.length];
    const borderColor = `rgb(${color})`;
    const textColor = `rgb(${color})`;
    const card = document.createElement('div');
    card.className = 'categoria-card';
    // garante tamanho fixo para cálculo de scroll; ajuste 120px se seu CSS usar outra largura
    card.style.flex = '0 0 120px';
    card.style.minWidth = '120px';
    card.innerHTML = `
      <div class="categoria-title">${escapeHtml(c.nome || ('Cat ' + (c.id || (idx+1))))}</div>
      <div class="categoria-estoque" style="border:2px solid ${borderColor}; color:${textColor};">
        <div class="label">Estoque</div>
        <div class="value">${numberFormatInt(c.estoque || 0)}</div>
      </div>
      <div class="categoria-rows">
        <div class="row entradas"><span>Entradas</span><span>${numberFormatInt(c.entradas || 0)}</span></div>
        <div class="row saidas"><span>Saídas</span><span>${numberFormatInt(c.saidas || 0)}</span></div>
      </div>
    `;
    wrapper.appendChild(card);
  });

  // --- lógica de botões: mostra/oculta e faz scroll suave (não re-render) ---
  if(!btnPrev || !btnNext){
    // se não existir botões, não tenta criar handlers
    updateButtons(); 
    return;
  }

  // calcula passo: largura visível do "viewport" (pai) — se não houver viewport, usa wrapper.clientWidth
  const viewport = document.querySelector('.categoria-cards-viewport') || wrapper.parentElement || wrapper;
  const getStep = () => Math.max(120, Math.floor((viewport.clientWidth || 900)));

  // exibe/oculta botões com base em overflow e posição
  function updateButtons(){
    const maxScrollLeft = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);
    const hasOverflow = wrapper.scrollWidth > wrapper.clientWidth + 2;
    btnPrev.style.display = hasOverflow && wrapper.scrollLeft > 2 ? '' : 'none';
    btnNext.style.display = hasOverflow && wrapper.scrollLeft < (maxScrollLeft - 2) ? '' : 'none';
  }

  // attach handlers (substitui handlers anteriores)
  btnPrev.onclick = () => {
    wrapper.scrollBy({ left: -getStep(), behavior: 'smooth' });
    setTimeout(updateButtons, 360);
  };
  btnNext.onclick = () => {
    wrapper.scrollBy({ left: getStep(), behavior: 'smooth' });
    setTimeout(updateButtons, 360);
  };

  // sincroniza botões com scroll manual
  wrapper.removeEventListener('scroll', wrapper._catScrollHandler || (()=>{}));
  wrapper._catScrollHandler = updateButtons;
  wrapper.addEventListener('scroll', wrapper._catScrollHandler);

  // garantir estado inicial coerente (não reseta scroll automaticamente)
  setTimeout(updateButtons, 20);
}

// ...existing code...
function animateCategoriaScroll(direction, wrapperEl){
  // função agora faz apenas um efeito visual sutil (sem manipular o DOM nem re-render)
  try {
    const el = wrapperEl || document.getElementById('categoria-cards');
    if(!el) return;
    el.style.transition = 'opacity 150ms ease';
    el.style.opacity = '0.95';
    setTimeout(()=> { el.style.opacity = '1'; el.style.transition = ''; }, 160);
  } catch(e){ /* silencioso */ }
}
// ...existing code...
// ...existing code...
function montarResumoCategoriasEgerarCards(produtos, movimentacoes){
  const catsLS = getCategoriasDoLocalStorage();
  const defaultCats = ['Camisa','Camiseta','Calça','Bermuda','Vestido','Sapato','Meia'];
  const cats = (catsLS && catsLS.length) ? catsLS : defaultCats.map((n,idx)=>({ id: idx+1, nome: n }));

  const summary = cats.map((c,idx)=>{
    const key = (c.nome||'').toString().toUpperCase();
    const estoque = produtos.reduce((s,p)=>{ const pcat = (p.categoria||'').toString().toUpperCase(); return s + ((pcat===key)?(Number(p.quantidade)||0):0); },0);
    const entradas = movimentacoes.reduce((s,m)=>{ const mcat=(m.categoria||'').toString().toUpperCase(); const qtd=Number(m.quantidadeMovimentada||m.quantidade||0)||0; return s + ((mcat===key && String((m.tipoMovimentacao||'').toUpperCase())==='ENTRADA')?qtd:0); },0);
    const saidas = movimentacoes.reduce((s,m)=>{ const mcat=(m.categoria||'').toString().toUpperCase(); const qtd=Number(m.quantidadeMovimentada||m.quantidade||0)||0; return s + ((mcat===key && String((m.tipoMovimentacao||'').toUpperCase())==='SAIDA')?qtd:0); },0);
    return { id: c.id||idx+1, nome: c.nome, keyUpper: key, estoque, entradas, saidas };
  });

  renderCategoriaCards(summary);
}



(function ensureCategoriaScroll() {
  function setup() {
    const cards = document.getElementById('categoria-cards');
    if (!cards) return;

    // se não existir a viewport, cria e envolve #categoria-cards
    let viewport = document.querySelector('.categoria-cards-viewport');
    if (!viewport) {
      viewport = document.createElement('div');
      viewport.className = 'categoria-cards-viewport';
      // insere viewport onde #categoria-cards estava
      const parent = cards.parentNode;
      parent.insertBefore(viewport, cards);
      viewport.appendChild(cards);
    }

    // força CSS inline mínimo para garantir o comportamento que você quer
    viewport.style.width = '900px';
    viewport.style.maxWidth = '900px';
    viewport.style.overflow = 'hidden';
    viewport.style.position = 'relative';

    // garante que o wrapper role horizontalmente e com smooth (apenas configura; já tem CSS)
    cards.style.display = 'flex';
    cards.style.gap = cards.style.gap || '10px';
    cards.style.alignItems = 'flex-start';
    cards.style.overflowX = 'auto';
    cards.style.scrollBehavior = 'smooth';
    // impede que o wrapper expanda o parent (gera scrollbar interno)
    cards.style.boxSizing = 'border-box';

    // configura botões Prev/Next para rolagem suave simples
    const btnPrev = document.getElementById('cat-prev');
    const btnNext = document.getElementById('cat-next');
    if (!btnPrev || !btnNext) return;

    const getStep = () => Math.max(120, Math.floor(viewport.clientWidth || 900));

    function updateButtons() {
      const max = Math.max(0, cards.scrollWidth - cards.clientWidth);
      btnPrev.style.display = cards.scrollLeft > 2 ? '' : 'none';
      btnNext.style.display = cards.scrollLeft < max - 2 ? '' : 'none';
    }

    btnPrev.onclick = () => {
      cards.scrollBy({ left: -getStep(), behavior: 'smooth' });
      setTimeout(updateButtons, 360);
    };
    btnNext.onclick = () => {
      cards.scrollBy({ left: getStep(), behavior: 'smooth' });
      setTimeout(updateButtons, 360);
    };

    // manter sincronizado com scroll manual
    cards.removeEventListener('scroll', cards._catScrollHandler || (()=>{}));
    cards._catScrollHandler = updateButtons;
    cards.addEventListener('scroll', cards._catScrollHandler);

    // initial
    setTimeout(updateButtons, 20);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();