package com.example.estoquei.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.example.estoquei.model.Cargo;
import com.example.estoquei.model.Usuario;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

@Repository
public class UsuarioFiltroRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public List<Usuario> findAndFilter(Usuario filtro) {
        String query = "SELECT u FROM Usuario u";
        List<String> whereClause = new ArrayList<>();

        String nome = filtro.getNome();
        String codigo = filtro.getCodigo();
        String email = filtro.getEmail();
        Cargo cargo = filtro.getCargo();
        List<Long> cargoIds = filtro.getCargoIds();

        whereClause.add("u.ic_excluido = false");

        // Busca por nome, código ou email usando LIKE
        if ((nome != null && !nome.isEmpty()) || (codigo != null && !codigo.isEmpty()) || (email != null && !email.isEmpty())) {
            List<String> termos = new ArrayList<>();
            if (nome != null && !nome.isEmpty()) {
                termos.add("LOWER(u.nome) LIKE :nome");
            }
            if (codigo != null && !codigo.isEmpty()) {
                termos.add("LOWER(u.codigo) LIKE :codigo");
            }
            if (email != null && !email.isEmpty()) {
                termos.add("LOWER(u.email) LIKE :email");
            }
            whereClause.add("(" + String.join(" OR ", termos) + ")");
        }
        if (cargo != null) {
            whereClause.add("u.cargo = :cargo");
        }
        if (cargoIds != null && !cargoIds.isEmpty()) {
            whereClause.add("u.cargo.id IN :cargoIds");
        }

        if (!whereClause.isEmpty()) {
            query += " WHERE " + String.join(" AND ", whereClause);
        }

        TypedQuery<Usuario> typedQuery = entityManager.createQuery(query, Usuario.class);

        if (nome != null && !nome.isEmpty()) {
            typedQuery.setParameter("nome", "%" + nome.toLowerCase().replace(" ", "%") + "%");
        }
        if (codigo != null && !codigo.isEmpty()) {
            typedQuery.setParameter("codigo", "%" + codigo.toLowerCase() + "%");
        }
        if (email != null && !email.isEmpty()) {
            typedQuery.setParameter("email", "%" + email.toLowerCase() + "%");
        }
        if (cargo != null) {
            typedQuery.setParameter("cargo", cargo);
        }
        if (cargoIds != null && !cargoIds.isEmpty()) {
            typedQuery.setParameter("cargoIds", cargoIds);
        }

        return typedQuery.getResultList();
    }
}