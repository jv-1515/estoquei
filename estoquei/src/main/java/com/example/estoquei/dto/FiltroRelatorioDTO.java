package com.example.estoquei.dto;

import java.util.List;

public class FiltroRelatorioDTO {
    private List<Long> ids;
    private List<String> categorias;
    private List<String> tamanhos;
    private List<String> generos;
    private Integer quantidadeMin;
    private Integer quantidadeMax;
    private Boolean baixoEstoque;

    public List<Long> getIds() { return ids; }
    public void setIds(List<Long> ids) { this.ids = ids; }

    public List<String> getCategorias() { return categorias; }
    public void setCategorias(List<String> categorias) { this.categorias = categorias; }

    public List<String> getTamanhos() { return tamanhos; }
    public void setTamanhos(List<String> tamanhos) { this.tamanhos = tamanhos; }

    public List<String> getGeneros() { return generos; }
    public void setGeneros(List<String> generos) { this.generos = generos; }

    public Integer getQuantidadeMin() { return quantidadeMin; }
    public void setQuantidadeMin(Integer quantidadeMin) { this.quantidadeMin = quantidadeMin; }

    public Integer getQuantidadeMax() { return quantidadeMax; }
    public void setQuantidadeMax(Integer quantidadeMax) { this.quantidadeMax = quantidadeMax; }

    public Boolean getBaixoEstoque() { return baixoEstoque; }
    public void setBaixoEstoque(Boolean baixoEstoque) { this.baixoEstoque = baixoEstoque; }
}