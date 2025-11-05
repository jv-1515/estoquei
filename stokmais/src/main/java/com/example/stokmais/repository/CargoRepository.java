package com.example.stokmais.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.stokmais.model.Cargo;

public interface CargoRepository extends JpaRepository<Cargo, Long> {
    Cargo findByNome(String nome);
}