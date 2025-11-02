package com.example.estoquei.resources;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.estoquei.dto.FiltroRelatorioDTO;
import com.example.estoquei.dto.GerarRelatorioRequest;
import com.example.estoquei.model.Produto;
import com.example.estoquei.service.FirebaseStorageService;
import com.example.estoquei.service.RelatorioService;

@RestController
@RequestMapping("/relatorio")
public class RelatorioResource {

    @Autowired
    private RelatorioService relatorioService;

    @Autowired
    private FirebaseStorageService firebaseStorageService;

    @PostMapping("/gerar")
    public ResponseEntity<byte[]> gerarRelatorio(@RequestBody GerarRelatorioRequest payload) throws IOException {
        
        // 1. Monta o DTO com os filtros
        FiltroRelatorioDTO filtro = new FiltroRelatorioDTO();
        
        if (payload.getProdutos() != null) {
            filtro.setIds(payload.getProdutos().stream().map(Produto::getId).collect(Collectors.toList()));
            filtro.setCategorias(payload.getProdutos().stream()
                .map(Produto::getCategoria)
                .filter(cat -> cat != null && !cat.isEmpty())
                .distinct()
                .collect(Collectors.toList()));
        }
        filtro.setDataInicio(payload.getDataInicio());
        filtro.setDataFim(payload.getDataFim());

        if (payload.getFiltrosAplicados() != null) {
            filtro.setFiltrosAplicados(payload.getFiltrosAplicados());
        }

        if (payload.getGraficoBase64() != null && !payload.getGraficoBase64().isEmpty()) {
            filtro.setGraficoBase64(payload.getGraficoBase64());
        }

        if (payload.getGraficoSaldoBase64() != null && !payload.getGraficoSaldoBase64().isEmpty()) {
            filtro.setGraficoSaldoBase64(payload.getGraficoSaldoBase64());
        }

        // 2. Gera o PDF em um array de bytes
        byte[] pdf = relatorioService.gerarPDFProdutos(filtro);
        
        // 3. Define um nome de arquivo único para o upload e para o download
        String dataHoje = LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyyyy"));
        String nomeArquivo = "RelatorioDesempenho_" + dataHoje + "_" + UUID.randomUUID().toString() + ".pdf";

        // Adiciona uma verificação para garantir que o PDF foi gerado corretamente
        if (pdf == null || pdf.length == 0) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", nomeArquivo); 
            
            // Retorna um erro com uma mensagem clara no corpo da resposta
            return ResponseEntity.badRequest().headers(headers).body("Não foi possível gerar o PDF do relatório.".getBytes());
        }

        // 4. Cria o MockMultipartFile com os dados necessários
        MockMultipartFile multipartFile = new MockMultipartFile(
            "file", 
            nomeArquivo, 
            "application/pdf", 
            pdf
        );

        // 5. Faz o upload do MockMultipartFile para o Firebase e obtém a URL
        String relatorioUrl = firebaseStorageService.uploadFile(multipartFile, "relatorios");

        // 6. Configura os headers para download e retorna o PDF como resposta HTTP
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", nomeArquivo);
        
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}