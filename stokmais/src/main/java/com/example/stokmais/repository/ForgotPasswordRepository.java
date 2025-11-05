package com.example.stokmais.repository;

import java.util.Date;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.stokmais.entities.ForgotPassword;
import com.example.stokmais.model.Usuario;

@Repository
public interface ForgotPasswordRepository extends JpaRepository<ForgotPassword, Integer> {
    
    Optional<ForgotPassword> findByOtp(Integer otp);

    Optional<ForgotPassword> findByUser(Usuario user);

    @Modifying
    @Query("UPDATE ForgotPassword f SET f.otp = :otp, f.expirationTime = :expirationTime WHERE f.forgotPasswordID = :id")
    void updateOtpAndExpiration(@Param("id") Integer id, @Param("otp") Integer otp, @Param("expirationTime") Date expirationTime);
}