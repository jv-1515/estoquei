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

let categoriasBackend = [];
let todosProdutos = [];
let totalProdutosCadastrados = 0;

document.addEventListener('DOMContentLoaded', function() {
    fetch('/produtos')
        .then(res => res.json())
        .then(produtos => {
            todosProdutos = produtos;
            totalProdutosCadastrados = produtos.length;
            document.getElementById('detalhe-total-cadastrados').textContent = totalProdutosCadastrados;
            // montarSelects(produtos);
            atualizarLista();
        });

    ['produtos-select','categorias-select','tamanhos-select','generos-select',
     'quantidade-min','quantidade-max','periodo-data-inicio','periodo-data-fim','baixo-estoque-checkbox']
     .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', atualizarLista);
    });

    document.getElementById('btn-gerar-relatorio').addEventListener('click', gerarRelatorio);
});



async function atualizarLista() {
    const filtros = getFiltrosSelecionados();
    let filtrados = todosProdutos.filter(p => {
        if (filtros.idsSelecionados.length && !filtros.idsSelecionados.includes(p.id)) return false;
        if (filtros.categorias.length && !filtros.categorias.includes(p.categoria)) return false;
        if (filtros.tamanhos.length && !filtros.tamanhos.includes(p.tamanho)) return false;
        if (filtros.generos.length && !filtros.generos.includes(p.genero)) return false;
        if (!filtros.quantidadeTodos) {
            if (filtros.quantidadeBaixo && !filtros.quantidadeZerados) {
                if (!(p.quantidade > 0 && p.quantidade < p.limiteMinimo)) return false;
            } else if (!filtros.quantidadeBaixo && filtros.quantidadeZerados) {
                if (p.quantidade !== 0) return false;
            } else if (filtros.quantidadeBaixo && filtros.quantidadeZerados) {
                if (!(p.quantidade < p.limiteMinimo || p.quantidade === 0)) return false;
            } else {
                // Nenhum marcado: não mostra nada
                return false;
            }
        }
        // Faixa sempre é aplicada, exceto se só zerados está marcado
        if (!(filtros.quantidadeBaixo === false && filtros.quantidadeTodos === false && filtros.quantidadeZerados === true)) {
            if (filtros.quantidadeMin !== null && p.quantidade < filtros.quantidadeMin) return false;
            if (filtros.quantidadeMax !== null && p.quantidade > filtros.quantidadeMax) return false;
        }
        if (filtros.precoMin !== null && p.preco < filtros.precoMin) return false;
        if (filtros.precoMax !== null && p.preco > filtros.precoMax) return false;
        return true;
    });

    if (filtros.dataInicio && filtros.dataFim) {
        filtrados = await filtrarProdutosPorPeriodo(filtrados, filtros.dataInicio, filtros.dataFim);
    }

    if (filtrados.length === 0) {
        exibirNenhumProduto();

        atualizarDetalhesPrevia([], filtros);
        window.atualizarDetalhesEstoque([]);
        return;
    }

    atualizarDetalhesPrevia(filtrados, filtros); // Atualiza os 6 cards
    window.atualizarDetalhesEstoque(filtrados);  // Atualiza os gráficos
    atualizarMovimentacoesResumo();
}

// E na função:
// function desenharTagsLegenda(ctx, entradas, saidas, saldoFormatado) {
//     const tags = [
//         { texto: `Entradas ${numberFormatInt(entradas)}`, cor: "#FF5722" },
//         { texto: `Saídas ${numberFormatInt(saidas)}`, cor: "#43B04A" },
//         { texto: `Saldo (R$) ${saldoFormatado}`, cor: "#1e94a3" }
//     ];

//     const larguraTag = 180;
//     const alturaTag = 38;
//     const espacamento = 20;
//     ctx.font = 'bold 18px Helvetica';
//     ctx.textBaseline = 'middle';

//     // Centralizar as tags no topo do canvas
//     const totalLargura = tags.length * larguraTag + (tags.length - 1) * espacamento;
//     let xStart = (ctx.canvas.width - totalLargura) / 2;
//     for (let i = 0; i < tags.length; i++) {
//         const x = xStart + i * (larguraTag + espacamento);
//         const y = 22;
//         ctx.beginPath();
//         ctx.moveTo(x + 10, y);
//         ctx.lineTo(x + larguraTag - 10, y);
//         ctx.quadraticCurveTo(x + larguraTag, y, x + larguraTag, y + 10);
//         ctx.lineTo(x + larguraTag, y + alturaTag - 10);
//         ctx.quadraticCurveTo(x + larguraTag, y + alturaTag, x + larguraTag - 10, y + alturaTag);
//         ctx.lineTo(x + 10, y + alturaTag);
//         ctx.quadraticCurveTo(x, y + alturaTag, x, y + alturaTag - 10);
//         ctx.lineTo(x, y + 10);
//         ctx.quadraticCurveTo(x, y, x + 10, y);
//         ctx.closePath();
//         ctx.fillStyle = tags[i].cor;
//         ctx.fill();
//         ctx.fillStyle = "#fff";
//         ctx.textAlign = "center";
//         ctx.fillText(tags[i].texto, x + larguraTag / 2, y + alturaTag / 2);
//     }
// }

