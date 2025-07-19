package com.example.estoquei.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "movimentacoes_produto")
public class MovimentacaoProduto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data")
    private LocalDate data;

    @Column(name = "codigo_produto")
    private String codigoProduto;

    private String nome;

    @Enumerated(EnumType.STRING)
    private Categoria categoria;

    @Enumerated(EnumType.STRING)
    private Tamanho tamanho;

    @Enumerated(EnumType.STRING)
    private Genero genero;

    @Column(name = "tipo_movimentacao")
    private String tipoMovimentacao; // "ENTRADA" ou "SAIDA"

    @Column(name = "codigo_movimentacao")
    private String codigoMovimentacao;

    @Column(name = "quantidade_movimentada")
    private int quantidadeMovimentada;

    @Column(name = "estoque_final")
    private int estoqueFinal;

    @Column(name = "valor_movimentacao")
    private BigDecimal valorMovimentacao;

    // 🎯 NOVO CAMPO - Parte Envolvida (fornecedor ou cliente)
    @Column(name = "parte_envolvida")
    private String parteEnvolvida;

    // Construtores
    public MovimentacaoProduto() {}

    // 🎯 CONSTRUTOR ATUALIZADO com parteEnvolvida
    public MovimentacaoProduto(LocalDate data, String codigoProduto, String nome, Categoria categoria, 
                              Tamanho tamanho, Genero genero, String tipoMovimentacao, 
                              String codigoMovimentacao, int quantidadeMovimentada, 
                              int estoqueFinal, BigDecimal valorMovimentacao, String parteEnvolvida) {
        this.data = data;
        this.codigoProduto = codigoProduto;
        this.nome = nome;
        this.categoria = categoria;
        this.tamanho = tamanho;
        this.genero = genero;
        this.tipoMovimentacao = tipoMovimentacao;
        this.codigoMovimentacao = codigoMovimentacao;
        this.quantidadeMovimentada = quantidadeMovimentada;
        this.estoqueFinal = estoqueFinal;
        this.valorMovimentacao = valorMovimentacao;
        this.parteEnvolvida = parteEnvolvida;
    }

    // Getters e Setters
    public Long getId() { return id; }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }

    public String getCodigoProduto() { return codigoProduto; }
    public void setCodigoProduto(String codigoProduto) { this.codigoProduto = codigoProduto; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }

    public Tamanho getTamanho() { return tamanho; }
    public void setTamanho(Tamanho tamanho) { this.tamanho = tamanho; }

    public Genero getGenero() { return genero; }
    public void setGenero(Genero genero) { this.genero = genero; }

    public String getTipoMovimentacao() { return tipoMovimentacao; }
    public void setTipoMovimentacao(String tipoMovimentacao) { this.tipoMovimentacao = tipoMovimentacao; }

    public String getCodigoMovimentacao() { return codigoMovimentacao; }
    public void setCodigoMovimentacao(String codigoMovimentacao) { this.codigoMovimentacao = codigoMovimentacao; }

    public int getQuantidadeMovimentada() { return quantidadeMovimentada; }
    public void setQuantidadeMovimentada(int quantidadeMovimentada) { this.quantidadeMovimentada = quantidadeMovimentada; }

    public int getEstoqueFinal() { return estoqueFinal; }
    public void setEstoqueFinal(int estoqueFinal) { this.estoqueFinal = estoqueFinal; }

    public BigDecimal getValorMovimentacao() { return valorMovimentacao; }
    public void setValorMovimentacao(BigDecimal valorMovimentacao) { this.valorMovimentacao = valorMovimentacao; }

    public String getParteEnvolvida() { return parteEnvolvida; }
    public void setParteEnvolvida(String parteEnvolvida) { this.parteEnvolvida = parteEnvolvida; }
}