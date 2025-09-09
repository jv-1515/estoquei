package com.example.estoquei.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.estoquei.model.Cargo;
import com.example.estoquei.repository.CargoRepository;

@Service
public class CargoService {

    @Autowired
    private CargoRepository cargoRepository;

    public List<Cargo> listarTodos() {
        return cargoRepository.findAll();
    }

    public Cargo buscarPorId(Long id) {
        return cargoRepository.findById(id).orElse(null);
    }

    public Cargo buscarPorNome(String nome) {
        return cargoRepository.findByNome(nome);
    }

    public Cargo salvar(Cargo cargo) {
        return cargoRepository.save(cargo);
    }

    public void deletar(Long id) {
        cargoRepository.deleteById(id);
    }
}