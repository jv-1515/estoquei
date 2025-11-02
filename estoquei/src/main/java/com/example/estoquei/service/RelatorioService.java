package com.example.estoquei.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.estoquei.dto.FiltroRelatorioDTO;
import com.example.estoquei.model.Produto;
import com.example.estoquei.repository.MovimentacaoProdutoRepository;
import com.example.estoquei.repository.MovimentacaoProdutoRepositoryCustomImpl;
import com.example.estoquei.repository.ProdutoRepository;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPCellEvent;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfPageEventHelper;
import com.itextpdf.text.pdf.PdfWriter;

@Service
public class RelatorioService {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private MovimentacaoProdutoRepository movimentacaoProdutoRepository;

    @Autowired
    private MovimentacaoProdutoRepositoryCustomImpl movimentacaoProdutoRepositoryCustom;

    public byte[] gerarPDFProdutos(FiltroRelatorioDTO filtro) {
        List<Produto> produtos;
        if (filtro.getIds() == null || filtro.getIds().isEmpty()) {
            produtos = produtoRepository.findAll();
        } else {
            produtos = produtoRepository.findAllById(filtro.getIds());
        }
        // Filtrar por categoria
        if (filtro.getCategorias() != null && !filtro.getCategorias().isEmpty()) {
            produtos = produtos.stream()
                .filter(p -> p.getCategoria() != null && filtro.getCategorias().contains(p.getCategoria()))
                .collect(Collectors.toList());
        }
        // Filtrar por tamanho
        if (filtro.getTamanhos() != null && !filtro.getTamanhos().isEmpty()) {
            produtos = produtos.stream()
                .filter(p -> filtro.getTamanhos().contains(p.getTamanho()))
                .collect(Collectors.toList());
        }
        // Filtrar por gênero
        if (filtro.getGeneros() != null && !filtro.getGeneros().isEmpty()) {
            produtos = produtos.stream()
                .filter(p -> filtro.getGeneros().contains(p.getGenero()))
                .collect(Collectors.toList());
        }
        // Faixa de quantidade
        if (filtro.getQuantidadeMin() != null) {
            produtos = produtos.stream()
                .filter(p -> p.getQuantidade() >= filtro.getQuantidadeMin())
                .collect(Collectors.toList());
        }
        if (filtro.getQuantidadeMax() != null) {
            produtos = produtos.stream()
                .filter(p -> p.getQuantidade() <= filtro.getQuantidadeMax())
                .collect(Collectors.toList());
        }
        // Baixo estoque
        if (Boolean.TRUE.equals(filtro.getBaixoEstoque())) {
            produtos = produtos.stream()
                .filter(p -> p.getQuantidade() <= p.getLimiteMinimo())
                .collect(Collectors.toList());
        }

        // Geração do PDF
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4.rotate(), 28, 28, 28, 28); 
            PdfWriter writer = PdfWriter.getInstance(doc, baos);
            writer.setPageEvent(new PaginacaoEvento());
            doc.open();

            // Logo
            try {
                Image logo = Image.getInstance(getClass().getResource("/static/images/logo_icon.png"));
                logo.scaleAbsolute(30, 30);
                logo.setAbsolutePosition(doc.right() - doc.rightMargin(), doc.top() - doc.topMargin());
                doc.add(logo);
            } catch (Exception e) {
                try {
                    Image logo = Image.getInstance("images/logo_icon.png");
                    logo.scaleAbsolute(30, 30);
                    logo.setAbsolutePosition(doc.right() - doc.rightMargin(), doc.top() - doc.topMargin());
                    doc.add(logo);
                } catch (Exception ex) {}
            }

            // Título
            String periodo = filtro.getFiltrosAplicados() != null ? filtro.getFiltrosAplicados().getOrDefault("periodo", "") : "";
            Font fontTitulo = new Font(Font.FontFamily.HELVETICA, 22, Font.BOLD, new BaseColor(0x27, 0x75, 0x80));
            Paragraph titulo = new Paragraph("Relatório de Desempenho" + (periodo.isEmpty() ? "" : " (" + periodo + ")"), fontTitulo);
            titulo.setSpacingBefore(5);
            titulo.setSpacingAfter(2);
            doc.add(titulo);

