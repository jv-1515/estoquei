package com.example.estoquei.repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.example.estoquei.model.Genero;
import com.example.estoquei.model.Produto;
import com.example.estoquei.model.Tamanho;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

@Repository
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

    //valida codigo
    public boolean existsByCodigo(String codigo) {
        String jpql = "SELECT COUNT(p) FROM Produto p WHERE p.codigo = :codigo";
        Long count = entityManager.createQuery(jpql, Long.class)
            .setParameter("codigo", codigo)
            .getSingleResult();
        return count > 0;
}

    //estoque
    public List<Produto> findAll() {
        return entityManager.createQuery("SELECT p FROM Produto p WHERE p.ic_excluido = false ORDER BY p.codigo ASC", Produto.class).getResultList();
    }

    //mostrando top
    public List<Produto> findTop(int top) {
    return entityManager.createQuery("SELECT p FROM Produto p", Produto.class)
        .setMaxResults(top)
        .getResultList();
    }

    //filtro estoque
    public List<Produto> findAndFilter(Produto produto) {
        String query = "SELECT p FROM Produto p";
        List<String> whereClause = new ArrayList<>();

        String codigo = produto.getCodigo();
        String nome = produto.getNome();
        String categoria = produto.getCategoria();
        Tamanho tamanho = produto.getTamanho();
        Genero genero = produto.getGenero();
        Integer quantidade = produto.getQuantidade();
        Integer limiteMinimo = produto.getLimiteMinimo();
        BigDecimal preco = produto.getPreco();

        if(codigo != null && !codigo.isEmpty()) {
            whereClause.add("p.codigo = :cd");
        }
        if(nome != null && !nome.isEmpty()) {
            whereClause.add("p.nome LIKE :nm");
        }
        if (categoria != null && !categoria.isEmpty()) {
            whereClause.add("p.categoria = :cat");
        }
        if(tamanho != null) {
            whereClause.add("p.tamanho = :tam");
        }
        if(genero != null) {
            whereClause.add("p.genero = :gen");
        }
        if(quantidade != null && quantidade > 0) {
            whereClause.add("p.quantidade = :qt");
        }
        if(limiteMinimo != null && limiteMinimo > 0) {
            whereClause.add("p.limiteMinimo = :lim");
        }
        if(preco != null) {
            whereClause.add("p.preco = :preco");
        }

        if (whereClause.size() > 0) {
            query += " WHERE " + String.join(" AND ", whereClause);
        }

        TypedQuery<Produto> typedQuery = entityManager.createQuery(query, Produto.class);
        if(codigo != null && !codigo.isEmpty()) {
            typedQuery.setParameter("cd", codigo);
        }
        if(nome != null && !nome.isEmpty()) {
            typedQuery.setParameter("nm", "%" + nome + "%");
        }
        if (categoria != null && !categoria.isEmpty()) {
            typedQuery.setParameter("cat", categoria);
        }
        if(tamanho != null) {
            typedQuery.setParameter("tam", tamanho);
        }
        if(genero != null) {
            typedQuery.setParameter("gen", genero);
        }
        if(quantidade != null && quantidade > 0) {
            typedQuery.setParameter("qt", quantidade);
        }
        if(limiteMinimo != null && limiteMinimo > 0) {
            typedQuery.setParameter("lim", limiteMinimo);
        }
        if(preco != null) {
            typedQuery.setParameter("preco", preco);
        }
        return typedQuery.getResultList();
    }

    
    //baixo estoque
    public List<Produto> filterMinLimit() {
        String query = "SELECT p FROM Produto p WHERE p.quantidade <= (p.limiteMinimo * 2) ORDER BY p.codigo ASC";
        return entityManager.createQuery(query, Produto.class).getResultList();
    }

    //mostrando top baixo estoque
    public List<Produto> findTopBaixoEstoque(int top) {
        return entityManager.createQuery(
            "SELECT p FROM Produto p WHERE p.quantidade <= p.limiteMinimo ORDER BY p.codigo ASC", Produto.class)
            .setMaxResults(top)
            .getResultList();
    }

    //filtro baixo estoque
    public List<Produto> findAndFilterMinLimit(Produto produto) {

        String query = "SELECT p FROM Produto p WHERE p.quantidade <= (p.limiteMinimo * 2) ORDER BY p.codigo ASC";
        List<String> whereClause = new ArrayList<>();
    
        String codigo = produto.getCodigo();
        String nome = produto.getNome();
        String categoria = produto.getCategoria();
        Tamanho tamanho = produto.getTamanho();
        Genero genero = produto.getGenero();
        Integer quantidade = produto.getQuantidade();
        Integer limiteMinimo = produto.getLimiteMinimo();
        BigDecimal preco = produto.getPreco();
    
        if(codigo != null && !codigo.isEmpty()) {
            whereClause.add("p.codigo = :cd");
        }
        if(nome != null && !nome.isEmpty()) {
            whereClause.add("p.nome LIKE :nm");
        }
        if (categoria != null && !categoria.isEmpty()) {
            whereClause.add("p.categoria = :cat");
        }
        if(tamanho != null) {
            whereClause.add("p.tamanho = :tam");
        }
        if(genero != null) {
            whereClause.add("p.genero = :gen");
        }
        if(quantidade != null && quantidade > 0) {
            whereClause.add("p.quantidade = :qt");
        }
        if(limiteMinimo != null && limiteMinimo > 0) {
            whereClause.add("p.limiteMinimo = :lim");
        }
        if(preco != null) {
            whereClause.add("p.preco = :preco");
        }
    
        if (!whereClause.isEmpty()) {
            query += " AND " + String.join(" AND ", whereClause);
        }
    
        TypedQuery<Produto> typedQuery = entityManager.createQuery(query, Produto.class);
        if(codigo != null && !codigo.isEmpty()) {
            typedQuery.setParameter("cd", codigo);
        }
        if(nome != null && !nome.isEmpty()) {
            typedQuery.setParameter("nm", "%" + nome + "%");
        }
        if (categoria != null && !categoria.isEmpty()) {
            typedQuery.setParameter("cat", categoria);
        }
        if(tamanho != null) {
            typedQuery.setParameter("tam", tamanho);
        }
        if(genero != null) {
            typedQuery.setParameter("gen", genero);
        }
        if(quantidade != null && quantidade > 0) {
            typedQuery.setParameter("qt", quantidade);
        }
        if(limiteMinimo != null && limiteMinimo > 0) {
            typedQuery.setParameter("lim", limiteMinimo);
        }
        if(preco != null) {
            typedQuery.setParameter("preco", preco);
        }
        return typedQuery.getResultList();
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

    public Optional<Produto> findByCodigo(String codigo) {
        String jpql = "SELECT p FROM Produto p WHERE p.codigo = :codigo";
        try {
            Produto produto = entityManager.createQuery(jpql, Produto.class)
                .setParameter("codigo", codigo)
                .getSingleResult();
            return Optional.of(produto);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public List<Produto> findAllById(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return new ArrayList<>();
        String jpql = "SELECT p FROM Produto p WHERE p.id IN :ids";
        return entityManager.createQuery(jpql, Produto.class)
            .setParameter("ids", ids)
            .getResultList();
    }

    public List<Produto> findAllRemovidos() {
        return entityManager.createQuery("SELECT p FROM Produto p WHERE p.ic_excluido = true", Produto.class).getResultList();
    }

    public List<Produto> findByCategoriaObj_Id(Long categoriaId) {
        String jpql = "SELECT p FROM Produto p WHERE p.categoriaObj.id = :categoriaId";
        return entityManager.createQuery(jpql, Produto.class)
            .setParameter("categoriaId", categoriaId)
            .getResultList();
    }
}