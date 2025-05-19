package com.example.estoquei.model;

import java.math.BigDecimal;

public class Produto {
    private int id;
    private String nome;
    private Categoria categoria;
    private String tamanho;
    public int quantidade;
    public int limiteMinimo;
    public BigDecimal preco;
    public String descricao;
    
    public Produto(){

    }

    public Produto(String nome, Categoria categoria,String tamanho, int quantidade, int limiteMinimo , BigDecimal preco, String descricao){
        this.nome=nome;
        this.categoria=categoria;
        this.tamanho=tamanho;
        this.quantidade=quantidade;
        this.limiteMinimo=limiteMinimo;
        this.preco=preco;
        this.descricao=descricao;
    }

    public String getNome() {
        return this.nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public int getId() {
        return this.id;
    }

    public String getTamanho() {
        return this.tamanho;
    }

    public void setTamanho(String tamanho) {
        this.tamanho = tamanho;
    }

    public int getQuantidade() {
        return this.quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public int getLimiteMinimo() {
        return this.limiteMinimo;
    }

    public void setLimiteMinimo(int limiteMinimo) {
        this.limiteMinimo = limiteMinimo;
    }

    public BigDecimal getPreco() {
        return this.preco;
    }

    public void setPreco(BigDecimal preco) {
        this.preco = preco;
    }

    public String getDescricao() {
        return this.descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

}
