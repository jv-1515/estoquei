package com.example.estoquei.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
@RequestMapping("/")
public class Router {

    @GetMapping
    public String login() {
        return "login";
    }

    @GetMapping("/cadastrar-produto")
    public String cadastro() {
        return "cadastrar_produto";
    }

    @PostMapping("/inicio")
    public String processaLogin(@RequestParam String email, @RequestParam String password) {
        return "inicio";
    }

    @GetMapping("/inicio")
    public String inicio() {
        return "inicio";
    }
    

    @GetMapping("/estoque")
    public String estoque() {
        return "estoque";
    }

    // @GetMapping("/reabastecer-produto")
    // public String reabastecerProduto() {
    //     return "reabastecer_produto";
    // }

    // @GetMapping("/visualizar-produto")
    // public String visualizarProduto() {
    //     return "visualizar_produto";
    // }
    
    // @GetMapping("/editar-produto")
    // public String editarProduto() {
    //     return "editar_produto";
    // }


    // @GetMapping("/visualizar-funcionario")
    // public String visualizarFuncionario() {
    //     return "visualizar_funcionario";
    // }
    // @GetMapping("/cadastrar-funcionario")
    // public String cadastrarFuncionario")() {
    //     return "cadastrar_funcionario");
    // }

    // @GetMapping("/editar-funcionario")
    // public String editarFuncionario() {
    //     return "editar_funcionario";
    // }

    // @GetMapping("/visualizar-fornecedor")
    // public String visualizarFornecedor() {
    //     return "visualizar_fornecedor";

    // @GetMapping("/cadastrar-fornecedor")
    // public String cadastrarFornecedor() {
    //     return "cadastrar_fornecedor";
    // }

    // @GetMapping("/editar-fornecedor")
    // public String editarFornecedor() {
    //     return "editar_fornecedor";
    // }
}