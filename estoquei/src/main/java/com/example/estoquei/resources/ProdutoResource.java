package com.example.estoquei.resources;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
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

import com.example.estoquei.model.Produto;
import com.example.estoquei.model.Tamanho;
import com.example.estoquei.model.Genero;
import com.example.estoquei.model.Usuario;
import com.example.estoquei.repository.MovimentacaoProdutoRepository;
import com.example.estoquei.service.ProdutoService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/produtos")
public class ProdutoResource {

    private final ProdutoService produtoService;
    
    @Autowired
    private MovimentacaoProdutoRepository movimentacaoRepo;

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

        List<Object[]> entradasHoje = movimentacaoRepo.somaMovimentacaoPorTipoEData("ENTRADA", hoje);
        List<Object[]> saidasHoje = movimentacaoRepo.somaMovimentacaoPorTipoEData("SAIDA", hoje);

        Map<String, Integer> entradasPorCodigo = entradasHoje.stream()
            .collect(Collectors.toMap(
                row -> (String) row[0],
                row -> ((Number) row[1]).intValue()
            ));

        Map<String, Integer> saidasPorCodigo = saidasHoje.stream()
            .collect(Collectors.toMap(
                row -> (String) row[0],
                row -> ((Number) row[1]).intValue()
            ));

        return produtos.stream().map(produto -> {
            Map<String, Object> produtoMap = new HashMap<>();
            produtoMap.put("id", produto.getId());
            produtoMap.put("codigo", produto.getCodigo());
            produtoMap.put("nome", produto.getNome());
            produtoMap.put("categoria", produto.getCategoria());
            produtoMap.put("categoriaId", produto.getCategoriaObj() != null ? produto.getCategoriaObj().getId() : null);
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

    @GetMapping("/removidos")
    public List<Map<String, Object>> listarRemovidos() {
        List<Produto> produtos = produtoService.listarRemovidos();
        return produtos.stream().map(produto -> {
            Map<String, Object> produtoMap = new HashMap<>();
            produtoMap.put("id", produto.getId());
            produtoMap.put("codigo", produto.getCodigo());
            produtoMap.put("nome", produto.getNome());
            produtoMap.put("categoria", produto.getCategoria() != null ? produto.getCategoria() : "");
            produtoMap.put("tamanho", produto.getTamanho() != null ? produto.getTamanho().toString() : "");
            produtoMap.put("genero", produto.getGenero() != null ? produto.getGenero().toString() : "");
            produtoMap.put("quantidade", produto.getQuantidade());
            produtoMap.put("limiteMinimo", produto.getLimiteMinimo());
            produtoMap.put("preco", produto.getPreco());
            produtoMap.put("descricao", produto.getDescricao());
            produtoMap.put("url_imagem", produto.getUrl_imagem() != null && !produto.getUrl_imagem().isEmpty()
                ? produto.getUrl_imagem()
                : null);
            produtoMap.put("dataExclusao", produto.getDataExclusao());
            produtoMap.put("responsavelExclusao", produto.getResponsavelExclusao());
            return produtoMap;
        }).collect(Collectors.toList());
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

    @PostMapping("/{id}")
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
    public ResponseEntity<Void> deletar(@PathVariable Long id, HttpSession session) {
        Usuario usuarioLogado = (Usuario) session.getAttribute("isActive");
        if (usuarioLogado == null || usuarioLogado.getCargo() == null || usuarioLogado.getCargo().getProdutos() < 4) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        String codigoUsuario = usuarioLogado.getCodigo();
        String nomeUsuario = usuarioLogado.getNome();
        String[] nomes = nomeUsuario.trim().split("\\s+");
        String nomeFormatado = nomes.length == 1 ? nomes[0] : nomes[0] + " " + nomes[nomes.length - 1];
        String responsavel = codigoUsuario + " - " + nomeFormatado;

        boolean removido = produtoService.deletar(id, responsavel);
        if (removido) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/excluir/{id}")
    public ResponseEntity<Void> deletarDefinitivo(@PathVariable Long id) {
        produtoService.excluirDefinitivo(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/restaurar/{id}")
    public ResponseEntity<Void> restaurarProduto(@PathVariable Long id) {
        Produto produto = produtoService.buscarPorId(id);
        if (produto != null && produto.getIc_excluido()) {
            produto.setIc_excluido(false);
            produto.setDataExclusao(null);
            produto.setResponsavelExclusao(null);
            try {
                produtoService.salvar(produto, null);
            } catch (IOException e) {
                System.err.println("Erro ao restaurar produto: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{codigo}/movimentacao-hoje")
    public Map<String, Integer> movimentacaoHoje(@PathVariable String codigo) {
        LocalDate hoje = LocalDate.now();
        Map<String, Integer> resultado = new HashMap<>();
        resultado.put("entradasHoje", movimentacaoRepo.somaMovimentacaoHojePorCodigo(codigo, "ENTRADA", hoje));
        resultado.put("saidasHoje", movimentacaoRepo.somaMovimentacaoHojePorCodigo(codigo, "SAIDA", hoje));
        return resultado;
    }

    @GetMapping("/tamanhos")
    public ResponseEntity<List<String>> getTamanhos() {
        List<String> tamanhos = Arrays.stream(Tamanho.values())
            .map(Enum::name)
            .collect(Collectors.toList());
        return ResponseEntity.ok(tamanhos);
    }

    @GetMapping("/generos")
    public ResponseEntity<List<String>> getGeneros() {
        List<String> generos = Arrays.stream(Genero.values())
            .map(Enum::name)
            .collect(Collectors.toList());
        return ResponseEntity.ok(generos);
    }
}
