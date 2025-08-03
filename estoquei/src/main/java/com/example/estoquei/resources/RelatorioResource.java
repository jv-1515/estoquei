package com.example.estoquei.resources;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.estoquei.dto.GerarRelatorioRequest;
import com.example.estoquei.model.Produto;
import com.example.estoquei.service.RelatorioService;

@RestController
@RequestMapping("/relatorio")
public class RelatorioResource {

    @Autowired
    private RelatorioService relatorioService;

    @PostMapping("/gerar")
    public ResponseEntity<byte[]> gerarRelatorio(@RequestBody GerarRelatorioRequest payload) {
        List<Produto> produtos = payload.getProdutos();
        String dataInicio = payload.getDataInicio();
        String dataFim = payload.getDataFim();
        byte[] pdf = relatorioService.gerarPDFProdutosDireto(produtos, dataInicio, dataFim);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "RelatorioProdutos.pdf");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}