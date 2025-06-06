package com.example.estoquei.controller;

import com.example.estoquei.model.Usuario;
import com.example.estoquei.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

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
            return "redirect:/inicio";
        } else {
            model.addAttribute("erro", "Email ou senha inválidos.");
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