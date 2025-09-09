package com.example.estoquei.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.estoquei.model.Cargo;

public interface CargoRepository extends JpaRepository<Cargo, Long> {
    Cargo findByNome(String nome);
}