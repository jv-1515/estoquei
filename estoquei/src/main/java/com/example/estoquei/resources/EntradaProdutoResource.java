package com.example.estoquei.resources;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.estoquei.model.EntradaProduto;
import com.example.estoquei.repository.EntradaProdutoRepository;

@RestController
@RequestMapping("/entradas")
public class EntradaProdutoResource {

    private final EntradaProdutoRepository entradaRepo;

    public EntradaProdutoResource(EntradaProdutoRepository entradaRepo) {
        this.entradaRepo = entradaRepo;
    }

    @GetMapping
    public List<EntradaProduto> listarEntradas() {
        return entradaRepo.findAll();
    }

    @PostMapping
    public EntradaProduto registrarEntrada(@RequestBody EntradaProduto entrada) {
        System.out.println("Recebido:");
        System.out.println(entrada);
        return entradaRepo.save(entrada);
    }
}