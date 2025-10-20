package com.example.estoquei.service;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.estoquei.model.MovimentacaoProduto;
import com.example.estoquei.model.Produto;
import com.example.estoquei.model.Usuario;
import com.example.estoquei.repository.MovimentacaoProdutoRepository;

import jakarta.servlet.http.HttpSession;

@Service
public class MovimentacaoService {
    
    @Autowired
    private MovimentacaoProdutoRepository movimentacaoRepo;
    
    public void registrarEntrada(String codigoCompra, int quantidade, BigDecimal valorCompra, String fornecedor, Produto produto, HttpSession session) {
        Usuario usuarioLogado = (Usuario) session.getAttribute("isActive");
        String codigoUsuario = usuarioLogado != null ? usuarioLogado.getCodigo() : "desconhecido";
        String nomeUsuario = usuarioLogado != null ? usuarioLogado.getNome() : "desconhecido";
        String[] nomes = nomeUsuario.trim().split("\\s+");
        String nomeFormatado = nomes.length == 1 ? nomes[0] : nomes[0] + " " + nomes[nomes.length - 1];
        String responsavel = codigoUsuario + " - " + nomeFormatado;

        MovimentacaoProduto movimentacao = new MovimentacaoProduto(
            LocalDate.now(),
            produto.getCodigo(),
            produto.getNome(),
            produto.getCategoriaNome() != null ? produto.getCategoriaNome() : null,
            produto.getTamanho(),
            produto.getGenero(),
            codigoCompra,
            quantidade,
            produto.getQuantidade(),
            valorCompra,
            fornecedor,
            responsavel
        );

        movimentacaoRepo.save(movimentacao);
    }
    
    public void registrarSaida(String codigoVenda, int quantidade, BigDecimal valorVenda, String comprador, Produto produto, HttpSession session) {
        Usuario usuarioLogado = (Usuario) session.getAttribute("isActive");
        String codigoUsuario = usuarioLogado != null ? usuarioLogado.getCodigo() : "desconhecido";
        String nomeUsuario = usuarioLogado != null ? usuarioLogado.getNome() : "desconhecido";
        String[] nomes = nomeUsuario.trim().split("\\s+");
        String nomeFormatado = nomes.length == 1 ? nomes[0] : nomes[0] + " " + nomes[nomes.length - 1];
        String responsavel = codigoUsuario + " - " + nomeFormatado;

        MovimentacaoProduto movimentacao = new MovimentacaoProduto(
            LocalDate.now(),
            produto.getCodigo(),
            produto.getNome(),
            produto.getCategoria() != null ? produto.getCategoria().getNome() : null,
            produto.getTamanho(),
            produto.getGenero(),
            codigoVenda,
            quantidade,
            produto.getQuantidade(),
            valorVenda,
            comprador,
            responsavel
        );
        
        movimentacaoRepo.save(movimentacao);
    }
}