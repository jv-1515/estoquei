package com.example.stokmais.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "cargos")
public class Cargo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    @Column(nullable = false)
    private int produtos;

    @Column(nullable = false)
    private int movimentacoes;

    @Column(nullable = false)
    private int relatorios;

    @Column(nullable = false)
    private int fornecedores;

    @Column(nullable = false)
    private int funcionarios;

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public int getProdutos() { return produtos; }
    public void setProdutos(int produtos) { this.produtos = produtos; }

    public int getMovimentacoes() { return movimentacoes; }
    public void setMovimentacoes(int movimentacoes) { this.movimentacoes = movimentacoes; }

    public int getRelatorios() { return relatorios; }
    public void setRelatorios(int relatorios) { this.relatorios = relatorios; }

    public int getFornecedores() { return fornecedores; }
    public void setFornecedores(int fornecedores) { this.fornecedores = fornecedores; }

    public int getFuncionarios() { return funcionarios; }
    public void setFuncionarios(int funcionarios) { this.funcionarios = funcionarios; }
}