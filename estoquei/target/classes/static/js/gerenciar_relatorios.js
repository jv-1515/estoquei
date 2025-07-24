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

window.onload = function() {
    renderizarRelatorios(window.relatoriosGerados);
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

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.categoria-multi-check').forEach(cb => {
        cb.addEventListener('change', updateOptions);
        cb.addEventListener('change', atualizarPlaceholderCategoriaMulti);
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
            const baixoEstoque = produtos.filter(p => p.quantidade > 0 && p.quantidade <= (2 * p.limiteMinimo)).length;
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
    if (btnGerar && areaGerar) {
        btnGerar.addEventListener('click', function() {
            areaGerar.style.display = 'flex';
            const periodoInput = document.getElementById('filter-periodo');
            if (periodoInput) {
                setTimeout(() => periodoInput.focus(), 10);
            }
        });
    }

    // Limpar filtros da barra de busca
    const btnLimpar = document.getElementById('btn-limpar-filtros-busca');
    const btnCancelar = document.getElementById('btn-cancelar-gerar');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', function() {
            // Limpa todos os campos da barra de busca de relatórios
            const camposBusca = [
                'busca-relatorio',
                'filter-data-criacao-busca',
                'filter-data-inicio-busca',
                'filter-data-fim-busca'
            ];
            camposBusca.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            filtrarRelatorios();
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            // Fecha a área de gerar relatório
            const areaGerar = document.querySelector('.filters-container + .filters-container');
            if (areaGerar) {
                areaGerar.style.display = 'none';
            }
            
            // Limpa campos de texto/data
            ['filter-periodo', 'filter-preco', 'filter-quantidade'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.value = '';
                    el.style.border = '';
                    el.style.color = '';
                }
            });
            
            // Limpa campos de preço e quantidade (faixas)
            ['preco-min', 'preco-max', 'quantidade-min', 'quantidade-max'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            
            // Restaura todos os checkboxes para marcado (padrão)
            
            // Produtos - Marca "Todos" e todos os individuais
            const checksProdutos = document.querySelectorAll('.codigo-multi-check');
            checksProdutos.forEach(cb => {
                cb.checked = true;
                cb.setAttribute('checked', 'checked');
            });
            
            // Categorias - Marca "Todas" e todos os individuais
            const checksCategorias = document.querySelectorAll('.categoria-multi-check');
            checksCategorias.forEach(cb => {
                cb.checked = true;
                cb.setAttribute('checked', 'checked');
            });
            
            // Tamanhos - Marca todos
            const checksTamanhos = document.querySelectorAll('.tamanho-multi-check');
            checksTamanhos.forEach(cb => {
                cb.checked = true;
                cb.setAttribute('checked', 'checked');
            });
            
            // Gêneros - Marca "Todos" e todos os individuais
            const checksGeneros = document.querySelectorAll('.genero-multi-check');
            checksGeneros.forEach(cb => {
                cb.checked = true;
                cb.setAttribute('checked', 'checked');
            });
            
            // Quantidades - Marca todos os checkboxes como true
            const quantidadeChecks = document.querySelectorAll('#quantidade-faixa-popup input[type="checkbox"]');
            quantidadeChecks.forEach(cb => {
                cb.checked = true;
                cb.setAttribute('checked', 'checked');
            });
            
            // Atualiza todos os placeholders para o estado padrão
            if (typeof atualizarPlaceholderCodigoMulti === 'function') {
                atualizarPlaceholderCodigoMulti();
            }
            
            if (typeof atualizarPlaceholderCategoriaMulti === 'function') {
                atualizarPlaceholderCategoriaMulti();
            }
            
            if (typeof updateOptions === 'function') {
                updateOptions(); // Atualiza tamanhos baseado nas categorias
            }
            
            if (typeof atualizarPlaceholderTamanhoMulti === 'function') {
                atualizarPlaceholderTamanhoMulti();
            }
            
            if (typeof atualizarPlaceholderGeneroMulti === 'function') {
                atualizarPlaceholderGeneroMulti();
            }
            
            if (typeof atualizarPlaceholderQuantidade === 'function') {
                atualizarPlaceholderQuantidade();
            }
            
            // Limpa as bordas dos selects (remove cores ativas)
            ['filter-categoria', 'filter-tamanho', 'filter-genero'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.border = '';
                    el.style.color = '';
                }
            });
            
            console.log('✅ Filtros restaurados ao padrão (todos marcados)');
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('filter-data-inicio-busca').addEventListener('change', filtrarRelatorios);
    document.getElementById('filter-data-fim-busca').addEventListener('change', filtrarRelatorios);
    document.getElementById('filter-data-criacao-busca').addEventListener('change', filtrarRelatorios);
    document.getElementById('busca-relatorio').addEventListener('input', filtrarRelatorios);
});

function filtrarRelatorios() {
    const dataCriacao = document.getElementById('filter-data-criacao-busca').value;
    const dataInicio = document.getElementById('filter-data-inicio-busca').value;
    const dataFim = document.getElementById('filter-data-fim-busca').value;
    const titulo = document.getElementById('busca-relatorio').value.toLowerCase();
    // Códigos selecionados
    let codigosSelecionados = [];
    const checksCodigo = document.querySelectorAll('.codigo-multi-check');
    if (checksCodigo.length > 0) {
        codigosSelecionados = Array.from(checksCodigo)
            .filter(cb => cb.checked && cb.value)
            .map(cb => cb.value);
    }
    let filtrados = window.relatoriosGerados.filter(r => {
        let ok = true;
        // Filtro por código (se algum selecionado e não "Todos")
        if (codigosSelecionados.length > 0) {
            if (!codigosSelecionados.includes(r.codigoProduto)) ok = false;
        }
        // Filtro por título
        if (titulo && !r.nome.toLowerCase().includes(titulo)) ok = false;
        // Filtro por data de criação (exata)
        if (dataCriacao) {
            let dataRel = r.dataCriacao ? new Date(r.dataCriacao) : null;
            // let dataFiltro = new Date(dataCriacao);
            if (!dataRel || dataRel.toISOString().slice(0,10) !== dataCriacao) ok = false;
        }
        // Filtro por período (data início/fim)
        if (dataInicio) {
            let dataRel = r.dataCriacao ? new Date(r.dataCriacao) : null;
            let dataFiltro = new Date(dataInicio);
            if (!dataRel || dataRel < dataFiltro) ok = false;
        }
        if (dataFim) {
            let dataRel = r.dataCriacao ? new Date(r.dataCriacao) : null;
            let dataFiltro = new Date(dataFim);
            if (!dataRel || dataRel > dataFiltro) ok = false;
        }
        return ok;
    });

    renderizarRelatorios(filtrados);
}


