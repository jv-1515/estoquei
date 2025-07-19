package com.example.estoquei.resources;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.estoquei.model.MovimentacaoProduto;
import com.example.estoquei.repository.MovimentacaoProdutoRepository;

@RestController
@RequestMapping("/api/movimentacoes")
public class MovimentacaoProdutoResource {
    
    @Autowired
    private MovimentacaoProdutoRepository movimentacaoRepo;
    
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

    // ROTA PARA ATUALIZAR MOVIMENTAÇÃO
    @PutMapping("/{id}")
    public ResponseEntity<MovimentacaoProduto> atualizarMovimentacao(@PathVariable Long id, @RequestBody MovimentacaoProduto movimentacaoAtualizada) {
        Optional<MovimentacaoProduto> movimentacaoExistente = movimentacaoRepo.findById(id);
        
        if (movimentacaoExistente.isPresent()) {
            MovimentacaoProduto movimentacao = movimentacaoExistente.get();
            
            // Atualiza apenas os campos editáveis
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

    // ROTA PARA DELETAR MOVIMENTAÇÃO
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarMovimentacao(@PathVariable Long id) {
        if (movimentacaoRepo.existsById(id)) {
            movimentacaoRepo.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}