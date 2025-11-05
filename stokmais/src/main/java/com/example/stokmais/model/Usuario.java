package com.example.stokmais.model;

import java.sql.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigo;
    private String nome;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String senha;

    private String telefone;
    private String cpf;

    @ManyToOne
    @JoinColumn(name = "cargo_id")
    private Cargo cargo;

    private Date dataNascimento;
    private Date createdAt;

    private boolean ativo;
    private boolean ic_excluido;

    private String ctps;
    private String rg;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getCtps() { return ctps; }
    public void setCtps(String ctps) { this.ctps = ctps; }
    
    public String getRg() { return rg; }
    public void setRg(String rg) { this.rg = rg; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public Cargo getCargo() { return cargo; }
    public void setCargo(Cargo cargo) { this.cargo = cargo; }

    public Date getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(Date dataNascimento) { this.dataNascimento = dataNascimento; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public boolean getAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }

    public boolean getIc_excluido() { return ic_excluido; }
    public void setIc_excluido(boolean ic_excluido) { this.ic_excluido = ic_excluido; }

    @jakarta.persistence.Transient
    private java.util.List<Long> cargoIds;

    public java.util.List<Long> getCargoIds() { return cargoIds; }
    public void setCargoIds(java.util.List<Long> cargoIds) { this.cargoIds = cargoIds; }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = new java.sql.Date(System.currentTimeMillis());
        }
    }
}
