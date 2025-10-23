package com.example.estoquei.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.estoquei.dto.CategoriaDTO;
import com.example.estoquei.model.Categoria;
import com.example.estoquei.model.Fornecedor;
import com.example.estoquei.repository.CategoriaRepository;
import com.example.estoquei.repository.FornecedorRepository;

@Service
public class CategoriaService {
    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private FornecedorRepository fornecedorRepository;

    public void salvarCategorias(List<CategoriaDTO> categorias) {
        for (CategoriaDTO dto : categorias) {
            Categoria categoria;
            if (dto.id == null) {
                categoria = new Categoria();
            } else {
                categoria = categoriaRepository.findById(dto.id).orElse(new Categoria());
            }
            categoria.setNome(dto.nome);
            categoria.setTipoTamanho(dto.tipoTamanho);
            categoria.setTipoGenero(dto.tipoGenero);
            categoriaRepository.save(categoria);
        }
    }

    public void removerCategoria(Long id) {
        long produtosUsando = categoriaRepository.countProdutosByCategoriaId(id);
        if (produtosUsando > 0) {
            throw new RuntimeException("Não é possível remover: existem produtos usando esta categoria.");
        }
        // Remove dos fornecedores
        List<Fornecedor> fornecedores = fornecedorRepository.findAll();
        for (Fornecedor f : fornecedores) {
            if (f.getCategorias() != null && f.getCategorias().contains(id)) {
                f.getCategorias().remove(id);
                fornecedorRepository.save(f);
            }
        }
        categoriaRepository.deleteById(id);
    }
}