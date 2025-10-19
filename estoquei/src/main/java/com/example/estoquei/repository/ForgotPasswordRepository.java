package com.example.estoquei.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.estoquei.entities.ForgotPassword;
import com.example.estoquei.model.Usuario;

import java.util.Optional;

@Repository
public interface ForgotPasswordRepository extends JpaRepository<ForgotPassword, Integer> {
    Optional<ForgotPassword> findByOtp(Integer otp);

    Optional<ForgotPassword> findByUser(Usuario user);
}