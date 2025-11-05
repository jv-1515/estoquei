package com.example.stokmais.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.stokmais.dto.CategoriaDTO;
import com.example.stokmais.model.Usuario;
import com.example.stokmais.repository.CategoriaRepository;
import com.example.stokmais.repository.MovimentacaoProdutoRepository;
import com.example.stokmais.service.CategoriaService;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/")
public class Router {

    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private MovimentacaoProdutoRepository movimentacaoRepo;

    @Autowired
    private CategoriaService categoriaService;

    private Usuario getUsuarioOuRedireciona(HttpSession session) {
        return (Usuario) session.getAttribute("isActive");
    }

    //login
    @GetMapping
    public String login() {
        return "login";
    }

    //Inicio
    @GetMapping("/inicio")
    public String inicio(HttpSession session, Model model) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario == null) return "redirect:/";
        model.addAttribute("nome", usuario.getNome());
        model.addAttribute("cargo", usuario.getCargo());
        return "inicio";
    }

    //estoque
    @GetMapping("/estoque")
    public String estoque(HttpSession session, Model model) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario == null) return "redirect:/";
        if (usuario.getCargo() == null || usuario.getCargo().getProdutos() < 1) {
            return "redirect:/inicio";
        }
        model.addAttribute("cargo", usuario.getCargo());
        return "estoque";
    }

    @GetMapping("/baixo-estoque")
    public String baixoEstoque(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario == null) return "redirect:/";
        if (usuario.getCargo() == null || usuario.getCargo().getMovimentacoes() < 2) {
            return "redirect:/inicio";
        }
        return "baixo_estoque";
    }

    //produto
    @GetMapping("/cadastrar-produto")
    public String cadastro(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario == null) return "redirect:/";
        if (usuario.getCargo() == null || usuario.getCargo().getProdutos() < 2) {
            return "redirect:/inicio";
        }
        return "cadastrar_produto";
    }

    @GetMapping("/editar-produto")
    public String editarProduto(HttpSession session, Model model) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario == null) return "redirect:/";
        if (usuario.getCargo() == null || usuario.getCargo().getProdutos() < 3) {
            return "redirect:/inicio";
        }
        model.addAttribute("cargo", usuario.getCargo());
        return "editar_produto";
    }


    @GetMapping("/produtos-removidos")
    public String produtosRemovidos(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario == null) return "redirect:/";
        return "produtos_removidos";
    }

    @GetMapping("/categorias")
    @ResponseBody
    public List<CategoriaDTO> listarCategorias() {
        return categoriaRepository.findAll().stream().map(cat -> {
            CategoriaDTO dto = new CategoriaDTO();
            dto.id = cat.getId();
            dto.nome = cat.getNome();
            dto.tipoTamanho = cat.getTipoTamanho();
            dto.tipoGenero = cat.getTipoGenero();
            return dto;
        }).collect(Collectors.toList());
    }

    @PostMapping("/categorias/salvar")
    public ResponseEntity<?> salvarCategorias(@RequestBody List<CategoriaDTO> categorias) {
        categoriaService.salvarCategorias(categorias);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/gerenciar-funcionarios")
    public String gerenciarFuncionarios(Model model, HttpSession session) {
        Usuario usuarioLogado = (Usuario) session.getAttribute("isActive");
        if (usuarioLogado == null) return "redirect:/";
        if (usuarioLogado.getCargo() != null && usuarioLogado.getCargo().getFuncionarios() >= 1) {
            model.addAttribute("usuarioLogado", usuarioLogado);
            return "gerenciar_funcionarios";
        }
        return "redirect:/inicio";
    }

    //infos do usuario
    @GetMapping("/infos-usuario")
    public String infosUsuario(HttpSession session, Model model) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario == null) return "redirect:/";
        model.addAttribute("usuarioLogado", usuario);
        model.addAttribute("cargo", usuario.getCargo());
        return "infos_usuario";
    }

    //fornecedor
    @GetMapping("/gerenciar-fornecedores")
    public String gerenciarFornecedor(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario == null) return "redirect:/";
        if (usuario.getCargo() != null && usuario.getCargo().getFornecedores() >= 1) {
            return "gerenciar_fornecedores";
        }
        return "redirect:/inicio";
    }

    //gerenciar relatorios
    @GetMapping("/gerenciar-relatorios")
    public String gerenciarRelatorios(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario == null) return "redirect:/";
        if (usuario.getCargo() != null && usuario.getCargo().getRelatorios() >= 1) {
            return "gerenciar_relatorios";
        }
        return "redirect:/inicio";
    }

    //andamento
    @GetMapping("/andamento")
    public String andamento(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario == null) return "redirect:/";
        return "andamento";
    }

    //movimentações
    @GetMapping("/movimentacoes")
    public String movimentacoes(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario == null) return "redirect:/";
        if (usuario.getCargo() == null || usuario.getCargo().getMovimentacoes() < 1) {
            return "redirect:/inicio";
        }
        return "movimentacoes";
    }

    @GetMapping("/movimentar-produto")
    public String movimentarProduto(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario == null) return "redirect:/";
        if (usuario.getCargo() == null || usuario.getCargo().getMovimentacoes() < 2) {
            return "redirect:/inicio";
        }
        return "movimentar_produto";
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

    @GetMapping("/gerar-relatorio")
    public String gerarRelatorioPage(HttpSession session) {
        Usuario usuario = getUsuarioOuRedireciona(session);
        if (usuario == null) return "redirect:/";
        if (usuario.getCargo() == null || usuario.getCargo().getRelatorios() < 2) {
            return "redirect:/inicio";
        }
        return "gerar_relatorio";
    }

    @GetMapping("/recuperar-senha/esqueci-senha")
    public String esqueciSenhaPage() {
        return "recuperar-senha/esqueci-senha";
    }

    @GetMapping("/recuperar-senha/codigo-verificacao")
    public String codigoVerificacaoPage() {
        return "recuperar-senha/codigo-verificacao";
    }

    @GetMapping("/recuperar-senha/redefinir-senha")
    public String redefinirSenhaPage() {
        return "recuperar-senha/redefinir-senha";
    }

    @GetMapping("/permissoes")
    public String permissoes(HttpSession session, Model model) {
        Usuario usuario = (Usuario) session.getAttribute("isActive");
        if (usuario == null) return "redirect:/";
        if (usuario.getCargo() != null && usuario.getCargo().getFuncionarios() >= 4) {
            model.addAttribute("usuarioLogado", usuario);
            return "permissoes";
        }
        return "redirect:/inicio";
    }
}