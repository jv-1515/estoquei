function getFiltros() {
    return {
        categoria: document.getElementById('filter-categoria') ? document.getElementById('filter-categoria').value : '',
        tamanho: document.getElementById('filter-tamanho') ? document.getElementById('filter-tamanho').value : '',
        genero: document.getElementById('filter-genero') ? document.getElementById('filter-genero').value : '',
        preco: document.getElementById('filter-preco') ? document.getElementById('filter-preco').value : '',
        dataInicio: document.getElementById('filter-data-inicio') ? document.getElementById('filter-data-inicio').value : '',
        dataFim: document.getElementById('filter-data-fim') ? document.getElementById('filter-data-fim').value : ''
    };
}

function formatarDataBR(data) {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function gerar() {
    const filtros = getFiltros();

    // Se dataFim está preenchido e dataInicio está vazio, impede gerar e foca no campo
    if (filtros.dataFim && !filtros.dataInicio) {
        const dataInicioInput = document.getElementById('filter-data-inicio');
        dataInicioInput.required = true;
        dataInicioInput.reportValidity(); // Mostra a mensagem nativa do navegador
        dataInicioInput.focus();
        return;
    }

    // Se dataInicio preenchido e dataFim não, preenche dataFim com hoje
    if (filtros.dataInicio && !filtros.dataFim) {
        const hoje = new Date();
        const yyyy = hoje.getFullYear();
        const mm = String(hoje.getMonth() + 1).padStart(2, '0');
        const dd = String(hoje.getDate()).padStart(2, '0');
        filtros.dataFim = `${yyyy}-${mm}-${dd}`;
    }

    limparFiltros();              // Só limpe depois, se quiser

    Object.keys(filtros).forEach(key => {
        if (filtros[key] === "") filtros[key] = null;
    });
    const todosVazios = Object.values(filtros).every(v => !v || v === '');

    // Função para ordenar e agrupar produtos por categoria e tamanho
    function agruparOrdenar(produtos) {
        return produtos
            .slice()
            .sort((a, b) => {
                // Ordena por categoria, depois por tamanho (alfanumérico)
                if (a.categoria.toLowerCase() < b.categoria.toLowerCase()) return -1;
                if (a.categoria.toLowerCase() > b.categoria.toLowerCase()) return 1;
                // Tamanho pode ser número ou string, então compara como string
                return a.tamanho.toString().localeCompare(b.tamanho.toString(), undefined, { numeric: true });
            });
    }

    // Função para gerar o PDF (recebe a lista de produtos)
    function gerarPDF(produtos, filtros) {
        if (!produtos || produtos.length === 0) {
            Swal.fire('Atenção', 'Nenhum produto encontrado para os filtros selecionados.', 'info');
            return;
        }

        // ORDENA E AGRUPA
        produtos = agruparOrdenar(produtos);

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // CORES DO PROJETO (ajuste conforme seu padrão)
        const corCabecalho = "#1E94A3";
        const corLinha = "#F5F5F5";

        // LOGO (ajuste o caminho se necessário)
        const logoImg = new Image();
        logoImg.src = './images/logo_icon.png'; // ajuste o caminho conforme seu projeto

        // Cabeçalho com logo (carrega o logo antes de gerar o resto)
        logoImg.onload = function () {
            doc.addImage(logoImg, 'PNG', 14, 8, 10, 10);
            doc.setFontSize(12);
            doc.setTextColor(corCabecalho);
            doc.text('Relatório de Produtos', 26, 15);
            doc.setFontSize(8);
            doc.setTextColor('#333');
            doc.text('Data de emissão: ' + new Date().toLocaleDateString('pt-BR'), 14, 22);

            // Tabela principal
            const columns = [
                { header: 'Código', dataKey: 'codigo' },
                { header: 'Nome', dataKey: 'nome' },
                { header: 'Categoria', dataKey: 'categoria' },
                { header: 'Tamanho', dataKey: 'tamanho' },
                { header: 'Gênero', dataKey: 'genero' },
                { header: 'Entradas', dataKey: 'entradas' },
                { header: 'Saídas', dataKey: 'saidas' },
                { header: 'Estoque Atual', dataKey: 'quantidade' },
                { header: 'Limite Mínimo', dataKey: 'limiteMinimo' },
                { header: 'Preço Unitário', dataKey: 'preco' },
                { header: 'Preço Total', dataKey: 'precoTotal' }
            ];

            const rows = produtos.map(p => ({
                codigo: p.codigo,
                nome: p.nome,
                categoria: p.categoria,
                tamanho: p.tamanho,
                genero: p.genero,
                entradas: p.quantidade,
                saidas: p.quantidade,
                quantidade: p.quantidade,
                limiteMinimo: p.limiteMinimo,
                preco: p.preco ? 'R$ ' + Number(p.preco).toFixed(2).replace('.', ',') : '',
                precoTotal: p.preco ? 'R$ ' + (Number(p.preco) * Number(p.quantidade)).toFixed(2).replace('.', ',') : ''
            }));

            doc.autoTable({
                columns: columns,
                body: rows,
                startY: 26,
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: corCabecalho, textColor: '#fff', fontStyle: 'bold' },
                alternateRowStyles: { fillColor: corLinha }
            });

            // Detalhamento por produto (opcional)
            let y = doc.lastAutoTable.finalY + 8;
            produtos.forEach((p, idx) => {
                doc.setFontSize(10);
                doc.setTextColor(corCabecalho);
                doc.text(`Detalhes do produto: ${p.nome}`, 14, y);

                doc.setFontSize(8);
                doc.setTextColor('#333');
                y += 5;
                doc.text(`Código: ${p.codigo}`, 14, y);
                doc.text(`Categoria: ${p.categoria}`, 50, y);
                doc.text(`Tamanho: ${p.tamanho}`, 100, y);
                doc.text(`Gênero: ${p.genero}`, 140, y);

                y += 5;
                doc.text(`Estoque Atual: ${p.quantidade}`, 14, y);
                doc.text(`Limite Mínimo: ${p.limiteMinimo}`, 50, y);
                doc.text(`Preço Unitário: ${p.preco ? 'R$ ' + Number(p.preco).toFixed(2).replace('.', ',') : ''}`, 100, y);
                doc.text(`Preço Total: ${p.preco ? 'R$ ' + (Number(p.preco) * Number(p.quantidade)).toFixed(2).replace('.', ',') : ''}`, 140, y);

                y += 5;
                doc.text(`Entradas: ${p.quantidade} (TEMPORÁRIO: igual quantidade)`, 14, y);
                doc.text(`Saídas: ${p.quantidade} (TEMPORÁRIO: igual quantidade)`, 60, y);

                y += 5;
                doc.text(`Data de criação: ${p.dataCriacao ? formatarDataBR(p.dataCriacao) : new Date().toLocaleDateString('pt-BR')} (TEMPORÁRIO: usar data real depois)`, 14, y);

                y += 10;
                // Quebra de página se necessário
                if (y > 270 && idx < produtos.length - 1) {
                    doc.addPage();
                    y = 20;
                }
            });

            // Nome do arquivo: RelatorioDeDesempenho_DDMMAAAA.pdf
            const hoje = new Date();
            const baseNomeArquivo = `RelatorioDeDesempenho_${String(hoje.getDate()).padStart(2, '0')}${String(hoje.getMonth() + 1).padStart(2, '0')}${hoje.getFullYear()}`;
            let nomeArquivo = `${baseNomeArquivo}.pdf`;

            // Garante nome único adicionando _1, _2, etc.
            if (window.relatoriosGerados) {
                let contador = 1;
                while (window.relatoriosGerados.some(r => r.nome === nomeArquivo)) {
                    nomeArquivo = `${baseNomeArquivo}_${contador}.pdf`;
                    contador++;
                }
            }

            doc.save(nomeArquivo); // (mantém para baixar na hora)

            var blob = doc.output('blob');
            var blobUrl = URL.createObjectURL(blob);
            if (window.adicionarRelatorio) {
                window.adicionarRelatorio({
                    id: Date.now(),
                    nome: nomeArquivo,
                    dataCriacao: new Date(),
                    periodo: (filtros.dataInicio && filtros.dataFim)
                        ? (filtros.dataInicio === filtros.dataFim
                            ? formatarDataBR(filtros.dataInicio)
                            : `${formatarDataBR(filtros.dataInicio)} - ${formatarDataBR(filtros.dataFim)}`)
                        : formatarDataBR(new Date().toISOString().slice(0, 10)),
                    blobUrl
                });
            }
        };
    }

    if (todosVazios) {
        fetch('/produtos')
            .then(res => res.json())
            .then(produtos => gerarPDF(produtos, filtros))
            .catch(() => {
                Swal.fire('Erro', 'Falha ao gerar relatório.', 'error');
            });
    } else {
        fetch('/produtos/filtrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filtros)
        })
        .then(res => res.json())
        .then(produtos => gerarPDF(produtos, filtros))
        .catch(() => {
            Swal.fire('Erro', 'Falha ao gerar relatório.', 'error');
        });
    }
}

function limparFiltros() {
    document.querySelectorAll(
        '#filter-categoria, #filter-tamanho, #filter-genero, #filter-preco, #filter-data-inicio, #filter-data-fim'
    ).forEach(el => el.value = '');
}

document.getElementById('filter-data-fim').addEventListener('input', function() {
    const dataInicio = document.getElementById('filter-data-inicio');
    if (this.value) {
        dataInicio.required = true;
    } else {
        dataInicio.required = false;
    }
});