//estoque
document.addEventListener('DOMContentLoaded', function() {
                    const periodoInput = document.getElementById('filter-periodo');
                    const popup = document.getElementById('periodo-popup');
                    const dataInicio = document.getElementById('periodo-data-inicio');
                    const dataFim = document.getElementById('periodo-data-fim');
                    const aplicarBtn = document.getElementById('periodo-aplicar-btn');

                    periodoInput.addEventListener('click', function(e) {
                        popup.style.display = 'block';
                        const rect = periodoInput.getBoundingClientRect();

                    });

                    document.addEventListener('mousedown', function(e) {
                        function formatarDataBR(data) {
                            if (!data) return '';
                            const [ano, mes, dia] = data.split('-');
                            return `${dia}/${mes}/${ano}`;
                        }
                        if (dataInicio.value && dataFim.value) {
                            periodoInput.value = `${formatarDataBR(dataInicio.value)} - ${formatarDataBR(dataFim.value)}`;
                        } else if (dataInicio.value) {
                            periodoInput.value = `de ${formatarDataBR(dataInicio.value)}`;
                        } else if (dataFim.value) {
                            periodoInput.value = `até ${formatarDataBR(dataFim.value)}`;
                        } else {
                            periodoInput.value = '';
                        }
                        // popup.style.display = 'none';
                        if (!popup.contains(e.target) && e.target !== periodoInput) {
                            popup.style.display = 'none';
                        }
                    });
                });


// Fecha dropdown de gêneros ao clicar fora
document.addEventListener('mousedown', function(e) {
    var checkboxes = document.getElementById("checkboxes-genero-multi");
    var overSelect = document.querySelector('.multiselect .overSelect, .multiselect-genero .overSelect');
    if (
        window.expandedGeneroMulti &&
        checkboxes &&
        !checkboxes.contains(e.target) &&
        (!overSelect || !overSelect.contains(e.target))
    ) {
        checkboxes.style.display = "none";
        window.expandedGeneroMulti = false;
        if (typeof atualizarPlaceholderGeneroMulti === 'function') atualizarPlaceholderGeneroMulti();
    }
});

// Função para mostrar/ocultar o dropdown de gêneros (copiado do estoque.js)
window.expandedGeneroMulti = false;
function showCheckboxesGeneroMulti() {
    var checkboxes = document.getElementById("checkboxes-genero-multi");
    if (!window.expandedGeneroMulti) {
        checkboxes.style.display = "block";
        window.expandedGeneroMulti = true;
    } else {
        checkboxes.style.display = "none";
        window.expandedGeneroMulti = false;
    }
}

// Função para atualizar o placeholder do multiselect de gêneros (copiado do estoque.js)
function atualizarPlaceholderGeneroMulti() {
    const checks = Array.from(document.querySelectorAll('.genero-multi-check'));
    const todas = checks[0];
    const select = document.getElementById('filter-genero');
    const placeholder = document.getElementById('genero-multi-placeholder');
    const selecionados = checks.slice(1)
        .filter(cb => cb.checked)
        .map(cb => cb.parentNode.textContent.trim());
    todas.checked = checks.slice(1).every(cb => cb.checked);

    let ativo = true;
    if (todas.checked || selecionados.length === 0) {
        placeholder.textContent = 'Todos';
        ativo = false;
    } else {
        placeholder.textContent = selecionados.join(', ');
    }

    if (ativo) {
        select.style.border = '2px solid #1e94a3';
        select.style.color = '#1e94a3';
    } else {
        select.style.border = '';
        select.style.color = '';
    }
}

['quantidade-todas-popup','quantidade-baixo-estoque-popup','quantidade-zerados-popup'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', atualizarPlaceholderQuantidade);
});
document.addEventListener('DOMContentLoaded', atualizarPlaceholderQuantidade);

// Garante que ao desmarcar qualquer gênero individual, o "Todos" desmarca na hora
document.querySelectorAll('.genero-multi-check').forEach(cb => {
    if (cb.id !== 'genero-multi-todos') {
        cb.addEventListener('change', function() {
            const todas = document.getElementById('genero-multi-todos');
            if (!cb.checked) {
                todas.checked = false;
                todas.removeAttribute('checked');
            } else {
                // Se todos individuais marcados, marca o "Todos"
                const checks = Array.from(document.querySelectorAll('.genero-multi-check')).slice(1);
                if (checks.every(c => c.checked)) {
                    todas.checked = true;
                    todas.setAttribute('checked', 'checked');
                }
            }
            atualizarPlaceholderGeneroMulti();
            filtrar();
        });
    }
});
// Função para marcar/desmarcar todos os gêneros
function marcarOuDesmarcarTodosGeneros() {
    const todas = document.getElementById('genero-multi-todos');
    const checks = document.querySelectorAll('.genero-multi-check');
    if (todas.checked) {
        checks.forEach(cb => {
            cb.checked = true;
            cb.setAttribute('checked', 'checked');
        });
    } else {
        checks.forEach(cb => {
            cb.checked = false;
            cb.removeAttribute('checked');
        });
    }
    atualizarPlaceholderGeneroMulti();
    filtrar();
}

function gerarCheckboxesTamanhoMulti(tamanhosValidos) {
    const checkboxesDiv = document.getElementById('checkboxes-tamanho-multi');
    checkboxesDiv.innerHTML = '';

    const temLetra = [...tamanhosValidos].some(v => ["ÚNICO","PP","P","M","G","GG","XG","XGG","XXG"].includes(v));
    const temNum = [...tamanhosValidos].some(v => /^_\d+$/.test(v));

    // "Todos" só aparece se tem letras E números
    if (temLetra && temNum) {
        checkboxesDiv.innerHTML += `<label><input type="checkbox" id="tamanho-multi-todas" class="tamanho-multi-check" value="" checked> Todos</label>`;
    }
    // "Todos em Letras"
    if (temLetra) {
        checkboxesDiv.innerHTML += `<label><input type="checkbox" id="tamanho-multi-todas-letra" class="tamanho-multi-check" value="LETRAS" checked> Todos em Letras</label>`;
    }
    // "Todos Numéricos"
    if (temNum) {
        checkboxesDiv.innerHTML += `<label><input type="checkbox" id="tamanho-multi-todas-num" class="tamanho-multi-check" value="NUMERICOS" checked> Todos Numéricos</label>`;
    }

    // Letras
    const letras = ["ÚNICO","PP","P","M","G","GG","XG","XGG","XXG"];
    letras.forEach(val => {
        if (tamanhosValidos.has(val)) {
            checkboxesDiv.innerHTML += `<label><input type="checkbox" class="tamanho-multi-check" value="${val}" checked> ${val === 'ÚNICO' ? 'Único' : val}</label>`;
        }
    });
    // Números
    for (let i = 36; i <= 56; i++) {
        const val = '_' + i;
        if (tamanhosValidos.has(val)) {
            checkboxesDiv.innerHTML += `<label><input type="checkbox" class="tamanho-multi-check" value="${val}" checked> ${i}</label>`;
        }
    }
}

