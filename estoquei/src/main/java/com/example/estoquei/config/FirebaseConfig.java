package com.example.estoquei.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.config.path}")
    private Resource serviceAccountResource;

    @Value("${firebase.bucket-name}")
    private String bucketName;

    @Bean
    public String firebaseBucketName() {
        return bucketName;
    }

    @PostConstruct
    public void initializeFirebase() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            try (InputStream serviceAccountStream = serviceAccountResource.getInputStream()) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
                        .setStorageBucket(bucketName)
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("Firebase Application Initialized");

            } catch (IOException e) {
                System.err.println("Error initializing Firebase Admin SDK: " + e.getMessage());
                throw e;
            }
        }
    }
}