package com.example.estoquei.service;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.estoquei.model.Produto;
import com.example.estoquei.model.Categoria;
import com.example.estoquei.repository.ProdutoRepository;
import com.example.estoquei.repository.CategoriaRepository;


@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final FirebaseStorageService firebaseStorageService;
    private final CategoriaRepository categoriaRepository;

    @Autowired
    public ProdutoService(ProdutoRepository produtoRepository, FirebaseStorageService firebaseStorageService, CategoriaRepository categoriaRepository) {
        this.produtoRepository = produtoRepository;
        this.firebaseStorageService = firebaseStorageService;
        this.categoriaRepository = categoriaRepository;
    }

    public Produto salvar(Produto produto, MultipartFile foto) throws IOException {
        if (produto.getCategoria() != null && produto.getCategoria().getNome() != null) {
            String nomeCategoria = produto.getCategoria().getNome();
            Categoria categoria = categoriaRepository.findByNome(nomeCategoria);
            if (categoria == null) {
                throw new RuntimeException("Categoria não encontrada: " + nomeCategoria);
            }
            produto.setCategoria(categoria);
        } else {
            throw new RuntimeException("Categoria não informada!");
        }

        if (foto != null && !foto.isEmpty()) {
            String imageUrl = firebaseStorageService.uploadFile(foto, "imagens");
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
            // Só atualiza se vier preenchido (campos String)
            if (novoProduto.getNome() != null && !novoProduto.getNome().isEmpty())
                p.setNome(novoProduto.getNome());

            if (novoProduto.getCodigo() != null && !novoProduto.getCodigo().isEmpty())
                p.setCodigo(novoProduto.getCodigo());

            if (novoProduto.getCategoria() != null && novoProduto.getCategoria().getNome() != null) {
                Categoria categoria = categoriaRepository.findByNome(novoProduto.getCategoria().getNome());
                if (categoria == null) throw new RuntimeException("Categoria não encontrada!");
                p.setCategoria(categoria);
            }

            if (novoProduto.getTamanho() != null)
                p.setTamanho(novoProduto.getTamanho());

            if (novoProduto.getGenero() != null)
                p.setGenero(novoProduto.getGenero());

            p.setQuantidade(novoProduto.getQuantidade());
            p.setLimiteMinimo(novoProduto.getLimiteMinimo());

            if (novoProduto.getPreco() != null)
                p.setPreco(novoProduto.getPreco());

            if (novoProduto.getDescricao() != null)
                p.setDescricao(novoProduto.getDescricao());

            if (foto != null && !foto.isEmpty()) {
                if (p.getUrl_imagem() != null && !p.getUrl_imagem().isEmpty()) {
                    try {
                        firebaseStorageService.deleteFileByFirebaseUrl(p.getUrl_imagem());
                    } catch (Exception e) {
                        System.err.println("Falha ao deletar imagem antiga do Firebase: " + e.getMessage());
                    }
                }
                String novaImageUrl = firebaseStorageService.uploadFile(foto, "imagens");
                p.setUrl_imagem(novaImageUrl);
            } else if (novoProduto.getUrl_imagem() == null || novoProduto.getUrl_imagem().isEmpty()) {
                // Se quiser remover a imagem caso o campo venha vazio, descomente abaixo:
                // if (p.getUrl_imagem() != null && !p.getUrl_imagem().isEmpty()) {
                //     firebaseStorageService.deleteFileByFirebaseUrl(p.getUrl_imagem());
                // }
                // p.setUrl_imagem(null);
            }

            return produtoRepository.save(p);
        }
        return null;
    }

        public List<Produto> listarRemovidos() {
        return produtoRepository.findAllRemovidos();
    }

    public boolean deletar(Long id, String responsavel) {
        Produto produtoParaDeletar = produtoRepository.findById(id);
    
        if (produtoParaDeletar != null) {
            produtoParaDeletar.setIc_excluido(true);
            produtoParaDeletar.setDataExclusao(java.time.LocalDate.now());
            produtoParaDeletar.setResponsavelExclusao(responsavel); // <-- igual movimentação!
            produtoRepository.save(produtoParaDeletar);
            return true;
        }
        return false;
    }

        public void excluirDefinitivo(Long id) {
            Produto produto = produtoRepository.findById(id);
            if (produto != null && produto.getUrl_imagem() != null && !produto.getUrl_imagem().isEmpty()) {
                try {
                    firebaseStorageService.deleteFileByFirebaseUrl(produto.getUrl_imagem());
                } catch (Exception e) {
                    System.err.println("Falha ao tentar deletar a imagem do Firebase para o produto ID " + id + ": " + e.getMessage());
                }
            }
            produtoRepository.deleteById(id);
    }
}