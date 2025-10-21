package com.example.estoquei.repository;

import com.example.estoquei.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    Categoria findByNome(String nome);

    @Query("SELECT COUNT(p) FROM Produto p WHERE p.categoriaObj.id = :categoriaId")
    long countProdutosByCategoriaId(@Param("categoriaId") Long categoriaId);
}
