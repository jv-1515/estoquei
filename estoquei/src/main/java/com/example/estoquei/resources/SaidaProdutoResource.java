package com.example.estoquei.resources;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.estoquei.model.Produto;
import com.example.estoquei.model.SaidaProduto;
import com.example.estoquei.repository.ProdutoRepository;
import com.example.estoquei.repository.SaidaProdutoRepository;
import com.example.estoquei.service.MovimentacaoService;

@RestController
@RequestMapping("/saidas")
public class SaidaProdutoResource {

    private final SaidaProdutoRepository saidaRepo;
    private final ProdutoRepository produtoRepo;

    @Autowired
    private MovimentacaoService movimentacaoService;

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
        System.out.println("Recebendo saída: " + saida.getCodigo());
        
        // Salva a saída
        SaidaProduto saidaSalva = saidaRepo.save(saida);
        
        try {
            // Busca o produto pelo código
            Produto produto = produtoRepo.findByCodigo(saida.getCodigo());
            if (produto != null) {
                System.out.println("Produto encontrado: " + produto.getNome());
                
                // Atualiza a quantidade do produto
                produto.setQuantidade(produto.getQuantidade() - saida.getQuantidade());
                produto.setDtUltimaSaida(saida.getDataSaida());
                
                // Salva o produto atualizado
                produtoRepo.save(produto);
                
                System.out.println("Produto atualizado com sucesso");
                
                movimentacaoService.registrarSaida(saida, produto);
            } else {
                System.out.println("Produto não encontrado com código: " + saida.getCodigo());
            }
        } catch (Exception e) {
            System.out.println("Erro ao atualizar produto: " + e.getMessage());
            e.printStackTrace();
        }
        
        return saidaSalva;
    }

    @GetMapping("/total-hoje")
    public int totalSaidasHoje() {
        return saidaRepo.somaSaidasHoje();
    }
}