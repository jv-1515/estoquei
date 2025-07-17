package com.example.estoquei.resources;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.estoquei.model.EntradaProduto;
import com.example.estoquei.model.Produto;
import com.example.estoquei.repository.EntradaProdutoRepository;
import com.example.estoquei.repository.ProdutoRepository;

@RestController
@RequestMapping("/entradas")
public class EntradaProdutoResource {

    private final EntradaProdutoRepository entradaRepo;
    private final ProdutoRepository produtoRepo;

    public EntradaProdutoResource(EntradaProdutoRepository entradaRepo, ProdutoRepository produtoRepo) {
        this.entradaRepo = entradaRepo;
        this.produtoRepo = produtoRepo;
    }

    @GetMapping
    public List<EntradaProduto> listarEntradas() {
        return entradaRepo.findAll();
    }

    @PostMapping
    public EntradaProduto registrarEntrada(@RequestBody EntradaProduto entrada) {
        // Salva a entrada
        EntradaProduto entradaSalva = entradaRepo.save(entrada);
        
        // Busca o produto pelo código
        Produto produto = produtoRepo.findByCodigo(entrada.getCodigo());
        if (produto != null) {
            // Atualiza a quantidade do produto
            produto.setQuantidade(produto.getQuantidade() + entrada.getQuantidade());
            
            // Atualiza a data da última entrada
            produto.setDtUltimaEntrada(entrada.getDataEntrada());
            
            // Salva o produto atualizado
            produtoRepo.save(produto);
        }
        
        return entradaSalva;
    }
}