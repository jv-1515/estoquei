package com.example.estoquei.repository;

import com.example.estoquei.model.Produto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class ProdutoRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public Produto save(Produto produto) {
        Long id = produto.getId();
        if (id == null || id == 0) {
            entityManager.persist(produto);
        } else {
            entityManager.merge(produto);
        }
        return produto;
    }


    public List<Produto> findAll() {
        return entityManager.createQuery("SELECT p FROM Produto p", Produto.class).getResultList();
    }

    public Produto findById(Long id) {
        return entityManager.find(Produto.class, id);
    }

    public boolean existsById(Long id) {
        Produto produto = entityManager.find(Produto.class, id);
        return produto != null;
    }

    public void deleteById(Long id) {
        Produto produto = entityManager.find(Produto.class, id);
        if (produto != null) {
            entityManager.remove(produto);
        }
    }
}