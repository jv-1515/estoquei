package com.example.estoquei.resources;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.estoquei.model.Produto;
import com.example.estoquei.model.SaidaProduto;
import com.example.estoquei.repository.ProdutoRepository;
import com.example.estoquei.repository.SaidaProdutoRepository;

@RestController
@RequestMapping("/saidas")
public class SaidaProdutoResource {

    private final SaidaProdutoRepository saidaRepo;
    private final ProdutoRepository produtoRepo;

    public SaidaProdutoResource(SaidaProdutoRepository saidaRepo, ProdutoRepository produtoRepo) {
        this.saidaRepo = saidaRepo;
        this.produtoRepo = produtoRepo;
    }

    @GetMapping
    public List<SaidaProduto> listarSaidas() {
        return saidaRepo.findAll();
    }

    @PostMapping
    public SaidaProduto registrarSaida(@RequestBody SaidaProduto saida) {
        // Salva a saída
        SaidaProduto saidaSalva = saidaRepo.save(saida);
        
        // Busca o produto pelo código
        Produto produto = produtoRepo.findByCodigo(saida.getCodigo());
        if (produto != null) {
            // Atualiza a quantidade do produto (subtrai)
            produto.setQuantidade(produto.getQuantidade() - saida.getQuantidade());
            
            // Atualiza a data da última saída
            produto.setDtUltimaSaida(saida.getDataSaida());
            
            // Salva o produto atualizado
            produtoRepo.save(produto);
        }
        
        return saidaSalva;
    }

    @GetMapping("/total-hoje")
    public int totalSaidasHoje() {
        LocalDate hoje = LocalDate.now();
        List<SaidaProduto> saidasHoje = saidaRepo.findByDataSaida(hoje);
        return saidasHoje.stream().mapToInt(SaidaProduto::getQuantidade).sum();
    }
}