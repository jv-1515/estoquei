package com.example.estoquei.repository;

import com.example.estoquei.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    Categoria findByNome(String nome);
}