async function gerarRelatorio() {
    const filtros = getFiltrosSelecionados();

    if (!validarObrigatoriedadePeriodo(filtros.dataInicio, filtros.dataFim)) return;
    if (!validarDatasPeriodo(filtros.dataInicio, filtros.dataFim)) return;

        Swal.fire({
            icon: 'info',
            title: 'Gerando Relatório de Desempenho',
            text: 'Aguarde...',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });


    // captura os placeholders dos inputs de filtro
    const filtrosAplicados = {
        produtos: document.getElementById('filter-produto')?.value || '',
        categorias: document.getElementById('filter-categoria')?.value || '',
        tamanhos: document.getElementById('filter-tamanho')?.value || '',
        generos: document.getElementById('filter-genero')?.value || '',
        quantidade: document.getElementById('filter-quantidade')?.value || '',
        preco: document.getElementById('filter-preco')?.value || '',
        periodo: document.getElementById('filter-periodo')?.value || ''
    };

    // Filtra os produtos igual à prévia (categoria, tamanho, etc)
    let produtosFiltrados = todosProdutos.filter(p => {
        if (filtros.idsSelecionados.length && !filtros.idsSelecionados.includes(p.id)) return false;
        if (filtros.categorias.length && !filtros.categorias.includes(p.categoria)) return false;
        if (filtros.tamanhos.length && !filtros.tamanhos.includes(p.tamanho)) return false;
        if (filtros.generos.length && !filtros.generos.includes(p.genero)) return false;
        if (!filtros.quantidadeTodos) {
            if (filtros.quantidadeBaixo && !filtros.quantidadeZerados) {
                if (!(p.quantidade > 0 && p.quantidade < p.limiteMinimo)) return false;
            } else if (!filtros.quantidadeBaixo && filtros.quantidadeZerados) {
                if (p.quantidade !== 0) return false;
            } else if (filtros.quantidadeBaixo && filtros.quantidadeZerados) {
                if (!(p.quantidade < p.limiteMinimo || p.quantidade === 0)) return false;
            } else {
                // Nenhum marcado: não mostra nada
                return false;
            }
        }
        // Faixa sempre é aplicada, exceto se só zerados está marcado (já filtrou acima)
        if (!(filtros.quantidadeBaixo === false && filtros.quantidadeTodos === false && filtros.quantidadeZerados === true)) {
            if (filtros.quantidadeMin !== null && p.quantidade < filtros.quantidadeMin) return false;
            if (filtros.quantidadeMax !== null && p.quantidade > filtros.quantidadeMax) return false;
        }
        if (filtros.precoMin !== null && p.preco < filtros.precoMin) return false;
        if (filtros.precoMax !== null && p.preco > filtros.precoMax) return false;
        return true;
    });

    if (filtros.dataInicio && filtros.dataFim) {
        produtosFiltrados = await filtrarProdutosPorPeriodo(produtosFiltrados, filtros.dataInicio, filtros.dataFim);
    }

    if (produtosFiltrados.length === 0) {
        exibirNenhumProduto();
        return;
    }

    // --- GERAÇÃO DO GRÁFICO ---
    const dadosGrafico = montarDadosGraficoStacked(produtosFiltrados, filtros.dataInicio, filtros.dataFim);


    const maxEmpilhado = Math.max(
        ...dadosGrafico.entradas.map((v, i) => v + (dadosGrafico.saidas[i] || 0)),
        0
    );
    const limiteBarra = calcularLimiteBarra([maxEmpilhado]);


    let canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 350;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);


    let chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: dadosGrafico.labels,
            datasets: [
                {
                    label: `Entradas ${numberFormatInt(dadosGrafico.totalEntradas)}`,
                    data: dadosGrafico.entradas,
                    backgroundColor: '#FF5722',
                    borderColor: '#FF5722',
                    borderWidth: 1,
                    stack: 'quantidade',
                    datalabels: {
                        color: '#fff',
                        anchor: 'end',
                        align: 'start',
                        font: { weight: 'bold', size: 14 },
                        formatter: v => v > 0 ? numberFormatInt(v) : ''
                    }
                },
                {
                    label: `Saídas ${numberFormatInt(dadosGrafico.totalSaidas)}`,
                    data: dadosGrafico.saidas,
                    backgroundColor: '#43B04A',
                    borderColor: '#43B04A',
                    borderWidth: 1,
                    stack: 'quantidade',
                    datalabels: {
                        color: '#fff',
                        anchor: 'end',
                        align: 'start',
                        font: { weight: 'bold', size: 14 },
                        formatter: v => v > 0 ? numberFormatInt(v) : ''
                    }
                }
            ]
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 20, weight: 'bold' },
                        color: '#277580',
                        boxWidth: 24,
                        padding: 18
                    }
                },
                title: { display: false },
                datalabels: { display: true }
            },
            scales: {
                x: { stacked: true, ticks: { color: '#000' } },
                y: {
                    stacked: true,
                    min: 0,
                    max: limiteBarra,
                    ticks: { stepSize: limiteBarra/5, color: '#000' }
                }
            }
        },
        plugins: [ChartDataLabels]
    });

    // Aguarde o Chart.js renderizar
    await new Promise(resolve => setTimeout(resolve, 400));
    const ctx = canvas.getContext('2d');

    const saldo = dadosGrafico.totalEntradas - dadosGrafico.totalSaidas;
    const sinalSaldo = saldo >= 0 ? "+" : "-";
    const saldoFormatado = `${sinalSaldo}${Math.abs(saldo).toLocaleString('pt-BR', {minimumFractionDigits:2})}`;

    
    // Legenda no topo
    // desenharTagsLegenda(ctx, dadosGrafico.totalEntradas, dadosGrafico.totalSaidas, dadosGrafico.saldoTotal);
    
    // Labels customizadas abaixo das barras
    // ctx.font = 'bold 13px Helvetica';
    // for (let i = 0; i < dadosGrafico.labels.length; i++) {
    //     let x = 70 + i * 70; // ajuste conforme largura
    //     let y = canvas.height - 10;
    //     ctx.fillStyle = '#277580';
    //     ctx.fillText(dadosGrafico.labelDetalhes[i], x, y);
    // }
    
    let graficoBase64 = canvas.toDataURL('image/png');
    canvas.remove();

    // --- FETCH ---
    fetch('/relatorio/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            produtos: produtosFiltrados,
            dataInicio: filtros.dataInicio,
            dataFim: filtros.dataFim,
            filtrosAplicados,
            graficoBase64 // <-- AGORA ESTÁ DEFINIDO!
        })
    })
    .then(res => {
        if (!res.ok) throw new Error('Erro ao gerar PDF');
        return res.blob();
    })
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const hoje = new Date();
        const baseNomeArquivo = `RelatorioDesempenho_${String(hoje.getDate()).padStart(2, '0')}${String(hoje.getMonth() + 1).padStart(2, '0')}${hoje.getFullYear()}`;
        let nomeArquivo = `${baseNomeArquivo}.pdf`;

        let relatorios = JSON.parse(localStorage.getItem('relatoriosGerados') || '[]');
        let contador = 1;
        let nomeUnico = `${baseNomeArquivo}.pdf`;
        while (relatorios.some(r => r.nome === nomeUnico)) {
            nomeUnico = `${baseNomeArquivo}_${contador}.pdf`;
            contador++;
        }
        nomeArquivo = nomeUnico;

        // download
        const a = document.createElement('a');
        a.href = url;
        a.download = nomeArquivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // salva no localStorage
        const reader = new FileReader();
        reader.onloadend = function() {
            const base64 = reader.result;
            const novoRelatorio = {
                id: Date.now(),
                nome: nomeArquivo,
                dataCriacao: hoje.toISOString(),
                periodo: filtros.dataInicio && filtros.dataFim
                    ? (filtros.dataInicio === filtros.dataFim
                        ? formatarDataBR(filtros.dataInicio)
                        : `${formatarDataBR(filtros.dataInicio)} - ${formatarDataBR(filtros.dataFim)}`)
                    : formatarDataBR(hoje.toISOString().slice(0, 10)),
                base64
            };
            let relatorios = JSON.parse(localStorage.getItem('relatoriosGerados') || '[]');
            relatorios.push(novoRelatorio);
            window.relatoriosGerados = relatorios;
            localStorage.setItem('relatoriosGerados', JSON.stringify(relatorios));
        };
        reader.readAsDataURL(blob);
        Swal.close();
        // preview na tela
        document.getElementById('preview-relatorio').innerHTML =
            `<iframe src="${url}" name="${nomeArquivo}" id="${nomeArquivo}"></iframe>`;
        setTimeout(() => {
            document.getElementById('preview-relatorio').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
        })
        .catch(() => {
        Swal.close();
        Swal.fire('Erro', 'Falha ao gerar relatório.', 'error');
    });
}

function montarCheckboxesProduto(produtos) {
    const divProd = document.getElementById('checkboxes-produto-multi');
    divProd.innerHTML = `<label><input type="checkbox" id="produto-multi-todos" class="produto-multi-check" value="" checked> Todos</label>`;
    produtos.forEach(p => {
        divProd.innerHTML += `<label><input type="checkbox" class="produto-multi-check" value="${p.id}" checked> ${p.nome} - ${p.codigo}</label>`;
    });
    document.querySelectorAll('.produto-multi-check').forEach(cb => {
        cb.addEventListener('change', atualizarPlaceholderProdutoMulti);
        cb.addEventListener('change', atualizarLista);
    });
    atualizarPlaceholderProdutoMulti.call(document.querySelector('.produto-multi-check'));
}

function montarCheckboxesCategoria(produtos) {
    const categorias = [...new Set(produtos.map(p => p.categoria).filter(Boolean))];
    const divCat = document.getElementById('checkboxes-categoria-multi');
    divCat.innerHTML = `<label><input type="checkbox" id="categoria-multi-todas" class="categoria-multi-check" value="" checked> Todas</label>`;
    categorias.forEach(cat => {
        divCat.innerHTML += `<label><input type="checkbox" class="categoria-multi-check" value="${cat}" checked> ${cat}</label>`;
    });
    document.querySelectorAll('.categoria-multi-check').forEach(cb => {
        cb.addEventListener('change', function() {
            atualizarPlaceholderCategoriaMulti.call(cb);
            atualizarLista();
        });
    });
    atualizarPlaceholderCategoriaMulti.call(document.querySelector('.categoria-multi-check'));
}

function montarCheckboxesTamanho(produtos) {
    const tamanhos = [...new Set(produtos.map(p => p.tamanho))];
    const divTam = document.getElementById('checkboxes-tamanho-multi');
    divTam.innerHTML = `<label><input type="checkbox" id="tamanho-multi-todos" class="tamanho-multi-check" value="" checked> Todos</label>`;
    tamanhos.forEach(tam => {
        divTam.innerHTML += `<label><input type="checkbox" class="tamanho-multi-check" value="${tam}" checked> ${exibirTamanho(tam)}</label>`;
    });
    document.querySelectorAll('.tamanho-multi-check').forEach(cb => {
        cb.addEventListener('change', atualizarPlaceholderTamanhoMulti);
        cb.addEventListener('change', atualizarLista);
    });
    atualizarPlaceholderTamanhoMulti.call(document.querySelector('.tamanho-multi-check'));
}

function montarCheckboxesGenero(produtos) {
    const generos = [...new Set(produtos.map(p => p.genero))];
    const divGen = document.getElementById('checkboxes-genero-multi');
    divGen.innerHTML = `<label><input type="checkbox" id="genero-multi-todos" class="genero-multi-check" value="" checked> Todos</label>`;
    generos.forEach(gen => {
        divGen.innerHTML += `<label><input type="checkbox" class="genero-multi-check" value="${gen}" checked> ${capitalizar(gen)}</label>`;
    });
    document.querySelectorAll('.genero-multi-check').forEach(cb => {
        cb.addEventListener('change', atualizarPlaceholderGeneroMulti);
        cb.addEventListener('change', atualizarLista);
    });
    atualizarPlaceholderGeneroMulti.call(document.querySelector('.genero-multi-check'));
}

