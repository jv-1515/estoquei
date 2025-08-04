package com.example.estoquei.dto;

import java.util.List;

import com.example.estoquei.model.Produto;

public class GerarRelatorioRequest {
    private List<Produto> produtos;
    private String dataInicio;
    private String dataFim;
    private java.util.Map<String, String> filtrosAplicados;

    public List<Produto> getProdutos() { return produtos; }
    public void setProdutos(List<Produto> produtos) { this.produtos = produtos; }

    public String getDataInicio() { return dataInicio; }
    public void setDataInicio(String dataInicio) { this.dataInicio = dataInicio; }

    public String getDataFim() { return dataFim; }
    public void setDataFim(String dataFim) { this.dataFim = dataFim; }

    public java.util.Map<String, String> getFiltrosAplicados() { return filtrosAplicados; }
    public void setFiltrosAplicados(java.util.Map<String, String> filtrosAplicados) { this.filtrosAplicados = filtrosAplicados; }
}