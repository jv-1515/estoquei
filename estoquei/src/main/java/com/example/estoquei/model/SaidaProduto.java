package com.example.estoquei.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "saidas_produto")
public class SaidaProduto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo")
    private String codigo;

    private String nome;

    @Column(name = "codigo_venda")
    private String codigoVenda;

    @Column(name = "data_saida")
    private LocalDate dataSaida;

    private String comprador;

    private int quantidade;

    @Column(name = "valor_venda")
    private BigDecimal valorVenda;

    // Getters e setters
    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCodigoVenda() { return codigoVenda; }
    public void setCodigoVenda(String codigoVenda) { this.codigoVenda = codigoVenda; }
    public LocalDate getDataSaida() { return dataSaida; }
    public void setDataSaida(LocalDate dataSaida) { this.dataSaida = dataSaida; }
    public String getComprador() { return comprador; }
    public void setComprador(String comprador) { this.comprador = comprador; }
    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
    public BigDecimal getValorVenda() { return valorVenda; }
    public void setValorVenda(BigDecimal valorVenda) { this.valorVenda = valorVenda; }
}