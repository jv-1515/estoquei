package com.example.stokmais.dto;

import java.util.List;

public class MovimentacaoFiltroRequest {
    private String dataInicio;
    private String dataFim;
    private List<String> codigos;

    public String getDataInicio() { return dataInicio; }
    public void setDataInicio(String dataInicio) { this.dataInicio = dataInicio; }

    public String getDataFim() { return dataFim; }
    public void setDataFim(String dataFim) { this.dataFim = dataFim; }

    public List<String> getCodigos() { return codigos; }
    public void setCodigos(List<String> codigos) { this.codigos = codigos; }
}