package com.example.stokmais.resources;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.stokmais.model.Fornecedor;
import com.example.stokmais.service.FornecedorService;

@RestController
@RequestMapping("/fornecedores")
public class FornecedorResource {

    @Autowired
    private FornecedorService fornecedorService;

    @GetMapping
    public ResponseEntity<List<Fornecedor>> listarTodos() {
        return ResponseEntity.ok(fornecedorService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Fornecedor> buscarPorId(@PathVariable Long id) {
        Fornecedor fornecedor = fornecedorService.buscarPorId(id);
        if (fornecedor != null) return ResponseEntity.ok(fornecedor);
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Fornecedor> salvar(@RequestBody Fornecedor fornecedor) {
        Fornecedor salvo = fornecedorService.salvar(fornecedor);
        return ResponseEntity.ok(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fornecedor> atualizar(@PathVariable Long id, @RequestBody Fornecedor fornecedor) {
        Fornecedor atualizado = fornecedorService.atualizar(id, fornecedor);
        if (atualizado != null) return ResponseEntity.ok(atualizado);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (fornecedorService.deletar(id)) return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/codigo-existe")
    public boolean codigoExiste(@RequestParam String codigo) {
        return fornecedorService.codigoExiste(codigo);
    }

    @GetMapping("/cnpj-existe")
    public boolean cnpjExiste(@RequestParam String cnpj) {
        return fornecedorService.cnpjExiste(cnpj);
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<Fornecedor> buscarPorCodigo(@PathVariable String codigo) {
        Fornecedor fornecedor = fornecedorService.buscarPorCodigo(codigo);
        if (fornecedor != null) return ResponseEntity.ok(fornecedor);
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/filtrar")
    public ResponseEntity<List<Fornecedor>> filtrar(@RequestBody Fornecedor filtro) {
        List<Fornecedor> resultado = fornecedorService.filtrar(filtro);
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/categoria-existe")
    public ResponseEntity<List<Fornecedor>> listarPorCategoria(@RequestParam Long categoriaId) {
        List<Fornecedor> fornecedores = fornecedorService.listarPorCategoriaId(categoriaId);
        return ResponseEntity.ok(fornecedores);
    }
}