package com.example.stokmais.resources;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.stokmais.model.Fornecedor;
import com.example.stokmais.model.MovimentacaoProduto;
import com.example.stokmais.model.Produto;
import com.example.stokmais.model.Usuario;
import com.example.stokmais.repository.MovimentacaoProdutoRepository;
import com.example.stokmais.repository.ProdutoRepository;
import com.example.stokmais.service.FornecedorService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/movimentacoes")
public class MovimentacaoProdutoResource {
    
    @Autowired
    private MovimentacaoProdutoRepository movimentacaoRepo;

    @Autowired
    private ProdutoRepository produtoRepo;

    @Autowired
    private FornecedorService fornecedorService;

    @GetMapping
    public List<MovimentacaoProduto> listarMovimentacoes() {
        return movimentacaoRepo.findAllOrderByDataDesc();
    }
    
    @GetMapping("/produto")
    public List<MovimentacaoProduto> listarPorProduto(@RequestParam String codigo) {
        return movimentacaoRepo.findByCodigoProdutoOrderByDataDesc(codigo);
    }
    
    @GetMapping("/tipo")
    public List<MovimentacaoProduto> listarPorTipo(@RequestParam String tipo) {
        return movimentacaoRepo.findByTipoMovimentacaoOrderByDataDesc(tipo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MovimentacaoProduto> atualizarMovimentacao(@PathVariable Long id, @RequestBody MovimentacaoProduto movimentacaoAtualizada) {
        Optional<MovimentacaoProduto> movimentacaoExistente = movimentacaoRepo.findById(id);
        
        if (movimentacaoExistente.isPresent()) {
            MovimentacaoProduto movimentacao = movimentacaoExistente.get();
            
            // Atualiza APENAS a movimentação
            movimentacao.setData(movimentacaoAtualizada.getData());
            movimentacao.setCodigoMovimentacao(movimentacaoAtualizada.getCodigoMovimentacao());
            movimentacao.setQuantidadeMovimentada(movimentacaoAtualizada.getQuantidadeMovimentada());
            movimentacao.setValorMovimentacao(movimentacaoAtualizada.getValorMovimentacao());
            movimentacao.setParteEnvolvida(movimentacaoAtualizada.getParteEnvolvida());
            
            MovimentacaoProduto movimentacaoSalva = movimentacaoRepo.save(movimentacao);
            return ResponseEntity.ok(movimentacaoSalva);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarMovimentacao(@PathVariable Long id) {
        if (movimentacaoRepo.existsById(id)) {
            movimentacaoRepo.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/existe-codigo")
    public boolean existeCodigoMovimentacao(@RequestParam("codigoMovimentacao") String codigoMovimentacao) {
        return movimentacaoRepo.existsByCodigoMovimentacao(codigoMovimentacao);
    }

    @GetMapping("/entradas/total-hoje")
    @ResponseBody
    public long totalEntradasHoje() {
        LocalDate hoje = LocalDate.now();
        return movimentacaoRepo.countByDataAndTipoMovimentacao(hoje, "ENTRADA");
    }

    @GetMapping("/saidas/total-hoje")
    @ResponseBody
    public long totalSaidasHoje() {
        LocalDate hoje = LocalDate.now();
        return movimentacaoRepo.countByDataAndTipoMovimentacao(hoje, "SAIDA");
    }

    @PostMapping("/entrada")
    @Transactional
    public ResponseEntity<MovimentacaoProduto> registrarEntrada(@RequestBody Map<String, Object> dadosEntrada, HttpSession session) {
        try {
            String codigo = (String) dadosEntrada.get("codigo");
            String codigoCompra = (String) dadosEntrada.get("codigoCompra");
            String dataEntrada = (String) dadosEntrada.get("dataEntrada");
            Long fornecedorId = Long.valueOf(dadosEntrada.get("fornecedorId").toString());

            Fornecedor fornecedor = fornecedorService.buscarPorId(fornecedorId);
            if (fornecedor == null) {
                return ResponseEntity.badRequest().body(null);
            }

            int quantidade = Integer.parseInt(dadosEntrada.get("quantidade").toString());
            double valorCompra = Double.parseDouble(dadosEntrada.get("valorCompra").toString());

            // Busca o produto
            Optional<Produto> produtoOpt = produtoRepo.findByCodigo(codigo);
            if (!produtoOpt.isPresent()) {
                return ResponseEntity.badRequest().build();
            }

            Produto produto = produtoOpt.get();
            
            // Atualiza estoque
            produto.setQuantidade(produto.getQuantidade() + quantidade);
            produto.setDtUltimaEntrada(LocalDate.parse(dataEntrada));
            produtoRepo.save(produto);

            // Cria movimentação
            MovimentacaoProduto movimentacao = new MovimentacaoProduto();
            movimentacao.setData(LocalDate.parse(dataEntrada));
            movimentacao.setCodigoProduto(codigo);
            movimentacao.setNome(produto.getNome());
    
            movimentacao.setCategoria(produto.getCategoria());
            movimentacao.setTamanho(produto.getTamanho());
            movimentacao.setGenero(produto.getGenero());
            
            movimentacao.setTipoMovimentacao("ENTRADA");
            movimentacao.setCodigoMovimentacao(codigoCompra);
            movimentacao.setQuantidadeMovimentada(quantidade);
            movimentacao.setEstoqueFinal(produto.getQuantidade());
            movimentacao.setValorMovimentacao(BigDecimal.valueOf(valorCompra));
            movimentacao.setParteEnvolvida(fornecedor.getNome_empresa());

            Usuario usuarioLogado = (Usuario) session.getAttribute("isActive");
            String codigoUsuario = usuarioLogado != null ? usuarioLogado.getCodigo() : "desconhecido";
            String nomeUsuario = usuarioLogado != null ? usuarioLogado.getNome() : "desconhecido";
            String[] nomes = nomeUsuario.trim().split("\\s+");
            String nomeFormatado = nomes.length == 1 ? nomes[0] : nomes[0] + " " + nomes[nomes.length - 1];
            movimentacao.setResponsavel(codigoUsuario + " - " + nomeFormatado);

            MovimentacaoProduto salva = movimentacaoRepo.save(movimentacao);
            return ResponseEntity.ok(salva);

        } catch (Exception e) {
            System.out.println("ERRO: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/saida")
    @Transactional
    public ResponseEntity<MovimentacaoProduto> registrarSaida(@RequestBody Map<String, Object> dadosSaida, HttpSession session) {
        try {
            String codigo = (String) dadosSaida.get("codigo");
            String codigoVenda = (String) dadosSaida.get("codigoVenda");
            String dataSaida = (String) dadosSaida.get("dataSaida");
            String comprador = (String) dadosSaida.get("comprador");
            int quantidade = Integer.parseInt(dadosSaida.get("quantidade").toString());
            double valorVenda = Double.parseDouble(dadosSaida.get("valorVenda").toString());

            // Busca o produto
            Optional<Produto> produtoOpt = produtoRepo.findByCodigo(codigo);
            if (!produtoOpt.isPresent()) {
                return ResponseEntity.badRequest().build();
            }

            Produto produto = produtoOpt.get();
            
            // Verifica estoque
            if (produto.getQuantidade() < quantidade) {
                return ResponseEntity.badRequest().build();
            }
            
            // Atualiza estoque
            produto.setQuantidade(produto.getQuantidade() - quantidade);
            produto.setDtUltimaSaida(LocalDate.parse(dataSaida));
            produtoRepo.save(produto);

            // Cria movimentação
            MovimentacaoProduto movimentacao = new MovimentacaoProduto();
            movimentacao.setData(LocalDate.parse(dataSaida));
            movimentacao.setCodigoProduto(codigo);
            movimentacao.setNome(produto.getNome());
            
            movimentacao.setCategoria(produto.getCategoria());
            
            movimentacao.setTamanho(produto.getTamanho());
            movimentacao.setGenero(produto.getGenero());

            movimentacao.setTipoMovimentacao("SAIDA");
            movimentacao.setCodigoMovimentacao(codigoVenda);
            movimentacao.setQuantidadeMovimentada(quantidade);
            movimentacao.setEstoqueFinal(produto.getQuantidade());
            movimentacao.setValorMovimentacao(BigDecimal.valueOf(valorVenda));
            movimentacao.setParteEnvolvida(comprador);

            Usuario usuarioLogado = (Usuario) session.getAttribute("isActive");
            String codigoUsuario = usuarioLogado != null ? usuarioLogado.getCodigo() : "desconhecido";
            String nomeUsuario = usuarioLogado != null ? usuarioLogado.getNome() : "desconhecido";
            String[] nomes = nomeUsuario.trim().split("\\s+");
            String nomeFormatado = nomes.length == 1 ? nomes[0] : nomes[0] + " " + nomes[nomes.length - 1];
            movimentacao.setResponsavel(codigoUsuario + " - " + nomeFormatado);

            MovimentacaoProduto salva = movimentacaoRepo.save(movimentacao);
            return ResponseEntity.ok(salva);

        } catch (Exception e) {
            System.out.println("ERRO: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping(params = "data")
    public List<MovimentacaoProduto> listarPorData(@RequestParam("data") String dataIso) {
        LocalDate data;
        try {
            data = LocalDate.parse(dataIso);
        } catch (Exception e) {
            return List.of(); // retorna lista vazia em caso de formato inválido
        }
        return movimentacaoRepo.findByDataOrderByDataDesc(data);
    }

    @GetMapping(params = {"dataInicio", "dataFim"})
    public List<MovimentacaoProduto> listarPorPeriodo(
        @RequestParam("dataInicio") String dataInicioIso,
        @RequestParam("dataFim") String dataFimIso
    ) {
        LocalDate inicio, fim;
        try {
            inicio = LocalDate.parse(dataInicioIso);
            fim = LocalDate.parse(dataFimIso);
        } catch (Exception e) {
            return List.of();
        }
        return movimentacaoRepo.findByDataBetweenOrderByDataDesc(inicio, fim);
    }

    @GetMapping("/total-movimentacoes")
    public int totalMovimentacoes() {
        return movimentacaoRepo.findAll().size();
    }

    @GetMapping("/nenhuma-movimentacao")
    public int nenhumaMovimentacao() {
        List<Produto> produtos = produtoRepo.findAll();
        List<String> codigosMovimentados = movimentacaoRepo.findAll().stream()
            .map(MovimentacaoProduto::getCodigoProduto)
            .distinct()
            .toList();
        long count = produtos.stream()
            .filter(p -> !codigosMovimentados.contains(p.getCodigo()))
            .count();
        return (int) count;
    }

    @GetMapping("/nenhuma-venda")
    public int nenhumaVenda() {
        List<MovimentacaoProduto> movs = movimentacaoRepo.findAll();
        List<String> codigosEntrada = movs.stream()
            .filter(m -> "ENTRADA".equals(m.getTipoMovimentacao()))
            .map(MovimentacaoProduto::getCodigoProduto)
            .distinct()
            .toList();
        List<String> codigosSaida = movs.stream()
            .filter(m -> "SAIDA".equals(m.getTipoMovimentacao()))
            .map(MovimentacaoProduto::getCodigoProduto)
            .distinct()
            .toList();
        long count = codigosEntrada.stream()
            .filter(cod -> !codigosSaida.contains(cod))
            .count();
        return (int) count;
    }


}
