package com.example.estoquei.service;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.estoquei.model.MovimentacaoProduto;
import com.example.estoquei.model.Produto;
import com.example.estoquei.repository.MovimentacaoProdutoRepository;

@Service
public class MovimentacaoService {
    
    @Autowired
    private MovimentacaoProdutoRepository movimentacaoRepo;
    
    // MÉTODO UNIFICADO PARA ENTRADAS
    public void registrarEntrada(String codigoCompra, int quantidade, BigDecimal valorCompra, String fornecedor, Produto produto) {
        MovimentacaoProduto movimentacao = new MovimentacaoProduto(
            LocalDate.now(),
            produto.getCodigo(),
            produto.getNome(),
            produto.getCategoria(),
            produto.getTamanho(),
            produto.getGenero(),
            "ENTRADA",
            codigoCompra,
            quantidade,
            produto.getQuantidade(),
            valorCompra,
            fornecedor
        );
        movimentacaoRepo.save(movimentacao);
    }
    
    // MÉTODO UNIFICADO PARA SAÍDAS
    public void registrarSaida(String codigoVenda, int quantidade, BigDecimal valorVenda, String comprador, Produto produto) {
        MovimentacaoProduto movimentacao = new MovimentacaoProduto(
            LocalDate.now(),
            produto.getCodigo(),
            produto.getNome(),
            produto.getCategoria(),
            produto.getTamanho(),
            produto.getGenero(),
            "SAIDA",
            codigoVenda,
            quantidade,
            produto.getQuantidade(),
            valorVenda,
            comprador
        );
        movimentacaoRepo.save(movimentacao);
    }
}