function updateOptions() {
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
    let categorias = [];
    if (!checks[0].checked) {
        categorias = checks.slice(1).filter(cb => cb.checked).map(cb => cb.value.toUpperCase());
    }
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
    for (let i = 36; i <= 56; i++) tamNumero.push(i);

    let tamanhos = new Set();
    if (categorias.length === 0) {
        tamLetra.forEach(t => tamanhos.add(t.value));
        tamNumero.forEach(n => tamanhos.add('_' + n));
    } else {
        if (categorias.some(cat => cat === 'SAPATO' || cat === 'MEIA')) {
            for (let i = 36; i <= 44; i++) tamanhos.add('_' + i);
        }
        if (categorias.some(cat => cat === 'BERMUDA' || cat === 'CALÇA' || cat === 'SHORTS')) {
            for (let i = 36; i <= 56; i += 2) tamanhos.add('_' + i);
        }
        if (categorias.some(cat => cat === 'CAMISA' || cat === 'CAMISETA')) {
            tamLetra.forEach(t => tamanhos.add(t.value));
        }
    }

    // Atualiza o select de tamanho
    let options = '';
    const temLetra = [...tamanhos].some(v => ["ÚNICO","PP","P","M","G","GG","XG","XGG","XXG"].includes(v));
    const temNum = [...tamanhos].some(v => /^_\d+$/.test(v));

    // "Todos" só aparece se tem letras E números
    if (temLetra && temNum) {
        options += `<option id="tamanho-multi-placeholder" value="">Todos</option>`;
    } else if (temLetra) {
        options += `<option id="tamanho-multi-placeholder" value="">Todos em Letras</option>`;
    } else if (temNum) {
        options += `<option id="tamanho-multi-placeholder" value="">Todos Numéricos</option>`;
    }
    tamLetra.forEach(t => {
        if (tamanhos.has(t.value)) options += `<option value="${t.value}">${t.label}</option>`;
    });
    tamNumero.forEach(n => {
        if (tamanhos.has('_' + n)) options += `<option value="_${n}">${n}</option>`;
    });
    tamanho.innerHTML = options;
    if ([...tamanhos].includes(valorSelecionado)) {
        tamanho.value = valorSelecionado;
    } else {
        tamanho.selectedIndex = 0;
    }
    tamanho.style.color = tamanho.value ? 'black' : '#757575';

    // Atualiza a DIV de tamanhos dinamicamente
    gerarCheckboxesTamanhoMulti(tamanhos, categorias);

    // Adiciona listeners e lógica dos checkboxes de tamanho
    aplicarListenersTamanhoMulti();

    // Atualiza placeholder visual e do select
    atualizarPlaceholderTamanhoMulti();
}

function aplicarListenersTamanhoMulti() {
    const checks = Array.from(document.querySelectorAll('.tamanho-multi-check'));
    const todas = document.getElementById('tamanho-multi-todas');
    const todasLetra = document.getElementById('tamanho-multi-todas-letra');
    const todasNum = document.getElementById('tamanho-multi-todas-num');
    const valoresLetra = ["ÚNICO","PP","P","M","G","GG","XG","XGG","XXG"];
    const valoresNum = [];
    for (let i = 36; i <= 56; i++) valoresNum.push('_' + i);

    // "Todos"
    if (todas) {
        todas.addEventListener('change', function() {
            checks.forEach(cb => cb.checked = todas.checked);
            if (todasLetra) todasLetra.checked = todas.checked;
            if (todasNum) todasNum.checked = todas.checked;
            atualizarPlaceholderTamanhoMulti();
            filtrar();
        });
    }
    // "Todos Letras"
    if (todasLetra) {
        todasLetra.addEventListener('change', function() {
            checks.forEach(cb => {
                if (valoresLetra.includes(cb.value)) cb.checked = todasLetra.checked;
            });
            todasLetra.checked = checks.filter(cb => valoresLetra.includes(cb.value)).every(cb => cb.checked);
            if (todasNum) todas.checked = todasLetra.checked && todasNum.checked;
            atualizarPlaceholderTamanhoMulti();
            filtrar();
        });
    }
    // "Todos Numéricos"
    if (todasNum) {
        todasNum.addEventListener('change', function() {
            checks.forEach(cb => {
                if (valoresNum.includes(cb.value)) cb.checked = todasNum.checked;
            });
            todasNum.checked = checks.filter(cb => valoresNum.includes(cb.value)).every(cb => cb.checked);
            if (todasLetra) todas.checked = todasLetra.checked && todasNum.checked;
            atualizarPlaceholderTamanhoMulti();
            filtrar();
        });
    }
    // Individuais
    checks.forEach(cb => {
        if (
            cb.id !== 'tamanho-multi-todas' &&
            cb.id !== 'tamanho-multi-todas-letra' &&
            cb.id !== 'tamanho-multi-todas-num'
        ) {
            cb.addEventListener('change', function() {
                if (!cb.checked) {
                    if (todas) todas.checked = false;
                    if (valoresLetra.includes(cb.value) && todasLetra) todasLetra.checked = false;
                    if (valoresNum.includes(cb.value) && todasNum) todasNum.checked = false;
                } else {
                    if (valoresLetra.includes(cb.value) && todasLetra)
                        todasLetra.checked = checks.filter(c => valoresLetra.includes(c.value)).every(c => c.checked);
                    if (valoresNum.includes(cb.value) && todasNum)
                        todasNum.checked = checks.filter(c => valoresNum.includes(c.value)).every(c => c.checked);
                    if (todas)
                        todas.checked = checks.filter(c =>
                            c.id !== 'tamanho-multi-todas' &&
                            c.id !== 'tamanho-multi-todas-letra' &&
                            c.id !== 'tamanho-multi-todas-num'
                        ).every(c => c.checked);
                }
                atualizarPlaceholderTamanhoMulti();
                filtrar();
            });
        }
    });
}

function atualizarPlaceholderTamanhoMulti() {
    const checks = Array.from(document.querySelectorAll('.tamanho-multi-check'));
    const select = document.getElementById('filter-tamanho');
    const placeholderOption = document.getElementById('tamanho-multi-placeholder');

    // Só conta os tamanhos individuais visíveis (não os grupos)
    const individuaisVisiveis = checks.filter(cb =>
        !['tamanho-multi-todas','tamanho-multi-todas-letra','tamanho-multi-todas-num'].includes(cb.id)
    );
    const selecionados = individuaisVisiveis.filter(cb => cb.checked)
        .map(cb => cb.parentNode.textContent.trim());

    let texto = 'Todos';
    let ativo = true;
    if (selecionados.length === 0 || selecionados.length === individuaisVisiveis.length) {
        // Se só tem letras visíveis, mostra "Todos em Letras"
        if (individuaisVisiveis.every(cb => !/^_\d+$/.test(cb.value))) {
            texto = 'Todos em Letras';
        }
        // Se só tem números visíveis, mostra "Todos Numéricos"
        else if (individuaisVisiveis.every(cb => /^_\d+$/.test(cb.value))) {
            texto = 'Todos Numéricos';
        }
        // Se tem ambos, mostra "Todos"
        else {
            texto = 'Todos';
            ativo = false;
        }
    } else {
        // Verifica se todos em letras estão marcados
        const todosLetrasMarcados = individuaisVisiveis
            .filter(cb => !/^_\d+$/.test(cb.value))
            .every(cb => cb.checked) &&
            individuaisVisiveis.some(cb => !/^_\d+$/.test(cb.value));
        // Verifica se todos numéricos estão marcados
        const todosNumericosMarcados = individuaisVisiveis
            .filter(cb => /^_\d+$/.test(cb.value))
            .every(cb => cb.checked) &&
            individuaisVisiveis.some(cb => /^_\d+$/.test(cb.value));
        if (todosLetrasMarcados && !todosNumericosMarcados) {
            texto = 'Todos em Letras, ' + selecionados.join(', ');
        } else if (todosNumericosMarcados && !todosLetrasMarcados) {
            texto = 'Todos Numéricos, ' + selecionados.join(', ');
        } else {
            texto = selecionados.join(', ');
        }
    }

    if (ativo) {
        select.style.border = '2px solid #1e94a3';
        select.style.color = '#1e94a3';
    } else {
        select.style.border = '';
        select.style.color = '';
    }

    // Atualiza o texto da option placeholder
    if (placeholderOption) placeholderOption.textContent = texto;
    // Garante que a option placeholder está selecionada visualmente
    select.selectedIndex = 0;
    // Atualiza cor do select
    // select.style.color = texto === 'Todos' ? '#757575' : 'black';
}

