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
    const tamLetra = [
        { value: 'ÚNICO', label: 'Único' },
        { value: 'PP', label: 'PP' },
        { value: 'P', label: 'P' },
        { value: 'M', label: 'M' },
        { value: 'G', label: 'G' },
        { value: 'GG', label: 'GG' },
        { value: 'XG', label: 'XG' },
        { value: 'XGG', label: 'XGG' },
        { value: 'XXG', label: 'XXG' }
    ];
    const tamNumero = [];
    for (let i = 36; i <= 56; i++) {
        tamNumero.push(i);
    }

    let options = '<option value="">Tamanho</option>';

    if (!categoria) {
        tamLetra.forEach(t => {
            options += `<option value="${t.value}">${t.label}</option>`;
        });
        tamNumero.forEach(n => {
            options += `<option value="_${n}">${n}</option>`;
        });
    } else {
        if (categoria === 'SAPATO' || categoria === 'MEIA') {
            for (let i = 36; i <= 44; i++) {
                options += `<option value="_${i}">${i}</option>`;
            }
        } else if (categoria === 'BERMUDA' || categoria === 'CALCA' || categoria === 'SHORTS') {
            for (let i = 36; i <= 56; i += 2) {
                options += `<option value="_${i}">${i}</option>`;
            }
        } else if (categoria === 'CAMISA' || categoria === 'CAMISETA') {
            tamLetra.forEach(t => {
                options += `<option value="${t.value}">${t.label}</option>`;
            });
        } else {
            tamLetra.forEach(t => {
                options += `<option value="${t.value}">${t.label}</option>`;
            });
            tamNumero.forEach(n => {
                options += `<option value="_${n}">${n}</option>`;
            });
        }
    }

    tamanho.innerHTML = options;
    tamanho.value = valorSelecionado;
}

window.addEventListener('DOMContentLoaded', function() {
    updateOptions();
    document.getElementById('filter-categoria').addEventListener('change', updateOptions);
});

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
            tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: red;">Erro ao carregar produtos. Verifique o console.</td></tr>`;
        });
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
            tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: red; padding: 10px; font-size: 16px;">Erro ao carregar produtos. Verifique o console.</td></tr>`;
        });
}

function exibirTamanho(tamanho) {
    if (tamanho === 'ÚNICO') return 'Único';
    if (typeof tamanho === 'string' && tamanho.startsWith('_')) return tamanho.substring(1);
    return tamanho;
}
    function renderizarProdutos(produtos) {
        const tbody = document.getElementById('product-table-body');
        tbody.innerHTML = '';

        if (produtos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 10px; color: #888; font-size: 16px;">Nenhum produto encontrado</td></tr>`;
            return;
        }

        produtos.forEach(p => {
            const imageUrl = p.url_imagem;
            const precoFormatado = p.preco.toFixed(2).replace('.', ',');
            const precisaReabastecer = p.quantidade <= (2 * p.limiteMinimo);
            const tamanhoExibido = exibirTamanho(p.tamanho);
            p.genero = p.genero.charAt(0).toUpperCase() + p.genero.slice(1).toLowerCase();
            p.categoria = p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1).toLowerCase();


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
                    <td>${tamanhoExibido}</td>
                    <td class="genero">${p.genero}</td>
                    <td style="position: relative; text-align: center;">
                    <span style="display: inline-block;">${p.quantidade}</span>

                    ${precisaReabastecer
                        ? `<a href="/reabastecer-produto/${p.codigo}" title="Reabastecer produto" 
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


let produtos = [];
window.onload = function() {
    carregarProdutos();
};