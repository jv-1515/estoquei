package com.example.estoquei.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.estoquei.model.SaidaProduto;

public interface SaidaProdutoRepository extends JpaRepository<SaidaProduto, Long> {
    
    List<SaidaProduto> findByDataSaida(LocalDate dataSaida);
}