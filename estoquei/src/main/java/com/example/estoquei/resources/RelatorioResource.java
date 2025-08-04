package com.example.estoquei.resources;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.estoquei.dto.FiltroRelatorioDTO;
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
        // Monte o DTO
        FiltroRelatorioDTO filtro = new FiltroRelatorioDTO();
        // Se quiser filtrar só pelos produtos recebidos:
        if (payload.getProdutos() != null) {
            filtro.setIds(payload.getProdutos().stream().map(Produto::getId).collect(java.util.stream.Collectors.toList()));
        }
        filtro.setDataInicio(payload.getDataInicio());
        filtro.setDataFim(payload.getDataFim());

        if (payload.getFiltrosAplicados() != null) {
            filtro.setFiltrosAplicados(payload.getFiltrosAplicados());
        }

        byte[] pdf = relatorioService.gerarPDFProdutos(filtro);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "RelatorioProdutos.pdf");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}