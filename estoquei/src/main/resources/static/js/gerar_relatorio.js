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

// function formatarDataBR(data) {
//     if (!data) return '';
//     const [ano, mes, dia] = data.split('-');
//     return `${dia}/${mes}/${ano}`;
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

document.addEventListener('DOMContentLoaded', function() {
    fetch('/produtos')
        .then(res => res.json())
        .then(produtos => {
            todosProdutos = produtos;
            montarSelects(produtos);
            atualizarLista();
        });

    ['produtos-select','categorias-select','tamanhos-select','generos-select',
     'quantidade-min','quantidade-max','data-inicio','data-fim','baixo-estoque-checkbox']
     .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', atualizarLista);
    });

    document.getElementById('btn-gerar-relatorio').addEventListener('click', gerarRelatorio);
});

function montarSelects(produtos) {
    // Produtos
    const selProd = document.getElementById('produtos-select');
    selProd.innerHTML = '';
    produtos.forEach(p => {
        selProd.innerHTML += `<option value="${p.id}" selected>${p.nome} (${p.codigo})</option>`;
    });

    // Categorias
    const categorias = [...new Set(produtos.map(p => p.categoria))];
    const selCat = document.getElementById('categorias-select');
    selCat.innerHTML = '';
    categorias.forEach(cat => {
        selCat.innerHTML += `<option value="${cat}" selected>${cat}</option>`;
    });

    // Tamanhos
    const tamanhos = [...new Set(produtos.map(p => p.tamanho))];
    const selTam = document.getElementById('tamanhos-select');
    selTam.innerHTML = '';
    tamanhos.forEach(tam => {
        selTam.innerHTML += `<option value="${tam}" selected>${tam}</option>`;
    });

    // Gêneros
    const generos = [...new Set(produtos.map(p => p.genero))];
    const selGen = document.getElementById('generos-select');
    selGen.innerHTML = '';
    generos.forEach(gen => {
        selGen.innerHTML += `<option value="${gen}" selected>${gen}</option>`;
    });
}

function getFiltrosSelecionados() {
    const idsSelecionados = Array.from(document.getElementById('produtos-select').selectedOptions).map(opt => Number(opt.value));
    const categorias = Array.from(document.getElementById('categorias-select').selectedOptions).map(opt => opt.value);
    const tamanhos = Array.from(document.getElementById('tamanhos-select').selectedOptions).map(opt => opt.value);
    const generos = Array.from(document.getElementById('generos-select').selectedOptions).map(opt => opt.value);
    const quantidadeTodos = document.getElementById('quantidade-todas-popup').checked;
    const quantidadeBaixo = document.getElementById('quantidade-baixo-estoque-popup').checked;
    const quantidadeZerados = document.getElementById('quantidade-zerados-popup').checked;
    const quantidadeMin = document.getElementById('quantidade-min').value ? Number(document.getElementById('quantidade-min').value) : null;
    const quantidadeMax = document.getElementById('quantidade-max').value ? Number(document.getElementById('quantidade-max').value) : null;
    const dataInicio = document.getElementById('periodo-data-inicio').value || null;
    const dataFim = document.getElementById('periodo-data-fim').value || null;
    return { idsSelecionados, categorias, tamanhos, generos, quantidadeTodos, quantidadeBaixo, quantidadeZerados, quantidadeMin, quantidadeMax, dataInicio, dataFim };
}

function atualizarLista() {
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
        // Faixa sempre é aplicada, exceto se só zerados está marcado (já filtrou acima)
        if (!(filtros.quantidadeBaixo === false && filtros.quantidadeTodos === false && filtros.quantidadeZerados === true)) {
            if (filtros.quantidadeMin !== null && p.quantidade < filtros.quantidadeMin) return false;
            if (filtros.quantidadeMax !== null && p.quantidade > filtros.quantidadeMax) return false;
        }
        return true;
    });

    // Monta lista prévia
    const ul = document.getElementById('lista-produtos');
    ul.innerHTML = '';
    filtrados.forEach(p => {
        ul.innerHTML += `<li>${p.nome} (${p.codigo}) - ${p.categoria} - ${p.tamanho} - ${p.genero} - Qtd: ${p.quantidade}</li>`;
    });
}