// Atualizar placeholders
function atualizarPlaceholderProdutoMulti() {
    const checks = Array.from(document.querySelectorAll('.produto-multi-check'));
    const todos = checks[0];
    const individuais = checks.slice(1);
    const input = document.getElementById('filter-produto');
    const selecionados = individuais.filter(cb => cb.checked);

    // "Todos" marca/desmarca todos
    if (this === todos) {
        checks.forEach(cb => cb.checked = todos.checked);
    } else {
        todos.checked = individuais.every(cb => cb.checked);
    }

    // Placeholder e borda
    let ativo = true;
    if (todos.checked || selecionados.length === 0) {
        input.value = "Todos";
        ativo = false;
    } else if (selecionados.length === 1) {
        input.value = selecionados[0].parentNode.textContent.trim();
    } else {
        input.value = `${selecionados.length} selecionados`;
    }
    if (ativo) {
        input.style.border = '2px solid #1e94a3';
        input.style.color = '#1e94a3';
    } else {
        input.style.border = '';
        input.style.color = '';
    }
    // Atualiza o chevron junto
    const chevron = input.parentNode.querySelector('span');
    if (chevron) {
        chevron.style.color = ativo ? '#1e94a3' : '#888';
    }
}

function atualizarPlaceholderCategoriaMulti() {
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
    const todas = checks[0];
    const individuais = checks.slice(1);
    const input = document.getElementById('filter-categoria');
    const selecionados = individuais.filter(cb => cb.checked);

    if (this === todas) {
        checks.forEach(cb => cb.checked = todas.checked);
    } else {
        todas.checked = individuais.every(cb => cb.checked);
    }

    let ativo = true;
    if (todas.checked || selecionados.length === 0) {
        input.value = "Todas";
        ativo = false;
    } else if (selecionados.length === 1) {
        input.value = selecionados[0].parentNode.textContent.trim();
    } else {
        input.value = `${selecionados.length} selecionadas`;
    }
    if (ativo) {
        input.style.border = '2px solid #1e94a3';
        input.style.color = '#1e94a3';
    } else {
        input.style.border = '';
        input.style.color = '';
    }
    // Atualiza o chevron junto
    const chevron = input.parentNode.querySelector('span');
    if (chevron) {
        chevron.style.color = ativo ? '#1e94a3' : '#888';
    }
}

function atualizarPlaceholderTamanhoMulti() {
    const checks = Array.from(document.querySelectorAll('.tamanho-multi-check'));
    const todos = checks[0];
    const individuais = checks.slice(1);
    const input = document.getElementById('filter-tamanho');
    const selecionados = individuais.filter(cb => cb.checked);

    if (this === todos) {
        checks.forEach(cb => cb.checked = todos.checked);
    } else {
        todos.checked = individuais.every(cb => cb.checked);
    }

    let ativo = true;
    if (todos.checked || selecionados.length === 0) {
        input.value = "Todos";
        ativo = false;
    } else if (selecionados.length === 1) {
        input.value = selecionados[0].parentNode.textContent.trim();
    } else {
        input.value = `${selecionados.length} selecionados`;
    }
    if (ativo) {
        input.style.border = '2px solid #1e94a3';
        input.style.color = '#1e94a3';
    } else {
        input.style.border = '';
        input.style.color = '';
    }
    // Atualiza o chevron junto
    const chevron = input.parentNode.querySelector('span');
    if (chevron) {
        chevron.style.color = ativo ? '#1e94a3' : '#888';
    }
}

function atualizarPlaceholderGeneroMulti() {
    const checks = Array.from(document.querySelectorAll('.genero-multi-check'));
    const todas = checks[0];
    const individuais = checks.slice(1);
    const input = document.getElementById('filter-genero');
    const selecionados = individuais.filter(cb => cb.checked);

    if (this === todas) {
        checks.forEach(cb => cb.checked = todas.checked);
    } else {
        todas.checked = individuais.every(cb => cb.checked);
    }

    let ativo = true;
    if (todas.checked || selecionados.length === 0) {
        input.value = "Todos";
        ativo = false;
    } else if (selecionados.length === 1) {
        input.value = selecionados[0].parentNode.textContent.trim();
    } else {
        input.value = `${selecionados.length} selecionados`;
    }
    if (ativo) {
        input.style.border = '2px solid #1e94a3';
        input.style.color = '#1e94a3';
    } else {
        input.style.border = '';
        input.style.color = '';
    }
    // Atualiza o chevron junto
    const chevron = input.parentNode.querySelector('span');
    if (chevron) {
        chevron.style.color = ativo ? '#1e94a3' : '#888';
    }
}

// Mostrar/ocultar popups ao clicar no input
['produto','categoria','tamanho','genero'].forEach(tipo => {
    const input = document.getElementById(`filter-${tipo}`);
    const popup = document.getElementById(`checkboxes-${tipo}-multi`);
    if (input && popup) {
        input.addEventListener('click', function(e) {
            // Fecha outros popups
            ['produto','categoria','tamanho','genero'].forEach(t => {
                if (t !== tipo) {
                    const p = document.getElementById(`checkboxes-${t}-multi`);
                    if (p) p.style.display = 'none';
                }
            });
            popup.style.display = 'block';
            e.stopPropagation();
        });
        document.addEventListener('mousedown', function(e) {
            if (popup.style.display === 'block' && !popup.contains(e.target) && e.target !== input) {
                popup.style.display = 'none';
            }
        });
    }
});

// Chame as funções de montagem no início
document.addEventListener('DOMContentLoaded', function() {
    fetch('/produtos')
        .then(res => res.json())
        .then(produtos => {
            todosProdutos = produtos;
            montarCheckboxesProduto(produtos);
            const categorias = [...new Set(produtos.map(p => p.categoria))];
            montarCheckboxesCategoria(produtos);
            montarCheckboxesTamanho(produtos);
            montarCheckboxesGenero(produtos);
            atualizarLista();
        });
});


function getProdutosSelecionados() {
    return Array.from(document.querySelectorAll('.produto-multi-check'))
        .filter(cb => cb.checked && cb.value)
        .map(cb => Number(cb.value));
}
function getCategoriasSelecionadas() {
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
    const todas = checks[0];
    if (!todas) return [];
    if (todas.checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
}
function getTamanhosSelecionados() {
    return Array.from(document.querySelectorAll('.tamanho-multi-check'))
        .filter(cb => cb.checked && cb.value)
        .map(cb => cb.value);
}
function getGenerosSelecionados() {
    return Array.from(document.querySelectorAll('.genero-multi-check'))
        .filter(cb => cb.checked && cb.value)
        .map(cb => cb.value);
}

// Use os selecionados no filtro
function getFiltrosSelecionados() {
    const idsSelecionados = getProdutosSelecionados();
    const categorias = getCategoriasSelecionadas();
    const tamanhos = getTamanhosSelecionados();
    const generos = getGenerosSelecionados();
    const quantidadeTodos = document.getElementById('quantidade-todas-popup').checked;
    const quantidadeBaixo = document.getElementById('quantidade-baixo-estoque-popup').checked;
    const quantidadeZerados = document.getElementById('quantidade-zerados-popup').checked;
    const quantidadeMin = document.getElementById('quantidade-min').value ? Number(document.getElementById('quantidade-min').value) : null;
    const quantidadeMax = document.getElementById('quantidade-max').value ? Number(document.getElementById('quantidade-max').value) : null;
    const dataInicio = document.getElementById('periodo-data-inicio').value || null;
    const dataFim = document.getElementById('periodo-data-fim').value || null;
    const precoMin = document.getElementById('preco-min').value ? Number(document.getElementById('preco-min').value.replace(',', '.')) : null;
    const precoMax = document.getElementById('preco-max').value ? Number(document.getElementById('preco-max').value.replace(',', '.')) : null;
    return {
        idsSelecionados,
        categorias,
        tamanhos,
        generos,
        quantidadeTodos,
        quantidadeBaixo,
        quantidadeZerados,
        quantidadeMin,
        quantidadeMax,
        dataInicio,
        dataFim,
        precoMin: precoMin,
        precoMax: precoMax
    };
}

// --- QUANTIDADE POPUP ---
const qtdInput = document.getElementById('filter-quantidade');
const qtdPopup = document.getElementById('quantidade-faixa-popup');
if (qtdInput && qtdPopup) {
    qtdInput.addEventListener('click', function(e) {
        qtdPopup.style.display = 'block';
        e.stopPropagation();
    });
    document.addEventListener('mousedown', function(e) {
        if (qtdPopup.style.display === 'block' && !qtdPopup.contains(e.target) && e.target !== qtdInput) {
            qtdPopup.style.display = 'none';
        }
    });
}

// --- PERÍODO POPUP ---
const periodoInput = document.getElementById('filter-periodo');
const periodoPopup = document.getElementById('periodo-popup');
if (periodoInput && periodoPopup) {
    periodoInput.addEventListener('click', function(e) {
        periodoPopup.style.display = 'block';
        e.stopPropagation();
    });
    document.addEventListener('mousedown', function(e) {
        if (periodoPopup.style.display === 'block' && !periodoPopup.contains(e.target) && e.target !== periodoInput) {
            periodoPopup.style.display = 'none';
        }
    });
}

// --- PLACEHOLDER QUANTIDADE ---
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
            faixa = `de ${min} até ${max}`;
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
        } else if (faixa) {
            texto = faixa;
        } else {
            texto = "Todas";
            ativo = false;
        }
        ativo = texto !== "Todas";
    }

    if (input) input.value = texto;

    if (ativo) {
        input.style.border = '2px solid #1e94a3';
        input.classList.add('quantidade-ativa');
    } else {
        input.style.border = '';
        input.classList.remove('quantidade-ativa');
    }
    // Atualiza o chevron junto
    const chevron = input.parentNode.querySelector('span');
    if (chevron) {
        chevron.style.color = ativo ? '#1e94a3' : '#888';
    }
}

