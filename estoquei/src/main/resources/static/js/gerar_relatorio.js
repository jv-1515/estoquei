// function getFiltros() {
//     return {
//         categoria: document.getElementById('filter-categoria') ? document.getElementById('filter-categoria').value : '',
//         tamanho: document.getElementById('filter-tamanho') ? document.getElementById('filter-tamanho').value : '',
//         genero: document.getElementById('filter-genero') ? document.getElementById('filter-genero').value : '',
//         preco: document.getElementById('filter-preco') ? document.getElementById('filter-preco').value : '',
//         dataInicio: document.getElementById('periodo-data-inicio') ? document.getElementById('periodo-data-inicio').value : '',
//         dataFim: document.getElementById('periodo-data-fim') ? document.getElementById('periodo-data-fim').value : ''
//     };
// }

// function gerar() {
//     const areaGerar = document.querySelector('.filters-container + .filters-container');
//     areaGerar.style.display = 'none';


//     const filtros = getFiltros();
//     const hoje = new Date();
//     const hojeStr = hoje.toISOString().slice(0, 10);

//     if (filtros.dataInicio && filtros.dataInicio > hojeStr) {
//         Swal.fire({
//             icon: 'warning',
//             title: 'Data inválida',
//             text: 'A Data Início não pode ser posterior à frente de hoje.',
//             timer: 1500,
//             showConfirmButton: false
//         });
//         areaGerar.style.display = 'flex';
//         return;
//     }
//     if (filtros.dataFim && filtros.dataFim > hojeStr) {
//         Swal.fire({
//             icon: 'warning',
//             title: 'Data inválida',
//             text: 'A Data Fim não pode ser posterior à data de hoje.',
//             timer: 1500,
//             showConfirmButton: false
//         });
//         areaGerar.style.display = 'flex';
//         return;
//     }


//     // Impede gerar se qualquer um dos campos de período estiver vazio
//     if (!filtros.dataInicio) {
//         const popup = document.getElementById('periodo-popup');
//         if (popup) {
//             popup.style.display = 'block';
//             const input = popup.querySelector('#periodo-data-inicio');
//             if (input) input.focus();
//         }
//         areaGerar.style.display = 'flex';
//         Swal.fire({
//             icon: 'warning',
//             title: 'Atenção',
//             text: 'Selecione a Data Início.',
//             timer: 1200,
//             showConfirmButton: false,
//             timerProgressBar: true

//         });
//         return;
//     }
//     if (!filtros.dataFim) {
//         const popup = document.getElementById('periodo-popup');
//         if (popup) {
//             popup.style.display = 'block';
//             const input = popup.querySelector('#periodo-data-fim');
//             if (input) input.focus();
//         }
//
//         Swal.fire({
//             icon: 'warning',
//             title: 'Atenção',
//             text: 'Selecione a Data Fim.',
//             timer: 1200,
//             showConfirmButton: false,
//             timerProgressBar: true

//         });
//         return;
//     }

//     limparFiltros();

//     Object.keys(filtros).forEach(key => {
//         if (filtros[key] === "") filtros[key] = null;
//     });
//     const todosVazios = Object.values(filtros).every(v => !v || v === '');

//     // Função para ordenar e agrupar produtos por categoria e tamanho
//     function agruparOrdenar(produtos) {
//         return produtos
//             .slice()
//             .sort((a, b) => {
//                 // Ordena por categoria, depois por tamanho (alfanumérico)
//                 if (a.categoria.toLowerCase() < b.categoria.toLowerCase()) return -1;
//                 if (a.categoria.toLowerCase() > b.categoria.toLowerCase()) return 1;
//                 // Tamanho pode ser número ou string, então compara como string
//                 return a.tamanho.toString().localeCompare(b.tamanho.toString(), undefined, { numeric: true });
//             });
//     }

//     // Função para gerar o PDF (recebe a lista de produtos)
//     function gerarPDF(produtos, filtros) {
//         if (!produtos || produtos.length === 0) {
//             Swal.fire('Atenção', 'Nenhum produto encontrado para os filtros selecionados.', 'info');
//             return;
//         }

//         // ORDENA E AGRUPA
//         produtos = agruparOrdenar(produtos);

//         const { jsPDF } = window.jspdf;
//         const doc = new jsPDF();

//         // CORES DO PROJETO (ajuste conforme seu padrão)
//         const corCabecalho = "#1E94A3";
//         const corLinha = "#F5F5F5";

//         // LOGO (ajuste o caminho se necessário)
//         const logoImg = new Image();
//         logoImg.src = './images/logo_icon.png'; // ajuste o caminho conforme seu projeto

