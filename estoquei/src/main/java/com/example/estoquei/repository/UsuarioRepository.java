package com.example.estoquei.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.estoquei.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByCargo_Id(Long cargoId);
}