// Listeners para todos os campos de quantidade
['quantidade-todas-popup','quantidade-baixo-estoque-popup','quantidade-zerados-popup','quantidade-min','quantidade-max'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', atualizarPlaceholderQuantidade);
});

document.addEventListener('DOMContentLoaded', atualizarPlaceholderQuantidade);

function atualizarPlaceholderPreco() {
    const precoMinEl = document.getElementById('preco-min');
    const precoMaxEl = document.getElementById('preco-max');
    const input = document.getElementById('filter-preco');

    let precoMin = precoMinEl.value.replace('R$','').replace(',','.').trim();
    let precoMax = precoMaxEl.value.replace('R$','').replace(',','.').trim();
    precoMin = precoMin && !isNaN(precoMin) ? Number(precoMin) : null;
    precoMax = precoMax && !isNaN(precoMax) ? Number(precoMax) : null;

    let texto = 'Todos';
    let ativo = false;

    if (precoMin !== null && precoMax !== null) {
        texto = `R$ ${precoMin.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})} - R$ ${precoMax.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        ativo = true;
    } else if (precoMin !== null) {
        texto = `R$ ${precoMin.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        ativo = true;
    } else if (precoMax !== null) {
        texto = `R$ ${precoMax.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2})}`;
        ativo = true;
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
    const chevron = input.parentNode.querySelector('span');
    if (chevron) {
        chevron.style.color = ativo ? '#1e94a3' : '#888';
    }
}

// Máscara e listeners para preço
['preco-min','preco-max'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', function() {
            mascaraPrecoFaixa(this);
            atualizarPlaceholderPreco();
        });
    }
});
document.addEventListener('DOMContentLoaded', atualizarPlaceholderPreco);

// --- PLACEHOLDER PERÍODO ---
function atualizarPlaceholderPeriodo() {
    const dataInicio = document.getElementById('periodo-data-inicio').value;
    const dataFim = document.getElementById('periodo-data-fim').value;
    const input = document.getElementById('filter-periodo');
    let ativo = false;

    if (dataInicio && dataFim) {
        input.value = `${dataInicio.split('-').reverse().join('/')} - ${dataFim.split('-').reverse().join('/')}`;
        ativo = true;
    } else {
        input.value = '';
    }

    if (ativo) {
        input.style.border = '2px solid #1e94a3';
        input.style.color = '#1e94a3';
    } else {
        input.style.border = '';
        input.style.color = '';
    }
    // Atualiza o chevron junto
    const chevron = input.parentNode.querySelector('span');
    if (chevron) {
        chevron.style.color = ativo ? '#1e94a3' : '#888';
    }
}

['periodo-data-inicio','periodo-data-fim'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', atualizarPlaceholderPeriodo);
});
document.addEventListener('DOMContentLoaded', atualizarPlaceholderPeriodo);

// --- LÓGICA DOS CHECKBOXES QUANTIDADE ---
if (document.getElementById('quantidade-todas-popup')) {
    document.getElementById('quantidade-todas-popup').addEventListener('change', function() {
        const baixo = document.getElementById('quantidade-baixo-estoque-popup');
        const zerados = document.getElementById('quantidade-zerados-popup');
        if (this.checked) {
            baixo.checked = true;
            zerados.checked = true;
        }
        atualizarPlaceholderQuantidade();
        atualizarLista();
    });
}
['quantidade-baixo-estoque-popup','quantidade-zerados-popup'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', function() {
        // Não força o "Todos" a desmarcar!
        atualizarPlaceholderQuantidade();
        atualizarLista();
    });
});

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
}

// Sempre que mudar os checkboxes de quantidade
['quantidade-todas-popup','quantidade-baixo-estoque-popup','quantidade-zerados-popup'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', function() {
        syncQuantidadeChecksAndInputs();
        atualizarPlaceholderQuantidade();
        atualizarLista();
    });
});

// Sempre que mudar min/max manualmente
['quantidade-min','quantidade-max'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', function() {
            // Só números, máximo 3 dígitos
            this.value = this.value.replace(/\D/g, '').slice(0, 3);

            const chkTodos = document.getElementById('quantidade-todas-popup');
            const chkBaixo = document.getElementById('quantidade-baixo-estoque-popup');
            const chkZerados = document.getElementById('quantidade-zerados-popup');
            // Se min/max for alterado para 0 e só zerados está marcado, mantenha
            if (this.value == 0 && chkZerados.checked && !chkTodos.checked && !chkBaixo.checked) {
            } else {
                chkTodos.checked = false;
                if (chkZerados.checked && (this.value != 0)) chkZerados.checked = false;
            }
            atualizarPlaceholderQuantidade();
            if (typeof atualizarLista === 'function') atualizarLista();
        });
    }
});

// Chame no início para garantir estado correto
document.addEventListener('DOMContentLoaded', syncQuantidadeChecksAndInputs);

