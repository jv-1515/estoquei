package com.example.estoquei.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.estoquei.model.EntradaProduto;

public interface EntradaProdutoRepository extends JpaRepository<EntradaProduto, Long> {
    
    List<EntradaProduto> findByDataEntrada(LocalDate dataEntrada);

    @Query("SELECT COALESCE(SUM(e.quantidade), 0) FROM EntradaProduto e WHERE e.dataEntrada = CURRENT_DATE")
    int somaEntradasHoje();

    @Query("SELECT COALESCE(SUM(e.quantidade), 0) FROM EntradaProduto e WHERE e.codigo = :codigo AND e.dataEntrada = CURRENT_DATE")
    int somaEntradasHojePorCodigo(@Param("codigo") String codigo);
}