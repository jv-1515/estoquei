// Função para aplicar máscara de preço (R$xx,xx)
function mascaraPreco(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 5) value = value.slice(0, 5);
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

    let options = '<option value="" disabled hidden selected>Tamanho</option>';

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

//var global e controle de paginação
let produtos = [];
let paginaAtual = 1;
let itensPorPagina = 10;

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
    .then(data => {
        produtos = data;
        const select = document.getElementById('registros-select');
        itensPorPagina = select.value === "" ? produtos.length : parseInt(select.value);
        paginaAtual = 1;
        renderizarProdutos(produtos);
    })
    .catch(error => {
        console.error('Erro na API:', error);
        const tbody = document.getElementById('product-table-body');
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: red;">Erro ao carregar produtos. Verifique o console.</td></tr>`;
    });
}    

function limpar() {
    document.querySelectorAll("#filter-codigo, #filter-nome, #filter-categoria, #filter-tamanho, #filter-genero, #filter-quantidade, #filter-limite, #filter-preco").forEach(el => el.value = "");
    carregarProdutos(document.getElementById('registros-select').value);
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
                        showConfirmButton: true,
                        confirmButtonColor: '#1E94A3',
                        allowOutsideClick: false,
                        timer: 1500,
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        title: 'Erro!',
                        text: 'Não foi possível remover.',
                        icon: 'error',
                        confirmButtonColor: '#1E94A3'
                    });
                }
            });
        }
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


    const select = document.getElementById('registros-select');
    //verifica se o select está vazio ou se o valor é inválido
    itensPorPagina = select.value === "" ? produtos.length : parseInt(select.value);
    
    const totalPaginas = Math.ceil(produtos.length / itensPorPagina);
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const produtosPagina = produtos.slice(inicio, fim);

    if (produtosPagina.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 10px; color: #888; font-size: 16px;">Nenhum produto encontrado</td></tr>`;
        document.getElementById('paginacao').innerHTML = '';
        return;
    }

    produtosPagina.forEach(p => {
        const imageUrl = p.url_imagem;
        const precoFormatado = p.preco.toFixed(2).replace('.', ',');
        const precisaAbastecer = p.quantidade <= (2 * p.limiteMinimo);
        const tamanhoExibido = exibirTamanho(p.tamanho);
        p.genero = p.genero.charAt(0).toUpperCase() + p.genero.slice(1).toLowerCase();
        p.categoria = p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1).toLowerCase();

        const rowHtml = `
            <tr>
            <td>
            ${imageUrl 
            ? `<img src="${imageUrl}" alt="Foto do produto" onclick="visualizarImagem('${imageUrl}', 'Produto: ${p.codigo}', \`${p.descricao ? p.descricao.replace(/`/g, '\\`') : ''}\`)" class="produto-img" loading="lazy" />` 
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
            ${
            precisaAbastecer
            ? `<a href="/abastecer-produto/${p.codigo}" title="Abastecer produto" 
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
            <span style="background:${p.quantidade <= p.limiteMinimo ? '#fff' : '#000'};width:5px;height:7px;position:absolute;left:23%;top:51%;transform:translate(-50%,-50%);border-radius:5px;z-index:0;"></span>
            <i class="fa-solid fa-triangle-exclamation" style="color:${
            p.quantidade <= p.limiteMinimo ? 'red' : '#fbc02d'
            };position:relative;z-index:1;"></i>
            </a>`
            : ''
            }
            </td>
            <td>${p.limiteMinimo}</td>
            <td>${precoFormatado}</td>
            <td class="actions">
            <a href="/editar-produto?id=${p.id}" title="Editar">
            <i class="fa-solid fa-pen"></i>
            </a>
            <button type="button" onclick="removerProduto('${p.id}')" title="Excluir">
            <i class="fa-solid fa-trash"></i>
            </button>
            </td>
                <td>
                    ${imageUrl 
                        ? `<img src="${imageUrl}" alt="Foto do produto" onclick="visualizarImagem('${imageUrl}', 'Produto: ${p.codigo}')" class="produto-img" loading="lazy" />` 
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
                ${
                    precisaAbastecer
                        ? `<a href="/abastecer-produto/${p.codigo}" title="Abastecer produto" 
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
                                <span style="background:${p.quantidade <= p.limiteMinimo ? '#fff' : '#000'};width:5px;height:7px;position:absolute;left:23%;top:51%;transform:translate(-50%,-50%);border-radius:5px;z-index:0;"></span>
                                <i class="fa-solid fa-triangle-exclamation" style="color:${
                                    p.quantidade <= p.limiteMinimo ? 'red' : '#fbc02d'
                                };position:relative;z-index:1;"></i>
                        </a>`
                        : ''
                }
                </td>
                <td>${p.limiteMinimo}</td>
                <td>${precoFormatado}</td>
                <td class="actions">
                    <a href="/editar-produto?id=${p.id}" title="Editar">
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

    renderizarPaginacao(totalPaginas);
}

function renderizarPaginacao(totalPaginas) {
    const paginacaoDiv = document.getElementById('paginacao');
    paginacaoDiv.innerHTML = '';
    if (totalPaginas <= 1) return;
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = (i === paginaAtual) ? 'pagina-ativa' : '';
        btn.onclick = function() {
            paginaAtual = i;
            renderizarProdutos(produtos);
        };
        paginacaoDiv.appendChild(btn);
    }
}

function carregarProdutos(top) {
        if (top && top !== "") {
            url += `?top=${top}`;
        }
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


window.onload = function() {
    const select = document.getElementById('registros-select');
    carregarProdutos(select.value);
    select.addEventListener('change', function() {
        itensPorPagina = this.value === "" ? produtos.length : parseInt(this.value);
        paginaAtual = 1;
        renderizarProdutos(produtos);
    });

    //campos para ordenação
    const campos = [
        'codigo',   
        'nome',       
        'categoria',  
        'tamanho',    
        'genero',    
        'quantidade',
        'limiteMinimo',
        'preco'       
    ];

    //inicia com true (decrescente)
    let estadoOrdenacao = Array(campos.length).fill(true);

    document.querySelectorAll('th.ordenar').forEach((th, idx) => {
        const icon = th.querySelector('.sort-icon');
        th.addEventListener('mouseenter', function() {
            icon.style.display = 'inline-block';
        });
        th.addEventListener('mouseleave', function() {
            if (!th.classList.contains('sorted')) {
                icon.style.display = 'none';
            }
        });
        th.addEventListener('click', function() {
            document.querySelectorAll('th.ordenar').forEach(t => t.classList.remove('sorted'));
            th.classList.add('sorted');

            const campo = campos[idx];
            produtos.sort((a, b) => {
                if (campo === 'quantidade' || campo === 'limiteMinimo' || campo === 'preco') {
                    // numérico
                    return estadoOrdenacao[idx]
                        ? b[campo] - a[campo]
                        : a[campo] - b[campo];
                } else {
                    // alfabético
                    return estadoOrdenacao[idx]
                        ? a[campo].localeCompare(b[campo], undefined, { numeric: true })
                        : b[campo].localeCompare(a[campo], undefined, { numeric: true });
                }
            });
            //altera o estado de ordenação
            estadoOrdenacao[idx] = !estadoOrdenacao[idx];
            icon.innerHTML = estadoOrdenacao[idx]
                // true seta para baixo (decrescente) false seta para cima (crescente)
                ? '<i class="fa-solid fa-arrow-down"></i>'
                : '<i class="fa-solid fa-arrow-up"></i>';
            renderizarProdutos(produtos);
            icon.style.display = 'inline-block';
        });
    });

}

function visualizarImagem(url, titulo, descricao) {
    Swal.fire({
        title: titulo,
        html: `
            <img src="${url}" alt="Imagem do Produto" style="max-width: 100%; max-height: 80vh;"/>
            ${descricao ? `<div style="margin-top:10px; text-align:left;"><strong>Descrição:</strong> ${descricao}</div>` : ''}
        `,
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
            popup: 'swal-popup'
        }
    });

    const closeBtn = document.querySelector('.swal2-close');
    if (closeBtn) {
        closeBtn.style.boxShadow = 'none';
    }
}

window.addEventListener('DOMContentLoaded', function() {
    function limitarInput999(input) {
        input.addEventListener('input', function() {
            if (this.value.length > 3) this.value = this.value.slice(0, 3);
            if (this.value > 999) this.value = 999;
        });
    }

    ['filter-quantidade', 'filter-limite'].forEach(id => {
        const input = document.getElementById(id);
        if (input) limitarInput999(input);
    });
});

//botão voltar ao topo
window.addEventListener('scroll', function() {
    const btn = document.getElementById('btn-topo');
    if (window.scrollY > 100) {
        btn.style.display = 'block';
    } else {
        btn.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('btn-topo');
    if (btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});