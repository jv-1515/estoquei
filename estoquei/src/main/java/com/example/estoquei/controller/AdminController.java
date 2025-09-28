package com.example.estoquei.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.estoquei.model.Usuario;
import com.example.estoquei.repository.UsuarioRepository;
import com.example.estoquei.service.UsuarioService;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

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
            if (!usuario.getAtivo()) {
                model.addAttribute("erro", true);
                model.addAttribute("mensagemErro", "Acesso negado! Você não tem mais acesso.");
                model.addAttribute("email", email);
                return "login";
            }
            session.setAttribute("isActive", usuario);
            System.out.println("Usuário logado: " + usuario.getNome() + " - Cargo: " + (usuario.getCargo() != null ? usuario.getCargo().getNome() : "Nenhum"));            
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
    
    @GetMapping("/usuarios/codigo-existe")
    public ResponseEntity<Boolean> codigoExiste(@RequestParam String codigo) {
        boolean existe = usuarioRepository.findByCodigo(codigo).isPresent();
        return ResponseEntity.ok(existe);
    }

    @GetMapping("/usuarios/email-existe")
    public ResponseEntity<Boolean> emailExiste(@RequestParam(name = "email", required = true) String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(false);
        }
        boolean existe = usuarioRepository.findByEmail(email).isPresent();
        return ResponseEntity.ok(existe);
    }

    @GetMapping("/usuarios/ctps-existe")
    public ResponseEntity<Boolean> ctpsExiste(@RequestParam String ctps) {
        if (ctps == null || ctps.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(false);
        }
        boolean existe = usuarioRepository.findByCtps(ctps).isPresent();
        return ResponseEntity.ok(existe);
    }
    
    @GetMapping("/usuarios/rg-existe")
    public ResponseEntity<Boolean> rgExiste(@RequestParam String rg) {
        if (rg == null || rg.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(false);
        }
        boolean existe = usuarioRepository.findByRg(rg).isPresent();
        return ResponseEntity.ok(existe);
    }

    @GetMapping("/usuarios/cpf-existe")
    public ResponseEntity<Boolean> cpfExiste(@RequestParam(name = "cpf", required = true) String cpf) {
        if (cpf == null || cpf.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(false);
        }
        boolean existe = usuarioRepository.findByCpf(cpf).isPresent();
        return ResponseEntity.ok(existe);
    }
}