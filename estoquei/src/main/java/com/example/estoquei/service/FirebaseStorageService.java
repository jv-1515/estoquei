package com.example.estoquei.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageException;
import com.google.firebase.cloud.StorageClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class FirebaseStorageService {

    private final String bucketName;

    @Autowired
    public FirebaseStorageService(@Qualifier("firebaseBucketName") String bucketName) {
        this.bucketName = bucketName;
    }
    
    /**
     * Faz o upload de um arquivo para o Firebase Storage.
     *
     * @param file        O arquivo a ser enviado.
     * @param folderName  O nome da pasta onde o arquivo será armazenado.
     * @return A URL de download do arquivo enviado.
     * @throws IOException Se ocorrer um erro ao fazer upload do arquivo.
     */
    public String uploadFile(MultipartFile file, String folderName) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("O arquivo não pode estar vazio.");
        }

        Storage storage = StorageClient.getInstance().bucket(bucketName).getStorage();

        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = folderName + "/" + UUID.randomUUID().toString() + extension;

        BlobId blobId = BlobId.of(bucketName, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        Blob blob = storage.create(blobInfo, file.getBytes());
        if (blob == null) {
            throw new IOException("Falha ao fazer upload do arquivo: " + originalFileName);
        }
        String downloadUrl = String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                bucketName,
                URLEncoder.encode(fileName, StandardCharsets.UTF_8.toString()));

        return downloadUrl;
    }

    /**
     * Gera uma URL assinada para acessar um arquivo no Firebase Storage.
     *
     * @param folderName O nome da pasta onde o arquivo está localizado.
     * @param fileName   O nome do arquivo.
     * @param duration   A duração da validade da URL assinada.
     * @param timeUnit   A unidade de tempo para a duração (ex: TimeUnit.HOURS).
     * @return A URL assinada como uma String.
     * @throws IOException Se ocorrer um erro ao acessar o Firebase Storage.
     */
    public String getSignedUrl(String folderName, String fileName, long duration, TimeUnit timeUnit) throws IOException {
        Storage storage = StorageClient.getInstance().bucket(bucketName).getStorage();
        BlobId blobId = BlobId.of(bucketName, folderName + "/" + fileName);
        Blob blob = storage.get(blobId);

        if (blob == null) {
            throw new IOException("Arquivo não encontrado: " + folderName + "/" + fileName);
        }

        return blob.signUrl(duration, timeUnit).toString();
    }

    /**
     * Deleta um arquivo do Firebase Storage usando sua URL de download.
     * A URL deve ser do formato: https://firebasestorage.googleapis.com/v0/b/BUCKET_NAME/o/FILE_PATH?alt=media...
     *
     * @param fileUrl A URL completa do arquivo no Firebase Storage.
     * @return true se o arquivo foi deletado com sucesso ou se não foi encontrado (já não existe).
     * @throws IOException Se ocorrer um erro durante a comunicação com o Firebase Storage,
     * ou se a URL for inválida/não pertencer ao bucket configurado.
     * @throws IllegalArgumentException Se a URL for nula, vazia ou malformada.
     */
    public boolean deleteFileByFirebaseUrl(String fileUrl) throws IOException {
        if (fileUrl == null || fileUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("A URL do arquivo não pode ser nula ou vazia.");
        }

        String expectedUrlPrefix = String.format("https://firebasestorage.googleapis.com/v0/b/%s/o/", this.bucketName);

        if (!fileUrl.startsWith(expectedUrlPrefix)) {
            throw new IllegalArgumentException("URL inválida ou não pertence ao bucket configurado ('" + this.bucketName + "'): " + fileUrl);
        }

        String encodedFilePathWithPossibleToken = fileUrl.substring(expectedUrlPrefix.length());
        
        String encodedFilePath;
        int queryParamStartIndex = encodedFilePathWithPossibleToken.indexOf('?');
        if (queryParamStartIndex != -1) {
            encodedFilePath = encodedFilePathWithPossibleToken.substring(0, queryParamStartIndex);
        } else {
            encodedFilePath = encodedFilePathWithPossibleToken;
        }

        if (encodedFilePath.trim().isEmpty()) {
            throw new IllegalArgumentException("Não foi possível extrair o caminho do arquivo da URL: " + fileUrl);
        }

        String decodedFilePath;
        try {
            decodedFilePath = URLDecoder.decode(encodedFilePath, StandardCharsets.UTF_8.name());
        } catch (IllegalArgumentException e) {
            throw new IOException("Erro ao decodificar o caminho do arquivo da URL: " + encodedFilePath, e);
        }

        Storage storage = StorageClient.getInstance().bucket(this.bucketName).getStorage();
        BlobId blobId = BlobId.of(this.bucketName, decodedFilePath);

        try {
            boolean deleted = storage.delete(blobId);
            if (!deleted) {
                System.out.println("Arquivo não encontrado no Firebase Storage (ou já deletado): " + decodedFilePath);
            }
            return true;
        } catch (StorageException e) {
            System.err.println("Erro ao deletar arquivo '" + decodedFilePath + "' do Firebase Storage: " + e.getMessage());
            throw new IOException("Erro ao deletar arquivo do Firebase Storage: " + e.getMessage(), e);
        }
    }
}