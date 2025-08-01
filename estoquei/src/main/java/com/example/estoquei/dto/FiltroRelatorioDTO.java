package com.example.estoquei.dto;

import java.util.List;

public class FiltroRelatorioDTO {
    private List<Long> ids;
    private Integer quantidadeMin;
    private Integer quantidadeMax;
    private Boolean baixoEstoque;

    public List<Long> getIds() { return ids; }
    public void setIds(List<Long> ids) { this.ids = ids; }

    public Integer getQuantidadeMin() { return quantidadeMin; }
    public void setQuantidadeMin(Integer quantidadeMin) { this.quantidadeMin = quantidadeMin; }

    public Integer getQuantidadeMax() { return quantidadeMax; }
    public void setQuantidadeMax(Integer quantidadeMax) { this.quantidadeMax = quantidadeMax; }

    public Boolean getBaixoEstoque() { return baixoEstoque; }
    public void setBaixoEstoque(Boolean baixoEstoque) { this.baixoEstoque = baixoEstoque; }
}