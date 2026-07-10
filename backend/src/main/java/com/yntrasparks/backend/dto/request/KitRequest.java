package com.yntrasparks.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class KitRequest {

    @NotBlank(message = "Kit title is required")
    private String title;

    private String description;
    private String thumbnailUrl;
    private String manualPdfUrl;

    @NotBlank(message = "Grade is required")
    private String grade;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal price;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @Valid
    private List<VideoRequest> videos;

    public KitRequest() {}

    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public String getManualPdfUrl() { return manualPdfUrl; }
    public String getGrade() { return grade; }
    public BigDecimal getPrice() { return price; }
    public Long getCategoryId() { return categoryId; }
    public List<VideoRequest> getVideos() { return videos; }

    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
    public void setManualPdfUrl(String manualPdfUrl) { this.manualPdfUrl = manualPdfUrl; }
    public void setGrade(String grade) { this.grade = grade; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public void setVideos(List<VideoRequest> videos) { this.videos = videos; }
}