function gerarRelatorio() {
    const filtros = getFiltrosSelecionados();
    // Filtra os produtos igual à prévia
    const produtosFiltrados = todosProdutos.filter(p => {
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
        return true;
    });

    fetch('/relatorio/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtos: produtosFiltrados })
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
        divProd.innerHTML += `<label><input type="checkbox" class="produto-multi-check" value="${p.id}" checked> ${p.nome} (${p.codigo})</label>`;
    });
    document.querySelectorAll('.produto-multi-check').forEach(cb => {
        cb.addEventListener('change', atualizarPlaceholderProdutoMulti);
        cb.addEventListener('change', atualizarLista);
    });
}
function montarCheckboxesCategoria(produtos) {
    const categorias = [...new Set(produtos.map(p => p.categoria))];
    const divCat = document.getElementById('checkboxes-categoria-multi');
    divCat.innerHTML = `<label><input type="checkbox" id="categoria-multi-todas" class="categoria-multi-check" value="" checked> Todas</label>`;
    categorias.forEach(cat => {
        divCat.innerHTML += `<label><input type="checkbox" class="categoria-multi-check" value="${cat}" checked> ${cat}</label>`;
    });
    document.querySelectorAll('.categoria-multi-check').forEach(cb => {
        cb.addEventListener('change', atualizarPlaceholderCategoriaMulti);
        cb.addEventListener('change', atualizarLista);
    });
}
function montarCheckboxesTamanho(produtos) {
    const tamanhos = [...new Set(produtos.map(p => p.tamanho))];
    const divTam = document.getElementById('checkboxes-tamanho-multi');
    divTam.innerHTML = `<label><input type="checkbox" id="tamanho-multi-todos" class="tamanho-multi-check" value="" checked> Todos</label>`;
    tamanhos.forEach(tam => {
        divTam.innerHTML += `<label><input type="checkbox" class="tamanho-multi-check" value="${tam}" checked> ${tam}</label>`;
    });
    document.querySelectorAll('.tamanho-multi-check').forEach(cb => {
        cb.addEventListener('change', atualizarPlaceholderTamanhoMulti);
        cb.addEventListener('change', atualizarLista);
    });
}
function montarCheckboxesGenero(produtos) {
    const generos = [...new Set(produtos.map(p => p.genero))];
    const divGen = document.getElementById('checkboxes-genero-multi');
    divGen.innerHTML = `<label><input type="checkbox" id="genero-multi-todos" class="genero-multi-check" value="" checked> Todos</label>`;
    generos.forEach(gen => {
        divGen.innerHTML += `<label><input type="checkbox" class="genero-multi-check" value="${gen}" checked> ${gen}</label>`;
    });
    document.querySelectorAll('.genero-multi-check').forEach(cb => {
        cb.addEventListener('change', atualizarPlaceholderGeneroMulti);
        cb.addEventListener('change', atualizarLista);
    });
}

// Funções para mostrar/ocultar dropdowns
function showCheckboxesProdutoMulti() {
    var checkboxes = document.getElementById("checkboxes-produto-multi");
    checkboxes.style.display = checkboxes.style.display === "block" ? "none" : "block";
}
function showCheckboxesCategoriaMulti() {
    var checkboxes = document.getElementById("checkboxes-categoria-multi");
    checkboxes.style.display = checkboxes.style.display === "block" ? "none" : "block";
}
function showCheckboxesTamanhoMulti() {
    var checkboxes = document.getElementById("checkboxes-tamanho-multi");
    checkboxes.style.display = checkboxes.style.display === "block" ? "none" : "block";
}
function showCheckboxesGeneroMulti() {
    var checkboxes = document.getElementById("checkboxes-genero-multi");
    checkboxes.style.display = checkboxes.style.display === "block" ? "none" : "block";
}