// Função para pegar tamanhos selecionados
function getTamanhosSelecionados() {
    const checks = Array.from(document.querySelectorAll('.tamanho-multi-check'));
    const todas = checks[0];
    if (todas.checked) return [];
    return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
}

// Controle de expansão do multiselect de tamanhos
window.expandedTamanhoMulti = false;

function showCheckboxesTamanhoMulti() {
    var checkboxes = document.getElementById("checkboxes-tamanho-multi");
    if (!window.expandedTamanhoMulti) {
        updateOptions();

        checkboxes.style.display = "block";
        window.expandedTamanhoMulti = true;

        // ATUALIZA O PLACEHOLDER AGORA QUE OS CHECKBOXES ESTÃO VISÍVEIS
        atualizarPlaceholderTamanhoMulti();

        // Fecha ao clicar fora
        function handleClickOutside(e) {
            if (
                checkboxes &&
                !checkboxes.contains(e.target) &&
                !document.querySelector('.multiselect .overSelect').contains(e.target)
            ) {
                checkboxes.style.display = "none";
                window.expandedTamanhoMulti = false;
                document.removeEventListener('mousedown', handleClickOutside);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
    } else {
        checkboxes.style.display = "none";
        window.expandedTamanhoMulti = false;
    }
}

function marcarOuDesmarcarTodosTamanhos() {
    const todas = document.getElementById('tamanho-multi-todas');
    const todasLetra = document.getElementById('tamanho-multi-todas-letra');
    const todasNum = document.getElementById('tamanho-multi-todas-num');
    const checks = document.querySelectorAll('.tamanho-multi-check');
    checks.forEach(cb => {
        cb.checked = todas.checked;
    });
    // Atualiza "Todos Letras" e "Todos Numéricos" conforme o estado de "Todos"
    todasLetra.checked = todas.checked;
    todasNum.checked = todas.checked;
    atualizarPlaceholderTamanhoMulti();
    filtrar();
}

// Atualiza "Todos" se ambos "Todos Letras" e "Todos Numéricos" estiverem marcados
function atualizarTodosTamanhosCheck() {
    const todas = document.getElementById('tamanho-multi-todas');
    const todasLetra = document.getElementById('tamanho-multi-todas-letra');
    const todasNum = document.getElementById('tamanho-multi-todas-num');
    todas.checked = todasLetra.checked && todasNum.checked;
}

// Adiciona listeners para manter sincronização
document.addEventListener('DOMContentLoaded', function() {
    const todasLetra = document.getElementById('tamanho-multi-todas-letra');
    const todasNum = document.getElementById('tamanho-multi-todas-num');
    if (todasLetra && todasNum) {
        todasLetra.addEventListener('change', atualizarTodosTamanhosCheck);
        todasNum.addEventListener('change', atualizarTodosTamanhosCheck);
    }
});

function marcarOuDesmarcarLetras() {
    const todasLetras = document.getElementById('tamanho-multi-todas-letra');
    const todasNum = document.getElementById('tamanho-multi-todas-num');
    const todas = document.getElementById('tamanho-multi-todas');
    const valoresLetra = ["ÚNICO","PP","P","M","G","GG","XG","XGG","XXG"];
    const checks = document.querySelectorAll('.tamanho-multi-check');

    checks.forEach(cb => {
        if (valoresLetra.includes(cb.value)) cb.checked = todasLetras.checked;
    });
    const checksLetra = Array.from(checks).filter(cb => valoresLetra.includes(cb.value));
    todasLetras.checked = checksLetra.every(cb => cb.checked);

    // Atualiza "Todos" corretamente
    todas.checked = todasLetras.checked && todasNum.checked;

    atualizarPlaceholderTamanhoMulti();
    filtrar();
}

function marcarOuDesmarcarNumericos() {
    const todasNum = document.getElementById('tamanho-multi-todas-num');
    const todasLetras = document.getElementById('tamanho-multi-todas-letra');
    const todas = document.getElementById('tamanho-multi-todas');
    const valoresNum = ["_36","_37","_38","_39","_40","_41","_42","_43","_44","_45","_46","_47","_48","_49","_50","_51","_52","_53","_54","_55","_56"];
    const checks = document.querySelectorAll('.tamanho-multi-check');
    checks.forEach(cb => {
        if (valoresNum.includes(cb.value)) cb.checked = todasNum.checked;
    });
    const checksNum = Array.from(checks).filter(cb => valoresNum.includes(cb.value));
    todasNum.checked = checksNum.every(cb => cb.checked);

    // Atualiza "Todos" corretamente
    todas.checked = todasLetras.checked && todasNum.checked;

    atualizarPlaceholderTamanhoMulti();
    filtrar();
}

// function atualizarPlaceholderTamanhoMulti() {
//     const checks = Array.from(document.querySelectorAll('.tamanho-multi-check'));
//     const select = document.getElementById('filter-tamanho');
//     const placeholderOption = document.getElementById('tamanho-multi-placeholder');

//     // Só conta os tamanhos individuais visíveis (não os grupos)
//     const individuaisVisiveis = checks.filter(cb =>
//         !['tamanho-multi-todas','tamanho-multi-todas-letra','tamanho-multi-todas-num'].includes(cb.id)
//     );
//     const selecionados = individuaisVisiveis.filter(cb => cb.checked)
//         .map(cb => cb.parentNode.textContent.trim());

//     let texto = 'Todos';
//     let ativo = true;
//     if (selecionados.length === 0 || selecionados.length === individuaisVisiveis.length) {
//         // Se só tem letras visíveis, mostra "Todos em Letras"
//         if (individuaisVisiveis.every(cb => !/^_\d+$/.test(cb.value))) {
//             texto = 'Todos em Letras';
//         }
//         // Se só tem números visíveis, mostra "Todos Numéricos"
//         else if (individuaisVisiveis.every(cb => /^_\d+$/.test(cb.value))) {
//             texto = 'Todos Numéricos';
//         }
//         // Se tem ambos, mostra "Todos"
//         else {
//             texto = 'Todos';
//             ativo = false;
//         }
//     } else {
//         // Verifica se todos em letras estão marcados
//         const todosLetrasMarcados = individuaisVisiveis
//             .filter(cb => !/^_\d+$/.test(cb.value))
//             .every(cb => cb.checked) &&
//             individuaisVisiveis.some(cb => !/^_\d+$/.test(cb.value));
//         // Verifica se todos numéricos estão marcados
//         const todosNumericosMarcados = individuaisVisiveis
//             .filter(cb => /^_\d+$/.test(cb.value))
//             .every(cb => cb.checked) &&
//             individuaisVisiveis.some(cb => /^_\d+$/.test(cb.value));
//         if (todosLetrasMarcados && !todosNumericosMarcados) {
//             texto = 'Todos em Letras, ' + selecionados.join(', ');
//         } else if (todosNumericosMarcados && !todosLetrasMarcados) {
//             texto = 'Todos Numéricos, ' + selecionados.join(', ');
//         } else {
//             texto = selecionados.join(', ');
//         }
//     }

//     if (ativo) {
//         select.style.border = '2px solid #1e94a3';
//         select.style.color = '#1e94a3';
//     } else {
//         select.style.border = '';
//         select.style.color = '';
//     }

//     // Atualiza o texto da option placeholder
//     if (placeholderOption) placeholderOption.textContent = texto;
//     // Garante que a option placeholder está selecionada visualmente
//     select.selectedIndex = 0;
//     // Atualiza cor do select
//     // select.style.color = texto === 'Todos' ? '#757575' : 'black';
// }

// --- MULTISELECT CÓDIGO (CHECKBOXES) ---
function showCheckboxesCodigoMulti() {
    const checkboxes = document.getElementById('checkboxes-codigo-multi');
    if (checkboxes.style.display === 'block') {
        checkboxes.style.display = 'none';
        // Remove listener se já estava aberto
        if (window._codigoMultiListener) {
            document.removeEventListener('mousedown', window._codigoMultiListener);
            window._codigoMultiListener = null;
        }
    } else {
        checkboxes.style.display = 'block';
        // Adiciona listener para fechar ao clicar fora
        window._codigoMultiListener = function(e) {
            const isVisible = checkboxes && window.getComputedStyle(checkboxes).display !== 'none';
            const select = document.getElementById('filter-codigo-multi');
            if (isVisible && !checkboxes.contains(e.target) && e.target !== select) {
                checkboxes.style.display = 'none';
                document.removeEventListener('mousedown', window._codigoMultiListener);
                window._codigoMultiListener = null;
            }
        };
        document.addEventListener('mousedown', window._codigoMultiListener);
    }
}

function atualizarPlaceholderCodigoMulti() {
    const checks = Array.from(document.querySelectorAll('.codigo-multi-check'));
    const select = document.getElementById('filter-codigo-multi');
    const placeholderOption = document.getElementById('codigo-multi-placeholder');
    const selecionados = checks.filter(cb => cb.checked).map(cb => cb.getAttribute('data-label'));
    let texto = 'Todos';
    let ativo = true;
    // Se o primeiro checkbox ("Todos") estiver marcado, sempre mostra "Todos"
    if (checks[0] && checks[0].checked) {
        texto = 'Todos';
        ativo = false;
    } else if (selecionados.length === 1) {
        texto = selecionados[0];
    } else if (selecionados.length > 1) {
        texto = '';
        texto = `${selecionados.length} produtos selecionados`;
    }
    if (placeholderOption) placeholderOption.textContent = texto;
    // if (select) {
    //     select.selectedIndex = 0;
    //     // ativo = false;
    // }
    if (ativo && texto !== 'Todos') {
        select.style.border = '2px solid #1e94a3';
        select.style.color = '#1e94a3';
    } else {
        select.style.border = '';
        select.style.color = '';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Popular checkboxes de código dinamicamente
    const checkboxesDiv = document.getElementById('checkboxes-codigo-multi');
    const select = document.getElementById('filter-codigo-multi');
    if (checkboxesDiv && select) {
        fetch('/produtos')
            .then(res => res.json())
            .then(produtos => {
                checkboxesDiv.innerHTML = '';
                checkboxesDiv.innerHTML += `<label><input type="checkbox" id="codigo-multi-todos" class="codigo-multi-check" value="" checked onclick="marcarOuDesmarcarTodosCodigos()" data-label="Todos" /> Todos</label>`;
                produtos.forEach(prod => {
                    checkboxesDiv.innerHTML += `<label title="${prod.codigo} - ${prod.nome}" style="gap: 2px 2px 8px 10px"><input type="checkbox" class="codigo-multi-check" value="${prod.codigo}" checked data-label="${prod.codigo} - ${prod.nome}" /> ${prod.codigo} - ${prod.nome}</label>`;
                });
                aplicarListenersCodigoMulti();
                atualizarPlaceholderCodigoMulti();
            });
    }
});

function marcarOuDesmarcarTodosCodigos() {
    const todas = document.getElementById('codigo-multi-todos');
    const checks = document.querySelectorAll('.codigo-multi-check');
    if (todas.checked) {
        checks.forEach(cb => {
            cb.checked = true;
            cb.setAttribute('checked', 'checked');
        });
    } else {
        checks.forEach(cb => {
            cb.checked = false;
            cb.removeAttribute('checked');
        });
    }
    atualizarPlaceholderCodigoMulti();
    filtrarRelatorios();
}

function aplicarListenersCodigoMulti() {
    const checks = Array.from(document.querySelectorAll('.codigo-multi-check'));
    const todas = document.getElementById('codigo-multi-todos');
    checks.forEach(cb => {
        if (cb.id !== 'codigo-multi-todos') {
            cb.addEventListener('change', function() {
                if (!cb.checked && todas) todas.checked = false;
                else if (todas) {
                    todas.checked = checks.slice(1).every(c => c.checked);
                }
                atualizarPlaceholderCodigoMulti();
                filtrarRelatorios();
            });
        }
    });
    if (todas) {
        todas.addEventListener('change', function() {
            marcarOuDesmarcarTodosCodigos();
        });
    }
}

// Atualiza detalhes do estoque ao abrir a página
window.addEventListener('DOMContentLoaded', function() {
    const detalhesDiv = document.getElementById('detalhes-estoque');
    if (detalhesDiv) {
        detalhesDiv.style.display = 'none';
    }
    fetch('/produtos')
        .then(response => response.json())
        .then(produtos => {
            window.atualizarDetalhesEstoque(produtos);
            const total = produtos.reduce((soma, p) => soma + (parseInt(p.quantidade) || 0), 0);
            const baixoEstoque = produtos.filter(p => p.quantidade > 0 && p.quantidade <= (2 * p.limiteMinimo)).length;
            const zerados = produtos.filter(p => p.quantidade === 0).length;
            const elTotal = document.getElementById('detalhe-total-produtos');
            const elBaixo = document.getElementById('detalhe-baixo-estoque');
            const elZerados = document.getElementById('detalhe-estoque-zerado');
            if (elTotal) elTotal.textContent = total;
            if (elBaixo) elBaixo.textContent = baixoEstoque;
            if (elZerados) elZerados.textContent = zerados;
        });
});

// document.addEventListener('DOMContentLoaded', function() {
//     // Controle de exibição dos detalhes
//     const btnDetalhes = document.getElementById('btn-exibir-detalhes');
//     const detalhesEstoque = document.getElementById('detalhes-estoque');
//     let detalhesVisiveis = true; // começa visível
//     if (btnDetalhes && detalhesEstoque) {
//         detalhesEstoque.style.display = 'flex';
//         btnDetalhes.innerHTML = '<i class="fa-solid fa-eye" style="margin-right:4px;"></i>Detalhes';

//         btnDetalhes.addEventListener('click', function() {
//             detalhesVisiveis = !detalhesVisiveis;
//             if (detalhesVisiveis) {
//                 detalhesEstoque.style.display = 'flex';
//                 btnDetalhes.innerHTML = '<i class="fa-solid fa-eye" style="margin-right:4px;"></i>Detalhes';
//                 btnDetalhes.style.background = '#1e94a3';
//                 btnDetalhes.style.color = '#fff';
//                 btnDetalhes.style.border = 'none';
//             } else {
//                 detalhesEstoque.style.display = 'none';
//                 btnDetalhes.innerHTML = '<i class="fa-solid fa-eye-slash" style="margin-right:4px;"></i>Detalhes';
//                 btnDetalhes.style.background = '#fff';
//                 btnDetalhes.style.color = '#1e94a3';
//                 btnDetalhes.style.border = '1px solid #1e94a3';
//             }
//         });
//     }

    // Limpar filtros da barra de busca
//     const btnLimpar = document.getElementById('btn-limpar-filtros-busca');
//     const btnCancelar = document.getElementById('btn-cancelar-gerar');
//     if (btnLimpar) {
//         btnLimpar.addEventListener('click', function() {
//             // Limpa todos os campos da barra de busca de relatórios
//             const camposBusca = [
//                 'busca-relatorio',
//                 'filter-data-criacao-busca',
//                 'filter-data-inicio-busca',
//                 'filter-data-fim-busca'
//             ];
//             camposBusca.forEach(id => {
//                 const el = document.getElementById(id);
//                 if (el) el.value = '';
//             });
//             filtrarRelatorios();
//         });
//     }

//     if (btnCancelar) {
//         btnCancelar.addEventListener('click', function() {
//             document.getElementById('filter-categoria').value = '';
//             document.getElementById('filter-tamanho').value = '';
//             document.getElementById('filter-genero').value = '';
//             document.getElementById('filter-data-criacao').value = '';
//             document.getElementById('filter-data-inicio').value = '';
//             document.getElementById('filter-data-fim').value = '';
//         });
//     }
// });

// document.addEventListener('DOMContentLoaded', function() {
//     document.getElementById('filter-data-inicio-busca').addEventListener('change', filtrarRelatorios);
//     document.getElementById('filter-data-fim-busca').addEventListener('change', filtrarRelatorios);
//     document.getElementById('filter-data-criacao-busca').addEventListener('change', filtrarRelatorios);
//     document.getElementById('busca-relatorio').addEventListener('input', filtrarRelatorios);
// });

// --- PREÇO E QUANTIDADE FAIXA ---
document.addEventListener('DOMContentLoaded', function() {
    // --- PREÇO FAIXA ---
    const precoInput = document.getElementById('filter-preco');
    const precoPopup = document.getElementById('preco-faixa-popup');
    const precoMin = document.getElementById('preco-min');
    const precoMax = document.getElementById('preco-max');

    // Máscara para 0,00 até 999,99
    function mascaraPrecoFaixa(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 5) value = value.slice(0, 5);
        if (value.length > 0) {
            value = (parseInt(value) / 100).toFixed(2).replace('.', ',');
            input.value = 'R$ ' + value;
        } else {
            input.value = '';
        }
    }

    if (precoMin) precoMin.addEventListener('input', function() { mascaraPrecoFaixa(this); });
    if (precoMax) precoMax.addEventListener('input', function() { mascaraPrecoFaixa(this); });

    if (precoInput && precoPopup && precoMin && precoMax) {
        precoInput.addEventListener('click', function(e) {
            precoPopup.style.display = 'block';
            precoInput.style.border = '';
            precoMin.focus();
            e.stopPropagation();
        });

        // Função para aplicar o filtro só ao fechar o popup
        function aplicarFiltroPrecoFaixa() {
            let min = precoMin.value.replace(/^R\$ ?/, '').replace(',', '.');
            let max = precoMax.value.replace(/^R\$ ?/, '').replace(',', '.');
            let ativo = true;

            // Se ambos vazios, limpa o input para mostrar o placeholder
            if (!min && !max) {
                precoInput.value = '';
                precoPopup.style.display = 'none';
                ativo = false;
                filtrar();
                return;
            }

            // Se só "de" preenchido, assume até 999,99
            if (min && !max) max = '999.99';
            // Se só "até" preenchido, assume de 0,00
            if (!min && max) min = '0.00';

            // Converte para número para comparar
            let minNum = parseFloat(min) || 0;
            let maxNum = parseFloat(max) || 999.99;
            
            // Inverte se min > max
            if (minNum > maxNum) [minNum, maxNum] = [maxNum, minNum];

            // Formata de volta para string
            min = minNum.toFixed(2).replace('.', ',');
            max = maxNum.toFixed(2).replace('.', ',');

            precoInput.value = `R$ ${min} - R$ ${max}`;
            if (precoInput.value === "R$ 0,00 - R$ 999,99") {
                precoInput.value = 'Todos';
                ativo = false;
            }

            precoPopup.style.display = 'none';

            if (ativo) {
                precoInput.style.border = '2px solid #1e94a3';
                precoInput.style.color = '#1e94a3';
            } else {
                precoInput.style.border = '';
                precoInput.style.color = '';
            }
            filtrar();
        }

        // Fecha popup ao clicar fora e aplica filtro
        document.addEventListener('mousedown', function(e) {
            if (precoPopup.style.display === 'block' && !precoPopup.contains(e.target) && e.target !== precoInput) {
                aplicarFiltroPrecoFaixa();
            }
        });
    }

    // Limpa campos ao limpar filtros
    window.limparFaixaPreco = function() {
        if (precoMin) precoMin.value = '';
        if (precoMax) precoMax.value = '';
        if (precoInput) precoInput.value = '';
    };

    // --- QUANTIDADE FAIXA ---
    const qtdInput = document.getElementById('filter-quantidade');
    const qtdPopup = document.getElementById('quantidade-faixa-popup');
    const qtdMin = document.getElementById('quantidade-min');
    const qtdMax = document.getElementById('quantidade-max');

    if (qtdInput && qtdPopup && qtdMin && qtdMax) {
        qtdInput.addEventListener('click', function(e) {
            qtdPopup.style.display = 'block';
            qtdInput.style.border = '';
            qtdMin.focus();
            e.stopPropagation();
        });
        qtdMin.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 3);
        });
        qtdMax.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 3);
        });

        function aplicarFiltroQtdFaixa() {
            let min = qtdMin.value;
            let max = qtdMax.value;
            let ativo = true;

            // Se ambos vazios, limpa o input para mostrar o placeholder
            if (min === "" && max === "") {
                qtdInput.value = '';
                qtdPopup.style.display = 'none';
                ativo = false;
                filtrar();
                return;
            }

            min = min === "" ? 0 : parseInt(min);
            max = max === "" ? 999 : parseInt(max);

            if (min > max) [min, max] = [max, min];
            qtdMin.value = min;
            qtdMax.value = max;
            qtdInput.value = `${min} - ${max}`;
            if (qtdInput.value === "0 - 999") {
                qtdInput.value = "Todas";
                ativo = false;
            }
            qtdPopup.style.display = 'none';

            if (ativo) {
                qtdInput.style.border = '2px solid #1e94a3';
                qtdInput.style.color = '#1e94a3';
            } else {
                qtdInput.style.border = '';
                qtdInput.style.color = '';
            }
            filtrar();
        }

        document.addEventListener('mousedown', function(e) {
            // Considera popup visível para qualquer valor diferente de 'none' (block, flex, etc)
            const isVisible = qtdPopup && window.getComputedStyle(qtdPopup).display !== 'none';
            if (isVisible && !qtdPopup.contains(e.target) && e.target !== qtdInput) {
                if (typeof atualizarPlaceholderQuantidade === 'function') atualizarPlaceholderQuantidade();
                aplicarFiltroQtdFaixa();
            }
        });
    }
});