//         // Cabeçalho com logo (carrega o logo antes de gerar o resto)
//         logoImg.onload = function () {
//             doc.addImage(logoImg, 'PNG', 14, 8, 10, 10);
//             doc.setFontSize(12);
//             doc.setTextColor(corCabecalho);
//             doc.text('Relatório de Produtos', 26, 15);
//             doc.setFontSize(8);
//             doc.setTextColor('#333');
//             doc.text('Data de emissão: ' + new Date().toLocaleDateString('pt-BR'), 14, 22);

//             // Tabela principal
//             const columns = [
//                 { header: 'Código', dataKey: 'codigo' },
//                 { header: 'Nome', dataKey: 'nome' },
//                 { header: 'Categoria', dataKey: 'categoria' },
//                 { header: 'Tamanho', dataKey: 'tamanho' },
//                 { header: 'Gênero', dataKey: 'genero' },
//                 { header: 'Entradas', dataKey: 'entradas' },
//                 { header: 'Saídas', dataKey: 'saidas' },
//                 { header: 'Estoque Atual', dataKey: 'quantidade' },
//                 { header: 'Limite Mínimo', dataKey: 'limiteMinimo' },
//                 { header: 'Preço Unitário', dataKey: 'preco' },
//                 { header: 'Preço Total', dataKey: 'precoTotal' }
//             ];

//             const rows = produtos.map(p => ({
//                 codigo: p.codigo,
//                 nome: p.nome,
//                 categoria: p.categoria,
//                 tamanho: p.tamanho,
//                 genero: p.genero,
//                 entradas: p.quantidade,
//                 saidas: p.quantidade,
//                 quantidade: p.quantidade,
//                 limiteMinimo: p.limiteMinimo,
//                 preco: p.preco ? 'R$ ' + Number(p.preco).toFixed(2).replace('.', ',') : '',
//                 precoTotal: p.preco ? 'R$ ' + (Number(p.preco) * Number(p.quantidade)).toFixed(2).replace('.', ',') : ''
//             }));

//             doc.autoTable({
//                 columns: columns,
//                 body: rows,
//                 startY: 26,
//                 styles: { fontSize: 8, cellPadding: 2 },
//                 headStyles: { fillColor: corCabecalho, textColor: '#fff', fontStyle: 'bold' },
//                 alternateRowStyles: { fillColor: corLinha }
//             });

//             // Detalhamento por produto (opcional)
//             let y = doc.lastAutoTable.finalY + 8;
//             produtos.forEach((p, idx) => {
//                 doc.setFontSize(10);
//                 doc.setTextColor(corCabecalho);
//                 doc.text(`Detalhes do produto: ${p.nome}`, 14, y);

//                 doc.setFontSize(8);
//                 doc.setTextColor('#333');
//                 y += 5;
//                 doc.text(`Código: ${p.codigo}`, 14, y);
//                 doc.text(`Categoria: ${p.categoria}`, 50, y);
//                 doc.text(`Tamanho: ${p.tamanho}`, 100, y);
//                 doc.text(`Gênero: ${p.genero}`, 140, y);

//                 y += 5;
//                 doc.text(`Estoque Atual: ${p.quantidade}`, 14, y);
//                 doc.text(`Limite Mínimo: ${p.limiteMinimo}`, 50, y);
//                 doc.text(`Preço Unitário: ${p.preco ? 'R$ ' + Number(p.preco).toFixed(2).replace('.', ',') : ''}`, 100, y);
//                 doc.text(`Preço Total: ${p.preco ? 'R$ ' + (Number(p.preco) * Number(p.quantidade)).toFixed(2).replace('.', ',') : ''}`, 140, y);

//                 y += 5;
//                 doc.text(`Entradas: ${p.quantidade} (TEMPORÁRIO: igual quantidade)`, 14, y);
//                 doc.text(`Saídas: ${p.quantidade} (TEMPORÁRIO: igual quantidade)`, 60, y);

//                 y += 5;
//                 doc.text(`Data de criação: ${p.dataCriacao ? formatarDataBR(p.dataCriacao) : new Date().toLocaleDateString('pt-BR')} (TEMPORÁRIO: usar data real depois)`, 14, y);

//                 y += 10;
//                 // Quebra de página se necessário
//                 if (y > 270 && idx < produtos.length - 1) {
//                     doc.addPage();
//                     y = 20;
//                 }
//             });

