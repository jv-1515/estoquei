package com.example.estoquei.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.ui.Model;

import com.example.estoquei.model.TipoUsuario;
import com.example.estoquei.model.Usuario;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/")
public class Router {

    private Usuario getUsuarioOuRedireciona(HttpSession session) {
        return (Usuario) session.getAttribute("isActive");
    }

    //login
    @GetMapping
    public String login() {
        return "login";
    }

    //Inicio
    @GetMapping("/inicio")
    public String inicio(HttpSession session, Model model) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario==null) return "redirect:/";
        model.addAttribute("tipo", usuario.getTipo().name());
        return "inicio";
    }


    //estoque
    @GetMapping("/estoque")
    public String estoque(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario==null) return "redirect:/";
        return "estoque";
    }

    @GetMapping("/baixo-estoque")
    public String baixoEstoque(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario==null) return "redirect:/";
        return "baixo_estoque";
    }


    //produto
    @GetMapping("/cadastrar-produto")
    public String cadastro(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario==null) return "redirect:/";
        return "cadastrar_produto";
    }

    @GetMapping("/editar-produto")
    public String editarProduto(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario==null) return "redirect:/";
        return "editar_produto";
    }

    @GetMapping("/reabastecer-produto")
    public String reabastecerProduto(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario==null) return "redirect:/";
        return "reabastecer_produto";
    }


    //funcionario
    @GetMapping("/cadastrar-funcionario")
    public String cadastrarFuncionario(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario==null) return "redirect:/";
            
        System.out.println("Usuário na sessão: " + usuario.getNome() + " | Tipo: " + usuario.getTipo());
        if (usuario.getTipo() == TipoUsuario.ADMIN || usuario.getTipo() == TipoUsuario.GERENTE) {
            return "cadastrar_funcionario";
        }

        return "redirect:/inicio";
    }

    @GetMapping("/editar-funcionario")
    public String editarFuncionario(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario==null) return "redirect:/";

        System.out.println("Usuário na sessão: " + usuario.getNome() + " | Tipo: " + usuario.getTipo());
        if (usuario.getTipo() == TipoUsuario.ADMIN || usuario.getTipo() == TipoUsuario.GERENTE) {
            return "editar_funcionario";
        }

        return "redirect:/inicio";
    }

    @GetMapping("/gerenciar-funcionarios")
    public String gerenciarFuncionario(HttpSession session) {
                Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario==null) return "redirect:/";
            
        System.out.println("Usuário na sessão: " + usuario.getNome() + " | Tipo: " + usuario.getTipo());
        if (usuario.getTipo() == TipoUsuario.ADMIN || usuario.getTipo() == TipoUsuario.GERENTE) {
            return "gerenciar_funcionarios";
        }

        return "redirect:/inicio";
    }

    //fornecedor
    @GetMapping("/cadastrar-fornecedor")
    public String cadastrarFornecedor(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario==null) return "redirect:/";

        System.out.println("Usuário na sessão: " + usuario.getNome() + " | Tipo: " + usuario.getTipo());
        if (usuario.getTipo() == TipoUsuario.ADMIN || usuario.getTipo() == TipoUsuario.GERENTE) {
            return "cadastrar_fornecedor";
        }

        return "redirect:/inicio";
    }

    @GetMapping("/editar-fornecedor")
    public String editarFornecedor(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario==null) return "redirect:/";

        System.out.println("Usuário na sessão: " + usuario.getNome() + " | Tipo: " + usuario.getTipo());
        if (usuario.getTipo() == TipoUsuario.ADMIN || usuario.getTipo() == TipoUsuario.GERENTE) {
            return "editar_fornecedor";
        }

        return "redirect:/inicio";
    }

    @GetMapping("/gerenciar-fornecedores")
    public String gerenciarFornecedor(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario==null) return "redirect:/";

        System.out.println("Usuário na sessão: " + usuario.getNome() + " | Tipo: " + usuario.getTipo());
        if (usuario.getTipo() == TipoUsuario.ADMIN || usuario.getTipo() == TipoUsuario.GERENTE) {
            return "gerenciar_fornecedores";
        }

        return "redirect:/inicio";
    }

    //relatorio
    @GetMapping("/gerar-relatorio")
    public String relatorio(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario==null) return "redirect:/";

        System.out.println("Usuário na sessão: " + usuario.getNome() + " | Tipo: " + usuario.getTipo());
        if (usuario.getTipo() == TipoUsuario.ADMIN || usuario.getTipo() == TipoUsuario.GERENTE) {
            return "relatorio";
        }

        return "redirect:/inicio";
    }

    //gerenciar relatorios
    @GetMapping("/gerenciar-relatorios")
    public String gerenciarRelatorios(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario==null) return "redirect:/";

        System.out.println("Usuário na sessão: " + usuario.getNome() + " | Tipo: " + usuario.getTipo());
        if (usuario.getTipo() == TipoUsuario.ADMIN || usuario.getTipo() == TipoUsuario.GERENTE) {
            return "gerenciar_relatorios";
        }

        return "redirect:/inicio";
    }
    
}







