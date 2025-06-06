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
                            ? `<img src="${imageUrl}" alt="Foto do produto" class="produto-img loading="lazy" />` 
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
                            ? `<a href="/reabastecer-produto/${p.codigo}" title="Reabastecer produto" style="display: inline-block; text-decoration: none;">
                                    <i class="fa-solid fa-triangle-exclamation" style="color:#fbc02d;"></i>
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