//             // Nome do arquivo: RelatorioDeDesempenho_DDMMAAAA.pdf
//             const hoje = new Date();
//             const baseNomeArquivo = `RelatorioDeDesempenho_${String(hoje.getDate()).padStart(2, '0')}${String(hoje.getMonth() + 1).padStart(2, '0')}${hoje.getFullYear()}`;
//             let nomeArquivo = `${baseNomeArquivo}.pdf`;

//             // Garante nome único adicionando _1, _2, etc.
//             if (window.relatoriosGerados) {
//                 let contador = 1;
//                 while (window.relatoriosGerados.some(r => r.nome === nomeArquivo)) {
//                     nomeArquivo = `${baseNomeArquivo}_${contador}.pdf`;
//                     contador++;
//                 }
//             }

//             doc.save(nomeArquivo); // (mantém para baixar na hora)

//             var blob = doc.output('blob');
//             var blobUrl = URL.createObjectURL(blob);
//             if (window.adicionarRelatorio) {
//                 window.adicionarRelatorio({
//                     id: Date.now(),
//                     nome: nomeArquivo,
//                     dataCriacao: new Date(),
//                     periodo: (filtros.dataInicio && filtros.dataFim)
//                         ? (filtros.dataInicio === filtros.dataFim
//                             ? formatarDataBR(filtros.dataInicio)
//                             : `${formatarDataBR(filtros.dataInicio)} - ${formatarDataBR(filtros.dataFim)}`)
//                         : formatarDataBR(new Date().toISOString().slice(0, 10)),
//                     blobUrl
//                 });
//             }
//         };
//     }

//     if (todosVazios) {
//         fetch('/produtos')
//             .then(res => res.json())
//             .then(produtos => gerarPDF(produtos, filtros))
//             .catch(() => {
//                 Swal.fire('Erro', 'Falha ao gerar relatório.', 'error');
//             });
//     } else {
//         fetch('/produtos/filtrar', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(filtros)
//         })
//         .then(res => res.json())
//         .then(produtos => gerarPDF(produtos, filtros))
//         .catch(() => {
//             Swal.fire('Erro', 'Falha ao gerar relatório.', 'error');
//         });
//     }
// }

// function limparFiltros() {
//     document.querySelectorAll(
//         '#filter-categoria, #filter-tamanho, #filter-genero, #filter-preco, #filter-data-inicio, #filter-data-fim'
//     ).forEach(el => el.value = '');
// }

// document.getElementById('filter-data-fim').addEventListener('input', function() {
//     const dataInicio = document.getElementById('filter-data-inicio');
//     if (this.value) {
//         dataInicio.required = true;
//     } else {
//         dataInicio.required = false;
//     }
// });






//novo

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


// function getFiltrosSelecionados() {
//     const idsSelecionados = Array.from(document.getElementById('produtos-select').selectedOptions).map(opt => Number(opt.value));
//     const categorias = Array.from(document.getElementById('categorias-select').selectedOptions).map(opt => opt.value);
//     const tamanhos = Array.from(document.getElementById('tamanhos-select').selectedOptions).map(opt => opt.value);
//     const generos = Array.from(document.getElementById('generos-select').selectedOptions).map(opt => opt.value);
//     const quantidadeTodos = document.getElementById('quantidade-todas-popup').checked;
//     const quantidadeBaixo = document.getElementById('quantidade-baixo-estoque-popup').checked;
//     const quantidadeZerados = document.getElementById('quantidade-zerados-popup').checked;
//     const quantidadeMin = document.getElementById('quantidade-min').value ? Number(document.getElementById('quantidade-min').value) : null;
//     const quantidadeMax = document.getElementById('quantidade-max').value ? Number(document.getElementById('quantidade-max').value) : null;
//     const dataInicio = document.getElementById('periodo-data-inicio').value || null;
//     const dataFim = document.getElementById('periodo-data-fim').value || null;
//     const precoMin = document.getElementById('preco-min').value ? Number(document.getElementById('preco-min').value.replace(',', '.')) : null;
//     const precoMax = document.getElementById('preco-max').value ? Number(document.getElementById('preco-max').value.replace(',', '.')) : null;
//     return {
//         idsSelecionados,
//         categorias,
//         tamanhos,
//         generos,
//         quantidadeTodos,
//         quantidadeBaixo,
//         quantidadeZerados,
//         quantidadeMin,
//         quantidadeMax,
//         dataInicio,
//         dataFim,
//         precoMin: precoMin,
//         precoMax: precoMax
//     };
// }

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
        // Limpe os cards e gráficos se quiser
        atualizarDetalhesPrevia([], filtros);
        window.atualizarDetalhesEstoque([]);
        return;
    }

    atualizarDetalhesPrevia(filtrados, filtros); // Atualiza os 6 cards
    window.atualizarDetalhesEstoque(filtrados);  // Atualiza os gráficos
}

