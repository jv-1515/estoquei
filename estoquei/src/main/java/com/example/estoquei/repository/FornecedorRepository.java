package com.example.estoquei.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.estoquei.model.Fornecedor;

@Repository
public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> {
    boolean existsByCodigo(String codigo);
    boolean existsByCnpj(String cnpj);
    Fornecedor findByCodigo(String codigo);
}