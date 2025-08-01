package com.example.estoquei.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.estoquei.dto.FiltroRelatorioDTO;
import com.example.estoquei.model.Produto;
import com.example.estoquei.repository.ProdutoRepository;
import com.example.estoquei.repository.MovimentacaoProdutoRepository;
import com.example.estoquei.repository.MovimentacaoProdutoRepositoryCustomImpl;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;

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
                .filter(p -> filtro.getCategorias().contains(p.getCategoria()))
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

        // Geração do PDF (mantém igual)
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document doc = new Document();
            PdfWriter.getInstance(doc, baos);
            doc.open();

            doc.add(new Paragraph("Relatório de Produtos"));
            doc.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(6); // 6 colunas
            table.addCell("Código");
            table.addCell("Nome");
            table.addCell("Categoria");
            table.addCell("Tamanho");
            table.addCell("Gênero");
            table.addCell("Quantidade");

            for (Produto p : produtos) {
                table.addCell(p.getCodigo());
                table.addCell(p.getNome());
                table.addCell(p.getCategoria() != null ? p.getCategoria().toString() : "");
                table.addCell(p.getTamanho() != null ? p.getTamanho().toString() : "");
                table.addCell(p.getGenero() != null ? p.getGenero().toString() : "");
                table.addCell(String.valueOf(p.getQuantidade()));
            }

            doc.add(table);
            doc.close();
            return baos.toByteArray();
        } catch (DocumentException e) {
            e.printStackTrace();
            return new byte[0];
        }
    }

    public byte[] gerarPDFProdutosDireto(List<Produto> produtos) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4.rotate(), 10, 10, 10, 10);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            doc.add(new Paragraph("Relatório de Produtos"));
            doc.add(new Paragraph(" "));

            // Cabeçalho com todos os campos pedidos
            PdfPTable table = new PdfPTable(12); // 12 colunas
            table.addCell("Código");
            table.addCell("Nome");
            table.addCell("Categoria");
            table.addCell("Tamanho");
            table.addCell("Gênero");
            table.addCell("Preço (R$)");
            table.addCell("Estoque");
            table.addCell("Limite");
            table.addCell("Última Entrada");
            table.addCell("Entradas");
            table.addCell("Última Saída");
            table.addCell("Saídas");

            for (Produto p : produtos) {
                table.addCell(p.getCodigo() != null ? p.getCodigo() : "");
                table.addCell(capitalize(p.getNome()));
                table.addCell(capitalize(p.getCategoria() != null ? p.getCategoria().toString() : ""));
                table.addCell(p.getTamanho() != null ? formatarTamanho(p.getTamanho().toString()) : "");
                table.addCell(capitalize(p.getGenero() != null ? p.getGenero().toString() : ""));
                table.addCell(formatarPreco(p.getPreco()));
                table.addCell(String.valueOf(p.getQuantidade()));
                table.addCell(String.valueOf(p.getLimiteMinimo()));

                LocalDate ultimaEntrada = movimentacaoProdutoRepositoryCustom.buscarUltimaEntrada(p.getCodigo());
                table.addCell(formatarData(ultimaEntrada)); 
                int entradas = movimentacaoProdutoRepositoryCustom.totalEntradas(p.getCodigo());
                table.addCell(String.valueOf(entradas));

                LocalDate ultimaSaida = movimentacaoProdutoRepositoryCustom.buscarUltimaSaida(p.getCodigo());
                table.addCell(formatarData(ultimaSaida));
                int saidas = movimentacaoProdutoRepositoryCustom.totalSaidas(p.getCodigo());
                table.addCell(String.valueOf(saidas));
            }

            doc.add(table);
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
}