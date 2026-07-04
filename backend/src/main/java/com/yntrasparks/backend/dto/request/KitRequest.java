package com.yntrasparks.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class KitRequest {

    @NotBlank(message = "Kit title is required")
    private String title;

    private String description;
    private String thumbnailUrl;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @Valid
    private List<VideoRequest> videos;

    public KitRequest() {}

    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public Long getCategoryId() { return categoryId; }
    public List<VideoRequest> getVideos() { return videos; }

    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public void setVideos(List<VideoRequest> videos) { this.videos = videos; }
}