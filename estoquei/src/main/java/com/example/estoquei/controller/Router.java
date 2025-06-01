package com.example.estoquei.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
@RequestMapping("/")
public class Router {

    //login
    @GetMapping
    public String login() {
        return "login";
    }


    //menu inicial
    @PostMapping("/inicio")
    public String processaLogin(@RequestParam String email, @RequestParam String password) {
        return "inicio";
    }

    @GetMapping("/inicio")
    public String inicio() {
        return "inicio";
    }


    //estoque
    @GetMapping("/estoque")
    public String estoque() {
        return "estoque";
    }

    @GetMapping("/baixo-estoque")
    public String baixoEstoque() {
        return "baixo_estoque";
    }


    //produto
    @GetMapping("/cadastrar-produto")
    public String cadastro() {
        return "cadastrar_produto";
    }

    @GetMapping("/editar-produto")
    public String editarProduto() {
        return "editar_produto";
    }

    @GetMapping("/reabastecer-produto")
    public String reabastecerProduto() {
        return "reabastecer_produto";
    }


    //funcionario
    @GetMapping("/cadastrar-funcionario")
    public String cadastrarFuncionario() {
        return "cadastrar_funcionario";
    }

    @GetMapping("/editar-funcionario")
    public String editarFuncionario() {
        return "editar_funcionario";
    }

    @GetMapping("/gerenciar-funcionarios")
    public String gerenciarFuncionario() {
        return "gerenciar_funcionarios";
    }

    //fornecedor
    @GetMapping("/cadastrar-fornecedor")
    public String cadastrarFornecedor() {
        return "cadastrar_fornecedor";
    }

    @GetMapping("/editar-fornecedor")
    public String editarFornecedor() {
        return "editar_fornecedor";
    }

    @GetMapping("/gerenciar-fornecedores")
    public String gerenciarFornecedor() {
        return "gerenciar_fornecedores";
    }

    //relatorio
    @GetMapping("/gerar-relatorio")
    public String relatorio() {
        return "relatorio";
    }

    //gerenciar relatorios
    @GetMapping("/gerenciar-relatorios")
    public String gerenciarRelatorios() {
        return "gerenciar_relatorios";
    }
    
}







