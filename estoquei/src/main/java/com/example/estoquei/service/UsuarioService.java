package com.example.estoquei.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.estoquei.model.CargoUsuario;
import com.example.estoquei.model.TipoUsuario;
import com.example.estoquei.model.Usuario;
import com.example.estoquei.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Usuario autenticar(String email, String senha) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (usuario.getSenha().equals(senha)) {
                return usuario;
            }
        }
        return null;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    public Usuario salvar(Usuario usuario) {
        // Define tipo automaticamente pelo cargo
        if (usuario.getCargo() == CargoUsuario.GERENTE) {
            usuario.setTipo(TipoUsuario.GERENTE);
        } else if (usuario.getCargo() == CargoUsuario.ADMIN) {
            usuario.setTipo(TipoUsuario.ADMIN);
        } else {
            usuario.setTipo(TipoUsuario.FUNCIONARIO);
        }
        if (usuario.getTelefone() == null) {
        usuario.setTelefone("");
        }
        return usuarioRepository.save(usuario);
    }

    public Usuario atualizar(Long id, Usuario usuarioAtualizado) {
        Usuario usuario = buscarPorId(id);
        if (usuario == null) return null;
        usuario.setCodigo(usuarioAtualizado.getCodigo());
        usuario.setNome(usuarioAtualizado.getNome());
        usuario.setEmail(usuarioAtualizado.getEmail());
        usuario.setCargo(usuarioAtualizado.getCargo());
        if (usuario.getCargo() == CargoUsuario.GERENTE) {
            usuario.setTipo(TipoUsuario.GERENTE);
        } else if (usuario.getCargo() == CargoUsuario.ADMIN) {
            usuario.setTipo(TipoUsuario.ADMIN);
        } else {
            usuario.setTipo(TipoUsuario.FUNCIONARIO);
        }
        usuario.setTelefone(usuarioAtualizado.getTelefone());
        usuario.setCpf(usuarioAtualizado.getCpf());
        usuario.setDataNascimento(usuarioAtualizado.getDataNascimento());
        usuario.setAtivo(usuarioAtualizado.getAtivo());
        return usuarioRepository.save(usuario);
    }

    public boolean deletar(Long id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return true;
        }
        return false;
    }
}