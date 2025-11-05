package com.example.stokmais.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.stokmais.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCodigo(String codigo);
    Optional<Usuario> findByCpf(String cpf);
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByCtps(String ctps);
    Optional<Usuario> findByRg(String rg);
    List<Usuario> findByCargoId(Long cargoId);
}
