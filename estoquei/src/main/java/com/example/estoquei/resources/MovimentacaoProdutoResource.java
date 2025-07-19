package com.example.estoquei.resources;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.estoquei.model.MovimentacaoProduto;
import com.example.estoquei.repository.MovimentacaoProdutoRepository;

@RestController
@RequestMapping("/api/movimentacoes")
public class MovimentacaoProdutoResource {
    
    @Autowired
    private MovimentacaoProdutoRepository movimentacaoRepo;
    
    @GetMapping
    public List<MovimentacaoProduto> listarMovimentacoes() {
        return movimentacaoRepo.findAllOrderByDataDesc();
    }
    
    @GetMapping("/produto")
    public List<MovimentacaoProduto> listarPorProduto(@RequestParam String codigo) {
        return movimentacaoRepo.findByCodigoProdutoOrderByDataDesc(codigo);
    }
    
    @GetMapping("/tipo")
    public List<MovimentacaoProduto> listarPorTipo(@RequestParam String tipo) {
        return movimentacaoRepo.findByTipoMovimentacaoOrderByDataDesc(tipo);
    }
}