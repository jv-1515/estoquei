package com.example.estoquei.dto;

import java.util.List;

import com.example.estoquei.model.Produto;

public class GerarRelatorioRequest {
    private List<Produto> produtos;
    private String dataInicio;
    private String dataFim;

    public List<Produto> getProdutos() { return produtos; }
    public void setProdutos(List<Produto> produtos) { this.produtos = produtos; }

    public String getDataInicio() { return dataInicio; }
    public void setDataInicio(String dataInicio) { this.dataInicio = dataInicio; }

    public String getDataFim() { return dataFim; }
    public void setDataFim(String dataFim) { this.dataFim = dataFim; }
}