// Funções para pegar selecionados
function getProdutosSelecionados() {
    const checks = Array.from(document.querySelectorAll('.produto-multi-check'));
    if (checks[0].checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => Number(cb.value));
}
function getCategoriasSelecionadas() {
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
    if (checks[0].checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
}
function getTamanhosSelecionados() {
    const checks = Array.from(document.querySelectorAll('.tamanho-multi-check'));
    if (checks[0].checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
}
function getGenerosSelecionados() {
    const checks = Array.from(document.querySelectorAll('.genero-multi-check'));
    if (checks[0].checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
}

// Atualizar placeholders (opcional, para mostrar "Todos" ou "X selecionados")
function atualizarPlaceholderProdutoMulti() {
    const checks = Array.from(document.querySelectorAll('.produto-multi-check'));
    const todos = checks[0];
    const individuais = checks.slice(1);

    if (this === todos) {
        if (todos.checked) individuais.forEach(cb => cb.checked = true);
    } else {
        if (!this.checked) todos.checked = false;
        if (individuais.every(cb => cb.checked)) todos.checked = true;
    }

    const span = document.getElementById('produto-multi-placeholder');
    if (todos.checked) span.textContent = "Todos";
    else span.textContent = `${individuais.filter(cb => cb.checked).length} selecionados`;
}

function atualizarPlaceholderCategoriaMulti() {
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
    const todas = checks[0];
    const individuais = checks.slice(1);

    if (this === todas) {
        if (todas.checked) individuais.forEach(cb => cb.checked = true);
    } else {
        if (!this.checked) todas.checked = false;
        if (individuais.every(cb => cb.checked)) todas.checked = true;
    }

    const span = document.getElementById('categoria-multi-placeholder');
    if (todas.checked) span.textContent = "Todas";
    else span.textContent = `${individuais.filter(cb => cb.checked).length} selecionadas`;
}

function atualizarPlaceholderTamanhoMulti() {
    const checks = Array.from(document.querySelectorAll('.tamanho-multi-check'));
    const todos = checks[0];
    const individuais = checks.slice(1);

    if (this === todos) {
        if (todos.checked) individuais.forEach(cb => cb.checked = true);
    } else {
        if (!this.checked) todos.checked = false;
        if (individuais.every(cb => cb.checked)) todos.checked = true;
    }

    const span = document.getElementById('tamanho-multi-placeholder');
    if (todos.checked) span.textContent = "Todos";
    else span.textContent = `${individuais.filter(cb => cb.checked).length} selecionados`;
}

function atualizarPlaceholderGeneroMulti() {
    const checks = Array.from(document.querySelectorAll('.genero-multi-check'));
    const todos = checks[0];
    const individuais = checks.slice(1);

    if (this === todos) {
        if (todos.checked) individuais.forEach(cb => cb.checked = true);
    } else {
        if (!this.checked) todos.checked = false;
        if (individuais.every(cb => cb.checked)) todos.checked = true;
    }

    const span = document.getElementById('genero-multi-placeholder');
    if (todos.checked) span.textContent = "Todos";
    else span.textContent = `${individuais.filter(cb => cb.checked).length} selecionados`;
}

function atualizarPlaceholder(tipo) {
  const checkboxes = document.querySelectorAll(`#checkboxes-${tipo}-multi input[type="checkbox"]:checked`);
  const placeholder = document.getElementById(`${tipo}-multi-placeholder`);
  if (checkboxes.length === 0) {
    placeholder.textContent = tipo === 'categoria' ? 'Todas' : 'Todos';
  } else if (checkboxes.length === 1) {
    placeholder.textContent = checkboxes[0].parentElement.textContent.trim();
  } else {
    placeholder.textContent = `${checkboxes.length} selecionados`;
  }
}

// Controle de dropdowns abertos
const expanded = {
  produto: false,
  categoria: false,
  tamanho: false,
  genero: false
};

function toggleCheckboxes(tipo) {
  // Fecha todos antes de abrir o clicado
  Object.keys(expanded).forEach(key => {
    if (key !== tipo) {
      document.getElementById(`checkboxes-${key}-multi`).style.display = "none";
      expanded[key] = false;
    }
  });
  const el = document.getElementById(`checkboxes-${tipo}-multi`);
  expanded[tipo] = !expanded[tipo];
  el.style.display = expanded[tipo] ? "block" : "none";
}

// Fecha dropdown ao clicar fora
document.addEventListener('click', function(e) {
  const classes = e.target.classList || [];
  if (!e.target.closest('.multiselect')) {
    Object.keys(expanded).forEach(key => {
      document.getElementById(`checkboxes-${key}-multi`).style.display = "none";
      expanded[key] = false;
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
    return { idsSelecionados, categorias, tamanhos, generos, quantidadeTodos, quantidadeBaixo, quantidadeZerados, quantidadeMin, quantidadeMax, dataInicio, dataFim };
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
    let texto = 'Todas';

    if (chkTodos.checked && chkBaixo.checked && chkZerados.checked && !min && !max) texto = 'Todas';
    else if (chkBaixo.checked && !chkZerados.checked && !chkTodos.checked) texto = 'Baixo estoque';
    else if (!chkBaixo.checked && chkZerados.checked && !chkTodos.checked) texto = 'Zerados';
    else if (chkBaixo.checked && chkZerados.checked && !chkTodos.checked) texto = 'Baixo estoque + Zerados';
    else if (min || max) texto = `De ${min || 0} até ${max || 999}`;
    else texto = 'Personalizado';

    input.value = texto;
}
['quantidade-todas-popup','quantidade-baixo-estoque-popup','quantidade-zerados-popup','quantidade-min','quantidade-max'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', atualizarPlaceholderQuantidade);
});
document.addEventListener('DOMContentLoaded', atualizarPlaceholderQuantidade);

// --- PLACEHOLDER PERÍODO ---
function atualizarPlaceholderPeriodo() {
    const dataInicio = document.getElementById('periodo-data-inicio').value;
    const dataFim = document.getElementById('periodo-data-fim').value;
    const input = document.getElementById('filter-periodo');
    if (dataInicio && dataFim) {
        input.value = `De ${dataInicio.split('-').reverse().join('/')} até ${dataFim.split('-').reverse().join('/')}`;
    } else if (dataInicio) {
        input.value = `A partir de ${dataInicio.split('-').reverse().join('/')}`;
    } else if (dataFim) {
        input.value = `Até ${dataFim.split('-').reverse().join('/')}`;
    } else {
        input.value = '';
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
    if (el) el.addEventListener('input', function() {
        const chkTodos = document.getElementById('quantidade-todas-popup');
        const chkBaixo = document.getElementById('quantidade-baixo-estoque-popup');
        const chkZerados = document.getElementById('quantidade-zerados-popup');
        // Se min/max for alterado para 0 e só zerados está marcado, mantenha
        if (this.value == 0 && chkZerados.checked && !chkTodos.checked && !chkBaixo.checked) {
            // ok
        } else {
            // Se mexeu nos inputs, desmarque "Todos" e "Zerados"
            chkTodos.checked = false;
            if (chkZerados.checked && (this.value != 0)) chkZerados.checked = false;
        }
        atualizarPlaceholderQuantidade();
        atualizarLista && atualizarLista();
    });
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
}