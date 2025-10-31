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
    private java.math.BigDecimal precoMin;
    private java.math.BigDecimal precoMax;
    private String dataInicio;
    private String dataFim;
    private java.util.Map<String, String> filtrosAplicados;
    private String graficoBase64;

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

    public java.math.BigDecimal getPrecoMin() { return precoMin; }
    public void setPrecoMin(java.math.BigDecimal precoMin) { this.precoMin = precoMin; }

    public java.math.BigDecimal getPrecoMax() { return precoMax; }
    public void setPrecoMax(java.math.BigDecimal precoMax) { this.precoMax = precoMax; }

    public String getDataInicio() { return dataInicio; }
    public void setDataInicio(String dataInicio) { this.dataInicio = dataInicio; }

    public String getDataFim() { return dataFim; }
    public void setDataFim(String dataFim) { this.dataFim = dataFim; }

    public java.util.Map<String, String> getFiltrosAplicados() { return filtrosAplicados; }
    public void setFiltrosAplicados(java.util.Map<String, String> filtrosAplicados) { this.filtrosAplicados = filtrosAplicados; }

    public String getGraficoBase64() { return graficoBase64; }
    public void setGraficoBase64(String graficoBase64) { this.graficoBase64 = graficoBase64; }
}