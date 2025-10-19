package com.example.estoquei.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.estoquei.dto.CategoriaDTO;
import com.example.estoquei.model.Categoria;
import com.example.estoquei.repository.CategoriaRepository;

@Service
public class CategoriaService {
    @Autowired
    private CategoriaRepository categoriaRepository;

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
}