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

        if (codigo === "") codigo = null;
        if (nome === "") nome = null;
        if (categoria === "") categoria = null;
        if (tamanho === "") tamanho = null;
        if (genero === "") genero = null;
        if (quantidade === "") quantidade = null;
        if (limiteMinimo === "") limiteMinimo = null;
        if (preco === "") preco = null;

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
            tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: red;">Erro ao carregar produtos. Verifique o console.</td></tr>`;
        });
    }    

    function filtrar1() {
        let codigo = document.getElementById("filter-codigo").value;
        let nome = document.getElementById("filter-nome").value;
        let cat = document.getElementById("filter-categoria").value;
        let tam = document.getElementById("filter-tamanho").value;
        let gen = document.getElementById("filter-genero").value;
        let qtd = document.getElementById("filter-quantidade").value;
        let lim = document.getElementById("filter-limite").value;
        let preco = document.getElementById("filter-preco").value;

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
        document.querySelectorAll(".filters input, .filters select").forEach(el => el.value = "");
        filtrar();
    }

    function removerProduto(id) {
        Swal.fire({
            title: 'Tem certeza?',
            text: 'Esta ação não poderá ser desfeita.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#1E94A3',
            confirmButtonText: 'Remover',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {

                fetch('/produtos/' + id, {
                    method: 'DELETE'
                }).then(response => {
                    if (response.ok) {
                        Swal.fire({
                            title: 'Removendo...',
                            text: 'Aguarde enquanto o produto é removido.',
                            icon: 'info',
                            showConfirmButton: false,
                            allowOutsideClick: false,
                            timer: 1500,
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire('Erro!', 'Não foi possível remover.', 'error');
                    }
                });
            }
        });
    }

    function renderizarProdutos(produtos) {
        const tbody = document.getElementById('product-table-body');
        tbody.innerHTML = '';

        if (produtos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align: center;">Nenhum produto encontrado.</td></tr>`;
            return;
        }

        produtos.forEach(p => {
            const imageUrl = p.url_imagem;
            const precoFormatado = p.preco.toFixed(2).replace('.', ',');
            const precisaReabastecer = p.quantidade <= p.limiteMinimo;

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
                    <td>${p.categoria}</td>
                    <td>${p.tamanho}</td>
                    <td>${p.genero}</td>
                    <td>
                        <span>${p.quantidade}</span>
                        ${precisaReabastecer 
                            ? `<a href="/reabastecer-produto/${p.codigo}" title="Reabastecer produto" style="display:inline-block;position:relative;width:20px;height:20px;text-decoration:none;">
                                    <span style="background:#000;width:5px;height:7px;position:absolute;left:50%;top:41%;transform:translate(-50%,-50%);border-radius:5px;z-index:0;"></span>
                                    <i class="fa-solid fa-triangle-exclamation" style="color:#fbc02d;position:relative;z-index:1;"></i>
                            </a>`
                            : ''
                        }
                    </td>
                    <td>${p.limiteMinimo}</td>
                    <td>R$ ${precoFormatado}</td>
                    <td class="actions">
                        <a href="/editar-produto/${p.id}" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </a>
                        <button type="button" onclick="removerProduto('${p.id}')" title="Excluir">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += rowHtml;
        });
    }

    renderizarProdutos(produtos);

