package com.example.estoquei.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.estoquei.model.MovimentacaoProduto;

@Repository
public interface MovimentacaoProdutoRepository extends JpaRepository<MovimentacaoProduto, Long> {
    
    // Busca todas as movimentações ordenadas por data (mais recente primeiro)
    @Query("SELECT m FROM MovimentacaoProduto m ORDER BY m.data DESC, m.id DESC")
    List<MovimentacaoProduto> findAllOrderByDataDesc();
    
    // Busca movimentações por código do produto
    @Query("SELECT m FROM MovimentacaoProduto m WHERE m.codigoProduto = ?1 ORDER BY m.data DESC")
    List<MovimentacaoProduto> findByCodigoProdutoOrderByDataDesc(String codigoProduto);
    
    // Busca movimentações por tipo (ENTRADA ou SAIDA)
    @Query("SELECT m FROM MovimentacaoProduto m WHERE m.tipoMovimentacao = ?1 ORDER BY m.data DESC")
    List<MovimentacaoProduto> findByTipoMovimentacaoOrderByDataDesc(String tipoMovimentacao);
}