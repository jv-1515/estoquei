package com.example.estoquei.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.estoquei.model.EntradaProduto;
import com.example.estoquei.model.MovimentacaoProduto;
import com.example.estoquei.model.Produto;
import com.example.estoquei.model.SaidaProduto;
import com.example.estoquei.repository.MovimentacaoProdutoRepository;

@Service
public class MovimentacaoService {
    
    @Autowired
    private MovimentacaoProdutoRepository movimentacaoRepo;
    
    public void registrarEntrada(EntradaProduto entrada, Produto produto) {
        MovimentacaoProduto movimentacao = new MovimentacaoProduto(
            entrada.getDataEntrada(),
            produto.getCodigo(),
            produto.getNome(),
            produto.getCategoria(),
            produto.getTamanho(),
            produto.getGenero(),
            "ENTRADA",
            entrada.getCodigoCompra(),
            entrada.getQuantidade(),
            produto.getQuantidade(),
            entrada.getValorCompra()
        );
        movimentacaoRepo.save(movimentacao);
    }
    
    public void registrarSaida(SaidaProduto saida, Produto produto) {
        MovimentacaoProduto movimentacao = new MovimentacaoProduto(
            saida.getDataSaida(),
            produto.getCodigo(),
            produto.getNome(),
            produto.getCategoria(),
            produto.getTamanho(),
            produto.getGenero(),
            "SAIDA",
            saida.getCodigoVenda(),
            saida.getQuantidade(),
            produto.getQuantidade(),
            saida.getValorVenda()
        );
        movimentacaoRepo.save(movimentacao);
    }
}