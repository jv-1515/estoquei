package com.example.estoquei.repository;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

@Repository
public class MovimentacaoProdutoRepositoryCustomImpl {

    @PersistenceContext
    private EntityManager entityManager;

    public LocalDate buscarUltimaEntrada(String codigoProduto) {
        String jpql = "SELECT m.data FROM MovimentacaoProduto m WHERE m.codigoProduto = :codigo AND m.tipoMovimentacao = 'ENTRADA' ORDER BY m.data DESC";
        List<LocalDate> datas = entityManager.createQuery(jpql, LocalDate.class)
            .setParameter("codigo", codigoProduto)
            .setMaxResults(1)
            .getResultList();
        return datas.isEmpty() ? null : datas.get(0);
    }

    public LocalDate buscarUltimaSaida(String codigoProduto) {
        String jpql = "SELECT m.data FROM MovimentacaoProduto m WHERE m.codigoProduto = :codigo AND m.tipoMovimentacao = 'SAIDA' ORDER BY m.data DESC";
        List<LocalDate> datas = entityManager.createQuery(jpql, LocalDate.class)
            .setParameter("codigo", codigoProduto)
            .setMaxResults(1)
            .getResultList();
        return datas.isEmpty() ? null : datas.get(0);
    }

    public int totalEntradas(String codigoProduto) {
        String jpql = "SELECT SUM(m.quantidadeMovimentada) FROM MovimentacaoProduto m WHERE m.codigoProduto = :codigo AND m.tipoMovimentacao = 'ENTRADA'";
        Long total = entityManager.createQuery(jpql, Long.class)
            .setParameter("codigo", codigoProduto)
            .getSingleResult();
        return total != null ? total.intValue() : 0;
    }

    public int totalSaidas(String codigoProduto) {
        String jpql = "SELECT SUM(m.quantidadeMovimentada) FROM MovimentacaoProduto m WHERE m.codigoProduto = :codigo AND m.tipoMovimentacao = 'SAIDA'";
        Long total = entityManager.createQuery(jpql, Long.class)
            .setParameter("codigo", codigoProduto)
            .getSingleResult();
        return total != null ? total.intValue() : 0;
    }
}
