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
                String logoPath = "src/main/resources/static/images/logo_icon.png";
                Image logo = Image.getInstance(logoPath);
                logo.scaleAbsolute(32, 32);
                logo.setAlignment(Image.ALIGN_LEFT);
                doc.add(logo);
            } catch (Exception e) {}

            // Título
            Font fontTitulo = new Font(Font.FontFamily.HELVETICA, 22, Font.BOLD, new BaseColor(0x27, 0x75, 0x80));
            Paragraph titulo = new Paragraph("Relatório de Desempenho", fontTitulo);
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

            String[] chaves = {"Período", "Produtos", "Categorias", "Tamanhos", "Gêneros", "Quantidades", "Preços"};
            String[] campos = {"periodo", "produtos", "categorias", "tamanhos", "generos", "quantidade", "preco"};
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
            BaseColor azulCabecalho = new BaseColor(30,148,163);

            // 1. Tabela geral
            PdfPTable table = new PdfPTable(12);
            table.setWidthPercentage(100);
            table.setHeaderRows(1);

            Font fontCabecalho = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.WHITE);

            String[] headers = {"Código","Nome","Categoria","Tamanho","Gênero","Preço (R$)","Estoque","Limite","Última Entrada","Entradas","Última Saída","Saídas"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(h, fontCabecalho));
                cell.setBackgroundColor(azulCabecalho);
                cell.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
                cell.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
                cell.setPadding(5);
                cell.setBorderWidth(0f);
                table.addCell(cell);
            }

            // Linhas alternadas
            boolean zebra = false;
            for (Produto p : produtos) {
                BaseColor bg = zebra ? new BaseColor(241,241,241) : BaseColor.WHITE;
                zebra = !zebra;

                table.addCell(celula(p.getCodigo(), bg, true));
                table.addCell(celula(capitalize(p.getNome()), bg, true));
                table.addCell(celula(capitalize(p.getCategoria() != null ? p.getCategoria() : ""), bg, true));
                table.addCell(celula(p.getTamanho() != null ? formatarTamanho(p.getTamanho().toString()) : "", bg, true));
                table.addCell(celula(capitalize(p.getGenero() != null ? p.getGenero().toString() : ""), bg, true));
                table.addCell(celula(formatarPreco(p.getPreco()), bg, true));
                table.addCell(celula(String.valueOf(p.getQuantidade()), bg, true));
                table.addCell(celula(String.valueOf(p.getLimiteMinimo()), bg, true));

                LocalDate ultimaEntrada = movimentacaoProdutoRepositoryCustom.buscarUltimaEntrada(p.getCodigo());
                table.addCell(celula(formatarData(ultimaEntrada), bg, true));
                int entradas = movimentacaoProdutoRepositoryCustom.totalEntradas(p.getCodigo());
                table.addCell(celula(String.valueOf(entradas), bg, true));

                LocalDate ultimaSaida = movimentacaoProdutoRepositoryCustom.buscarUltimaSaida(p.getCodigo());
                table.addCell(celula(formatarData(ultimaSaida), bg, true));
                int saidas = movimentacaoProdutoRepositoryCustom.totalSaidas(p.getCodigo());
                table.addCell(celula(String.valueOf(saidas), bg, true));
            }

            doc.add(table);

            // 2. Para cada produto, nova página com detalhamento
            for (Produto p : produtos) {
                doc.newPage();

                // Título com código e nome do produto
                Font fontH2 = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, new BaseColor(0x27, 0x75, 0x80));
                Paragraph h2 = new Paragraph(p.getNome() + " - " + p.getCodigo(), fontH2);
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

                Font fontHistCab = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.WHITE);
                String[] histHeaders = {"Data","Movimentação","Código","Quantidade","Estoque Final","Valor (R$)","Parte Envolvida","Responsável"};
                for (String h : histHeaders) {
                    PdfPCell cell = new PdfPCell(new Paragraph(h, fontHistCab));
                    cell.setBackgroundColor(azulCabecalho);
                    cell.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
                    cell.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
                    cell.setPadding(5);
                    cell.setBorderWidth(0f);
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
                    Font fontTag = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, tipo.equals("ENTRADA") ? new BaseColor(67,176,74) : new BaseColor(255,87,34));
                    PdfPCell tagCell = new PdfPCell(new Paragraph(tipo.equals("ENTRADA") ? "Entrada" : "Saída", fontTag));
                    tagCell.setBackgroundColor(bg);
                    tagCell.setHorizontalAlignment(PdfPCell.ALIGN_CENTER);
                    tagCell.setVerticalAlignment(PdfPCell.ALIGN_MIDDLE);
                    tagCell.setPadding(4);
                    tagCell.setBorderWidth(1f);
                    tagCell.setBorderColor(new BaseColor(220,220,220));
                    histTable.addCell(tagCell);

                    histTable.addCell(celula(m.getCodigoMovimentacao() != null ? m.getCodigoMovimentacao() : "-", bg, true));
                    histTable.addCell(celula(String.valueOf(m.getQuantidadeMovimentada()), bg, true));
                    histTable.addCell(celula(String.valueOf(m.getEstoqueFinal()), bg, true));
                    histTable.addCell(celula(m.getValorMovimentacao() != null ? formatarPreco(m.getValorMovimentacao()) : "", bg, true));
                    histTable.addCell(celula(m.getParteEnvolvida() != null ? m.getParteEnvolvida() : "-", bg, true));

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
                    histTable.addCell(celula(resp != null ? resp : "-", bg, false)); // responsável alinhado à esquerda
                }

                doc.add(histTable);
            }

            doc.close();
            return baos.toByteArray();
        } catch (DocumentException e) {
            e.printStackTrace();
            return new byte[0];
        }
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
        return String.format("%02d/%02d/%04d", data.getDayOfMonth(), data.getMonthValue(), data.getYear());
    }

    // Função utilitária para célula colorida
    private PdfPCell celula(String texto, BaseColor bg, boolean alinhadoCentro) {
        PdfPCell cell = new PdfPCell(new Paragraph(texto, new Font(Font.FontFamily.HELVETICA, 9)));
        cell.setBackgroundColor(bg);
        cell.setPadding(4);
        cell.setBorderColor(new BaseColor(220,220,220));
        cell.setHorizontalAlignment(alinhadoCentro ? PdfPCell.ALIGN_CENTER : PdfPCell.ALIGN_LEFT);
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