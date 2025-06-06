package com.example.estoquei.model;

import java.math.BigDecimal;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
@Table(name = "produtos")
public class Produto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigo;

    private String nome;

    @Enumerated(EnumType.STRING)
    private Categoria categoria;

    @Enumerated(EnumType.STRING)
    private Tamanho tamanho;

    @Enumerated(EnumType.STRING)
    private Genero genero;

    private int quantidade;

    private int limiteMinimo;

    private BigDecimal preco;

    private String descricao;

    private String url_imagem;

    
    public Produto(){
    }

    public Produto(String nome, String codigo, Categoria categoria,Tamanho tamanho, Genero genero, int quantidade, int limiteMinimo , BigDecimal preco, String descricao, String url_imagem) {
        this.nome=nome;
        this.codigo=codigo;
        this.categoria=categoria;
        this.tamanho=tamanho;
        this.genero=genero;
        this.quantidade=quantidade;
        this.limiteMinimo=limiteMinimo;
        this.preco=preco;
        this.descricao=descricao;
        this.url_imagem = url_imagem;
    }

    public String getNome() {
        return this.nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCodigo() {
        return this.codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public Long getId() {
        return this.id;
    }

    public Tamanho getTamanho() {
        return this.tamanho;
    }

    public void setTamanho(Tamanho tamanho) {
        this.tamanho = tamanho;
    }

    public Genero getGenero() {
        return this.genero;
    }

    public void setGenero(Genero genero) {
        this.genero = genero;
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

    public String getUrl_imagem() {
        return this.url_imagem;
    }

    public void setUrl_imagem(String url_imagem) {
        this.url_imagem = url_imagem;
    }

}
