window.atualizarDetalhesEstoque = function(produtos) {
    // 1. Cards
    document.getElementById('detalhe-total-produtos').textContent = produtos.length;
    document.getElementById('detalhe-baixo-estoque').textContent = produtos.filter(p => p.quantidade > 0 && p.quantidade <= p.limiteMinimo).length;
    document.getElementById('detalhe-estoque-zerado').textContent = produtos.filter(p => p.quantidade === 0).length;

    // 2. Gráfico de categoria
    const categorias = [
        "CAMISA", "CAMISETA", "BERMUDA", "CALCA", "SHORTS", "SAPATO", "MEIA"
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
            labels: categorias,
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
    categorias.forEach((cat, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span style="display:inline-block;width:14px;height:14px;background:${cores[i]};border-radius:3px;margin-right:8px;vertical-align:middle;"></span>${cat} <b style="color:#222;">${dados[i]}</b>`;
        lista.appendChild(li);
    });
};