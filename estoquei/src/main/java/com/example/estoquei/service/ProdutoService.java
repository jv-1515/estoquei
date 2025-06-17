package com.example.estoquei.service;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.estoquei.model.Produto;
import com.example.estoquei.repository.ProdutoRepository;


@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final FirebaseStorageService firebaseStorageService;

    @Autowired
    public ProdutoService(ProdutoRepository produtoRepository, FirebaseStorageService firebaseStorageService) {
        this.produtoRepository = produtoRepository;
        this.firebaseStorageService = firebaseStorageService;
    }

    public Produto salvar(Produto produto, MultipartFile foto) throws IOException {
        if (foto != null && !foto.isEmpty()) {
            String imageUrl = firebaseStorageService.uploadFile(foto, "produtos");
            produto.setUrl_imagem(imageUrl);
        }
        return produtoRepository.save(produto);
    }

    public boolean codigoExiste(String codigo) {
        return produtoRepository.existsByCodigo(codigo);
    }
    
    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    public List<Produto> listarTop(int top) {
        return produtoRepository.findTop(top);
    }

    public List<Produto> listarBaixoEstoque() {
    return produtoRepository.filterMinLimit();
    }

    public List<Produto> listarTopBaixoEstoque(int top) {
    return produtoRepository.findTopBaixoEstoque(top);
}

    public List<Produto> filtrarBaixoEstoque(Produto produto) {
    return produtoRepository.findAndFilterMinLimit(produto);
    }

    public List<Produto> buscar(Produto filtro) {
        return produtoRepository.findAndFilter(filtro);
    }

    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id);
    }

    public Produto atualizar(Long id, Produto novoProduto, MultipartFile foto) throws IOException {
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

            if (foto != null && !foto.isEmpty()) {
                if (p.getUrl_imagem() != null && !p.getUrl_imagem().isEmpty()) {
                    try {
                        firebaseStorageService.deleteFileByFirebaseUrl(p.getUrl_imagem());
                    } catch (Exception e) {
                        System.err.println("Falha ao deletar imagem antiga do Firebase: " + e.getMessage());
                    }
                }
                String novaImageUrl = firebaseStorageService.uploadFile(foto, "produtos");
                p.setUrl_imagem(novaImageUrl);
            }
            else if (novoProduto.getUrl_imagem() == null || novoProduto.getUrl_imagem().isEmpty()) {
                if (p.getUrl_imagem() != null && !p.getUrl_imagem().isEmpty()) {
                    firebaseStorageService.deleteFileByFirebaseUrl(p.getUrl_imagem());
                }
                p.setUrl_imagem(null);
            }


            return produtoRepository.save(p);
        }
        return null;
    }

    public boolean deletar(Long id) {
        Produto produtoParaDeletar = produtoRepository.findById(id);

        if (produtoParaDeletar != null) {
            if (produtoParaDeletar.getUrl_imagem() != null && !produtoParaDeletar.getUrl_imagem().isEmpty()) {
                try {
                    firebaseStorageService.deleteFileByFirebaseUrl(produtoParaDeletar.getUrl_imagem());
                    produtoRepository.deleteById(id);
                } catch (Exception e) {
                    System.err.println("Falha ao tentar deletar a imagem do Firebase para o produto ID " + id + ": " + e.getMessage());
                }
            }
            produtoRepository.deleteById(id);
            return true;
        }
        return false;
    }
}