async function gerarPDFHistoricoProdutos(produtos) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape" });

    for (let i = 0; i < produtos.length; i++) {
        const p = produtos[i];

        // Título do produto
        doc.setFontSize(14);
        doc.setTextColor("#1E94A3");
        doc.text(`Produto: ${p.nome} (${p.codigo})`, 14, 18);
        doc.setFontSize(10);
        doc.setTextColor("#333");
        doc.text(`Categoria: ${p.categoria || '-'}   Tamanho: ${p.tamanho || '-'}   Gênero: ${p.genero || '-'}`, 14, 26);

        // Busca histórico do produto
        let historico = [];
        try {
            const resp = await fetch(`/api/movimentacoes/produto?codigo=${encodeURIComponent(p.codigo)}`);
            historico = await resp.json();
        } catch (e) {
            historico = [];
        }

        // Ordena do mais recente para o mais antigo
        historico.sort((a, b) => new Date(b.data) - new Date(a.data));

        // Monta linhas da tabela
        const rows = historico.map(m => {
            // Extrai primeiro e último nome do responsável
            let resp = m.responsavel || '';
            if (resp.includes('-')) {
                let [codigo, nome] = resp.split('-').map(s => s.trim());
                let nomes = nome.split(/\s+/);
                nome = nomes.length === 1 ? nomes[0] : nomes[0] + ' ' + nomes[nomes.length - 1];
                resp = `${codigo} - ${nome}`;
            }
            return [
                m.data ? m.data.split('-').reverse().join('/') : '',
                m.tipoMovimentacao,
                m.codigoMovimentacao,
                m.quantidadeMovimentada,
                m.estoqueFinal,
                m.valorMovimentacao ? 'R$ ' + Number(m.valorMovimentacao).toFixed(2).replace('.', ',') : '',
                m.parteEnvolvida || '',
                resp
            ];
        });

        // Cabeçalho da tabela
        const columns = [
            "Data", "Tipo Movimentação", "Código", "Quantidade", "Estoque Final", "Valor (R$)", "Parte Envolvida", "Responsável"
        ];

        // Adiciona tabela
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: i === 0 ? 32 : doc.lastAutoTable.finalY + 16,
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: "#1E94A3", textColor: "#fff", fontStyle: 'bold' },
            alternateRowStyles: { fillColor: "#F5F5F5" }
        });

        // Quebra de página se não for o último produto
        if (i < produtos.length - 1) doc.addPage("landscape");
    }

    doc.save("HistoricoProdutos.pdf");


    // async function adicionarHistoricoProdutosAoPDF(doc, produtos, filtros) {
    //     // Busca todos os históricos em paralelo
    //     const historicos = await Promise.all(produtos.map(p =>
    //         fetch(`/api/movimentacoes/produto?codigo=${encodeURIComponent(p.codigo)}`)
    //             .then(res => res.json())
    //             .catch(() => [])
    //     ));

    //     let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 30;

    //     for (let i = 0; i < produtos.length; i++) {
    //         const p = produtos[i];
    //         let historico = (historicos[i] || []);
    //         // Filtra histórico pelo período, se marcado
    //         if (filtros && filtros.dataInicio && filtros.dataFim) {
    //             const dtIni = new Date(filtros.dataInicio);
    //             const dtFim = new Date(filtros.dataFim);
    //             historico = historico.filter(mov => {
    //                 const dt = new Date(mov.data);
    //                 return dt >= dtIni && dt <= dtFim;
    //             });
    //         }
    //         // Ordena do mais recente para o mais antigo
    //         historico.sort((a, b) => new Date(b.data) - new Date(a.data));

    //         // Título do produto
    //         doc.addPage("landscape");
    //         y = 20;
    //         doc.setFontSize(13);
    //         doc.setTextColor("#1E94A3");
    //         doc.text(`${p.codigo} - ${p.nome}`, 14, y);
    //         doc.setFontSize(10);
    //         doc.setTextColor("#333");
    //         y += 7;
    //         doc.text(`Categoria: ${p.categoria || '-'}   Tamanho: ${p.tamanho || '-'}   Gênero: ${p.genero || '-'}   Preço: ${p.preco ? 'R$ ' + Number(p.preco).toFixed(2).replace('.', ',') : '-'}   Estoque Atual: ${p.quantidade}`, 14, y);

    //         // Cabeçalho da tabela
    //         const columns = [
    //             "Data", "Movimentação", "Código", "Quantidade", "Estoque Final", "Valor (R$)", "Parte Envolvida", "Responsável"
    //         ];

    //         // Monta linhas da tabela
    //         const rows = historico.map(m => {
    //             // Extrai primeiro e último nome do responsável
    //             let resp = m.responsavel || '';
    //             if (resp.includes('-')) {
    //                 let [codigo, nome] = resp.split('-').map(s => s.trim());
    //                 let nomes = nome.split(/\s+/);
    //                 nome = nomes.length === 1 ? nomes[0] : nomes[0] + ' ' + nomes[nomes.length - 1];
    //                 resp = `${codigo} - ${nome}`;
    //             }
    //             return [
    //                 m.data ? m.data.split('-').reverse().join('/') : '',
    //                 m.tipoMovimentacao === 'ENTRADA' ? 'Entrada' : 'Saída',
    //                 m.codigoMovimentacao || '-',
    //                 m.quantidadeMovimentada,
    //                 m.estoqueFinal,
    //                 m.valorMovimentacao ? 'R$ ' + Number(m.valorMovimentacao).toFixed(2).replace('.', ',') : '',
    //                 m.parteEnvolvida || '',
    //                 resp
    //             ];
    //         });

    //         doc.autoTable({
    //             head: [columns],
    //             body: rows,
    //             startY: y + 10,
    //             styles: { fontSize: 9, cellPadding: 2 },
    //             headStyles: { fillColor: "#1E94A3", textColor: "#fff", fontStyle: 'bold' },
    //             alternateRowStyles: { fillColor: "#F5F5F5" }
    //         });
    //     }
    // }

    
}

// --- PREÇO POPUP ---
const precoInput = document.getElementById('filter-preco');
const precoPopup = document.getElementById('preco-faixa-popup');
const precoMin = document.getElementById('preco-min');
const precoMax = document.getElementById('preco-max');

function mascaraPrecoFaixa(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 5) value = value.slice(0, 5);
    if (value.length === 0) {
        input.value = '';
        return;
    }
    value = (parseInt(value) / 100).toFixed(2);
    if (parseFloat(value) > 999.99) value = '999.99';
    input.value = 'R$ ' + value.replace('.', ',');
}

if (precoMin) precoMin.addEventListener('input', function() { mascaraPrecoFaixa(this); });
if (precoMax) precoMax.addEventListener('input', function() { mascaraPrecoFaixa(this); });

if (precoInput && precoPopup) {
    precoInput.addEventListener('click', function(e) {
        precoPopup.style.display = 'block';
        precoMin.focus();
        e.stopPropagation();
    });
    document.addEventListener('mousedown', function(e) {
        if (precoPopup.style.display === 'block' && !precoPopup.contains(e.target) && e.target !== precoInput) {
            precoPopup.style.display = 'none';
            aplicarFiltroPrecoFaixa();
        }
    });
}

function aplicarFiltroPrecoFaixa() {
    let min = precoMin.value.replace(/^R\$ ?/, '').replace(',', '.');
    let max = precoMax.value.replace(/^R\$ ?/, '').replace(',', '.');
    let ativo = true;

    // Se ambos vazios, limpa o input para mostrar o placeholder
    if (!min && !max) {
        precoInput.value = '';
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

    precoInput.value = `R$ ${min} - R$ ${max}`;
    if (precoInput.value === "R$ 0,00 - R$ 999,99") precoInput.value = '';

    atualizarLista();
}

['produto','categoria','tamanho','genero'].forEach(tipo => {
    const input = document.getElementById(`filter-${tipo}`);
    const popup = document.getElementById(`checkboxes-${tipo}-multi`);
    if (input && popup) {
        input.addEventListener('click', function(e) {
            // Fecha outros popups
            ['produto','categoria','tamanho','genero'].forEach(t => {
                if (t !== tipo) {
                    const p = document.getElementById(`checkboxes-${t}-multi`);
                    if (p) p.style.display = 'none';
                }
            });
            popup.style.display = 'block';
            e.stopPropagation();
        });
        document.addEventListener('mousedown', function(e) {
            if (popup.style.display === 'block' && !popup.contains(e.target) && e.target !== input) {
                popup.style.display = 'none';
            }
        });
    }
});

['produto','categoria','tamanho','genero'].forEach(tipo => {
    const input = document.getElementById(`filter-${tipo}`);
    const popup = document.getElementById(`checkboxes-${tipo}-multi`);
    if (input && popup) {
        input.addEventListener('click', function(e) {
            // Fecha outros popups
            ['produto','categoria','tamanho','genero'].forEach(t => {
                if (t !== tipo) {
                    const p = document.getElementById(`checkboxes-${t}-multi`);
                    if (p) p.style.display = 'none';
                }
            });
            popup.style.display = 'block';
            e.stopPropagation();
        });
        document.addEventListener('mousedown', function(e) {
            if (popup.style.display === 'block' && !popup.contains(e.target) && e.target !== input) {
                popup.style.display = 'none';
            }
        });
    }
});

async function filtrarProdutosPorPeriodo(produtos, dataInicio, dataFim) {
    if (!dataInicio || !dataFim) return [];
    const dtIni = new Date(dataInicio);
    const dtFim = new Date(dataFim);

    const produtosComHistorico = [];
    for (const p of produtos) {
        let historico = [];
        try {
            const resp = await fetch(`/api/movimentacoes/produto?codigo=${encodeURIComponent(p.codigo)}`);
            historico = await resp.json();
        } catch (e) {
            historico = [];
        }
        // Filtra o histórico pelo período
        const historicoFiltrado = historico.filter(mov => {
            const dt = new Date(mov.data);
            return dt >= dtIni && dt <= dtFim;
        });
        if (historicoFiltrado.length > 0) {
            // Só inclui produtos que têm movimentação no período
            p.historico = historicoFiltrado;
            produtosComHistorico.push(p);
        }
    }
    return produtosComHistorico;
}


function limparFiltros() {
    // Limpa todos os campos de filtro (inputs e selects)
    document.querySelectorAll(
        '#filter-produto, #filter-categoria, #filter-tamanho, #filter-genero, #filter-quantidade, #filter-preco, #periodo-data-inicio, #periodo-data-fim, #preco-min, #preco-max, #quantidade-min, #quantidade-max'
    ).forEach(el => {
        if (el.type === 'checkbox') el.checked = false;
        else el.value = '';
    });

    // Marca todos os checkboxes "Todos" como checked e desmarca os outros
    document.querySelectorAll('.produto-multi-check, .categoria-multi-check, .tamanho-multi-check, .genero-multi-check').forEach(cb => {
        if (cb.value === '' || cb.id.endsWith('-todos')) cb.checked = true;
        else cb.checked = false;
    });

    // Marca todos os checkboxes de quantidade "Todos" como checked e desmarca os outros
    ['quantidade-todas-popup','quantidade-baixo-estoque-popup','quantidade-zerados-popup'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = (id === 'quantidade-todas-popup');
    });

    // Chama as funções de atualizar os placeholders e bordas
    if (typeof atualizarPlaceholderProdutoMulti === 'function') atualizarPlaceholderProdutoMulti();
    if (typeof atualizarPlaceholderCategoriaMulti === 'function') atualizarPlaceholderCategoriaMulti();
    if (typeof atualizarPlaceholderTamanhoMulti === 'function') atualizarPlaceholderTamanhoMulti();
    if (typeof atualizarPlaceholderGeneroMulti === 'function') atualizarPlaceholderGeneroMulti();
    if (typeof atualizarPlaceholderQuantidade === 'function') atualizarPlaceholderQuantidade();
    if (typeof atualizarPlaceholderPreco === 'function') atualizarPlaceholderPreco();
    if (typeof atualizarPlaceholderPeriodo === 'function') atualizarPlaceholderPeriodo();

    // Sincroniza os inputs de quantidade
    if (typeof syncQuantidadeChecksAndInputs === 'function') syncQuantidadeChecksAndInputs();

    // Atualiza lista prévia
    if (typeof atualizarLista === 'function') atualizarLista();
}

