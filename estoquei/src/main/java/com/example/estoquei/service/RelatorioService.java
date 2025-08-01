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
        List<Produto> produtos = produtoRepository.findAllById(filtro.getIds());

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
        if (Boolean.TRUE.equals(filtro.getBaixoEstoque())) {
            produtos = produtos.stream()
                .filter(p -> p.getQuantidade() <= p.getLimiteMinimo())
                .collect(Collectors.toList());
        }

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