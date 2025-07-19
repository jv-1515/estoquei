window.atualizarDetalhesEstoque = function(produtos) {

    // 2. Gráfico de categoria
    const categorias = [
        "CAMISA", "CAMISETA", "BERMUDA", "CALÇA", "SHORTS", "SAPATO", "MEIA"
    ];
    const categoriasTipo = [
        "Camisa", "Camiseta", "Bermuda", "Calça", "Shorts", "Sapato", "Meia"
    ];
    const categoriasPlural = [
        "Camisas", "Camisetas", "Bermudas", "Calças", "Shorts", "Sapatos", "Meias"
    ];
    const cores = [
        "#1e94a3", "#277580", "#bfa100", "#c0392b", "#e67e22", "#8e44ad", "#16a085"
    ];
    const dados = categorias.map(cat =>
        produtos.filter(p => p.categoria && p.categoria.toUpperCase() === cat).length
    );

    // Gráfico Rosca
    if (window.graficoCategoria) window.graficoCategoria.destroy();
    const ctx = document.getElementById('grafico-categoria').getContext('2d');

    // Exemplo para gráfico de categorias:
    const todosZero = dados.every(v => v === 0);

    window.graficoCategoria = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: todosZero ? ['Sem dados'] : categoriasPlural,
            datasets: [{
                data: todosZero ? [1] : dados,
                backgroundColor: todosZero ? ['#cccccc'] : cores,
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            cutout: '65%',
            responsive: false
        }
    });

    // Lista de categorias ao lado
    const lista = document.getElementById('lista-categorias');
    lista.innerHTML = '';
    // Descobre o maior número para alinhar todos
    const maxValor = Math.max(...dados);
    const maxDigitos = String(maxValor).length < 2 ? 2 : String(maxValor).length;

    categorias.forEach((cat, i) => {
        const valor = dados[i];
        const nome = valor === 1 ? categoriasTipo[i] : categoriasPlural[i];
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.marginBottom = '2px';
        li.innerHTML = `
            <span style="
                display:inline-block;
                min-width:3ch;
                text-align:right;
                font-weight:bold;
                color:#fff;
                background:${cores[i]};
                border-radius:4px;
                padding:2px 5px 2px 10px;
                margin-right:5px;
            ">${valor}</span>
            <span>${nome}</span>
        `;
        lista.appendChild(li);
    });

    // 3. Gráfico de tamanhos (numéricos + letras juntos)

    const tamanhosNumericos = Array.from({length: 21}, (_, i) => (36 + i).toString());
    const tamanhosLetras = ["PP", "P", "M", "G", "GG", "XG", "XGG", "XXG", "ÚNICO"];
    const todosTamanhos = [...tamanhosNumericos, ...tamanhosLetras];
    const todosTamanhosLabels = [...tamanhosNumericos, "PP", "P", "M", "G", "GG", "XG", "XGG", "XXG", "Único"];
    const coresTamanhos = [
        "#1e94a3", "#277580", "#bfa100", "#c0392b", "#e67e22", "#8e44ad", "#16a085",
        "#1e94a3", "#277580", "#bfa100", "#c0392b", "#e67e22", "#8e44ad", "#16a085",
        "#1e94a3", "#277580", "#bfa100", "#c0392b", "#e67e22", "#8e44ad", "#16a085",
        "#1e94a3", "#277580", "#bfa100", "#c0392b", "#e67e22", "#1e94a3", "#277580", "#bfa100", "#c0392b"
    ];
    const dadosTamanhos = todosTamanhos.map(tam =>
        produtos.filter(p => {
            const t = (p.tamanho || '').toString().toUpperCase();
            return t === tam || t === `_${tam}`;
        }).length
    );

    // Destroi gráfico anterior se existir
    if (window.graficoTamanhos) window.graficoTamanhos.destroy();
    const ctxTamanhos = document.getElementById('grafico-tamanhos').getContext('2d');
    // Para tamanhos:
    const todosZeroTamanhos = dadosTamanhos.every(v => v === 0);
    window.graficoTamanhos = new Chart(ctxTamanhos, {
        type: 'doughnut',
        data: {
            labels: todosZeroTamanhos ? ['Sem dados'] : todosTamanhosLabels,
            datasets: [{
                data: todosZeroTamanhos ? [1] : dadosTamanhos,
                backgroundColor: todosZeroTamanhos ? ['#cccccc'] : coresTamanhos,
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            cutout: '65%',
            responsive: false
        }
    });

    const listaTamanhos = document.getElementById('lista-tamanhos');
    listaTamanhos.innerHTML = '';
    listaTamanhos.style.display = 'flex';
    listaTamanhos.style.flexDirection = 'row';
    listaTamanhos.style.height = '130px';

    // 1. Grid dos tamanhos numéricos (7 linhas por coluna)
    const gridNumeros = document.createElement('div');
    gridNumeros.style.display = 'grid';
    gridNumeros.style.gridTemplateRows = 'repeat(7, 1fr)';
    gridNumeros.style.gridAutoFlow = 'column';
    gridNumeros.style.gap = '2px 10px';

    tamanhosNumericos.forEach((tam, i) => {
        const valor = dadosTamanhos[i];
        const li = document.createElement('div');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.innerHTML = `
            <span style="
                display:inline-block;
                min-width:3ch;
                text-align:right;
                font-weight:bold;
                color:#fff;
                background:${coresTamanhos[i]};
                border-radius:4px;
                padding:2px 5px 2px 10px;
                margin-right:5px;
            ">${valor}</span>
            <span>${tam}</span>
        `;
        gridNumeros.appendChild(li);
    });
    listaTamanhos.appendChild(gridNumeros);

    // 2. Grid das letras ao lado (5 linhas x 2 colunas)
    const letrasCol1 = ["PP", "P", "M", "G", "GG"];
    const letrasCol2 = ["XG", "XGG", "XXG", "ÚNICO"];
    const gridLetras = document.createElement('div');
    gridLetras.style.display = 'grid';
    gridLetras.style.gridTemplateRows = 'repeat(5, 1fr)';
    gridLetras.style.gridTemplateColumns = 'repeat(2, 1fr)';
    gridLetras.style.gap = '0px';
    gridLetras.style.marginLeft = '5px';
    gridLetras.style.alignItems = 'self-start';
    gridLetras.style.maxHeight = '95px';
    gridLetras.style.maxWidth = '130px';



    for (let i = 0; i < 5; i++) {
        // Coluna 1
        if (letrasCol1[i]) {
            const idx = tamanhosNumericos.length + i;
            const valor = dadosTamanhos[tamanhosNumericos.length + i];
            const li = document.createElement('div');
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.innerHTML = `
                <span style="
                    display:inline-block;
                    min-width:3ch;
                    text-align:right;
                    font-weight:bold;
                    color:#fff;
                    background:${coresTamanhos[idx]};
                    border-radius:4px;
                    padding:2px 5px 2px 10px;
                    margin-right:5px;
                ">${valor}</span>
                <span>${letrasCol1[i]}</span>
            `;
            gridLetras.appendChild(li);
        }
        // Coluna 2
        if (letrasCol2[i]) {
            const idx = tamanhosNumericos.length + letrasCol1.length + i;
            const valor = dadosTamanhos[tamanhosNumericos.length + letrasCol1.length + i];
            const li = document.createElement('div');
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.innerHTML = `
                <span style="
                    display:inline-block;
                    min-width:3ch;
                    text-align:right;
                    font-weight:bold;
                    color:#fff;
                    background:${coresTamanhos[idx]};
                    border-radius:4px;
                    padding:2px 5px 2px 10px;
                    margin-right:5px;
                ">${valor}</span>
                <span>${letrasCol2[i] === "ÚNICO" ? "Único" : letrasCol2[i]}</span>
            `;
            gridLetras.appendChild(li);
        }
    }
    listaTamanhos.appendChild(gridLetras);

    // 5. Gráfico de Gênero
    const generos = ["MASCULINO", "FEMININO", "UNISSEX"];
    const nomesGeneros = ["Masculino", "Feminino", "Unissex"];
    const coresGenero = ["#1e94a3", "#c0392b", "#bfa100"];
    const dadosGenero = generos.map(g =>
        produtos.filter(p => (p.genero || "").toUpperCase() === g).length
    );

    // Destroi gráfico anterior se existir
    if (window.graficoGenero) window.graficoGenero.destroy();
    const ctxGenero = document.getElementById('grafico-genero').getContext('2d');
    // Para gênero:
    const todosZeroGenero = dadosGenero.every(v => v === 0);
    window.graficoGenero = new Chart(ctxGenero, {
        type: 'doughnut',
        data: {
            labels: todosZeroGenero ? ['Sem dados'] : nomesGeneros,
            datasets: [{
                data: todosZeroGenero ? [1] : dadosGenero,
                backgroundColor: todosZeroGenero ? ['#cccccc'] : coresGenero,
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            cutout: '65%',
            responsive: false
        }
    });

    // Lista de gêneros ao lado, em coluna de 3 itens
    const listaGenero = document.getElementById('lista-genero');
    listaGenero.innerHTML = '';
    listaGenero.style.display = 'grid';
    listaGenero.style.gridTemplateRows = 'repeat(3, 0fr)';
    listaGenero.style.gridAutoFlow = 'column';
    listaGenero.style.gap = '4px 10px';
    listaGenero.style.height = '130px';

    nomesGeneros.forEach((nome, i) => {
        const valor = dadosGenero[i];
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.innerHTML = `
            <span style="
                display:inline-block;
                min-width:3ch;
                text-align:right;
                font-weight:bold;
                color:#fff;
                background:${coresGenero[i]};
                border-radius:4px;
                padding:2px 5px 2px 10px;
                margin-right:5px;
            ">${valor}</span>
            <span>${nome}</span>
        `;
        listaGenero.appendChild(li);
    });
};

function criarGraficosMovimentacoes(movimentacoes) {
    console.log('🔍 Criando gráficos com movimentações:', movimentacoes);
    
    const categorias = ['CAMISA', 'CAMISETA', 'BERMUDA', 'CALÇA', 'SHORTS', 'SAPATO', 'MEIA'];
    const categoriasNomes = ['Camisa', 'Camiseta', 'Bermuda', 'Calça', 'Shorts', 'Sapato', 'Meia'];
    const categoriasPlural = ['Camisas', 'Camisetas', 'Bermudas', 'Calças', 'Shorts', 'Sapatos', 'Meias'];
    const cores = ["#1e94a3", "#277580", "#bfa100", "#c0392b", "#e67e22", "#8e44ad", "#16a085"];
    
    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formato
    console.log('📅 Data de hoje:', hoje);
    
    const dadosEntradas = [];
    const dadosSaidas = [];
    let totalEntradas = 0;
    let totalSaidas = 0;
    
    // 🎯 ARRAY PARA ARMAZENAR DADOS DE CADA CATEGORIA
    const dadosCategoriasCompletos = [];
    
    categorias.forEach((categoria, index) => {
        const entradasHoje = movimentacoes.filter(m => 
            m.categoria === categoria && 
            m.tipoMovimentacao === 'ENTRADA' &&
            m.data === hoje
        ).reduce((sum, m) => sum + m.quantidadeMovimentada, 0);
        
        const saidasHoje = movimentacoes.filter(m => 
            m.categoria === categoria && 
            m.tipoMovimentacao === 'SAIDA' &&
            m.data === hoje  
        ).reduce((sum, m) => sum + m.quantidadeMovimentada, 0);
        
        const totalCategoria = entradasHoje + saidasHoje;
        
        dadosEntradas.push({ categoria: categoriasNomes[index], valor: entradasHoje, cor: cores[index] });
        dadosSaidas.push({ categoria: categoriasNomes[index], valor: saidasHoje, cor: cores[index] });
        
        // 🎯 DADOS COMPLETOS PARA LEGENDA
        dadosCategoriasCompletos.push({
            nome: totalCategoria === 1 ? categoriasNomes[index] : categoriasPlural[index],
            valor: totalCategoria,
            cor: cores[index]
        });
        
        totalEntradas += entradasHoje;
        totalSaidas += saidasHoje;
        
        console.log(`📊 ${categoria}: ${entradasHoje} entradas, ${saidasHoje} saídas, total: ${totalCategoria}`);
    });
    
    // 🎯 CRIA BARRA DE ENTRADAS
    criarBarraHorizontal('barra-entradas', dadosEntradas, totalEntradas, 'Entradas');
    
    // 🎯 CRIA BARRA DE SAÍDAS  
    criarBarraHorizontal('barra-saidas', dadosSaidas, totalSaidas, 'Saídas');
    
    // 🎯 ATUALIZA LEGENDA COM NÚMEROS COLORIDOS
    atualizarLegendaMovimentacoes(dadosCategoriasCompletos);
    
    console.log(`✅ Gráficos de barras horizontais criados - ${totalEntradas} entradas, ${totalSaidas} saídas`);
}

// 🎯 FUNÇÃO PARA ATUALIZAR LEGENDA COM NÚMEROS COLORIDOS
function atualizarLegendaMovimentacoes(dados) {
    // 🎯 ENCONTRA A LEGENDA NO HTML (substitua pelo seletor correto se necessário)
    const legendaContainer = document.querySelector('.filters-container + div .legend-container') || 
                            document.querySelector('[style*="flex-wrap: wrap"]') ||
                            criarContainerLegenda();
    
    if (!legendaContainer) return;
    
    legendaContainer.innerHTML = '';
    
    dados.forEach(item => {
        const legendaItem = document.createElement('div');
        legendaItem.style.cssText = 'display: flex; align-items: center;';
        
        legendaItem.innerHTML = `
            <span style="
                display: inline-block;
                min-width: 3ch;
                text-align: right;
                font-weight: bold;
                color: #fff;
                background: ${item.cor};
                border-radius: 4px;
                padding: 2px 5px 2px 10px;
                margin-right: 5px;
                font-size: 10px;
            ">${item.valor}</span>
            <span style="font-size: 10px; color: #333;">${item.nome}</span>
        `;
        
        legendaContainer.appendChild(legendaItem);
    });
    
    console.log('✅ Legenda atualizada com números coloridos');
}

// 🎯 CRIA CONTAINER DA LEGENDA SE NÃO EXISTIR
function criarContainerLegenda() {
    // Encontra o container pai (aquele que tem as barras)
    const barraEntradas = document.getElementById('barra-entradas');
    if (!barraEntradas) return null;
    
    const containerPai = barraEntradas.closest('[style*="gap: 20px"]') || 
                        barraEntradas.closest('[style*="flex-direction: column"]');
    
    if (!containerPai) return null;
    
    // Cria o container da legenda
    const legendaContainer = document.createElement('div');
    legendaContainer.className = 'legend-container';
    legendaContainer.style.cssText = `
        display: flex; 
        flex-wrap: wrap; 
        gap: 8px; 
        justify-content: flex-start; 
        margin-top: 10px;
    `;
    
    containerPai.appendChild(legendaContainer);
    return legendaContainer;
}

// 🎯 FUNÇÃO AUXILIAR PARA CRIAR BARRA HORIZONTAL
function criarBarraHorizontal(containerId, dados, total, tipo) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = ''; // Limpa conteúdo anterior
    
    if (total === 0) {
        // 🎯 BARRA CINZA QUANDO SEM DADOS
        const segmentoVazio = document.createElement('div');
        segmentoVazio.style.cssText = `
            width: 100%;
            height: 100%;
            background: #cccccc;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #666;
            border-radius: 10px;
        `;
        segmentoVazio.textContent = `Sem ${tipo.toLowerCase()} hoje`;
        container.appendChild(segmentoVazio);
        return;
    }
    
    // 🎯 CRIA SEGMENTOS COLORIDOS
    dados.forEach(item => {
        if (item.valor > 0) {
            const porcentagem = (item.valor / total) * 100;
            const segmento = document.createElement('div');
            segmento.style.cssText = `
                width: ${porcentagem}%;
                height: 100%;
                background: ${item.cor};
                position: relative;
                cursor: pointer;
                transition: opacity 0.2s;
            `;
            
            // 🎯 REMOVE O TITLE PADRÃO E ADICIONA TOOLTIP CUSTOMIZADO
            segmento.addEventListener('mouseenter', function(e) {
                this.style.opacity = '0.8';
                mostrarTooltip(e, `${item.categoria}: ${item.valor} ${item.valor === 1 ? 'unidade' : 'unidades'}`);
            });
            
            segmento.addEventListener('mouseleave', function() {
                this.style.opacity = '1';
                esconderTooltip();
            });
            
            segmento.addEventListener('mousemove', function(e) {
                moverTooltip(e);
            });
            
            container.appendChild(segmento);
        }
    });
}

// 🎯 FUNÇÕES PARA TOOLTIP CUSTOMIZADO (IGUAL CHART.JS)
let tooltipElement = null;

function mostrarTooltip(event, texto) {
    esconderTooltip(); // Remove tooltip anterior se existir
    
    tooltipElement = document.createElement('div');
    tooltipElement.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 11px;
        font-family: Arial, sans-serif;
        z-index: 9999;
        pointer-events: none;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    tooltipElement.textContent = texto;
    
    document.body.appendChild(tooltipElement);
    moverTooltip(event);
}

function moverTooltip(event) {
    if (!tooltipElement) return;
    
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let left = event.pageX + 10;
    let top = event.pageY - tooltipRect.height - 10;
    
    // 🎯 AJUSTA POSIÇÃO PARA NÃO SAIR DA TELA
    if (left + tooltipRect.width > windowWidth) {
        left = event.pageX - tooltipRect.width - 10;
    }
    
    if (top < 0) {
        top = event.pageY + 10;
    }
    
    tooltipElement.style.left = left + 'px';
    tooltipElement.style.top = top + 'px';
}

function esconderTooltip() {
    if (tooltipElement) {
        tooltipElement.remove();
        tooltipElement = null;
    }
}

// 🎯 ESCONDE TOOLTIP AO ROLAR A PÁGINA
document.addEventListener('scroll', esconderTooltip);
document.addEventListener('click', esconderTooltip);