document.getElementById('btn-limpar-filtros').addEventListener('click', limparFiltros);

function capitalizar(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function exibirTamanho(tamanho) {
    if (!tamanho) return '';
    if (tamanho === 'ÚNICO') return 'Único';
    if (typeof tamanho === 'string' && tamanho.startsWith('_')) return tamanho.substring(1);
    return tamanho;
}


//controle de período
function validarDatasPeriodo(dataInicio, dataFim) {
    const hoje = new Date().toISOString().slice(0, 10);
    if (dataInicio && dataInicio > hoje) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida',
            text: 'A Data Início não pode ser posterior a hoje',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return false;
    }
    if (dataFim && dataFim > hoje) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida!',
            text: 'A Data Fim não pode ser posterior a hoje',
            timer: 1500,
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return false;
    }
    if (dataInicio && dataFim && dataInicio > dataFim) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida!',
            text: 'A Data Início não pode ser posterior à Data Fim',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        return false;
    }
    return true;
}

//periodo obrigatorio
function validarObrigatoriedadePeriodo(dataInicio, dataFim) {
    if (!dataInicio) {
        const popup = document.getElementById('periodo-popup');
        if (popup) {
            popup.style.display = 'block';
            const input = popup.querySelector('#periodo-data-inicio');
            if (input) input.focus();
        }
        Swal.fire({
            icon: 'warning',
            title: 'Período obrigatório!',
            text: 'Selecione a Data Início',
            timer: 1200,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }
    if (!dataFim) {
        const popup = document.getElementById('periodo-popup');
        if (popup) {
            popup.style.display = 'block';
            const input = popup.querySelector('#periodo-data-fim');
            if (input) input.focus();
        }
        Swal.fire({
            icon: 'warning',
            title: 'Período incompleto!',
            text: 'Selecione a Data Fim',
            timer: 1200,
            showConfirmButton: false,
            timerProgressBar: true,
            allowOutsideClick: false
        });
        return false;
    }
    return true;
}

//relatorio vazio
function exibirNenhumProduto() {
    Swal.fire({
        icon: 'info',
        title: 'Nenhum produto encontrado!',
        text: 'Altere os filtros selecionados',
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
        allowOutsideClick: false
    });
}

function formatarDataBR(data) {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function atualizarDetalhesPrevia(produtos, filtros) {

    if (!filtros.dataInicio || !filtros.dataFim || produtos.length === 0) {
        document.getElementById('detalhe-selecionados').textContent = '0';
    } else {
        document.getElementById('detalhe-selecionados').textContent = produtos.length;
    }

    // Período
    let periodo = 'de:' + '  ‎    ' + '  __/__/____ até: __/__/____';
    if (filtros.dataInicio && filtros.dataFim) {
        const inicio = formatarDataBR(filtros.dataInicio);
        const fim = formatarDataBR(filtros.dataFim);
        periodo = `de: ` + ` ‎    ` + `  ${inicio} até: ${fim}`;
    }
    document.getElementById('detalhe-periodo').textContent = periodo;

    // Estoque Atual
    document.getElementById('detalhe-total-produtos').textContent =
        produtos.reduce((soma, p) => soma + (Number(p.quantidade) || 0), 0);

    // Baixo Estoque
    document.getElementById('detalhe-total-baixo').textContent =
        produtos.filter(p => Number(p.quantidade) > 0 && Number(p.quantidade) <= 2 * Number(p.limiteMinimo)).length;

    // Produtos Zerados
    document.getElementById('detalhe-total-zerados').textContent =
        produtos.filter(p => Number(p.quantidade) === 0).length;
        
}





function numberFormatInt(n){ return n==null ? '0' : String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }

function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';'); }

let categoriaResumoArray = [];
const coresCategorias = [
    "30,148,163",   // #1e94a3
    "39,117,128",   // #277580
    "191,161,0",    // #bfa100
    "192,57,43",    // #c0392b
    "230,103,34",   // #e67e22
    "142,68,173",   // #8e44ad
    "22,160,133",   // #16a085
    "63,106,179",   // #3f6ab3
    "59,69,138",    // #3b458a
    "190,148,84",   // #be9454
    "242,109,141",  // #f26d8d
    "255,152,86",   // #ff9856
    "52,152,219",   // #3498db
    "46,204,113",   // #2ecc71
    "241,196,15",   // #f1c40f
    "155,89,182",   // #9b59b6
    "52,73,94",     // #34495e
    "127,140,141",  // #46adb4ff
    "231,76,60",    // #e74c3c
    "45,166,196"   // #2da6c4
];

function animateCategoriaScroll(direction, wrapperEl){
    const step = 120 + 10;
    wrapperEl.scrollBy({ left: direction * step * 3, behavior: 'smooth' });
}


async function carregarCategoriasBackend() {
    try {
        const res = await fetch('/categorias');
        categoriasBackend = await res.json();
    } catch {
        categoriasBackend = [];
    }
}

function montarResumoCategoriasEgerarCards(produtos, movimentacoes){
    if (!Array.isArray(categoriasBackend)) return;
    const cats = categoriasBackend.length ? categoriasBackend : [];
    const summary = cats.map((c,idx)=>{
        const key = (c.nome||'').toString().toUpperCase();
        const estoque = produtos.reduce((s,p)=>{ const pcat = (p.categoria||'').toString().toUpperCase(); return s + ((pcat===key)?(Number(p.quantidade)||0):0); },0);
        const entradas = movimentacoes.reduce((s,m)=>{ const mcat=(m.categoria||'').toString().toUpperCase(); const qtd=Number(m.quantidadeMovimentada||m.quantidade||0)||0; return s + ((mcat===key && String((m.tipoMovimentacao||'').toUpperCase())==='ENTRADA')?qtd:0); },0);
        const saidas = movimentacoes.reduce((s,m)=>{ const mcat=(m.categoria||'').toString().toUpperCase(); const qtd=Number(m.quantidadeMovimentada||m.quantidade||0)||0; return s + ((mcat===key && String((m.tipoMovimentacao||'').toUpperCase())==='SAIDA')?qtd:0); },0);
        return { id: c.id||idx+1, nome: c.nome, keyUpper: key, estoque, entradas, saidas };
    });

    renderCategoriaCards(summary);
}

// Chame carregarCategoriasBackend no início
document.addEventListener('DOMContentLoaded', async function() {
    await carregarCategoriasBackend();
    atualizarMovimentacoesResumo();
});

// function renderCategoriaCards(summaryArray){
//     const wrapper = document.getElementById('categoria-cards');
//     const btnPrev = document.getElementById('cat-prev');
//     const btnNext = document.getElementById('cat-next');
//     if(!wrapper) return;

//     wrapper.innerHTML = '';
//     summaryArray.forEach((c, idx) => {
//         const color = coresCategorias[idx % coresCategorias.length];
//         const borderColor = `rgb(${color})`;
//         const textColor = `rgb(${color})`;
//         const card = document.createElement('div');
//         card.className = 'categoria-card';
//         card.style.flex = '0 0 120px';
//         card.style.minWidth = '120px';
//         card.innerHTML = `
//           <div class="categoria-title">${escapeHtml(c.nome || ('Cat ' + (c.id || (idx+1))))}</div>
//           <div class="categoria-estoque" style="border:2px solid ${borderColor}; color:${textColor};">
//             <div class="label">Estoque</div>
//             <div class="value">${numberFormatInt(c.estoque || 0)}</div>
//           </div>
//           <div class="categoria-rows">
//             <div class="row saidas"><span>Saídas</span><span>${c.saidas ? '-' + numberFormatInt(c.saidas) : '0'}</span></div>
//             <div class="row entradas"><span>Entradas</span><span>${c.entradas ? '+' + numberFormatInt(c.entradas) : '0'}</span></div>
//         </div>
//         `;
//         wrapper.appendChild(card);
//     });

//     btnPrev.onclick = () => animateCategoriaScroll(-1, wrapper);
//     btnNext.onclick = () => animateCategoriaScroll(1, wrapper);

//     function updateButtons(){
//         const maxScrollLeft = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);
//         const hasOverflow = wrapper.scrollWidth > wrapper.clientWidth + 2;
//         btnPrev.style.display = hasOverflow && wrapper.scrollLeft > 2 ? '' : 'none';
//         btnNext.style.display = hasOverflow && wrapper.scrollLeft < (maxScrollLeft - 2) ? '' : 'none';
//     }
//     wrapper.removeEventListener('scroll', wrapper._catScrollHandler || (()=>{}));
//     wrapper._catScrollHandler = updateButtons;
//     wrapper.addEventListener('scroll', wrapper._catScrollHandler);
//     setTimeout(updateButtons, 20);
// }

const CAT_PAGE_SIZE = 7;

function renderCategoriaCardsSkeleton() {
    const container = document.getElementById('categoria-cards');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < CAT_PAGE_SIZE; i++) {
        container.innerHTML += `
            <div class="categoria-card-skeleton">
                <div class="categoria-card-skeleton-bar title"></div>
                <div class="categoria-card-skeleton-bar value"></div>
            </div>
        `;
    }
}


