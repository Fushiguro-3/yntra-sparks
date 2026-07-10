package com.yntrasparks.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "kit")
public class Kit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "manual_pdf_url")
    private String manualPdfUrl;

    @Column
    private String grade;

    // Display-only price. No cart/checkout/payment flow — informational only (MVP).
    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "kit", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequence ASC")
    private List<Video> videos = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KitStatus status = KitStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Kit() {}

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public String getManualPdfUrl() { return manualPdfUrl; }
    public String getGrade() { return grade; }
    public BigDecimal getPrice() { return price; }
    public Category getCategory() { return category; }
    public List<Video> getVideos() { return videos; }
    public KitStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
    public void setManualPdfUrl(String manualPdfUrl) { this.manualPdfUrl = manualPdfUrl; }
    public void setGrade(String grade) { this.grade = grade; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setCategory(Category category) { this.category = category; }
    public void setVideos(List<Video> videos) { this.videos = videos; }
    public void setStatus(KitStatus status) { this.status = status; }

    public enum KitStatus {
        ACTIVE, ARCHIVED
    }
}
