package com.example.estoquei.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.estoquei.model.Usuario;
import com.example.estoquei.service.UsuarioService;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/login")
    public String exibirLogin() {
        return "login";
    }

    @PostMapping("/login")
    public String processarLogin(@RequestParam String email,
                                 @RequestParam String senha,
                                 HttpSession session,
                                 Model model) {
        Usuario usuario = usuarioService.autenticar(email, senha);
        if (usuario != null) {
            session.setAttribute("isActive", usuario);
            System.out.println("Usuário logado: " + usuario.getNome() + " - Tipo: " + usuario.getTipo());
            return "redirect:/inicio";
        } else {
            model.addAttribute("erro", "Email ou senha inválidos.");
            model.addAttribute("email", email);
            return "login";
        }
    }

    @GetMapping("/inicio")
    public String inicio(HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("isActive");
        if (usuario != null) {
            return "inicio";
        } else {
            return "redirect:/";
        }
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }
}