package com.example.estoquei.resources;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.estoquei.model.Usuario;
import com.example.estoquei.service.UsuarioService;

@RestController
@RequestMapping("/usuarios")
public class UsuarioResource {

    private final UsuarioService usuarioService;

    public UsuarioResource(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<Usuario>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id) {
        Usuario usuario = usuarioService.buscarPorId(id);
        if (usuario != null) return ResponseEntity.ok(usuario);
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Usuario> salvar(@RequestBody Usuario usuario) {
        Usuario salvo = usuarioService.salvar(usuario);
        return ResponseEntity.ok(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizar(@PathVariable Long id, @RequestBody Usuario usuario) {
        Usuario atualizado = usuarioService.atualizar(id, usuario);
        if (atualizado != null) return ResponseEntity.ok(atualizado);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (usuarioService.deletar(id)) return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/validar-senha")
    public ResponseEntity<?> validarSenha(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String senha = body.get("senha");
        Usuario usuario = usuarioService.buscarPorId(id);
        boolean valida = usuario != null && usuario.getSenha() != null && usuario.getSenha().equals(senha);
        return ResponseEntity.ok(java.util.Collections.singletonMap("valida", valida));
    }

    @PutMapping("/{id}/senha")
    public ResponseEntity<?> atualizarSenha(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String novaSenha = body.get("senha");
        if (novaSenha == null || novaSenha.length() < 8) {
            return ResponseEntity.badRequest().body("Senha inválida");
        }
        Usuario usuario = usuarioService.buscarPorId(id);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }
        usuario.setSenha(novaSenha);
        usuarioService.salvar(usuario);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/filtrar")
    public ResponseEntity<List<Usuario>> filtrar(@RequestBody Usuario filtro) {
        List<Usuario> usuarios = usuarioService.filtrar(filtro);
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/cargo/{cargoId}")
    public List<Usuario> listarPorCargo(@PathVariable Long cargoId) {
        return usuarioService.listarPorCargoId(cargoId);
    }
}
