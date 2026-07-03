package com.yntrasparks.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class SchoolStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;

    public SchoolStatusRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}