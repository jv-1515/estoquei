package com.example.stokmais.dto;

import java.math.BigDecimal;

public class ProdutoDTO {
    public Long id;
    public String codigo;
    public String nome;
    public String categoria;
    public Long categoriaId;
    public String tamanho;
    public String genero;
    public int quantidade;
    public int limiteMinimo;
    public BigDecimal preco;
    public String descricao;
    public String url_imagem;
}