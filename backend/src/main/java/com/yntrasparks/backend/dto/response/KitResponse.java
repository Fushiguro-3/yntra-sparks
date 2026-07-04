package com.yntrasparks.backend.dto.response;

import com.yntrasparks.backend.entity.Kit;

import java.time.LocalDateTime;
import java.util.List;

public class KitResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final String thumbnailUrl;
    private final String categoryName;
    private final String status;
    private final List<VideoResponse> videos;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    private KitResponse(Long id, String title, String description,
                        String thumbnailUrl, String categoryName, String status,
                        List<VideoResponse> videos, LocalDateTime createdAt,
                        LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.thumbnailUrl = thumbnailUrl;
        this.categoryName = categoryName;
        this.status = status;
        this.videos = videos;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static KitResponse from(Kit kit) {
        List<VideoResponse> videoResponses = kit.getVideos()
                .stream()
                .map(VideoResponse::from)
                .toList();

        return new KitResponse(
                kit.getId(),
                kit.getTitle(),
                kit.getDescription(),
                kit.getThumbnailUrl(),
                kit.getCategory() != null ? kit.getCategory().getName() : null,
                kit.getStatus().name(),
                videoResponses,
                kit.getCreatedAt(),
                kit.getUpdatedAt()
        );
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public String getCategoryName() { return categoryName; }
    public String getStatus() { return status; }
    public List<VideoResponse> getVideos() { return videos; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}