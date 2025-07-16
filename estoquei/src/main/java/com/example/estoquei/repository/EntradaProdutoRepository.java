package com.example.estoquei.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.estoquei.model.EntradaProduto;

public interface EntradaProdutoRepository extends JpaRepository<EntradaProduto, Long> {
}