function renderCategoriaCards(summaryArray){
  const wrapper = document.getElementById('categoria-cards');
  const btnPrev = document.getElementById('cat-prev');
  const btnNext = document.getElementById('cat-next');
  if(!wrapper) return;

  summaryArray.sort((a,b)=>{ const d=(b.estoque||0)-(a.estoque||0); return d!==0?d:((a.id||0)-(b.id||0)); });
  const n = summaryArray.length;
  if(n === 0){ wrapper.innerHTML=''; if(btnPrev) btnPrev.style.display='none'; if(btnNext) btnNext.style.display='none'; return; }

  wrapper.innerHTML = '';
  summaryArray.forEach((c, idx) => {
    const color = coresCategorias[idx % coresCategorias.length];
    const borderColor = `rgb(${color})`;
    const textColor = `rgb(${color})`;
    const card = document.createElement('div');
    card.className = 'categoria-card';
    card.style.flex = '0 0 120px';
    card.style.minWidth = '120px';
    card.innerHTML = `
      <div class="categoria-title">${escapeHtml(c.nome || ('Cat ' + (c.id || (idx+1))))}</div>
      <div class="categoria-estoque" style="border:2px solid ${borderColor}; color:${textColor};">
        <div class="label">Estoque</div>
        <div class="value">${numberFormatInt(c.estoque || 0)}</div>
      </div>
      <div class="categoria-rows">
        <div class="row saidas"><span>Saídas</span><span>${c.saidas ? '-' + numberFormatInt(c.saidas) : '0'}</span></div>
        <div class="row entradas"><span>Entradas</span><span>${c.entradas ? '+' + numberFormatInt(c.entradas) : '0'}</span></div>
      </div>
    `;
    wrapper.appendChild(card);
  });

  // Scroll horizontal igual movimentacoes.js
  const viewport = document.querySelector('.categoria-cards-viewport') || wrapper.parentElement || wrapper;
  const getStep = () => Math.max(120, Math.floor((viewport.clientWidth || 900)));

  function updateButtons(){
    const maxScrollLeft = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);
    const hasOverflow = wrapper.scrollWidth > wrapper.clientWidth + 2;
    btnPrev.style.display = hasOverflow && wrapper.scrollLeft > 2 ? '' : 'none';
    btnNext.style.display = hasOverflow && wrapper.scrollLeft < (maxScrollLeft - 2) ? '' : 'none';
  }

  btnPrev.onclick = () => {
    wrapper.scrollBy({ left: -getStep(), behavior: 'smooth' });
    setTimeout(updateButtons, 360);
  };
  btnNext.onclick = () => {
    wrapper.scrollBy({ left: getStep(), behavior: 'smooth' });
    setTimeout(updateButtons, 360);
  };

  wrapper.removeEventListener('scroll', wrapper._catScrollHandler || (()=>{}));
  wrapper._catScrollHandler = updateButtons;
  wrapper.addEventListener('scroll', wrapper._catScrollHandler);

  setTimeout(updateButtons, 20);
}

// document.getElementById('cat-prev').addEventListener('click', function() {
//     if (catPageIndex > 0) {
//         catPageIndex--;
//         renderCategoriaCards(categoriaResumo);
//     }
// });
// document.getElementById('cat-next').addEventListener('click', function() {
//     if (catPageIndex < catTotalPages - 1) {
//         catPageIndex++;
//         renderCategoriaCards(categoriaResumo);
//     }
// });

async function atualizarMovimentacoesResumo() {
    const filtros = getFiltrosSelecionados();
    const { dataInicio, dataFim, categorias, tamanhos, generos } = filtros;

    // Atualize os cards fixos
    const [totalMovimentacoes, nenhumaMovimentacao, nenhumaVenda] = await Promise.all([
        fetch('/api/movimentacoes/total-movimentacoes').then(r => r.json()),
        fetch('/api/movimentacoes/nenhuma-movimentacao').then(r => r.json()),
        fetch('/api/movimentacoes/nenhuma-venda').then(r => r.json())
    ]);
    document.getElementById('detalhe-movimentacoes-totais').textContent = totalMovimentacoes;
    document.getElementById('detalhe-nenhuma-movimentacao').textContent = nenhumaMovimentacao;
    document.getElementById('detalhe-nenhuma-venda').textContent = nenhumaVenda;

    if (!dataInicio || !dataFim) {
        // Zera os cards
        document.getElementById('detalhe-entradas-hoje').textContent = '0';
        document.getElementById('detalhe-saidas-hoje').textContent = '0';
        document.getElementById('detalhe-total-movimentacoes').textContent = '0';
        montarResumoCategoriasEgerarCards(todosProdutos, []);
        return;
    }

    let movimentacoes = [];
    let url = '/api/movimentacoes';

    // Se período está preenchido, busca filtrado
    if (dataInicio && dataFim) {
        url += `?dataInicio=${encodeURIComponent(dataInicio)}&dataFim=${encodeURIComponent(dataFim)}`;
    }

    try {
        const res = await fetch(url);
        movimentacoes = await res.json();
    } catch (e) {
        movimentacoes = [];
    }


    // --- ATUALIZA OS CARDS DE MOVIMENTAÇÕES FILTRADAS ---
    let movFiltradas = movimentacoes.filter(m => {
        let ok = true;
        if (categorias.length > 0) ok = ok && categorias.includes(m.categoria);
        if (tamanhos.length > 0) ok = ok && tamanhos.includes(m.tamanho);
        if (generos.length > 0) ok = ok && generos.includes(m.genero);
        return ok;
    });

    const entradas = movFiltradas.filter(m => m.tipoMovimentacao === 'ENTRADA').reduce((acc, m) => acc + Number(m.quantidadeMovimentada || m.quantidade || 0), 0);
    const saidas = movFiltradas.filter(m => m.tipoMovimentacao === 'SAIDA').reduce((acc, m) => acc + Number(m.quantidadeMovimentada || m.quantidade || 0), 0);
    const totalMovimentacoesFiltradas = movFiltradas.length;

    document.getElementById('detalhe-entradas-hoje').textContent = entradas;
    document.getElementById('detalhe-saidas-hoje').textContent = saidas;
    document.getElementById('detalhe-total-movimentacoes').textContent = totalMovimentacoesFiltradas;

    // Cards de categoria
    montarResumoCategoriasEgerarCards(todosProdutos, movFiltradas);
}

