// window.onload = function() {
//     renderizarRelatorios(window.relatoriosGerados);
// }

document.addEventListener('DOMContentLoaded', function() {
    // Sempre recarrega do localStorage ao abrir a tela
    window.relatoriosGerados = JSON.parse(localStorage.getItem('relatoriosGerados') || '[]');
    renderizarRelatorios(window.relatoriosGerados);
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


function dataBRparaISO(dataBR) {
    if (!dataBR) return '';
    const [dia, mes, ano] = dataBR.split('/');
    return `${ano}-${mes.padStart(2,'0')}-${dia.padStart(2,'0')}`;
}
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
                delete relatorio.blobUrl;

                // Atualiza lista e salva no localStorage
                let relatorios = JSON.parse(localStorage.getItem('relatoriosGerados') || '[]');
                relatorios.push(relatorio);
                window.relatoriosGerados = relatorios;
                localStorage.setItem('relatoriosGerados', JSON.stringify(relatorios));
                renderizarRelatorios(relatorios);
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
    const relatorio = window.relatoriosGerados.find(r => r.id == id);
    const nomeRelatorio = relatorio ? relatorio.nome : '';
    Swal.fire({
        title: `Remover "${nomeRelatorio}"`,
        text: 'Esta ação não poderá ser desfeita!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Remover',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'swal2-remove-custom',
            cancelButton: 'swal2-cancel-custom'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.relatoriosGerados = window.relatoriosGerados.filter(r => r.id != id);
            localStorage.setItem('relatoriosGerados', JSON.stringify(window.relatoriosGerados));
            renderizarRelatorios(window.relatoriosGerados);
            Swal.fire({
                title: `"${nomeRelatorio}" Removido!`,
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
        title: '<h2 style="padding-top:20px; color:#277580; text-align:left;">Renomear Relatório</h2>',
        html: `<p style="text-align:left; padding: 0px 20px 0px 10px; margin: 0;">${nomeSemExtensao}</p>`,
        input: 'text',
        inputValue: '',
        showCloseButton: true,
        inputPlaceholder: 'Digite o novo nome do relatório',
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        didOpen: () => {
            const input = Swal.getInput();
            if (input) {
                input.style.fontSize = '12px';
                input.style.margin = '0px 20px 10px 20px';
                input.style.border = 'solid 1px #aaa';
                input.style.borderRadius = '4px';
            }
        }
    }).then(result => {
        if (result.isConfirmed) {
            const novoNome = (result.value || '').trim();
            // Não pode salvar vazio, só espaços, só .pdf ou caracteres especiais
            const nomeValido = 
                novoNome.length > 0 
                && !/[^a-zA-Z0-9_\- áéíóúãõâêîôûçÁÉÍÓÚÃÕÂÊÎÔÛÇ]/.test(novoNome) // permite letras, números, espaço, underline, hífen e acentos
                && novoNome.toLowerCase() !== 'pdf'
                && !/[_\-]$/.test(novoNome); // nao pode terminar com _ ou -
            if (!nomeValido) {
                Swal.fire({
                    title: 'Nome inválido!',
                    text: 'O nome não pode ser vazio, só ".pdf" ou conter caracteres especiais',
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
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
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

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('filter-data-inicio-busca').addEventListener('change', filtrarRelatorios);
    document.getElementById('filter-data-fim-busca').addEventListener('change', filtrarRelatorios);
    document.getElementById('filter-data-criacao-busca').addEventListener('change', filtrarRelatorios);
    document.getElementById('busca-relatorio').addEventListener('input', filtrarRelatorios);
});

function filtrarRelatorios() {
    const hoje = new Date().toISOString().slice(0, 10);
    const dataCriacao = document.getElementById('filter-data-criacao-busca').value; // yyyy-MM-dd
    const dataInicio = document.getElementById('filter-data-inicio-busca').value;   // yyyy-MM-dd
    const dataFim = document.getElementById('filter-data-fim-busca').value;         // yyyy-MM-dd
    const titulo = document.getElementById('busca-relatorio').value.toLowerCase();


    if (dataCriacao && dataCriacao > hoje) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida!',
            text: 'A Data de Criação não pode ser posterior a hoje',
            timer: 1500,
            showConfirmButton: false
        });
        document.getElementById('filter-data-criacao-busca').value = '';
        return;
    }
    if (dataInicio && dataInicio > hoje) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida!',
            text: 'A Data de Início não pode ser posterior a hoje',
            timer: 1500,
            showConfirmButton: false
        });
        document.getElementById('filter-data-inicio-busca').value = '';
        return;
    }
    if (dataFim && dataFim > hoje) {
        Swal.fire({
            icon: 'warning',
            title: 'Data inválida!',
            text: 'A Data de Fim não pode ser posterior a hoje',
            timer: 1500,
            showConfirmButton: false
        });
        document.getElementById('filter-data-fim-busca').value = '';
        return;
    }

    let filtrados = window.relatoriosGerados.filter(r => {
        let ok = true;

        // Filtro por título
        if (titulo && !r.nome.toLowerCase().includes(titulo)) ok = false;

        // Filtro por data de criação (exata)
        if (dataCriacao) {
            let dataRel = r.dataCriacao ? dataBRparaISO(r.dataCriacao) : '';
            if (dataRel !== dataCriacao) ok = false;
        }

        // Filtro por período (dataInicio/dataFim)
        if ((dataInicio || dataFim) && r.periodo) {
            let [ini, fim] = r.periodo.split('-').map(s => s.trim());
            ini = ini ? dataBRparaISO(ini) : '';
            fim = fim ? dataBRparaISO(fim) : ini;

            if (dataInicio && !dataFim) {
                if (ini !== dataInicio) ok = false;
            } else if (!dataInicio && dataFim) {
                if (fim !== dataFim) ok = false;
            } else if (dataInicio && dataFim) {
                if (!(ini === dataInicio && fim === dataFim)) ok = false;
            }
        }

        return ok;
    });

    renderizarRelatorios(filtrados);

    // Atualiza cor dos inputs de data início/fim
    const dataInicioInput = document.getElementById('filter-data-inicio-busca');
    const dataFimInput = document.getElementById('filter-data-fim-busca');
    [dataInicioInput, dataFimInput].forEach(input => {
        if (input) {
            if (input.value) {
                input.style.border = '2px solid #1e94a3';
                input.style.color = '#1e94a3';
            } else {
                input.style.border = '';
                input.style.color = '';
            }
        }
    });
}
//periodo
document.addEventListener('DOMContentLoaded', function() {
    const periodoInput = document.getElementById('filter-periodo');
    const popup = document.getElementById('periodo-popup');
    const dataInicio = document.getElementById('periodo-data-inicio');
    const dataFim = document.getElementById('periodo-data-fim');

    periodoInput.addEventListener('click', function(e) {
        popup.style.display = 'block';

    });

    document.addEventListener('mousedown', function(e) {
        function formatarDataBR(data) {
            if (!data) return '';
            const [ano, mes, dia] = data.split('-');
            return `${dia}/${mes}/${ano}`;
        }
        let ativo = true;
        if (dataInicio.value && dataFim.value) {
            periodoInput.value = `${formatarDataBR(dataInicio.value)} - ${formatarDataBR(dataFim.value)}`;
        } else if (dataInicio.value) {
            periodoInput.value = `de ${formatarDataBR(dataInicio.value)}`;
        } else if (dataFim.value) {
            periodoInput.value = `até ${formatarDataBR(dataFim.value)}`;
        } else {
            periodoInput.value = '';
            ativo = false;
        }
        // popup.style.display = 'none';
        if (!popup.contains(e.target) && e.target !== periodoInput) {
            popup.style.display = 'none';
            ativo = false;
        }

        if (ativo) {
            periodoInput.style.border = '2px solid #1e94a3';
            periodoInput.style.color = '#1e94a3';
        } else {
            periodoInput.style.border = '';
            periodoInput.style.color = '';
        }
    });
});



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


