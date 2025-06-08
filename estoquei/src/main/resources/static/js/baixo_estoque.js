// Função para aplicar máscara de preço (R$xx,xx)
function mascaraPreco(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 0) {
        value = (parseInt(value) / 100).toFixed(2).replace('.', ',');
        input.value = 'R$' + value;
    } else {
        input.value = '';
    }
}

function updateOptions() {
    const categoria = document.getElementById('filter-categoria').value;
    const tamanho = document.getElementById('filter-tamanho');
    const valorSelecionado = tamanho.value;
    const tamLetra = ['Único', 'PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'XXG'];
    const tamNumero = [];
    for (let i = 36; i <= 52; i++) {
        tamNumero.push(i.toString());
    }

    let options = '<option value="">Tamanho</option>';

    if (!categoria) {
        [...tamLetra, ...tamNumero].forEach(t => {
            options += `<option value="${t}">${t}</option>`;
        });
    } else {
        if (categoria === 'SAPATO' || categoria === 'MEIA') {
            for (let i = 36; i <= 44; i++) {
                options += `<option value="${i}">${i}</option>`;
            }
        } else if (categoria === 'BERMUDA' || categoria === 'CALCA' || categoria === 'SHORTS') {
            for (let i = 36; i <= 52; i += 2) {
                options += `<option value="${i}">${i}</option>`;
            }
        } else if (categoria === 'CAMISA' || categoria === 'CAMISETA') {
            tamLetra.forEach(t => {
                options += `<option value="${t}">${t}</option>`;
            });
        } else {
            [...tamLetra, ...tamNumero].forEach(t => {
                options += `<option value="${t}">${t}</option>`;
            });
        }
    }

    tamanho.innerHTML = options;
    tamanho.value = valorSelecionado;

}

window.onload = function() {
    updateOptions();
    document.getElementById('filter-categoria').addEventListener('change', updateOptions);
};


    function filtrar() {
        let codigo = document.getElementById("filter-codigo").value;
        let nome = document.getElementById("filter-nome").value;
        let categoria = document.getElementById("filter-categoria").value;
        let tamanho = document.getElementById("filter-tamanho").value;
        let genero = document.getElementById("filter-genero").value;
        let quantidade = document.getElementById("filter-quantidade").value;
        let limiteMinimo = document.getElementById("filter-limite").value;
        let preco = document.getElementById("filter-preco").value;
        preco = preco.replace(/[^\d,]/g, '').replace(',', '.');
        if (preco === "") preco = null;
        else preco = parseFloat(preco);

        if (codigo === "") codigo = null;
        if (nome === "") nome = null;
        if (categoria === "") categoria = null;
        if (tamanho === "") tamanho = null;
        if (genero === "") genero = null;
        if (quantidade === "") quantidade = null;
        if (limiteMinimo === "") limiteMinimo = null;

        fetch('/produtos/filtrar', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nome, codigo, categoria, tamanho, genero, quantidade, limiteMinimo, preco })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao buscar produtos. Status: ' + response.status);
            }
            return response.json();
        })
        .then(produtos => {
            renderizarProdutos(produtos);
        })
        .catch(error => {
            console.error('Erro na API:', error);
            const tbody = document.getElementById('product-table-body');
            tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: red; padding: 10px; font-size:16px">Erro ao carregar produtos. Verifique o console.</td></tr>`;
        });
    }    

    function limpar() {
        document.querySelectorAll(".filters input, .filters select").forEach(el => el.value = "");
        filtrar();
    }



function renderizarProdutos(produtos) {
    const tbody = document.getElementById('product-table-body');
    tbody.innerHTML = '';

    if (!produtos || produtos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 10px; color: #888; font-size: 16px;">Nenhum produto encontrado.</td></tr>`;
        return;
    }

    // Filtra apenas produtos que precisam reabastecer
    const produtosParaReabastecer = produtos.filter(p => p.quantidade <= (2 * p.limiteMinimo));

    if (produtosParaReabastecer.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center;">Nenhum produto precisa de reabastecimento.</td></tr>`;
        return;
    }

    produtosParaReabastecer.forEach(p => {
        const imageUrl = p.url_imagem;
        const precoFormatado = p.preco ? Number(p.preco).toFixed(2).replace('.', ',') : '';

        const rowHtml = `
            <tr>
                <td>
                    ${imageUrl 
                        ? `<img src="${imageUrl}" alt="Foto do produto" class="produto-img" loading="lazy" />` 
                        : `<span class="produto-img icon"><i class="fa-regular fa-image" style="padding-top:5px"></i></span>`
                    }
                </td>
                <td>${p.codigo}</td>
                <td>${p.nome}</td>
                <td class="categoria">${p.categoria}</td>
                <td>${p.tamanho}</td>
                <td class="genero">${p.genero}</td>
                <td style="position: relative; text-align: center;">
                    <span style="display: inline-block;">${p.quantidade}</span>
                    <a href="/reabastecer-produto/${p.codigo}" title="Reabastecer produto" 
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
                        <span style="background:#000;width:5px;height:7px;position:absolute;left:23%;top:51%;transform:translate(-50%,-50%);border-radius:5px;z-index:0;"></span>
                        <i class="fa-solid fa-triangle-exclamation" style="color:#fbc02d;position:relative;z-index:1;"></i>
                    </a>
                </td>
                <td>${p.limiteMinimo}</td>
                <td>R$ ${precoFormatado}</td>
                <td class="actions">
                    <a href="/reabastecer-produto/${p.codigo}" title="Reabastecer">
                        <i class="fa-solid fa-box"></i>
                    </a>
                </td>
            </tr>
        `;
        tbody.innerHTML += rowHtml;
    });
}


        let produtos = [];
        window.onload = function() {
            carregarProdutos();
        };

        function carregarProdutos() {
            fetch('/produtos')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Falha ao buscar produtos. Status: ' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    produtos = data;
                    renderizarProdutos(produtos);
                })
                .catch(error => {
                    console.error('Erro na API:', error);
                    const tbody = document.getElementById('product-table-body');
                    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: red; padding: 10px; font-size:16px">Erro ao carregar produtos. Verifique o console.</td></tr>`;
                });
        }