            // Data de emissão
            Font fontData = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, new BaseColor(51,51,51));
            Paragraph data = new Paragraph("Data de emissão: " + java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")), fontData);
            data.setSpacingAfter(5);
            doc.add(data);

            // Filtros aplicados
            StringBuilder filtrosStr = new StringBuilder();
            if (filtro.getFiltrosAplicados() != null && !filtro.getFiltrosAplicados().isEmpty()) {
                filtrosStr.append("Período: ").append(filtro.getFiltrosAplicados().getOrDefault("periodo", "Todos")).append("   ");
                filtrosStr.append("Produtos: ").append(filtro.getFiltrosAplicados().getOrDefault("produtos", "Todos")).append("   ");
                filtrosStr.append("Categorias: ").append(filtro.getFiltrosAplicados().getOrDefault("categorias", "Todas")).append("   ");
                filtrosStr.append("Tamanhos: ").append(filtro.getFiltrosAplicados().getOrDefault("tamanhos", "Todos")).append("   ");
                filtrosStr.append("Gêneros: ").append(filtro.getFiltrosAplicados().getOrDefault("generos", "Todos")).append("   ");
                filtrosStr.append("Quantidades: ").append(filtro.getFiltrosAplicados().getOrDefault("quantidade", "Todas")).append("   ");
                filtrosStr.append("Preços: ").append(filtro.getFiltrosAplicados().getOrDefault("preco", "Todos")).append("   ");
            } else {
                if (filtro.getCategorias() != null && !filtro.getCategorias().isEmpty()) {
                    filtrosStr.append("Categorias: ").append(String.join(", ", filtro.getCategorias())).append("   ");
                }
                if (filtro.getTamanhos() != null && !filtro.getTamanhos().isEmpty()) {
                    filtrosStr.append("Tamanhos: ").append(String.join(", ", filtro.getTamanhos())).append("   ");
                }
                if (filtro.getGeneros() != null && !filtro.getGeneros().isEmpty()) {
                    filtrosStr.append("Gêneros: ").append(String.join(", ", filtro.getGeneros())).append("   ");
                }
                if (filtro.getQuantidadeMin() != null || filtro.getQuantidadeMax() != null) {
                    filtrosStr.append("Quantidades: ");
                    if (filtro.getQuantidadeMin() != null) {
                        filtrosStr.append(filtro.getQuantidadeMin());
                    }
                    filtrosStr.append(" até ");
                    if (filtro.getQuantidadeMax() != null) {
                        filtrosStr.append(filtro.getQuantidadeMax());
                    }
                    filtrosStr.append("   ");
                }
                if (filtro.getPrecoMin() != null || filtro.getPrecoMax() != null) {
                    filtrosStr.append("Preços: ");
                    if (filtro.getPrecoMin() != null) {
                        filtrosStr.append("de ").append(formatarPreco(filtro.getPrecoMin()));
                    }
                    filtrosStr.append(" até ");
                    if (filtro.getPrecoMax() != null) {
                        filtrosStr.append(formatarPreco(filtro.getPrecoMax()));
                    }
                    filtrosStr.append("   ");
                }
                if (Boolean.TRUE.equals(filtro.getBaixoEstoque())) {
                    filtrosStr.append("Baixo Estoque: Sim   ");
                }
            }

            // Monta os filtros com negrito e separados por "|"
            java.util.List<Chunk> filtroChunks = new java.util.ArrayList<>();
            Font fontNegrito = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, new BaseColor(51,51,51));
            Font fontNormal = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL, new BaseColor(51,51,51));

            String[] chaves = {"Produtos", "Categorias", "Tamanhos", "Gêneros", "Quantidades", "Preços"};
            String[] campos = {"produtos", "categorias", "tamanhos", "generos", "quantidade", "preco"};
            for (int i = 0; i < chaves.length; i++) {
                String valor = filtro.getFiltrosAplicados() != null ? filtro.getFiltrosAplicados().getOrDefault(campos[i], "") : "";
                if (!valor.isEmpty()) {
                    if (!filtroChunks.isEmpty()) filtroChunks.add(new Chunk(" | ", fontNormal));
                    filtroChunks.add(new Chunk(chaves[i] + ": ", fontNegrito));
                    filtroChunks.add(new Chunk(valor, fontNormal));
                }
            }
            Paragraph filtrosPar = new Paragraph();
            for (Chunk c : filtroChunks) filtrosPar.add(c);
            filtrosPar.setSpacingAfter(10);
            doc.add(filtrosPar);

            // Cor do cabeçalho (usar sempre a mesma)
            BaseColor azulCabecalho = new BaseColor(39,117,128);

            // 1. Tabela geral
            PdfPTable table = new PdfPTable(14);
                        table.setWidths(new float[]{
                60f,   // Código (9 dígitos)
                100f,  // Nome (grande)
                70f,   // Categoria
                55f,   // Tamanho (Único)
                60f,   // Gênero
                55f,   // Preço (R$)
                50f,   // Estoque
                55f,   // Limite Mínimo
                70f,   // Última Entrada
                55f,   // Entradas
                70f,   // Última Saída
                55f,   // Saídas
                55f,   // Balanço
                75f    // Saldo (R$)
            });
            table.setWidthPercentage(100);
            table.setHeaderRows(1);

            String[] headers = {"Código","Nome","Categoria","Tamanho","Gênero","Preço (R$)","Estoque","Limite Mínimo","Última Entrada","Entradas","Última Saída","Saídas","Balanço","Saldo (R$)"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(h, new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.WHITE)));
                cell.setBackgroundColor(azulCabecalho);
                cell.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
                cell.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
                cell.setPadding(4f);
                cell.setBorderWidth(0);
                cell.setBorderWidthLeft(1f);
                cell.setBorderColor(BaseColor.WHITE);
                table.addCell(cell);
            }

            Font fontEntradas = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, new BaseColor(255,87,34));
            Font fontSaidas   = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, new BaseColor(67,176,74));
            
            // Linhas alternadas
            boolean zebra = false;
            for (Produto p : produtos) {
                BaseColor bg = zebra ? new BaseColor(241,241,241) : BaseColor.WHITE;
                zebra = !zebra;

                table.addCell(celula(p.getCodigo(), bg, true));
                table.addCell(celula(capitalize(p.getNome()), bg, false));
                table.addCell(celula(capitalize(p.getCategoria() != null ? p.getCategoria() : ""), bg, false));
                table.addCell(celula(p.getTamanho() != null ? formatarTamanho(p.getTamanho().toString()) : "", bg, true));
                table.addCell(celula(capitalize(p.getGenero() != null ? p.getGenero().toString() : ""), bg, false));
                table.addCell(celula(formatarPreco(p.getPreco()), bg, false, PdfPCell.ALIGN_RIGHT));
                String qtdStr = String.valueOf(p.getQuantidade());
                Font fontQtd = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.BLACK);
                if (p.getQuantidade() == 0 || p.getQuantidade() < p.getLimiteMinimo()) {
                    qtdStr += "";
                    fontQtd = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.RED);
                }
                PdfPCell cellQtd = new PdfPCell(new Paragraph(qtdStr, fontQtd));
                cellQtd.setBackgroundColor(bg);
                cellQtd.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
                cellQtd.setBorderColor(new BaseColor(220,220,220));
                table.addCell(cellQtd);
                table.addCell(celula(String.valueOf(p.getLimiteMinimo()), bg, true));

                LocalDate ultimaEntrada = movimentacaoProdutoRepositoryCustom.buscarUltimaEntrada(p.getCodigo());
                table.addCell(celula(formatarData(ultimaEntrada), bg, true));
                int entradas = movimentacaoProdutoRepositoryCustom.totalEntradas(p.getCodigo());
                // PdfPCell cellEntradas = new PdfPCell(new Paragraph(String.valueOf(entradas), fontEntradas));
                // cellEntradas.setBackgroundColor(bg);
                // cellEntradas.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
                // cellEntradas.setBorderWidth(0f);
                // table.addCell(cellEntradas);
                PdfPCell cellEntradas = new PdfPCell(new Paragraph(String.valueOf(entradas), fontEntradas));
                cellEntradas.setBackgroundColor(bg);
                cellEntradas.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
                cellEntradas.setBorderColor(new BaseColor(220,220,220));
                table.addCell(cellEntradas);

                LocalDate ultimaSaida = movimentacaoProdutoRepositoryCustom.buscarUltimaSaida(p.getCodigo());
                String ultimaSaidaStr = ultimaSaida != null ? formatarData(ultimaSaida) : "-";
                table.addCell(celula(ultimaSaidaStr, bg, true));
                int saidas = movimentacaoProdutoRepositoryCustom.totalSaidas(p.getCodigo());
                PdfPCell cellSaidas;
                if (saidas == 0) {
                    cellSaidas = new PdfPCell(new Paragraph("-"));
                } else {
                    cellSaidas = new PdfPCell(new Paragraph(String.valueOf(saidas), fontSaidas));
                }
                cellSaidas.setBackgroundColor(bg);
                cellSaidas.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
                cellSaidas.setBorderColor(new BaseColor(220,220,220));
                table.addCell(cellSaidas);

                // Balanço: entradas - saídas
                int balanco = entradas - saidas;
                Font fontBalanco = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL);
                PdfPCell cellBalanco = new PdfPCell(new Paragraph(String.valueOf(Math.abs(balanco)), fontBalanco));
                cellBalanco.setBackgroundColor(bg);
                cellBalanco.setBorderColor(new BaseColor(220,220,220));
                cellBalanco.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
                table.addCell(cellBalanco);

                // Saldo: valorSaidas - valorEntradas
                double valorEntradas = movimentacaoProdutoRepositoryCustom.totalValorEntradas(p.getCodigo());
                double valorSaidas = movimentacaoProdutoRepositoryCustom.totalValorSaidas(p.getCodigo());
                double saldo = valorSaidas - valorEntradas;
                BaseColor corSaldo = saldo > 0 ? new BaseColor(67,176,74) : saldo < 0 ? new BaseColor(255,87,34) : new BaseColor(180,180,180);
                Font fontSaldo = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, corSaldo);
                PdfPCell cellSaldo = new PdfPCell(new Paragraph(formatarValorMonetario(saldo), fontSaldo));
                cellSaldo.setBackgroundColor(bg);
                cellSaldo.setBorderColor(new BaseColor(220,220,220));
                cellSaldo.setHorizontalAlignment(PdfPCell.ALIGN_RIGHT);
                table.addCell(cellSaldo);
            }

            Font fontResumo = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, new BaseColor(0x27, 0x75, 0x80));
            Paragraph tituloResumo = new Paragraph("Resumo por produto", fontResumo);
            tituloResumo.setSpacingBefore(10);
            tituloResumo.setSpacingAfter(8);
            doc.add(tituloResumo);

            doc.add(table);
            // Totais
            int totalEntradas = produtos.stream()
                .mapToInt(p -> movimentacaoProdutoRepositoryCustom.totalEntradas(p.getCodigo()))
                .sum();
            int totalSaidas = produtos.stream()
                .mapToInt(p -> movimentacaoProdutoRepositoryCustom.totalSaidas(p.getCodigo()))
                .sum();
            double totalSaldo = produtos.stream()
                .mapToDouble(p -> movimentacaoProdutoRepositoryCustom.totalValorSaidas(p.getCodigo())
                               - movimentacaoProdutoRepositoryCustom.totalValorEntradas(p.getCodigo()))
                .sum();

            // Cores
            BaseColor corLaranja = new BaseColor(255,87,34);
            BaseColor corVerde   = new BaseColor(67,176,74);
            BaseColor corAzul    = new BaseColor(0x27, 0x75, 0x80); // neutra (para saldo = 0)

            // Apenas os NÚMEROS coloridos
            Font fontLabelNeutra     = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, new BaseColor(51,51,51));
            Font fontNumeroLaranja   = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, corLaranja);
            Font fontNumeroVerde     = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, corVerde);
            Font fontNumeroSaldo     = totalSaldo > 0
                ? new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, corVerde)
                : totalSaldo < 0
                    ? new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, corLaranja)
                    : new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, corAzul);

            // Legenda (labels neutros, SOMENTE números coloridos)
            Paragraph legenda = new Paragraph();
            legenda.add(new Chunk("Entradas: ", fontLabelNeutra));
            legenda.add(new Chunk(String.format("%,d", totalEntradas), fontNumeroLaranja));
            legenda.add(new Chunk("   Saídas: ", fontLabelNeutra));
            legenda.add(new Chunk(String.format("%,d", totalSaidas), fontNumeroVerde));
            legenda.add(new Chunk("   Saldo (R$): ", fontLabelNeutra));
            String saldoStr = (totalSaldo < 0 ? "-" : "") + formatarValorMonetario(totalSaldo);
            legenda.add(new Chunk(saldoStr, fontNumeroSaldo));
            legenda.setSpacingBefore(8);
            legenda.setSpacingAfter(12);
            doc.add(legenda);

            // Mantém referências usadas abaixo (acima do gráfico)
            // Aqui reutilizamos as fontes dos números para manter a cor coerente
            Font fontLegendaLaranja = fontNumeroLaranja;
            Font fontLegendaVerde   = fontNumeroVerde;
            Font fontLegendaAzul    = fontNumeroSaldo;


            
        // ...antes de adicionar o gráfico...
        if (filtro.getGraficoBase64() != null && !filtro.getGraficoBase64().isEmpty()) {
            // Adiciona os totais acima do gráfico, se poucos dados
            if (produtos.size() <= 5) { // ou outro critério de "poucos dados"
                Paragraph totaisGrafico = new Paragraph();
                totaisGrafico.add(new Chunk("Entradas: " + String.format("%,d", totalEntradas), fontLegendaLaranja));
                totaisGrafico.add(new Chunk("   Saídas: " + String.format("%,d", totalSaidas), fontLegendaVerde));
                totaisGrafico.add(new Chunk("   Saldo: R$ " + String.format("%,.2f", totalSaldo).replace('.',','), fontLegendaAzul));
                totaisGrafico.setSpacingBefore(4);
                totaisGrafico.setSpacingAfter(2);
                doc.add(totaisGrafico);
            }
            // ...segue para adicionar o gráfico...
        }

            // Gráfico - nova seção após a tabela
            Font fontH2Grafico = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, new BaseColor(0x27, 0x75, 0x80));
            Paragraph h2Grafico = new Paragraph("Movimentações do período", fontH2Grafico);
            h2Grafico.setSpacingBefore(10);
            h2Grafico.setSpacingAfter(2);
            
            if (filtro.getGraficoBase64() != null && !filtro.getGraficoBase64().isEmpty()) {
                byte[] imgBytes = java.util.Base64.getDecoder().decode(
                    filtro.getGraficoBase64().replace("data:image/png;base64,", "")
                );
                try {
                    Image graficoImg = Image.getInstance(imgBytes);
                    graficoImg.scaleToFit(800, 350);
                    graficoImg.setAlignment(Image.ALIGN_CENTER);
            
                    // AGRUPA EM UMA TABELA PARA NÃO QUEBRAR ENTRE PÁGINAS
                    PdfPTable blocoGrafico = new PdfPTable(1);
                    blocoGrafico.setWidthPercentage(100);
            
                    PdfPCell cellTitulo = new PdfPCell(h2Grafico);
                    cellTitulo.setBorder(Rectangle.NO_BORDER);
                    cellTitulo.setHorizontalAlignment(Element.ALIGN_LEFT);
            
                    PdfPCell cellGrafico = new PdfPCell(graficoImg, true);
                    cellGrafico.setBorder(Rectangle.NO_BORDER);
                    cellGrafico.setHorizontalAlignment(Element.ALIGN_CENTER);
            
                    blocoGrafico.addCell(cellTitulo);
                    blocoGrafico.addCell(cellGrafico);
            
                    blocoGrafico.setKeepTogether(true);
            
                    doc.add(blocoGrafico);
                } catch (java.io.IOException | com.itextpdf.text.BadElementException e) {
                    e.printStackTrace();
                    doc.add(new Paragraph("Erro ao inserir gráfico no relatório."));
                }
            }

            if (filtro.getGraficoSaldoBase64() != null && !filtro.getGraficoSaldoBase64().isEmpty()) {
                Font fontH2GraficoSaldo = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, new BaseColor(0x27, 0x75, 0x80));
                Paragraph h2GraficoSaldo = new Paragraph("Transações do período", fontH2GraficoSaldo);
                h2GraficoSaldo.setSpacingBefore(10);
                h2GraficoSaldo.setSpacingAfter(2);

                byte[] imgBytesSaldo = java.util.Base64.getDecoder().decode(
                    filtro.getGraficoSaldoBase64().replace("data:image/png;base64,", "")
                );
                try {
                    Image graficoSaldoImg = Image.getInstance(imgBytesSaldo);
                    graficoSaldoImg.scaleToFit(800, 350);
                    graficoSaldoImg.setAlignment(Image.ALIGN_CENTER);

                    PdfPTable blocoGraficoSaldo = new PdfPTable(1);
                    blocoGraficoSaldo.setWidthPercentage(100);

                    PdfPCell cellTituloSaldo = new PdfPCell(h2GraficoSaldo);
                    cellTituloSaldo.setBorder(Rectangle.NO_BORDER);
                    cellTituloSaldo.setHorizontalAlignment(Element.ALIGN_LEFT);

                    PdfPCell cellGraficoSaldo = new PdfPCell(graficoSaldoImg, true);
                    cellGraficoSaldo.setBorder(Rectangle.NO_BORDER);
                    cellGraficoSaldo.setHorizontalAlignment(Element.ALIGN_CENTER);

                    blocoGraficoSaldo.addCell(cellTituloSaldo);
                    blocoGraficoSaldo.addCell(cellGraficoSaldo);

                    blocoGraficoSaldo.setKeepTogether(true);

                    doc.add(blocoGraficoSaldo);
                } catch (java.io.IOException | com.itextpdf.text.BadElementException e) {
                    e.printStackTrace();
                    doc.add(new Paragraph("Erro ao inserir gráfico de saldo no relatório."));
                }
            }

            
            // 2. Para cada produto, nova página com detalhamento
            for (Produto p : produtos) {
                doc.newPage();

                // Título com código e nome do produto
                Font fontH2 = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, new BaseColor(0x27, 0x75, 0x80));
                Paragraph h2 = new Paragraph(p.getCodigo() + " - " + p.getNome(), fontH2);
                h2.setSpacingBefore(10);
                h2.setSpacingAfter(2);
                doc.add(h2);

                // Informações do produto
                Font fontLabel = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL, new BaseColor(51,51,51));
                Paragraph detalhes = new Paragraph();
                detalhes.add(new Chunk("Categoria: ", fontNegrito));
                detalhes.add(new Chunk(capitalize(p.getCategoria() != null ? p.getCategoria() : "-"), fontLabel));
                detalhes.add(new Chunk(" | Tamanho: ", fontNegrito));
                detalhes.add(new Chunk(p.getTamanho() != null ? formatarTamanho(p.getTamanho().toString()) : "-", fontLabel));
                detalhes.add(new Chunk(" | Gênero: ", fontNegrito));
                detalhes.add(new Chunk(capitalize(p.getGenero() != null ? p.getGenero().toString() : "-"), fontLabel));
                detalhes.add(new Chunk(" | Preço: ", fontNegrito));
                detalhes.add(new Chunk(formatarPreco(p.getPreco()), fontLabel));
                detalhes.add(new Chunk(" | Estoque Atual: ", fontNegrito));
                detalhes.add(new Chunk(String.valueOf(p.getQuantidade()), fontLabel));
                doc.add(detalhes);
                doc.add(new Paragraph(" "));

                // Busca o histórico do produto (mais recente para mais antigo)
                List<com.example.estoquei.model.MovimentacaoProduto> historico =
                    movimentacaoProdutoRepository.findByCodigoProdutoOrderByDataDesc(p.getCodigo());

                // Filtra por data, se os parâmetros forem fornecidos
                if (filtro.getDataInicio() != null && !filtro.getDataInicio().isEmpty() && filtro.getDataFim() != null && !filtro.getDataFim().isEmpty()) {
                    LocalDate ini = LocalDate.parse(filtro.getDataInicio());
                    LocalDate fim = LocalDate.parse(filtro.getDataFim());
                    historico = historico.stream()
                        .filter(m -> !m.getData().isBefore(ini) && !m.getData().isAfter(fim))
                        .collect(Collectors.toList());
                }

                // Monta tabela do histórico
                PdfPTable histTable = new PdfPTable(8);
                histTable.setWidthPercentage(100);
                histTable.setHeaderRows(1);
                histTable.setWidths(new float[]{40f, 60f, 60f, 40f, 60f, 60f, 90f, 90f});

                Font fontHistCab = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.WHITE);
                String[] histHeaders = {"Data","Movimentação","Código","Quantidade","Estoque Final","Valor (R$)","Parte Envolvida","Responsável"};
                for (String h : histHeaders) {
                    PdfPCell cell = new PdfPCell(new Paragraph(h, fontHistCab));
                    cell.setBackgroundColor(azulCabecalho);
                    cell.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
                    cell.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
                    cell.setPadding(4f);
                    cell.setBorderWidth(0);
                    cell.setBorderWidthLeft(1f);
                    cell.setBorderColor(BaseColor.WHITE);
                    histTable.addCell(cell);
                }

                // Corpo
                boolean zebraHist = false;
                for (com.example.estoquei.model.MovimentacaoProduto m : historico) {
                    BaseColor bg = zebraHist ? new BaseColor(241,241,241) : BaseColor.WHITE;
                    zebraHist = !zebraHist;

                    histTable.addCell(celula(formatarData(m.getData()), bg, true));

                    // Tag colorida para movimentação
                    String tipo = m.getTipoMovimentacao();
                    Font fontTag = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, tipo.equals("ENTRADA") ? new BaseColor(255,87,34) : new BaseColor(67,176,74));
                    PdfPCell tagCell = new PdfPCell(new Paragraph(tipo.equals("ENTRADA") ? "Entrada" : "Saída", fontTag));
                    tagCell.setBackgroundColor(bg);
                    tagCell.setBorderColor(new BaseColor(220,220,220));
                    tagCell.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
                    tagCell.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
                    tagCell.setPadding(4);
                    histTable.addCell(tagCell);

                    histTable.addCell(celula(m.getCodigoMovimentacao() != null ? m.getCodigoMovimentacao() : "-", bg, true));
                    
                    // Quantidade
                    Font fontQtdHist = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.BLACK);
                    if (m.getQuantidadeMovimentada() == 0) {
                        fontQtdHist = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.RED);
                    }
                    PdfPCell cellQtdHist = new PdfPCell(new Paragraph(String.valueOf(m.getQuantidadeMovimentada()), fontQtdHist));
                    cellQtdHist.setBackgroundColor(bg);
                    cellQtdHist.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
                    cellQtdHist.setBorderColor(new BaseColor(220,220,220));
                    histTable.addCell(cellQtdHist);

                    // Estoque Final
                    Font fontEstoqueFinal = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.BLACK);
                    if (m.getEstoqueFinal() == 0) {
                        fontEstoqueFinal = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, BaseColor.RED);
                    }
                    PdfPCell cellEstoqueFinal = new PdfPCell(new Paragraph(String.valueOf(m.getEstoqueFinal()), fontEstoqueFinal));
                    cellEstoqueFinal.setBackgroundColor(bg);
                    cellEstoqueFinal.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
                    cellEstoqueFinal.setBorderColor(new BaseColor(220,220,220));
                    histTable.addCell(cellEstoqueFinal);

                    histTable.addCell(celula(m.getValorMovimentacao() != null ? formatarValorMonetario(m.getValorMovimentacao().doubleValue(), 0) : "", bg, true, PdfPCell.ALIGN_CENTER));
                    histTable.addCell(celula(m.getParteEnvolvida() != null ? m.getParteEnvolvida() : "-", bg, false));

                    // Só o responsável fica alinhado à esquerda:
                    String resp = m.getResponsavel();
                    if (resp != null && resp.contains("-")) {
                        String[] partes = resp.split("-");
                        String codigo = partes[0].trim();
                        String nome = partes.length > 1 ? partes[1].trim() : "";
                        String[] nomes = nome.split("\\s+");
                        nome = nomes.length == 1 ? nomes[0] : nomes[0] + " " + nomes[nomes.length - 1];
                        resp = codigo + " - " + nome;
                    }
                    histTable.addCell(celula(resp != null ? resp : "-", bg, false));
                }

                int entradas = movimentacaoProdutoRepositoryCustom.totalEntradas(p.getCodigo());
                int saidas = movimentacaoProdutoRepositoryCustom.totalSaidas(p.getCodigo());
                double saldo = movimentacaoProdutoRepositoryCustom.totalValorSaidas(p.getCodigo()) - movimentacaoProdutoRepositoryCustom.totalValorEntradas(p.getCodigo());
                
                Paragraph legendaProduto = new Paragraph();
                legendaProduto.add(new Chunk("Entradas: ", fontLabelNeutra));
                legendaProduto.add(new Chunk(String.format("%,d", entradas), fontNumeroLaranja));
                legendaProduto.add(new Chunk("   Saídas: ", fontLabelNeutra));
                legendaProduto.add(new Chunk(String.format("%,d", saidas), fontNumeroVerde));
                legendaProduto.add(new Chunk("   Saldo (R$): ", fontLabelNeutra));
                legendaProduto.add(new Chunk(formatarValorMonetario(saldo), fontNumeroSaldo));
                legendaProduto.setSpacingBefore(8);
                legendaProduto.setSpacingAfter(12);

                doc.add(histTable);
                doc.add(legendaProduto);
            }


            doc.close();
            return baos.toByteArray();
        } catch (DocumentException e) {
            e.printStackTrace();
            return new byte[0];
        }
    }

    private String formatarValorMonetario(double valor) {
        return formatarValorMonetario(valor, 0);
    }

    private String formatarValorMonetario(double valor, int balanco) {
        java.text.DecimalFormat df = new java.text.DecimalFormat("#,##0.00");
        java.text.DecimalFormatSymbols symbols = new java.text.DecimalFormatSymbols();
        symbols.setDecimalSeparator(',');
        symbols.setGroupingSeparator('.');
        df.setDecimalFormatSymbols(symbols);
        String formatted = df.format(Math.abs(valor));
        String sinal = balanco > 0 ? "+" : balanco < 0 ? "-" : "";
        return sinal + formatted;
    }

    // Função para capitalizar
    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return "";
        return s.substring(0,1).toUpperCase() + s.substring(1).toLowerCase();
    }

    // Função para formatar preço
    private String formatarPreco(java.math.BigDecimal preco) {
        if (preco == null) return "";
        return preco.setScale(2, java.math.RoundingMode.HALF_UP).toString().replace('.', ',');
    }

    // Função para formatar tamanho (igual estoque)
    private String formatarTamanho(String tamanho) {
        if (tamanho == null) return "";
        if (tamanho.equals("ÚNICO")) return "Único";
        if (tamanho.startsWith("_")) return tamanho.substring(1);
        return tamanho;
    }

    // Função para formatar data
    private String formatarData(java.time.LocalDate data) {
        if (data == null) return "";
        return data.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yy"));
    }

    // Função utilitária para célula colorida
    private PdfPCell celula(String texto, BaseColor bg, boolean alinhadoCentro) {
        return celula(texto, bg, alinhadoCentro, alinhadoCentro ? PdfPCell.ALIGN_CENTER : PdfPCell.ALIGN_LEFT);
    }
    
    private PdfPCell celula(String texto, BaseColor bg, boolean alinhadoCentro, int alinhamento) {
        PdfPCell cell = new PdfPCell(new Paragraph(texto, new Font(Font.FontFamily.HELVETICA, 9)));
        cell.setBackgroundColor(bg);
        cell.setPadding(4);
        cell.setBorderColor(new BaseColor(220,220,220));
        cell.setHorizontalAlignment(alinhamento);
        return cell;
    }
}

// Classe utilitária para borda arredondada nas tags
class RoundedCellEvent implements PdfPCellEvent {
    private final float radius;
    public RoundedCellEvent(float radius) { this.radius = radius; }
    @Override
    public void cellLayout(PdfPCell cell, Rectangle rect, PdfContentByte[] canvas) {
        PdfContentByte cb = canvas[PdfPTable.BACKGROUNDCANVAS];
        cb.roundRectangle(rect.getLeft(), rect.getBottom(), rect.getWidth(), rect.getHeight(), radius);
        cb.stroke();
    }
}

// Evento para numeração de páginas
class PaginacaoEvento extends PdfPageEventHelper {
    private int totalPaginas = 0;

    @Override
    public void onEndPage(PdfWriter writer, Document document) {
        int paginaAtual = writer.getPageNumber();
        String texto = "Página " + paginaAtual;
        Font font = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, BaseColor.DARK_GRAY);
        float x = (document.right() + document.left()) / 2;
        float y = document.bottom() - 10;
        com.itextpdf.text.pdf.ColumnText.showTextAligned(
            writer.getDirectContent(),
            com.itextpdf.text.Element.ALIGN_CENTER,
            new Phrase(texto, font),
            x, y, 0
        );
    }
}