// Protege uso de limiteInput e limitePopup
const limiteInput = document.getElementById('filter-limite');
const limitePopup = document.getElementById('limite-faixa-popup');
const limiteMin = document.getElementById('limite-min');
const limiteMax = document.getElementById('limite-max');
if (limiteInput && limitePopup && limiteMin && limiteMax) {
    limiteInput.addEventListener('click', function(e) {
        limitePopup.style.display = 'block';
        limiteInput.style.border = '';
        limiteMin.focus();
        e.stopPropagation();
    });
    limiteMin.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 3);
    });
    limiteMax.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 3);
    });
    function aplicarFiltroLimiteFaixa() {
        let min = limiteMin.value;
        let max = limiteMax.value;
        let ativo = true;

        // Se ambos vazios, limpa o input para mostrar o placeholder
        if (!min && !max) {
            limiteInput.value = '';
            limitePopup.style.display = 'none';
            ativo = false;
            filtrar();
            return;
        }

        min = parseInt(min) || 1;
        max = parseInt(max) || 999;
        if (min > max) [min, max] = [max, min];
        limiteMin.value = min;
        limiteMax.value = max;
        limiteInput.value = `${min} - ${max}`;
        if (limiteInput.value === "1 - 999") {
            limiteInput.value = "Todos";
            ativo = false;
        }
        limitePopup.style.display = 'none';

        if (ativo) {
            limiteInput.style.border = '2px solid #1e94a3';
            limiteInput.style.color = '#1e94a3';
        } else {
            limiteInput.style.border = '';
            limiteInput.style.color = '';
        }
        filtrar();
    }
    document.addEventListener('mousedown', function(e) {
        if (limitePopup.style.display === 'block' && !limitePopup.contains(e.target) && e.target !== limiteInput) {
            aplicarFiltroLimiteFaixa();
        }
    });
}

