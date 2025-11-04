package com.example.stokmais.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.stokmais.model.MovimentacaoProduto;

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
    
    @Query("SELECT COALESCE(SUM(m.quantidadeMovimentada), 0) FROM MovimentacaoProduto m WHERE m.data = :data AND m.tipoMovimentacao = :tipo")
    long countByDataAndTipoMovimentacao(@Param("data") LocalDate data, @Param("tipo") String tipo);
    
    @Query("SELECT m.codigoProduto, SUM(m.quantidadeMovimentada) FROM MovimentacaoProduto m WHERE m.tipoMovimentacao = ?1 AND m.data = ?2 GROUP BY m.codigoProduto")
    List<Object[]> somaMovimentacaoPorTipoEData(String tipo, LocalDate data);

    @Query("SELECT COALESCE(SUM(m.quantidadeMovimentada), 0) FROM MovimentacaoProduto m WHERE m.codigoProduto = ?1 AND m.tipoMovimentacao = ?2 AND m.data = ?3")
    int somaMovimentacaoHojePorCodigo(String codigo, String tipo, LocalDate data);

    @Query("SELECT m FROM MovimentacaoProduto m WHERE m.data = :data ORDER BY m.data DESC, m.id DESC")
    List<MovimentacaoProduto> findByDataOrderByDataDesc(@Param("data") LocalDate data);

    @Query("SELECT m FROM MovimentacaoProduto m WHERE m.data >= :inicio AND m.data <= :fim ORDER BY m.data DESC, m.id DESC")
    List<MovimentacaoProduto> findByDataBetweenOrderByDataDesc(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    boolean existsByCodigoMovimentacao(String codigoMovimentacao);
}