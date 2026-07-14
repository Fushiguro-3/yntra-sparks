package com.yntrasparks.backend.service;

import com.yntrasparks.backend.dto.response.ManualUploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Service
public class FileStorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucketName;

    public FileStorageService(S3Client s3Client,
                              S3Presigner s3Presigner,
                              @Value("${app.s3.bucket-name}") String bucketName) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.bucketName = bucketName;
    }

    /**
     * Uploads a kit manual PDF to a PRIVATE S3 bucket. Returns the S3 object
     * key (not a public URL — bucket has no public access, all four Block
     * Public Access settings stay on). The key is what gets stored in the
     * database; actual download links are generated on-demand via
     * generateDownloadUrl() below, each one short-lived.
     */
    public ManualUploadResponse storeManualPdf(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File too large. Maximum size is 10MB");
        }

        String key = "manuals/" + UUID.randomUUID() + ".pdf";

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType("application/pdf")
                    .build();

            s3Client.putObject(putRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        } catch (IOException e) {
            throw new RuntimeException("Failed to read uploaded file", e);
        }

        // Store the KEY, not a URL — the bucket is private, so there is no
        // permanent public URL. Download links are generated fresh each time
        // via generateDownloadUrl(key).
        return new ManualUploadResponse(key, originalFilename);
    }

    /**
     * Generates a temporary, expiring download link for a manual stored at
     * the given S3 key. Valid for 15 minutes — long enough for a teacher to
     * click and download, short enough that a leaked link becomes useless
     * quickly. Call this fresh every time a manual needs to be downloaded;
     * never cache or store the resulting URL.
     */
    public String generateDownloadUrl(String key) {
        GetObjectRequest getRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .getObjectRequest(getRequest)
                .build();

        PresignedGetObjectRequest presignedRequest =
                s3Presigner.presignGetObject(presignRequest);

        return presignedRequest.url().toString();
    }
}