async function gerarRelatorio() {
    const filtros = getFiltrosSelecionados();

    if (!validarObrigatoriedadePeriodo(filtros.dataInicio, filtros.dataFim)) return;
    if (!validarDatasPeriodo(filtros.dataInicio, filtros.dataFim)) return;

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

    fetch('/relatorio/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            produtos: produtosFiltrados,
            dataInicio: filtros.dataInicio,
            dataFim: filtros.dataFim
        })
    })
    .then(res => res.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'RelatorioProdutos.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        document.getElementById('preview-relatorio').innerHTML = `<iframe src="${url}" width="100%" height="600px"></iframe>`;
    })
    .catch(() => {
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
    const categorias = [...new Set(produtos.map(p => p.categoria))];
    const divCat = document.getElementById('checkboxes-categoria-multi');
    divCat.innerHTML = `<label><input type="checkbox" id="categoria-multi-todas" class="categoria-multi-check" value="" checked> Todas</label>`;
    categorias.forEach(cat => {
        divCat.innerHTML += `<label><input type="checkbox" class="categoria-multi-check" value="${cat}" checked> ${capitalizar(cat)}</label>`;
    });
    document.querySelectorAll('.categoria-multi-check').forEach(cb => {
        cb.addEventListener('change', atualizarPlaceholderCategoriaMulti);
        cb.addEventListener('change', atualizarLista);
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
    return Array.from(document.querySelectorAll('.categoria-multi-check'))
        .filter(cb => cb.checked && cb.value)
        .map(cb => cb.value);
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
    const min = document.getElementById('quantidade-min').value;
    const max = document.getElementById('quantidade-max').value;
    const input = document.getElementById('filter-quantidade');

    let filtros = [];
    let faixa = '';
    let ativo = false;

    if (chkBaixo.checked) filtros.push('Baixo estoque');
    if (chkZerados.checked) filtros.push('Zerados');
    if (min && !isNaN(min) && max && !isNaN(max)) {
        faixa = `de ${min} até ${max}`;
    } else if (min && !isNaN(min)) {
        faixa = `a partir de ${min}`;
    } else if (max && !isNaN(max)) {
        faixa = `até ${max}`;
    }

    // Se só "Zerados" está marcado, não mostra faixa
    const apenasZerados = !chkTodos.checked && !chkBaixo.checked && chkZerados.checked;

    if (chkTodos.checked && chkBaixo.checked && chkZerados.checked && !min && !max) {
        input.value = "Todas";
        ativo = false;
    } else {
        let texto = '';
        if (filtros.length > 0) {
            texto = filtros.join(', ');
            if (faixa && !apenasZerados) texto += ` (${faixa})`;
        } else if (faixa) {
            texto = faixa;
        } else {
            texto = "Todas";
        }
        input.value = texto;
        ativo = texto !== "Todas";
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
    });
}
['quantidade-baixo-estoque-popup','quantidade-zerados-popup'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', function() {
        const todos = document.getElementById('quantidade-todas-popup');
        const baixo = document.getElementById('quantidade-baixo-estoque-popup');
        const zerados = document.getElementById('quantidade-zerados-popup');
        if (!baixo.checked || !zerados.checked) todos.checked = false;
        if (baixo.checked && zerados.checked) todos.checked = true;
        atualizarPlaceholderQuantidade();
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
        atualizarLista && atualizarLista();
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


    async function adicionarHistoricoProdutosAoPDF(doc, produtos, filtros) {
        // Busca todos os históricos em paralelo
        const historicos = await Promise.all(produtos.map(p =>
            fetch(`/api/movimentacoes/produto?codigo=${encodeURIComponent(p.codigo)}`)
                .then(res => res.json())
                .catch(() => [])
        ));

        let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 30;

        for (let i = 0; i < produtos.length; i++) {
            const p = produtos[i];
            let historico = (historicos[i] || []);
            // Filtra histórico pelo período, se marcado
            if (filtros && filtros.dataInicio && filtros.dataFim) {
                const dtIni = new Date(filtros.dataInicio);
                const dtFim = new Date(filtros.dataFim);
                historico = historico.filter(mov => {
                    const dt = new Date(mov.data);
                    return dt >= dtIni && dt <= dtFim;
                });
            }
            // Ordena do mais recente para o mais antigo
            historico.sort((a, b) => new Date(b.data) - new Date(a.data));

            // Título do produto
            doc.addPage("landscape");
            y = 20;
            doc.setFontSize(13);
            doc.setTextColor("#1E94A3");
            doc.text(`${p.codigo} - ${p.nome}`, 14, y);
            doc.setFontSize(10);
            doc.setTextColor("#333");
            y += 7;
            doc.text(`Categoria: ${p.categoria || '-'}   Tamanho: ${p.tamanho || '-'}   Gênero: ${p.genero || '-'}   Preço: ${p.preco ? 'R$ ' + Number(p.preco).toFixed(2).replace('.', ',') : '-'}   Estoque Atual: ${p.quantidade}`, 14, y);

            // Cabeçalho da tabela
            const columns = [
                "Data", "Movimentação", "Código", "Quantidade", "Estoque Final", "Valor (R$)", "Parte Envolvida", "Responsável"
            ];

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
                    m.tipoMovimentacao === 'ENTRADA' ? 'Entrada' : 'Saída',
                    m.codigoMovimentacao || '-',
                    m.quantidadeMovimentada,
                    m.estoqueFinal,
                    m.valorMovimentacao ? 'R$ ' + Number(m.valorMovimentacao).toFixed(2).replace('.', ',') : '',
                    m.parteEnvolvida || '',
                    resp
                ];
            });

            doc.autoTable({
                head: [columns],
                body: rows,
                startY: y + 10,
                styles: { fontSize: 9, cellPadding: 2 },
                headStyles: { fillColor: "#1E94A3", textColor: "#fff", fontStyle: 'bold' },
                alternateRowStyles: { fillColor: "#F5F5F5" }
            });
        }
    }

    
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

    // const precoMinStr = precoMin.value.replace(/[^\d,]/g, '').replace(',', '.');
    // const precoMaxStr = precoMax.value.replace(/[^\d,]/g, '').replace(',', '.');
    // const precoMinVal = precoMinStr ? Number(precoMinStr) : null;
    // const precoMaxVal = precoMaxStr ? Number(precoMaxStr) : null;

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
    // Limpa todos os campos de filtro
    document.querySelectorAll(
        '#filter-produto, #filter-categoria, #filter-tamanho, #filter-genero, #filter-quantidade, #filter-preco, #periodo-data-inicio, #periodo-data-fim, #preco-min, #preco-max, #quantidade-min, #quantidade-max'
    ).forEach(el => {
        if (el.type === 'checkbox') el.checked = false;
        else el.value = '';
    });

    // Marca todos os checkboxes "Todos" como checked
    document.querySelectorAll('.produto-multi-check, .categoria-multi-check, .tamanho-multi-check, .genero-multi-check').forEach(cb => {
        if (cb.value === '' || cb.id.endsWith('-todos')) cb.checked = true;
    });

    // Atualiza placeholders
    if (typeof atualizarPlaceholderProdutoMulti === 'function') atualizarPlaceholderProdutoMulti();
    if (typeof atualizarPlaceholderCategoriaMulti === 'function') atualizarPlaceholderCategoriaMulti();
    if (typeof atualizarPlaceholderTamanhoMulti === 'function') atualizarPlaceholderTamanhoMulti();
    if (typeof atualizarPlaceholderGeneroMulti === 'function') atualizarPlaceholderGeneroMulti();
    if (typeof atualizarPlaceholderQuantidade === 'function') atualizarPlaceholderQuantidade();
    if (typeof atualizarPlaceholderPeriodo === 'function') atualizarPlaceholderPeriodo();

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
            text: 'A Data Início não pode ser posterior a hoje.',
            timer: 1500,
            showConfirmButton: false
        });
        return false;
    }
    if (dataFim && dataFim > hoje) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida!',
            text: 'A Data Fim não pode ser posterior a hoje',
            timer: 1500,
            showConfirmButton: false
        });
        return false;
    }
    if (dataInicio && dataFim && dataInicio > dataFim) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida!',
            text: 'A Data Início não pode ser posterior à Data Fim',
            timer: 1500,
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
            title: 'Atenção',
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
    // Selecionados
    document.getElementById('detalhe-selecionados').textContent = produtos.length;

    // Período
    let periodo = 'de: __/__/____ até: __/__/____';
    if (filtros.dataInicio && filtros.dataFim) {
        const inicio = formatarDataBR(filtros.dataInicio);
        const fim = formatarDataBR(filtros.dataFim);
        periodo = `de: ${inicio} até: ${fim}`;
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