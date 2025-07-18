package com.example.estoquei.resources;

import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.estoquei.model.EntradaProduto;
import com.example.estoquei.model.Produto;
import com.example.estoquei.model.SaidaProduto;
import com.example.estoquei.repository.EntradaProdutoRepository;
import com.example.estoquei.repository.SaidaProdutoRepository;
import com.example.estoquei.service.ProdutoService;

@RestController
@RequestMapping("/produtos")
public class ProdutoResource {

    private final ProdutoService produtoService;
    
    @Autowired
    private EntradaProdutoRepository entradaRepo;
    
    @Autowired
    private SaidaProdutoRepository saidaRepo;

    public ProdutoResource(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping("/codigo-existe")
    @ResponseBody
    public boolean codigoProdutoExiste(@RequestParam String codigo) {
        return produtoService.codigoExiste(codigo);
    }

    @PostMapping
    public ResponseEntity<?> salvar(
            @ModelAttribute Produto produto,
            @RequestParam("foto") MultipartFile foto
    ) {
        try {
            System.out.println("Iniciando o upload da imagem: " + (foto != null ? foto.getOriginalFilename() : "Nenhuma imagem enviada"));
            Produto produtoSalvo = produtoService.salvar(produto, foto);
            return ResponseEntity.status(HttpStatus.CREATED).body(produtoSalvo);
        } catch (IOException e) {
            System.err.println("Erro no upload da imagem: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Falha no upload da imagem");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        } catch (Exception e) {
            System.err.println("Erro ao salvar produto: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Falha ao salvar produto");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping
    public List<Map<String, Object>> listarProdutos() {
        List<Produto> produtos = produtoService.listarTodos();
        LocalDate hoje = LocalDate.now();
        
        List<EntradaProduto> entradasHoje = entradaRepo.findByDataEntrada(hoje);
        
        List<SaidaProduto> saidasHoje = saidaRepo.findByDataSaida(hoje);
        
        Map<String, Integer> entradasPorCodigo = entradasHoje.stream()
            .collect(Collectors.groupingBy(
                EntradaProduto::getCodigo,
                Collectors.summingInt(EntradaProduto::getQuantidade)
            ));
        
        Map<String, Integer> saidasPorCodigo = saidasHoje.stream()
            .collect(Collectors.groupingBy(
                SaidaProduto::getCodigo,
                Collectors.summingInt(SaidaProduto::getQuantidade)
            ));
        
        return produtos.stream().map(produto -> {
            Map<String, Object> produtoMap = new HashMap<>();
            produtoMap.put("id", produto.getId());
            produtoMap.put("codigo", produto.getCodigo());
            produtoMap.put("nome", produto.getNome());
            produtoMap.put("categoria", produto.getCategoria() != null ? produto.getCategoria().toString() : "");
            produtoMap.put("tamanho", produto.getTamanho() != null ? produto.getTamanho().toString() : "");
            produtoMap.put("genero", produto.getGenero() != null ? produto.getGenero().toString() : "");
            produtoMap.put("quantidade", produto.getQuantidade()); 
            produtoMap.put("limiteMinimo", produto.getLimiteMinimo());
            produtoMap.put("preco", produto.getPreco());
            produtoMap.put("descricao", produto.getDescricao());
            produtoMap.put("url_imagem", produto.getUrl_imagem());
            produtoMap.put("dtUltimaEntrada", produto.getDtUltimaEntrada());
            produtoMap.put("dtUltimaSaida", produto.getDtUltimaSaida());
            produtoMap.put("entradasHoje", entradasPorCodigo.getOrDefault(produto.getCodigo(), 0));
            produtoMap.put("saidasHoje", saidasPorCodigo.getOrDefault(produto.getCodigo(), 0));
            return produtoMap;
        }).collect(Collectors.toList());
    }

    
    @PostMapping("/filtrar")
    public ResponseEntity<List<Produto>> listarTodos(
        @RequestBody Produto filtro
    ) {
        List<Produto> produtos = produtoService.buscar(filtro);
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/baixo-estoque")
    public ResponseEntity<List<Produto>> listarBaixoEstoque(@RequestParam(required = false) Integer top) {
        List<Produto> produtos;
        if (top != null) {
            produtos = produtoService.listarTopBaixoEstoque(top);
        } else {
            produtos = produtoService.listarBaixoEstoque();
        }
        return ResponseEntity.ok(produtos);
    }

    @PostMapping("/baixo-estoque/filtrar")
    public ResponseEntity<List<Produto>> filtrarBaixoEstoque(@RequestBody Produto filtro) {
        List<Produto> produtos = produtoService.filtrarBaixoEstoque(filtro);
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        Produto produto = produtoService.buscarPorId(id);
        if (produto != null) {
            return ResponseEntity.ok(produto);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
            @PathVariable Long id,
            @ModelAttribute Produto produtoAtualizado,
           @RequestParam(value = "foto", required = false) MultipartFile foto
    ) {
        try {
            Produto atualizado = produtoService.atualizar(id, produtoAtualizado, foto);
            if (atualizado != null) {
                return ResponseEntity.ok(atualizado);
            }
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            System.err.println("Erro no upload da imagem ao atualizar: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Falha no upload da imagem ao atualizar");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        } catch (Exception e) {
            System.err.println("Erro ao atualizar produto: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Falha ao atualizar produto");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        boolean removido = produtoService.deletar(id);
        if (removido) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{codigo}/movimentacao-hoje")
    public Map<String, Integer> movimentacaoHoje(@PathVariable String codigo) {
        Map<String, Integer> resultado = new HashMap<>();
        resultado.put("entradasHoje", entradaRepo.somaEntradasHojePorCodigo(codigo));
        resultado.put("saidasHoje", saidaRepo.somaSaidasHojePorCodigo(codigo));
        return resultado;
    }
}
