package com.yntrasparks.backend.dto.response;

public class ManualUploadResponse {

    private final String url;
    private final String fileName;

    public ManualUploadResponse(String url, String fileName) {
        this.url = url;
        this.fileName = fileName;
    }

    public String getUrl() { return url; }
    public String getFileName() { return fileName; }
}