['periodo-data-inicio','periodo-data-fim','filter-produto','filter-categoria','filter-tamanho','filter-genero'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', function() {
        if (categoriasBackend && Array.isArray(categoriasBackend)) {
            atualizarMovimentacoesResumo();
        }
    });
});


function montarDadosGraficoStacked(produtos, dataInicio, dataFim) {
    let movimentacoes = [];
    produtos.forEach(p => {
        if (Array.isArray(p.historico)) {
            movimentacoes = movimentacoes.concat(p.historico);
        }
    });

    const dtIni = new Date(dataInicio);
    const dtFim = new Date(dataFim);
    const diasNoPeriodo = Math.floor((dtFim - dtIni) / (1000 * 60 * 60 * 24)) + 1;

    let labels = [];
    let entradas = [];
    let saidas = [];
    let saldoPorGrupo = [];
    let labelDetalhes = [];

    // --- 1 dia até 7 dias: por dia ---
    if (diasNoPeriodo <= 7) {
        for (let i = 0; i < diasNoPeriodo; i++) {
            let d = new Date(dtIni);
            d.setDate(d.getDate() + i);
            const diaStr = d.toISOString().slice(0,10);
            labels.push(d.toLocaleDateString('pt-BR').slice(0,5)); // "dd/mm"
            labelDetalhes.push(d.toLocaleDateString('pt-BR')); // "dd/mm/yyyy"
            entradas.push(
                movimentacoes.filter(m => m.tipoMovimentacao === 'ENTRADA' && m.data === diaStr)
                    .reduce((acc, m) => acc + Number(m.quantidadeMovimentada || m.quantidade || 0), 0)
            );
            saidas.push(
                movimentacoes.filter(m => m.tipoMovimentacao === 'SAIDA' && m.data === diaStr)
                    .reduce((acc, m) => acc + Number(m.quantidadeMovimentada || m.quantidade || 0), 0)
            );
            saldoPorGrupo.push(entradas[entradas.length-1] - saidas[saidas.length-1]);
        }
    }
    // --- 8 a 31 dias: por semana ---
    else if (diasNoPeriodo <= 31) {
        let semanas = [];
        let d = new Date(dtIni);
        while (d <= dtFim) {
            let semanaIni = new Date(d);
            let semanaFim = new Date(d);
            semanaFim.setDate(semanaFim.getDate() + 6);
            if (semanaFim > dtFim) semanaFim = dtFim;
            semanas.push([new Date(semanaIni), new Date(semanaFim)]);
            d.setDate(d.getDate() + 7);
        }
        semanas.forEach(([ini, fim]) => {
            labels.push(`${ini.toLocaleDateString('pt-BR').slice(0,5)}-${fim.toLocaleDateString('pt-BR').slice(0,5)}`);
            labelDetalhes.push(`${ini.toLocaleDateString('pt-BR')} - ${fim.toLocaleDateString('pt-BR')}`);
            const entradasSemana = movimentacoes.filter(mov => {
                const movDate = new Date(mov.data);
                return mov.tipoMovimentacao === 'ENTRADA' && movDate >= ini && movDate <= fim;
            }).reduce((acc, m) => acc + Number(m.quantidadeMovimentada || m.quantidade || 0), 0);
            const saidasSemana = movimentacoes.filter(mov => {
                const movDate = new Date(mov.data);
                return mov.tipoMovimentacao === 'SAIDA' && movDate >= ini && movDate <= fim;
            }).reduce((acc, m) => acc + Number(m.quantidadeMovimentada || m.quantidade || 0), 0);
            entradas.push(entradasSemana);
            saidas.push(saidasSemana);
            saldoPorGrupo.push(entradasSemana - saidasSemana);
        });
    }
    // --- 2 a 6 meses: por mês, detalhando período ---
    else if (diasNoPeriodo <= 180) {
        let mesesSet = new Set();
        let d = new Date(dtIni);
        while (d <= dtFim) {
            mesesSet.add(d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'));
            d.setMonth(d.getMonth() + 1);
            d.setDate(1);
        }
        let mesesArray = Array.from(mesesSet).sort();
        mesesArray.forEach(m => {
            const [ano, mes] = m.split('-');
            // Busca o primeiro e último dia do mês no período
            const ini = new Date(`${ano}-${mes}-01`);
            let fim = new Date(ini);
            fim.setMonth(fim.getMonth() + 1);
            fim.setDate(0);
            if (ini < dtIni) ini.setTime(dtIni.getTime());
            if (fim > dtFim) fim.setTime(dtFim.getTime());
            labels.push(mesAbreviado(Number(mes))); // "Jan", "Fev", ...
            labelDetalhes.push(`${mesAbreviado(Number(mes))}\n${ini.toLocaleDateString('pt-BR')} - ${fim.toLocaleDateString('pt-BR')}`);
            const entradasMes = movimentacoes.filter(mov => {
                const movDate = new Date(mov.data);
                const movAnoMes = movDate.getFullYear() + '-' + String(movDate.getMonth()+1).padStart(2,'0');
                return mov.tipoMovimentacao === 'ENTRADA' && movAnoMes === m && movDate >= dtIni && movDate <= dtFim;
            }).reduce((acc, mov) => acc + Number(mov.quantidadeMovimentada || mov.quantidade || 0), 0);
            const saidasMes = movimentacoes.filter(mov => {
                const movDate = new Date(mov.data);
                const movAnoMes = movDate.getFullYear() + '-' + String(movDate.getMonth()+1).padStart(2,'0');
                return mov.tipoMovimentacao === 'SAIDA' && movAnoMes === m && movDate >= dtIni && movDate <= dtFim;
            }).reduce((acc, mov) => acc + Number(mov.quantidadeMovimentada || mov.quantidade || 0), 0);
            entradas.push(entradasMes);
            saidas.push(saidasMes);
            saldoPorGrupo.push(entradasMes - saidasMes);
        });
    }
    // --- 7 a 12 meses: por mês, só nome do mês ---
    else {
        let mesesArray = [];
        let d = new Date(dtIni);
        while (d <= dtFim) {
            const mes = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
            if (!mesesArray.includes(mes)) mesesArray.push(mes);
            d.setMonth(d.getMonth() + 1);
            d.setDate(1);
        }
        if (mesesArray.length > 12) mesesArray = mesesArray.slice(0, 12);
        mesesArray.forEach(m => {
            const [ano, mes] = m.split('-');
            labels.push(mesAbreviado(Number(mes)));
            labelDetalhes.push(mesAbreviado(Number(mes)));
            const entradasMes = movimentacoes.filter(mov => {
                const movDate = new Date(mov.data);
                const movAnoMes = movDate.getFullYear() + '-' + String(movDate.getMonth()+1).padStart(2,'0');
                return mov.tipoMovimentacao === 'ENTRADA' && movAnoMes === m && movDate >= dtIni && movDate <= dtFim;
            }).reduce((acc, mov) => acc + Number(mov.quantidadeMovimentada || mov.quantidade || 0), 0);
            const saidasMes = movimentacoes.filter(mov => {
                const movDate = new Date(mov.data);
                const movAnoMes = movDate.getFullYear() + '-' + String(movDate.getMonth()+1).padStart(2,'0');
                return mov.tipoMovimentacao === 'SAIDA' && movAnoMes === m && movDate >= dtIni && movDate <= dtFim;
            }).reduce((acc, mov) => acc + Number(mov.quantidadeMovimentada || mov.quantidade || 0), 0);
            entradas.push(entradasMes);
            saidas.push(saidasMes);
            saldoPorGrupo.push(entradasMes - saidasMes);
        });
    }

    // Limite máximo para altura das barras
    const maxQtd = Math.max(...entradas, ...saidas, 0);
    let limiteBarra = calcularLimiteBarra([maxQtd]);

    // Soma total para legendas
    const totalEntradas = entradas.reduce((a,b)=>a+b,0);
    const totalSaidas = saidas.reduce((a,b)=>a+b,0);
    const saldoTotal = totalEntradas - totalSaidas;

    return {
        labels,
        entradas,
        saidas,
        saldoPorGrupo,
        labelDetalhes,
        limiteBarra,
        totalEntradas,
        totalSaidas,
        saldoTotal
    };
}

function mesAbreviado(mes) {
    return ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][mes-1];
}

function calcularLimiteBarra(valores) {
    const max = Math.max(...valores, 0);
    if (max <= 0) return 1000;
    const base = Math.pow(10, String(Math.floor(max)).length - 1);
    let limite = Math.ceil(max / base) * base;
    if (limite <= max) limite = max + base;
    return limite;
}



