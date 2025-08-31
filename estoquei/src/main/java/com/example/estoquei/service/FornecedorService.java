package com.example.estoquei.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.estoquei.model.Fornecedor;
import com.example.estoquei.repository.FornecedorRepository;

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
        return fornecedorRepository.save(fornecedor);
    }

    public Fornecedor atualizar(Long id, Fornecedor fornecedorAtualizado) {
        Optional<Fornecedor> opt = fornecedorRepository.findById(id);
        if (opt.isPresent()) {
            Fornecedor fornecedor = opt.get();
            fornecedor.setCodigo(fornecedorAtualizado.getCodigo());
            fornecedor.setNome_empresa(fornecedorAtualizado.getNome_empresa());
            fornecedor.setCnpj(fornecedorAtualizado.getCnpj());
            fornecedor.setEmail(fornecedorAtualizado.getEmail());
            fornecedor.setCamisa(fornecedorAtualizado.isCamisa());
            fornecedor.setCamiseta(fornecedorAtualizado.isCamiseta());
            fornecedor.setCalça(fornecedorAtualizado.isCalça());
            fornecedor.setBermuda(fornecedorAtualizado.isBermuda());
            fornecedor.setShorts(fornecedorAtualizado.isShorts());
            fornecedor.setSapato(fornecedorAtualizado.isSapato());
            fornecedor.setMeia(fornecedorAtualizado.isMeia());
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
}