// --- SUGESTÃO DE CÓDIGOS "LIKE" ---
const codigoInput = document.getElementById('filter-codigo');

// Cria o container das sugestões
let sugestaoContainer = document.createElement('div');
sugestaoContainer.id = 'codigo-sugestoes';

codigoInput.parentNode.appendChild(sugestaoContainer);

codigoInput.addEventListener('input', function() {
    // Permite apenas números
    this.value = this.value.replace(/\D/g, '');
    const termo = this.value.trim();
    sugestaoContainer.innerHTML = '';
    if (!termo) {
        sugestaoContainer.style.display = 'none';
        filtrar();
        return;
    }
    // Busca códigos que contenham o termo digitado
    const encontrados = produtos.filter(p => p.codigo.includes(termo));
    if (encontrados.length === 0) {
        sugestaoContainer.style.display = 'none';
        filtrar();
        return;
    }
    encontrados.forEach(p => {
        const div = document.createElement('div');
        div.textContent = `${p.codigo} - ${p.nome}`;
        div.style.padding = '4px 8px';
        div.style.cursor = 'pointer';
        div.addEventListener('mousedown', function(e) {
            e.preventDefault();
            codigoInput.value = p.codigo;
            sugestaoContainer.style.display = 'none';
            filtrar();
        });
        sugestaoContainer.appendChild(div);
    });
    // Posiciona o container logo abaixo do input
    const rect = codigoInput.getBoundingClientRect();
    sugestaoContainer.style.top = (codigoInput.offsetTop + codigoInput.offsetHeight) + 'px';
    sugestaoContainer.style.left = codigoInput.offsetLeft + 'px';
    sugestaoContainer.style.display = 'block';
    filtrar();
});

