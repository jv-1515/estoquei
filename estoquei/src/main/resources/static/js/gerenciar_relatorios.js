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

    let options = '<option value="" selected>Todos</option>';

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
    renderizarRelatorios(window.relatoriosGerados);
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

// Carrega relatórios do localStorage ao abrir a página
window.relatoriosGerados = JSON.parse(localStorage.getItem('relatoriosGerados') || '[]');

window.adicionarRelatorio = function(relatorio) {
    // Salva o blob como base64 para persistir no localStorage
    fetch(relatorio.blobUrl)
        .then(res => res.blob())
        .then(blob => {
            const reader = new FileReader();
            reader.onloadend = function() {
                relatorio.base64 = reader.result; // base64 do PDF
                delete relatorio.blobUrl; // não precisa mais da URL temporária

                // Atualiza lista e salva no localStorage
                window.relatoriosGerados.push(relatorio);
                localStorage.setItem('relatoriosGerados', JSON.stringify(window.relatoriosGerados));
                renderizarRelatorios(window.relatoriosGerados);
            };
            reader.readAsDataURL(blob);
        });
};

function renderizarRelatorios(relatorios) {
    const tbody = document.getElementById('product-table-body');
    const thead = document.getElementById('relatorios-thead');
    tbody.innerHTML = '';
    if (!relatorios || relatorios.length === 0) {
        if (thead) thead.style.display = 'none';
        tbody.innerHTML = `<tr>
            <td colspan="4" style="text-align: center; padding: 10px; color: #888; font-size: 16px;">
                Nenhum relatório encontrado
            </td>
        </tr>`;
        return;
    }
    if (thead) thead.style.display = '';

    relatorios = relatorios.slice().sort((a, b) => {
        const campo = campoOrdenacaoRel[indiceOrdenacaoAtual];
        let valA = a[campo], valB = b[campo];
        if (campo === 'dataCriacao') {
            valA = new Date(valA);
            valB = new Date(valB);
        }
        if (estadoOrdenacaoRel[indiceOrdenacaoAtual]) {
            return valB > valA ? 1 : valB < valA ? -1 : 0;
        } else {
            return valA > valB ? 1 : valA < valB ? -1 : 0;
        }
    });
    relatorios.forEach(r => {
        tbody.innerHTML += `
            <tr>
            <td>
            ${r.nome}
            </td>
            <td>${r.dataCriacao ? new Date(r.dataCriacao).toLocaleDateString() : ''}</td>
            <td>${r.periodo || ''}</td>
            <td class="actions">
            <a href="#" title="Baixar" onclick="baixarRelatorio('${r.id}'); return false;">
            <i class="fa-solid fa-download"></i>
            </a>
            <a href="#" title="Renomear" onclick="renomearRelatorio('${r.id}'); return false;">
            <i class="fa-solid fa-pen"></i>
            </a>
            <a href="#" title="Excluir" onclick="excluirRelatorio('${r.id}'); return false;">
            <i class="fa-solid fa-trash"></i>
            </a>
            </td>
            </tr>
        `;
    });
}

// SweetAlert para remover relatório
window.excluirRelatorio = function(id) {
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
            window.relatoriosGerados = window.relatoriosGerados.filter(r => r.id != id);
            localStorage.setItem('relatoriosGerados', JSON.stringify(window.relatoriosGerados));
            renderizarRelatorios(window.relatoriosGerados);
            Swal.fire({
                title: 'Removido!',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
            });
        }
    });
};

// Renomear relatório
window.renomearRelatorio = function(id) {
    const relatorio = window.relatoriosGerados.find(r => r.id == id);
    if (!relatorio) return;
    // Mostra só o nome sem .pdf
    const nomeSemExtensao = relatorio.nome.replace(/\.pdf$/i, '');
    Swal.fire({
        title: 'Renomear Relatório',
        input: 'text',
        inputValue: nomeSemExtensao,
        showCloseButton: true,
        inputPlaceholder: 'Digite o novo nome do relatório',
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#1E94A3',
        cancelButtonColor: '#d33'
    }).then(result => {
        if (result.isConfirmed) {
            const novoNome = (result.value || '').trim();
            // Não pode salvar vazio, só espaços, só .pdf ou caracteres especiais
            const nomeValido = novoNome.length > 0 
                && !/[^a-zA-Z0-9_\- áéíóúãõâêîôûçÁÉÍÓÚÃÕÂÊÎÔÛÇ]/.test(novoNome) // permite letras, números, espaço, underline, hífen e acentos
                && novoNome.toLowerCase() !== 'pdf';
            if (!nomeValido) {
                Swal.fire({
                    title: 'Nome inválido!',
                    text: 'O nome não pode ser vazio, só ".pdf" ou conter caracteres especiais.',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                }).then(() => {
                    window.renomearRelatorio(id);
                });
                return;
            }
            // Monta nome final com .pdf
            const nomeFinal = `${novoNome}.pdf`;
            // Verifica se já existe outro relatório com o mesmo nome
            const nomeExiste = window.relatoriosGerados.some(r => r.nome === nomeFinal && r.id !== id);
            if (nomeExiste) {
                Swal.fire({
                    title: 'Nome não disponível!',
                    text: 'Já existe um relatório com esse nome. Escolha outro.',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                }).then(() => {
                    window.renomearRelatorio(id);
                });
                return;
            }
            relatorio.nome = nomeFinal;
            localStorage.setItem('relatoriosGerados', JSON.stringify(window.relatoriosGerados));
            renderizarRelatorios(window.relatoriosGerados);
            Swal.fire({
                title: 'Renomeado!',
                icon: 'success',
                confirmButtonColor: '#1E94A3'
            });
        }
    });
};

