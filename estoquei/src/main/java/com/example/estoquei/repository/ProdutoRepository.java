package com.example.estoquei.repository;

import com.example.estoquei.model.Produto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Repository;
import com.example.estoquei.model.Categoria;
import com.example.estoquei.model.Genero;
import com.example.estoquei.model.Tamanho;
import java.math.BigDecimal;
import java.util.ArrayList;
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

    
    public List<Produto> findAndFilter(Produto produto) {
        String query = "SELECT p FROM Produto p";
        List<String> whereClause = new ArrayList<>();

        String codigo = produto.getCodigo();
        String nome = produto.getNome();
        Categoria categoria = produto.getCategoria();
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
        if(categoria != null) {
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
        if(categoria != null) {
            typedQuery.setParameter("cat",  categoria);
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
}