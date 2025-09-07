package com.example.estoquei.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.example.estoquei.model.CargoUsuario;
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
        CargoUsuario cargo = filtro.getCargo();

        whereClause.add("u.ic_excluido = false");

        if ((nome != null && !nome.isEmpty()) || (codigo != null && !codigo.isEmpty()) || (email != null && !email.isEmpty())) {
            whereClause.add("(LOWER(u.nome) LIKE :termo OR LOWER(u.codigo) LIKE :termo OR LOWER(u.email) LIKE :termo)");
        }
        if (cargo != null) {
            whereClause.add("u.cargo = :cargo");
        }

        if (!whereClause.isEmpty()) {
            query += " WHERE " + String.join(" AND ", whereClause);
        }

        TypedQuery<Usuario> typedQuery = entityManager.createQuery(query, Usuario.class);

        if ((nome != null && !nome.isEmpty()) || (codigo != null && !codigo.isEmpty()) || (email != null && !email.isEmpty())) {
            String termo = nome != null && !nome.isEmpty() ? nome : (codigo != null && !codigo.isEmpty() ? codigo : email);
            typedQuery.setParameter("termo", "%" + termo.toLowerCase() + "%");
        }
        if (cargo != null) {
            typedQuery.setParameter("cargo", cargo);
        }

        return typedQuery.getResultList();
    }
}