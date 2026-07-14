package com.yntrasparks.backend.dto.response;

public class ManualUploadResponse {

    private final String key;           // S3 object key — stored in DB, not a public URL
    private final String originalFilename;

    public ManualUploadResponse(String key, String originalFilename) {
        this.key = key;
        this.originalFilename = originalFilename;
    }

    public String getKey() { return key; }
    public String getOriginalFilename() { return originalFilename; }
}