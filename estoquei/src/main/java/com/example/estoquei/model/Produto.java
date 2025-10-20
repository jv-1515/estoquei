package com.example.estoquei.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "produtos")
public class Produto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigo;

    private String nome;

    @Column(name = "categoria")
    private String categoriaNome; // <-- nome da categoria

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria; // <-- relacionamento

    @Enumerated(EnumType.STRING)
    private Tamanho tamanho;

    @Enumerated(EnumType.STRING)
    private Genero genero;

    private int quantidade = 0;

    private int limiteMinimo;

    private BigDecimal preco;

    private String descricao;

    private String url_imagem;

    private java.time.LocalDate dtUltimaEntrada;
    private java.time.LocalDate dtUltimaSaida;

    private boolean ic_excluido = false;
    private java.time.LocalDate dataExclusao;

    private String responsavelExclusao;

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

    public java.time.LocalDate getDtUltimaEntrada() {
        return dtUltimaEntrada;
    }

    public void setDtUltimaEntrada(java.time.LocalDate dtUltimaEntrada) {
        this.dtUltimaEntrada = dtUltimaEntrada;
    }

    public java.time.LocalDate getDtUltimaSaida() {
        return dtUltimaSaida;
    }

    public void setDtUltimaSaida(java.time.LocalDate dtUltimaSaida) {
        this.dtUltimaSaida = dtUltimaSaida;
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

    
    public String getCategoriaNome() { return categoriaNome; }
    
    public void setCategoriaNome(String categoriaNome) { this.categoriaNome = categoriaNome; }

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

    public boolean getIc_excluido() { return ic_excluido; }
    public void setIc_excluido(boolean ic_excluido) { this.ic_excluido = ic_excluido; }

    public java.time.LocalDate getDataExclusao() { return dataExclusao; }
    public void setDataExclusao(java.time.LocalDate dataExclusao) { this.dataExclusao = dataExclusao; }

    public String getResponsavelExclusao() { return responsavelExclusao; }
    public void setResponsavelExclusao(String responsavelExclusao) { this.responsavelExclusao = responsavelExclusao; }
}
