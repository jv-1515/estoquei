package com.example.stokmais.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.stokmais.model.Fornecedor;
import com.example.stokmais.repository.FornecedorRepository;

@Service
public class FornecedorService {

    @Autowired
    private FornecedorRepository fornecedorRepository;

    public List<Fornecedor> listarTodos() {
        return fornecedorRepository.findAll();
    }

    public Fornecedor buscarPorId(Long id) {
        Optional<Fornecedor> fornecedor = fornecedorRepository.findById(id);
        return fornecedor.orElse(null);
    }

    public Fornecedor salvar(Fornecedor fornecedor) {
        List<Fornecedor> todos = fornecedorRepository.findAll();
        String emailNovo = fornecedor.getEmail() != null ? fornecedor.getEmail().trim().toLowerCase() : "";
        String emailExtraNovo = fornecedor.getEmail_responsavel() != null ? fornecedor.getEmail_responsavel().trim().toLowerCase() : "";

        for (Fornecedor f : todos) {
            String emailExistente = f.getEmail() != null ? f.getEmail().trim().toLowerCase() : "";
            String emailExtraExistente = f.getEmail_responsavel() != null ? f.getEmail_responsavel().trim().toLowerCase() : "";

            // Verifica se o email principal ou extra já existe em outro fornecedor
            if (!f.getId().equals(fornecedor.getId())) {
                if (!emailNovo.isEmpty() && (emailNovo.equals(emailExistente) || emailNovo.equals(emailExtraExistente))) {
                    throw new RuntimeException("E-mail já cadastrado para outro fornecedor!");
                }
                if (!emailExtraNovo.isEmpty() && (emailExtraNovo.equals(emailExistente) || emailExtraNovo.equals(emailExtraExistente))) {
                    throw new RuntimeException("E-mail extra já cadastrado para outro fornecedor!");
                }
            }
        }
        return fornecedorRepository.save(fornecedor);
    }

    public Fornecedor atualizar(Long id, Fornecedor fornecedorAtualizado) {
        Optional<Fornecedor> opt = fornecedorRepository.findById(id);
        if (opt.isPresent()) {
            List<Fornecedor> todos = fornecedorRepository.findAll();
            String emailNovo = fornecedorAtualizado.getEmail() != null ? fornecedorAtualizado.getEmail().trim().toLowerCase() : "";
            String emailExtraNovo = fornecedorAtualizado.getEmail_responsavel() != null ? fornecedorAtualizado.getEmail_responsavel().trim().toLowerCase() : "";

            for (Fornecedor f : todos) {
                String emailExistente = f.getEmail() != null ? f.getEmail().trim().toLowerCase() : "";
                String emailExtraExistente = f.getEmail_responsavel() != null ? f.getEmail_responsavel().trim().toLowerCase() : "";

                // compara com outros fornecedores (id diferente)
                if (!f.getId().equals(id)) {
                    if (!emailNovo.isEmpty() && (emailNovo.equals(emailExistente) || emailNovo.equals(emailExtraExistente))) {
                        throw new RuntimeException("E-mail já cadastrado para outro fornecedor!");
                    }
                    if (!emailExtraNovo.isEmpty() && (emailExtraNovo.equals(emailExistente) || emailExtraNovo.equals(emailExtraExistente))) {
                        throw new RuntimeException("E-mail extra já cadastrado para outro fornecedor!");
                    }
                }
            }

            Fornecedor fornecedor = opt.get();
            fornecedor.setCodigo(fornecedorAtualizado.getCodigo());
            fornecedor.setNome_empresa(fornecedorAtualizado.getNome_empresa());
            fornecedor.setCnpj(fornecedorAtualizado.getCnpj());
            fornecedor.setEmail(fornecedorAtualizado.getEmail());
            fornecedor.setCategorias(fornecedorAtualizado.getCategorias());
            fornecedor.setNome_responsavel(fornecedorAtualizado.getNome_responsavel());
            fornecedor.setEmail_responsavel(fornecedorAtualizado.getEmail_responsavel());
            fornecedor.setTelefone(fornecedorAtualizado.getTelefone());
            fornecedor.setInscricao_estadual(fornecedorAtualizado.getInscricao_estadual());
            fornecedor.setCep(fornecedorAtualizado.getCep());
            fornecedor.setLogradouro(fornecedorAtualizado.getLogradouro());
            fornecedor.setBairro(fornecedorAtualizado.getBairro());
            fornecedor.setCidade(fornecedorAtualizado.getCidade());
            fornecedor.setEstado(fornecedorAtualizado.getEstado());
            fornecedor.setNumero(fornecedorAtualizado.getNumero());
            fornecedor.setObservacoes(fornecedorAtualizado.getObservacoes());
            return fornecedorRepository.save(fornecedor);
        }
        return null;
    }

    public boolean deletar(Long id) {
        if (fornecedorRepository.existsById(id)) {
            fornecedorRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public boolean codigoExiste(String codigo) {
        return fornecedorRepository.existsByCodigo(codigo);
    }

    public boolean cnpjExiste(String cnpj) {
        return fornecedorRepository.existsByCnpj(cnpj);
    }

    public Fornecedor buscarPorCodigo(String codigo) {
        return fornecedorRepository.findByCodigo(codigo);
    }

    public List<Fornecedor> filtrar(Fornecedor filtro) {
        return fornecedorRepository.findAll().stream()
            .filter(f -> (filtro.getNome_empresa() == null || f.getNome_empresa().toLowerCase().contains(filtro.getNome_empresa().toLowerCase()))
                && (filtro.getCnpj() == null || f.getCnpj().equals(filtro.getCnpj())))
            .toList();
    }

    public List<Fornecedor> listarPorCategoriaId(Long categoriaId) {
        return fornecedorRepository.findAll().stream()
            .filter(f -> f.getCategorias() != null && f.getCategorias().contains(categoriaId))
            .toList();
    }
}