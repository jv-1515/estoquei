package com.example.estoquei.model;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "fornecedores")
public class Fornecedor implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 9)
    private String codigo;

    @Column(nullable = false)
    private String nome_empresa;

    @Column(nullable = false, unique = true, length = 14)
    private String cnpj;

    @Column(nullable = false)
    private String email;

    // Categorias (booleans)
    private boolean camisa = true;
    private boolean camiseta = true;
    private boolean calça = true;
    private boolean bermuda = true;
    private boolean shorts = true;
    private boolean sapato = true;
    private boolean meia = true;

    // Contato extra (não obrigatórios)
    private String nome_responsavel;
    private String email_responsavel;
    private String telefone;

    // Endereço (não obrigatórios)
    private String inscricao_estadual;
    private String cep;
    private String logradouro;
    private String bairro;
    private String cidade;
    private String estado;
    private String numero;
    private String observacoes;

    // Getters e Setters
    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getNome_empresa() { return nome_empresa; }
    public void setNome_empresa(String nome_empresa) { this.nome_empresa = nome_empresa; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean isCamisa() { return camisa; }
    public void setCamisa(boolean camisa) { this.camisa = camisa; }
    public boolean isCamiseta() { return camiseta; }
    public void setCamiseta(boolean camiseta) { this.camiseta = camiseta; }
    public boolean isCalça() { return calça; }
    public void setCalça(boolean calça) { this.calça = calça; }
    public boolean isBermuda() { return bermuda; }
    public void setBermuda(boolean bermuda) { this.bermuda = bermuda; }
    public boolean isShorts() { return shorts; }
    public void setShorts(boolean shorts) { this.shorts = shorts; }
    public boolean isSapato() { return sapato; }
    public void setSapato(boolean sapato) { this.sapato = sapato; }
    public boolean isMeia() { return meia; }
    public void setMeia(boolean meia) { this.meia = meia; }

    public String getNome_responsavel() { return nome_responsavel; }
    public void setNome_responsavel(String nome_responsavel) { this.nome_responsavel = nome_responsavel; }
    public String getEmail_responsavel() { return email_responsavel; }
    public void setEmail_responsavel(String email_responsavel) { this.email_responsavel = email_responsavel; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getInscricao_estadual() { return inscricao_estadual; }
    public void setInscricao_estadual(String inscricao_estadual) { this.inscricao_estadual = inscricao_estadual; }
    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }
    public String getLogradouro() { return logradouro; }
    public void setLogradouro(String logradouro) { this.logradouro = logradouro; }
    public String getBairro() { return bairro; }
    public void setBairro(String bairro) { this.bairro = bairro; }
    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}