package com.example.estoquei.resources;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<SaidaProduto> registrarSaida(@RequestBody SaidaProduto saida) {
        try {
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
            
            return ResponseEntity.status(HttpStatus.CREATED).body(saidaSalva);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/total-hoje")
    public int totalSaidasHoje() {
        return saidaRepo.somaSaidasHoje();
    }
}