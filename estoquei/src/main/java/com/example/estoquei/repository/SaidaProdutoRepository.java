package com.example.estoquei.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.estoquei.model.SaidaProduto;

public interface SaidaProdutoRepository extends JpaRepository<SaidaProduto, Long> {
    
    List<SaidaProduto> findByDataSaida(LocalDate dataSaida);

    @Query("SELECT COALESCE(SUM(s.quantidade), 0) FROM SaidaProduto s WHERE s.dataSaida = CURRENT_DATE")
    int somaSaidasHoje();

    @Query("SELECT COALESCE(SUM(s.quantidade), 0) FROM SaidaProduto s WHERE s.codigo = :codigo AND s.dataSaida = CURRENT_DATE")
    int somaSaidasHojePorCodigo(@Param("codigo") String codigo);
}