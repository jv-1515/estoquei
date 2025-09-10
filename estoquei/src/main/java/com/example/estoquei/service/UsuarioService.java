package com.example.estoquei.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.estoquei.model.Usuario;
import com.example.estoquei.repository.UsuarioFiltroRepository;
import com.example.estoquei.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioFiltroRepository usuarioFiltroRepository;

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

        usuario.setTelefone(usuarioAtualizado.getTelefone());
        usuario.setCpf(usuarioAtualizado.getCpf());
        usuario.setDataNascimento(usuarioAtualizado.getDataNascimento());
        usuario.setAtivo(usuarioAtualizado.getAtivo());
        if (usuarioAtualizado.getSenha() != null && !usuarioAtualizado.getSenha().isEmpty()) {
            usuario.setSenha(usuarioAtualizado.getSenha());
        }      
        return usuarioRepository.save(usuario);
    }

    public boolean deletar(Long id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Usuario> filtrar(Usuario filtro) {
        return usuarioFiltroRepository.findAndFilter(filtro);
    }

    public List<Usuario> listarPorCargoId(Long cargoId) {
        return usuarioRepository.findByCargoId(cargoId);
    }
}