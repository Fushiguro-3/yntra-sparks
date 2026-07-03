package com.yntrasparks.backend.dto.response;

import com.yntrasparks.backend.entity.Category;
import java.time.LocalDateTime;

public class CategoryResponse {

    private final Long id;
    private final String name;
    private final LocalDateTime createdAt;

    private CategoryResponse(Long id, String name, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
    }

    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getCreatedAt()
        );
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}