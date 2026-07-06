package com.yntrasparks.backend.dto.response;

import com.yntrasparks.backend.entity.User;

import java.time.LocalDateTime;

public class TeacherResponse {

    private final Long id;
    private final String name;
    private final String email;
    private final String status;
    private final LocalDateTime createdAt;
    private final LocalDateTime lastLogin;

    private TeacherResponse(Long id, String name, String email,
                            String status, LocalDateTime createdAt,
                            LocalDateTime lastLogin) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.status = status;
        this.createdAt = createdAt;
        this.lastLogin = lastLogin;
    }

    public static TeacherResponse from(User user) {
        return new TeacherResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getStatus().name(),
                user.getCreatedAt(),
                user.getLastLogin()
        );
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getLastLogin() { return lastLogin; }
}