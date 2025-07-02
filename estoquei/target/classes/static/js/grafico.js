window.atualizarDetalhesEstoque = function(produtos) {
    // 1. Cards
    document.getElementById('detalhe-total-produtos').textContent = produtos.length;
    document.getElementById('detalhe-baixo-estoque').textContent = produtos.filter(p => p.quantidade > 0 && p.quantidade <= p.limiteMinimo).length;
    document.getElementById('detalhe-estoque-zerado').textContent = produtos.filter(p => p.quantidade === 0).length;

    // 2. Gráfico de categoria
    const categorias = [
        "CAMISA", "CAMISETA", "BERMUDA", "CALCA", "SHORTS", "SAPATO", "MEIA"
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
    window.graficoCategoria = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoriasPlural,
            datasets: [{
                data: dados,
                backgroundColor: cores,
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

    // 3. Gráfico de tamanhos numéricos
    const tamanhosNumericos = Array.from({length: 21}, (_, i) => (36 + i).toString());
    const dadosTamanhos = tamanhosNumericos.map(tam =>
        produtos.filter(p => p.tamanho && (p.tamanho.toString() === tam || p.tamanho.toString() === `_${tam}`)).length
    );
    const coresTamanhos = [
        "#1e94a3", "#277580", "#bfa100", "#c0392b", "#e67e22", "#8e44ad", "#16a085",
        "#1e94a3", "#277580", "#bfa100", "#c0392b", "#e67e22", "#8e44ad", "#16a085",
        "#1e94a3", "#277580", "#bfa100", "#c0392b", "#e67e22", "#8e44ad", "#16a085"
    ];

    // Destroi gráfico anterior se existir
    if (window.graficoTamanhosNumericos) window.graficoTamanhosNumericos.destroy();
    const ctxTam = document.getElementById('grafico-tamanhos-numericos').getContext('2d');
    window.graficoTamanhosNumericos = new Chart(ctxTam, {
        type: 'doughnut',
        data: {
            labels: tamanhosNumericos,
            datasets: [{
                data: dadosTamanhos,
                backgroundColor: coresTamanhos,
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

    // Lista de tamanhos ao lado, em 3 colunas
    const listaTamanhos = document.getElementById('lista-tamanhos-numericos');
    listaTamanhos.innerHTML = '';
    // Adicione este estilo para grid 3 colunas:
    listaTamanhos.style.display = 'grid';
    listaTamanhos.style.gridTemplateColumns = 'repeat(3, 1fr)';
    listaTamanhos.style.gap = '2px 10px';
    listaTamanhos.style.height = '120px';

    tamanhosNumericos.forEach((tam, i) => {
        const valor = dadosTamanhos[i];
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.innerHTML = `
            <span style="
                display:inline-block;
                min-width:2ch;
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
        listaTamanhos.appendChild(li);
    });
};