// Esconde sugestões ao clicar fora
document.addEventListener('mousedown', function(e) {
    if (!sugestaoContainer.contains(e.target) && e.target !== codigoInput) {
        sugestaoContainer.style.display = 'none';
    }
});

const buscaInput = document.getElementById('busca-produto');
const buscaSugestoes = document.getElementById('busca-sugestoes');

buscaInput.addEventListener('input', function() {
    const termo = this.value.trim();
    buscaSugestoes.innerHTML = '';
    if (!termo) {
        buscaSugestoes.style.display = 'none';
        return;
    }
    let encontrados;
    let mostrarCodigoPrimeiro = /^\d+$/.test(termo);
    if (mostrarCodigoPrimeiro) {
        encontrados = produtos.filter(p => p.codigo.includes(termo));
    } else {
        encontrados = produtos.filter(p => p.nome.toLowerCase().includes(termo.toLowerCase()));
    }
    encontrados.forEach(p => {
        const div = document.createElement('div');
        div.textContent = mostrarCodigoPrimeiro
            ? `${p.codigo} - ${p.nome}`
            : `${p.nome} - ${p.codigo}`;
        div.style.padding = '6px 12px';
        div.style.cursor = 'pointer';
        div.addEventListener('mousedown', function(e) {
            e.preventDefault();
            buscaInput.value = mostrarCodigoPrimeiro ? p.codigo : p.nome;
            buscaSugestoes.style.display = 'none';
        });
        buscaSugestoes.appendChild(div);
    });
    buscaSugestoes.style.display = encontrados.length > 0 ? 'block' : 'none';
});

document.addEventListener('mousedown', function(e) {
    if (!buscaSugestoes.contains(e.target) && e.target !== buscaInput) {
        buscaSugestoes.style.display = 'none';
    }
});

// Botão "Filtrar Produtos" mostra filtros avançados
btnFiltrarProdutos.addEventListener('click', function() {
    filtrosAvancados.style.display = 'flex';
});

// Botão "Limpar Filtros" limpa só os filtros avançados e esconde a div
btnLimparFiltros.addEventListener('click', function(e) {
    e.preventDefault();
    filtrosAvancados.querySelectorAll('input, select').forEach(el => {
        if (el.type === 'select-one') el.selectedIndex = 0;
        else el.value = '';
    });
    filtrosAvancados.style.display = 'none';
});

// Botão "Exibir Detalhes"
// let detalhesVisiveis = true; // começa visível

// btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-circle-info" style="margin-right:4px;"></i>Ocultar Detalhes';

// btnExibirDetalhes.addEventListener('click', function() {
//     const detalhesDiv = document.getElementById('detalhes-estoque');
//     const estaVisivel = window.getComputedStyle(detalhesDiv).display !== 'none';
//     if (estaVisivel) {
//         detalhesDiv.style.display = 'none';
//         btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-circle-info" style="margin-right:4px;"></i>Exibir Detalhes';
//     } else {
//         detalhesDiv.style.display = 'flex';
//         window.atualizarDetalhesEstoque(produtos);
//         btnExibirDetalhes.innerHTML = '<i class="fa-solid fa-circle-info" style="margin-right:4px;"></i>Ocultar Detalhes';
//         detalhesDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }
// });

