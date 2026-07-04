package com.yntrasparks.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "video")
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kit_id", nullable = false)
    private Kit kit;

    @Column(nullable = false)
    private String title;

    @Column(name = "youtube_video_id", nullable = false)
    private String youtubeVideoId;

    @Column(nullable = false)
    private int sequence;

    public Video() {}

    public Long getId() { return id; }
    public Kit getKit() { return kit; }
    public String getTitle() { return title; }
    public String getYoutubeVideoId() { return youtubeVideoId; }
    public int getSequence() { return sequence; }

    public void setId(Long id) { this.id = id; }
    public void setKit(Kit kit) { this.kit = kit; }
    public void setTitle(String title) { this.title = title; }
    public void setYoutubeVideoId(String youtubeVideoId) { this.youtubeVideoId = youtubeVideoId; }
    public void setSequence(int sequence) { this.sequence = sequence; }
}