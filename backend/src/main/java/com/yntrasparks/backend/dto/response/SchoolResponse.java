package com.yntrasparks.backend.dto.response;

import com.yntrasparks.backend.entity.School;

import java.time.LocalDateTime;

public class SchoolResponse {

    private final Long id;
    private final String name;
    private final String email;
    private final String address;
    private final String status;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    private SchoolResponse(Long id, String name, String email, String address,
                           String status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.address = address;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static SchoolResponse from(School school) {
        return new SchoolResponse(
                school.getId(),
                school.getName(),
                school.getEmail(),
                school.getAddress(),
                school.getStatus().name(),
                school.getCreatedAt(),
                school.getUpdatedAt()
        );
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getAddress() { return address; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}