package com.yntrasparks.backend.dto.response;

public class ManualDownloadResponse {

    private final String downloadUrl;

    public ManualDownloadResponse(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }

    public String getDownloadUrl() { return downloadUrl; }
}