window.onload = function() {
    renderizarRelatorios(window.relatoriosGerados);
};

window.baixarRelatorio = function(id) {
    const relatorio = window.relatoriosGerados.find(r => r.id == id);
    if (!relatorio || !relatorio.base64) return;

    // Cria um link temporário para download
    const a = document.createElement('a');
    a.href = relatorio.base64;
    a.download = relatorio.nome;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

let estadoOrdenacaoRel = [true, true, true]; // para cada coluna ordenável
let campoOrdenacaoRel = ['nome', 'dataCriacao', 'periodo'];
let indiceOrdenacaoAtual = 1; // Começa por data de criação (índice 1)

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('th.ordenar').forEach((th, idx) => {
        th.style.cursor = 'pointer';
        th.onclick = function() {
            if (indiceOrdenacaoAtual === idx) {
                estadoOrdenacaoRel[idx] = !estadoOrdenacaoRel[idx];
            } else {
                indiceOrdenacaoAtual = idx;
            }
            renderizarRelatorios(window.relatoriosGerados);
            atualizarSetasOrdenacao();
        };
    });
    atualizarSetasOrdenacao();
});

function atualizarSetasOrdenacao() {
    document.querySelectorAll('th.ordenar .sort-icon').forEach((icon, idx) => {
        if (indiceOrdenacaoAtual === idx) {
            icon.innerHTML = estadoOrdenacaoRel[idx]
                ? '<i class="fa-solid fa-arrow-down"></i>'
                : '<i class="fa-solid fa-arrow-up"></i>';
        } else {
            icon.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
        }
    });
}


window.addEventListener('DOMContentLoaded', function() {
    fetch('/produtos')
        .then(res => res.json())
        .then(produtos => {
            window.atualizarDetalhesEstoque(produtos);
            const total = produtos.reduce((soma, p) => soma + (parseInt(p.quantidade) || 0), 0);
            const baixoEstoque = produtos.filter(p => p.quantidade <= (2 * p.limiteMinimo)).length;
            const zerados = produtos.filter(p => p.quantidade === 0).length;
            const elTotal = document.getElementById('detalhe-total-produtos');
            const elBaixo = document.getElementById('detalhe-baixo-estoque');
            const elZerados = document.getElementById('detalhe-estoque-zerado');
            if (elTotal) elTotal.textContent = total;
            if (elBaixo) elBaixo.textContent = baixoEstoque;
            if (elZerados) elZerados.textContent = zerados;
        });
});

document.addEventListener('DOMContentLoaded', function() {
    // Controle de exibição dos detalhes
    const btnDetalhes = document.getElementById('btn-exibir-detalhes-busca');
    const detalhesEstoque = document.getElementById('detalhes-estoque');
    let detalhesVisiveis = false;
    if (btnDetalhes && detalhesEstoque) {
        detalhesEstoque.style.display = 'none';
        btnDetalhes.addEventListener('click', function() {
            detalhesVisiveis = !detalhesVisiveis;
            if (detalhesVisiveis) {
                detalhesEstoque.style.display = 'flex';
                btnDetalhes.innerHTML = '<i class="fa-solid fa-eye" style="margin-right:4px;"></i>Detalhes';
                btnDetalhes.style.background = '#1e94a3';
                btnDetalhes.style.color = '#fff';
                btnDetalhes.style.border = 'none';
            } else {
                detalhesEstoque.style.display = 'none';
                btnDetalhes.innerHTML = '<i class="fa-solid fa-eye-slash" style="margin-right:4px;"></i>Detalhes';
                btnDetalhes.style.background = '#fff';
                btnDetalhes.style.color = '#1e94a3';
                btnDetalhes.style.border = '1px solid #1e94a3';
            }
        });
    }

    // Controle de exibição da área de gerar relatório
    const btnGerar = document.getElementById('btn-gerar-busca');
    const areaGerar = document.querySelector('.filters-container + .filters-container');
    let gerarVisivel = true;
    if (btnGerar && areaGerar) {
        areaGerar.style.display = 'flex';
        btnGerar.addEventListener('click', function() {
            gerarVisivel = !gerarVisivel;
            if (gerarVisivel) {
                areaGerar.style.display = 'flex';
                btnGerar.innerHTML = '<i class="fa-solid fa-file-lines" style="margin-right: 6px;"></i>Relatórios';
                btnGerar.style.background = '#1e94a3';
                btnGerar.style.color = '#fff';
                btnGerar.style.border = 'none';
            } else {
                areaGerar.style.display = 'none';
                btnGerar.innerHTML = '<i class="fa-solid fa-file-excel" style="margin-right: 6px;"></i>Relatórios';
                btnGerar.style.background = '#fff';
                btnGerar.style.color = '#1e94a3';
                btnGerar.style.border = '1px solid #1e94a3';
            }
        });
    }

    // Limpar filtros da barra de busca
    const btnLimpar = document.getElementById('btn-limpar-filtros-busca');
    const btnCancelar = document.getElementById('btn-cancelar-gerar');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', function() {
            document.getElementById('busca-relatorio').value = '';
            document.getElementById('filter-data-criacao-busca').value = '';
            document.getElementById('filter-data-inicio-busca').value = '';
            document.getElementById('filter-data-fim-busca').value = '';
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            document.getElementById('filter-categoria').value = '';
            document.getElementById('filter-tamanho').value = '';
            document.getElementById('filter-genero').value = '';
            document.getElementById('filter-data-criacao').value = '';
            document.getElementById('filter-data-inicio').value = '';
            document.getElementById('filter-data-fim').value = '';
        });
    }
});