package com.example.estoquei.resources;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.estoquei.model.Cargo;
import com.example.estoquei.service.CargoService;

@RestController
@RequestMapping("/cargos")
public class CargoResource {

    @Autowired
    private CargoService cargoService;

    @GetMapping
    public List<Cargo> listarTodos() {
        return cargoService.listarTodos();
    }

    @GetMapping("/{id}")
    public Cargo buscarPorId(@PathVariable Long id) {
        return cargoService.buscarPorId(id);
    }

    @PostMapping
    public Cargo salvar(@RequestBody Cargo cargo) {
        return cargoService.salvar(cargo);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        cargoService.deletar(id);
    }

    @PutMapping("/{id}")
    public Cargo atualizar(@PathVariable Long id, @RequestBody Cargo cargo) {
        Cargo existente = cargoService.buscarPorId(id);
        if (existente != null) {
            existente.setNome(cargo.getNome());
            existente.setProdutos(cargo.getProdutos());
            existente.setMovimentacoes(cargo.getMovimentacoes());
            existente.setRelatorios(cargo.getRelatorios());
            existente.setFornecedores(cargo.getFornecedores());
            existente.setFuncionarios(cargo.getFuncionarios());
            return cargoService.salvar(existente);
        }
        return null;
    }
}