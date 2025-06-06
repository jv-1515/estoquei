    function updateOptions() {
        const categoria = document.getElementById('filter-categoria').value;
        const tamanho = document.getElementById('filter-tamanho');
        let options = '<option value="">Tamanho</option>';

        if (categoria === 'SAPATO' || categoria === 'MEIA') {
            for (let i = 36; i <= 44; i++) {
                options += `<option value="${i}">${i}</option>`;
            }
        } else if (categoria === 'BERMUDA' || categoria === 'CALCA' || categoria === 'SHORTS') {
            for (let i = 36; i <= 52; i += 2) {
                options += `<option value="${i}">${i}</option>`;
            }
        } else if (categoria === 'CAMISA' || categoria === 'CAMISETA') {
            const tamanhos = ['Único', 'PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'XXG'];
            tamanhos.forEach(t => {
                options += `<option value="${t}">${t}</option>`;
            });
        } else {
            const tamanhos = ['Único', 'PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'XXG'];
            for (let i = 36; i <= 44; i++) {
                tamanhos.push(i.toString());
            }
            tamanhos.forEach(t => {
                options += `<option value="${t}">${t}</option>`;
            });
        }
        tamanho.innerHTML = options;
    }
    window.onload = function() {
        updateOptions();
    };


    
        function filtrar() {
            const codigo = document.getElementById("filter-codigo").value;
            const nome = document.getElementById("filter-nome").value;
            const cat = document.getElementById("filter-categoria").value;
            const tam = document.getElementById("filter-tamanho").value;
            const gen = document.getElementById("filter-genero").value;
            const qtd = document.getElementById("filter-quantidade").value;
            const lim = document.getElementById("filter-limite").value;
            const preco = document.getElementById("filter-preco").value;

            const filtrados = produtos.filter(
            (p) =>
                (codigo === "" || p.codigo.includes(codigo)) &&
                (nome === "" || p.nome.toLowerCase().includes(nome.toLowerCase())) &&
                (cat === "" || p.categoria === cat) &&
                (tam === "" || p.tamanho === tam) &&
                (gen === "" || p.genero === gen) &&
                (qtd === "" || p.quantidade == qtd) &&
                (lim === "" || p.limite == lim) &&
                (preco === "" || p.preco == preco)
            );

            let msgDiv = document.getElementById("no-results-msg");
            if (!msgDiv) {
            msgDiv = document.createElement("div");
            msgDiv.id = "no-results-msg";
            msgDiv.style.textAlign = "center";
            msgDiv.style.padding = "0 0 10px 0";
            msgDiv.style.color = "#888";
            msgDiv.style.fontSize = "16px";
            document.querySelector(".main-container .table-space").appendChild(msgDiv);
            }

            if (filtrados.length === 0) {
            document.getElementById("product-list").style.display = "none";
            msgDiv.textContent = "Nenhum produto encontrado com os filtros selecionados.";
            msgDiv.style.display = "block";
            } else {
            document.getElementById("product-list").style.display = "";
            msgDiv.style.display = "none";
            renderizarProdutos(filtrados);
            }

            document.querySelector('.main-container').style.borderTopLeftRadius = "0";
            document.querySelector('.main-container').style.borderTopRightRadius = "0";
        }

        function limpar() {
            document.querySelectorAll(".filters input, .filters select").forEach((el) => (el.value = ""));
            renderizarProdutos(produtos);
        }
        renderizarProdutos(produtos);
