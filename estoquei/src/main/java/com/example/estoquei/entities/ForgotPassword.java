package com.example.estoquei.entities;

import java.util.Date;
import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

import com.example.estoquei.model.Usuario;

@Entity
public class ForgotPassword {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer forgotPasswordID;

    private Integer otp;

    private Date expirationTime;

    @OneToOne
    @JoinColumn(name = "usuario_id")
    private Usuario user;

    public ForgotPassword() {
    }

    public ForgotPassword(Integer forgotPasswordID, Integer otp, Date expirationTime, Usuario user) {
        this.forgotPasswordID = forgotPasswordID;
        this.otp = otp;
        this.expirationTime = expirationTime;
        this.user = user;
    }

    public Integer getForgotPasswordID() {
        return forgotPasswordID;
    }

    public void setForgotPasswordID(Integer forgotPasswordID) {
        this.forgotPasswordID = forgotPasswordID;
    }

    public Integer getOtp() {
        return otp;
    }

    public void setOtp(Integer otp) {
        this.otp = otp;
    }

    public Date getExpirationTime() {
        return expirationTime;
    }

    public void setExpirationTime(Date expirationTime) {
        this.expirationTime = expirationTime;
    }

    public Usuario getUser() {
        return user;
    }

    public void setUser(Usuario user) {
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ForgotPassword that = (ForgotPassword) o;
        return Objects.equals(forgotPasswordID, that.forgotPasswordID);
    }

    @Override
    public int hashCode() {
        return Objects.hash(forgotPasswordID);
    }
}