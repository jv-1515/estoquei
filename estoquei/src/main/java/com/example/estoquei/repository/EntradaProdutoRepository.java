package com.example.estoquei.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.estoquei.model.EntradaProduto;

public interface EntradaProdutoRepository extends JpaRepository<EntradaProduto, Long> {
    
    List<EntradaProduto> findByDataEntrada(LocalDate dataEntrada);
}