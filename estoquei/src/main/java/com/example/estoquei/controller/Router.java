package com.example.estoquei.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/")
public class Router {

    //login
    @GetMapping
    public String login() {
        return "login";
    }

    //Inicio
    @GetMapping("/inicio")
    public String inicio(HttpSession session) {
        if (session.getAttribute("isActive") == null) {
            return "redirect:/";
        }
        return "inicio";
    }


    //estoque
    @GetMapping("/estoque")
    public String estoque(HttpSession session) {
        if (session.getAttribute("isActive") == null) {
            return "redirect:/";
        }
        return "estoque";
    }

    @GetMapping("/baixo-estoque")
    public String baixoEstoque(HttpSession session) {
        if (session.getAttribute("isActive") == null) {
            return "redirect:/";
        }
        return "baixo_estoque";
    }


    //produto
    @GetMapping("/cadastrar-produto")
    public String cadastro(HttpSession session) {
        if (session.getAttribute("isActive") == null) {
            return "redirect:/";
        }
        return "cadastrar_produto";
    }

    @GetMapping("/editar-produto")
    public String editarProduto(HttpSession session) {
        if (session.getAttribute("isActive") == null) {
            return "redirect:/";
        }
        return "editar_produto";
    }

    @GetMapping("/reabastecer-produto")
    public String reabastecerProduto(HttpSession session) {
        if (session.getAttribute("isActive") == null) {
            return "redirect:/";
        }
        return "reabastecer_produto";
    }


    //funcionario
    @GetMapping("/cadastrar-funcionario")
    public String cadastrarFuncionario(HttpSession session) {
        if (session.getAttribute("isActive") == null) {
            return "redirect:/";
        }
        return "cadastrar_funcionario";
    }

    @GetMapping("/editar-funcionario")
    public String editarFuncionario(HttpSession session) {
        if (session.getAttribute("isActive") == null) {
            return "redirect:/";
        }
        return "editar_funcionario";
    }

    @GetMapping("/gerenciar-funcionarios")
    public String gerenciarFuncionario(HttpSession session) {
        if (session.getAttribute("isActive") == null) {
            return "redirect:/";
        }
        return "gerenciar_funcionarios";
    }

    //fornecedor
    @GetMapping("/cadastrar-fornecedor")
    public String cadastrarFornecedor(HttpSession session) {
        if (session.getAttribute("isActive") == null) {
            return "redirect:/";
        }
        return "cadastrar_fornecedor";
    }

    @GetMapping("/editar-fornecedor")
    public String editarFornecedor(HttpSession session) {
        if (session.getAttribute("isActive") == null) {
            return "redirect:/";
        }
        return "editar_fornecedor";
    }

    @GetMapping("/gerenciar-fornecedores")
    public String gerenciarFornecedor(HttpSession session) {
        if (session.getAttribute("isActive") == null) {
            return "redirect:/";
        }
        return "gerenciar_fornecedores";
    }

    //relatorio
    @GetMapping("/gerar-relatorio")
    public String relatorio(HttpSession session) {
        return "relatorio";
    }

    //gerenciar relatorios
    @GetMapping("/gerenciar-relatorios")
    public String gerenciarRelatorios(HttpSession session) {
        if (session.getAttribute("isActive") == null) {
            return "redirect:/";
        }
        return "gerenciar_relatorios";
    }
    
}







