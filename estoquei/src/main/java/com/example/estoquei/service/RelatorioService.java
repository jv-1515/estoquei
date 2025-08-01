package com.example.estoquei.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.estoquei.dto.FiltroRelatorioDTO;
import com.example.estoquei.model.Produto;
import com.example.estoquei.repository.ProdutoRepository;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;

@Service
public class RelatorioService {

    @Autowired
    private ProdutoRepository produtoRepository;

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
}