package com.yntrasparks.backend.dto.response;

import com.yntrasparks.backend.entity.Kit;

import java.math.BigDecimal;
import java.util.List;

// Intentionally excludes manualPdfUrl — manuals are for authenticated
// teachers/principals only, not anonymous public visitors.
public class PublicKitResponse {

    private final Long id;
    private final String title;
    private final String description;
    private final String thumbnailUrl;
    private final String grade;
    private final BigDecimal price;
    private final Long categoryId;
    private final String categoryName;
    private final String status;
    private final List<VideoResponse> videos;

    private PublicKitResponse(Long id, String title, String description,
                              String thumbnailUrl, String grade, BigDecimal price,
                              Long categoryId, String categoryName, String status,
                              List<VideoResponse> videos) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.thumbnailUrl = thumbnailUrl;
        this.grade = grade;
        this.price = price;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.status = status;
        this.videos = videos;
    }

    public static PublicKitResponse from(Kit kit) {
        List<VideoResponse> videoResponses = kit.getVideos()
                .stream()
                .map(VideoResponse::from)
                .toList();

        return new PublicKitResponse(
                kit.getId(),
                kit.getTitle(),
                kit.getDescription(),
                kit.getThumbnailUrl(),
                kit.getGrade(),
                kit.getPrice(),
                kit.getCategory() != null ? kit.getCategory().getId() : null,
                kit.getCategory() != null ? kit.getCategory().getName() : null,
                kit.getStatus().name(),
                videoResponses
        );
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public String getGrade() { return grade; }
    public BigDecimal getPrice() { return price; }
    public Long getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public String getStatus() { return status; }
    public List<VideoResponse> getVideos() { return videos; }
}
