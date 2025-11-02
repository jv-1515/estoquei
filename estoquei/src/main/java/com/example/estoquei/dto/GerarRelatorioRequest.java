package com.example.estoquei.dto;

import java.util.List;

import com.example.estoquei.model.Produto;

public class GerarRelatorioRequest {
    private List<Produto> produtos;
    private String dataInicio;
    private String dataFim;
    private java.util.Map<String, String> filtrosAplicados;
    private String graficoBase64;
    private String graficoSaldoBase64;

    public List<Produto> getProdutos() { return produtos; }
    public void setProdutos(List<Produto> produtos) { this.produtos = produtos; }

    public String getDataInicio() { return dataInicio; }
    public void setDataInicio(String dataInicio) { this.dataInicio = dataInicio; }

    public String getDataFim() { return dataFim; }
    public void setDataFim(String dataFim) { this.dataFim = dataFim; }

    public java.util.Map<String, String> getFiltrosAplicados() { return filtrosAplicados; }
    public void setFiltrosAplicados(java.util.Map<String, String> filtrosAplicados) { this.filtrosAplicados = filtrosAplicados; }

    public String getGraficoBase64() {
        return graficoBase64;
    }

    public void setGraficoBase64(String graficoBase64) {
        this.graficoBase64 = graficoBase64;
    }

    public String getGraficoSaldoBase64() { return graficoSaldoBase64; }
    public void setGraficoSaldoBase64(String graficoSaldoBase64) { this.graficoSaldoBase64 = graficoSaldoBase64; }
}