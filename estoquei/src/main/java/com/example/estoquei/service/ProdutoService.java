package com.example.estoquei.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.estoquei.model.Produto;
import com.example.estoquei.repository.ProdutoRepository;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    public Produto salvar(Produto produto) {
        return produtoRepository.save(produto);
    }

    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id);
    }

    public Produto atualizar(Long id, Produto novoProduto) {
        Produto p = produtoRepository.findById(id);
        if (p != null) {
            p.setNome(novoProduto.getNome());
            p.setCodigo(novoProduto.getCodigo());
            p.setCategoria(novoProduto.getCategoria());
            p.setTamanho(novoProduto.getTamanho());
            p.setGenero(novoProduto.getGenero());
            p.setQuantidade(novoProduto.getQuantidade());
            p.setLimiteMinimo(novoProduto.getLimiteMinimo());
            p.setPreco(novoProduto.getPreco());
            p.setDescricao(novoProduto.getDescricao());
            return produtoRepository.save(p);
        }
        return null;
    }

    public boolean deletar(Long id) {
        if (produtoRepository.existsById(id)) {
            produtoRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