function visualizarImagem(url, nome, descricao, codigo) {
    Swal.fire({
        title: nome + (codigo ? `<br><small style='font-weight:normal;'>Código: ${codigo}</small>` : ''),
        html: `
            ${url ? `<img src="${url}" alt="Imagem do Produto" style="max-width: 100%; max-height: 80vh;"/>` : ''}
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


function atualizarDetalhesInfo(produtos) {
    // Soma a coluna quantidade dos produtos recebidos (filtrados)
    const total = produtos.reduce((soma, p) => soma + (Number(p.quantidade) || 0), 0);
    document.getElementById('detalhe-total-produtos').textContent = total;

    // Baixo estoque: quantidade > 0 e <= limiteMinimo
    const baixoEstoque = produtos.filter(p => (Number(p.quantidade) > 0) && (Number(p.quantidade) <= 2 * Number(p.limiteMinimo))).length;
    document.getElementById('detalhe-baixo-estoque').textContent = baixoEstoque;

    // Estoque zerado: quantidade == 0
    const zerados = produtos.filter(p => Number(p.quantidade) === 0).length;
    document.getElementById('detalhe-estoque-zerado').textContent = zerados;
}

window.expandedCategoriaMulti = false;

function showCheckboxesCategoriaMulti() {
    var checkboxes = document.getElementById("checkboxes-categoria-multi");
    if (!window.expandedCategoriaMulti) {
        checkboxes.style.display = "block";
        window.expandedCategoriaMulti = true;

        // Fecha ao clicar fora
        function handleClickOutside(e) {
            if (
                checkboxes &&
                !checkboxes.contains(e.target) &&
                !document.querySelector('.multiselect .overSelect').contains(e.target)
            ) {
                checkboxes.style.display = "none";
                window.expandedCategoriaMulti = false;
                document.removeEventListener('mousedown', handleClickOutside);

                // ATUALIZA O PLACEHOLDER DOS TAMANHOS AO FECHAR O SELECT DE CATEGORIAS
                atualizarPlaceholderTamanhoMulti();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
    } else {
        checkboxes.style.display = "none";
        window.expandedCategoriaMulti = false;

        // ATUALIZA O PLACEHOLDER DOS TAMANHOS AO FECHAR O SELECT DE CATEGORIAS
        atualizarPlaceholderTamanhoMulti();
    }
}

// Fecha dropdown ao clicar fora
document.addEventListener('mousedown', function(e) {
  var checkboxes = document.getElementById("checkboxes-categoria-multi");
  var overSelect = document.querySelector('.multiselect .overSelect');  
if (
  window.expandedCategoriaMulti &&
  checkboxes &&
  !checkboxes.contains(e.target) &&
  !overSelect.contains(e.target)
) {
  checkboxes.style.display = "none";
  window.expandedCategoriaMulti = false;
}
});

// Lógica de seleção "Todas" e integração com filtro
// window.addEventListener('DOMContentLoaded', function() {
//   const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
//   const todas = checks[0];

//   // "Todas" marca/desmarca todos
//   todas.addEventListener('change', function() {
//     checks.forEach(cb => cb.checked = todas.checked);
//     atualizarPlaceholderCategoriaMulti();
//   });

//   // Se todos individuais marcados, marca "Todas". Se algum desmarcado, desmarca "Todas"
//   checks.slice(1).forEach(cb => {
//     cb.addEventListener('change', function() {
//       todas.checked = checks.slice(1).every(c => c.checked);
//       atualizarPlaceholderCategoriaMulti();
//     });
//   });

//   // Função global para pegar categorias selecionadas do multiselect
//   window.getCategoriasMultiSelecionadas = function() {
//     if (todas.checked) return [];
//     return checks.slice(1).filter(cb => cb.checked).map(cb => cb.value);
//   };
// });

function marcarOuDesmarcarTodasCategorias() {
    const todas = document.getElementById('categoria-multi-todas');
    const checks = document.querySelectorAll('.categoria-multi-check');
    if (todas.checked) {
        checks.forEach(cb => {
            cb.checked = true;
            cb.setAttribute('checked', 'checked');
        });
    } else {
        checks.forEach(cb => {
            cb.checked = false;
            cb.removeAttribute('checked');
        });
    }
}

function getCategoriasSelecionadas() {
    return Array.from(document.querySelectorAll('.categoria-multi-check'))
        .filter(cb => cb.id !== 'categoria-multi-todas' && cb.checked)
        .map(cb => cb.value);
}

function atualizarPlaceholderCategoriaMulti() {
    const checks = Array.from(document.querySelectorAll('.categoria-multi-check'));
    const todas = checks[0];
    const placeholder = document.getElementById('categoria-multi-placeholder');
    const input = document.getElementById('filter-categoria');
    const selecionados = checks.slice(1)
        .filter(cb => cb.checked)
        .map(cb => cb.parentNode.textContent.trim());
    todas.checked = checks.slice(1).every(cb => cb.checked);

    let ativo = true;
    if (todas.checked || selecionados.length === 0) {
        placeholder.textContent = 'Todas';
        ativo = false;
    } else {
        placeholder.textContent = selecionados.join(', ');
    }

    if (ativo) {
        input.style.border = '2px solid #1e94a3';
        input.style.color = '#1e94a3';
    } else {
        input.style.border = '';
        input.style.color = '';
    }
}



function atualizarPlaceholderQuantidade() {
    const chkTodos = document.getElementById('quantidade-todas-popup');
    const chkBaixo = document.getElementById('quantidade-baixo-estoque-popup');
    const chkZerados = document.getElementById('quantidade-zerados-popup');
    const input = document.getElementById('filter-quantidade');
    
    // if (!input || !chkTodos || !chkBaixo || !chkZerados) return;
    
    let texto = 'Todas';
    let ativo = true;

    // Todas as combinações possíveis
    if (chkTodos.checked && chkBaixo.checked && chkZerados.checked) {
        texto = 'Todas';
        ativo = false;
    } else if (chkTodos.checked && chkBaixo.checked && !chkZerados.checked) {
        texto = 'Todas exceto zerados';
    } else if (chkTodos.checked && !chkBaixo.checked && chkZerados.checked) {
        texto = 'Todas exceto baixo estoque';
    } else if (!chkTodos.checked && chkBaixo.checked && chkZerados.checked) {
        texto = 'Baixo estoque e zerados';
    } else if (!chkTodos.checked && chkBaixo.checked && !chkZerados.checked) {
        texto = 'Baixo estoque';
    } else if (!chkTodos.checked && !chkBaixo.checked && chkZerados.checked) {
        texto = 'Zerados';
    } else {
        texto = 'Todas';
        ativo = false;
    }
    
    if (input) input.placeholder = texto;

    if (ativo) {
        input.style.border = '2px solid #1e94a3';
        input.classList.add('quantidade-ativa');
    } else {
        input.style.border = '';
        input.classList.remove('quantidade-ativa');
    }
}

// ['quantidade-todas-popup','quantidade-baixo-estoque-popup','quantidade-zerados-popup'].forEach(id => {
//     const el = document.getElementById(id);
//     if (el) el.addEventListener('change', atualizarPlaceholderQuantidade);
// });
document.addEventListener('DOMContentLoaded', atualizarPlaceholderQuantidade);

document.querySelectorAll('.categoria-multi-check').forEach(cb => {
    cb.addEventListener('change', updateOptions);
});
document.querySelectorAll('.categoria-multi-check').forEach(cb => {
    cb.addEventListener('change', atualizarPlaceholderCategoriaMulti);
});