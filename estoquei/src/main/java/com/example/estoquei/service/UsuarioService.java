package com.example.estoquei.service;

import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.estoquei.dto.MailBody;
import com.example.estoquei.entities.ForgotPassword;
import com.example.estoquei.model.Usuario;
import com.example.estoquei.repository.ForgotPasswordRepository;
import com.example.estoquei.repository.UsuarioFiltroRepository;
import com.example.estoquei.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioFiltroRepository usuarioFiltroRepository;

    @Autowired
    private ForgotPasswordRepository forgotPasswordRepository;

    @Autowired
    private EmailService emailService;

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
        usuario.setCtps(usuarioAtualizado.getCtps());
        usuario.setRg(usuarioAtualizado.getRg());
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

    public void forgotPassword(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado com o e-mail: " + email));

        ForgotPassword fp = forgotPasswordRepository.findByUser(usuario)
            .orElse(new ForgotPassword());

        int otp = new Random().nextInt(900000) + 100000;
        
        fp.setOtp(otp);
        fp.setExpirationTime(new Date(System.currentTimeMillis() + 10 * 60 * 1000));
        fp.setUser(usuario);

        forgotPasswordRepository.save(fp);

        MailBody mailBody = new MailBody(
            usuario.getEmail(),
            "Código de Verificação - Stok+",
            "Olá " + usuario.getNome() + ",\n\nSeu código de verificação é: **" + otp + "**\n\nEste código irá expirar em 10 minutos.\n\nSe você não solicitou esta alteração, por favor ignore este e-mail.\n\nAtenciosamente,\nEquipe Stok+"
        );
        emailService.sendSimpleMessage(mailBody);
    }

    public boolean validarCodigo(String otp) {
        try {
            Integer otpCode = Integer.parseInt(otp);
            Optional<ForgotPassword> fpOpt = forgotPasswordRepository.findByOtp(otpCode);

            if (fpOpt.isEmpty()) {
                return false;
            }

            ForgotPassword fp = fpOpt.get();

            if (fp.getExpirationTime().before(new Date())) {
                forgotPasswordRepository.delete(fp);
                return false;
            }

            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
    
    public void redefinirSenha(String tokenOtp, String novaSenha) {
        Integer otpCode = Integer.parseInt(tokenOtp);
        ForgotPassword fp = forgotPasswordRepository.findByOtp(otpCode)
            .orElseThrow(() -> new RuntimeException("Token de redefinição inválido ou expirado."));

        if (fp.getExpirationTime().before(new Date())) {
            forgotPasswordRepository.delete(fp);
            throw new RuntimeException("Token de redefinição inválido ou expirado.");
        }

        Usuario usuario = fp.getUser();
        if (usuario == null) {
            throw new RuntimeException("Usuário associado ao token não encontrado.");
        }

        usuario.setSenha(novaSenha);
        usuarioRepository.save(usuario);

        forgotPasswordRepository.delete(fp);
    }
}