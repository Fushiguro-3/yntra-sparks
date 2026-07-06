package com.yntrasparks.backend.dto.response;

public class TempPasswordResponse {

    private final String tempPassword;

    public TempPasswordResponse(String tempPassword) {
        this.tempPassword = tempPassword;
    }

    public String getTempPassword() { return tempPassword; }
}