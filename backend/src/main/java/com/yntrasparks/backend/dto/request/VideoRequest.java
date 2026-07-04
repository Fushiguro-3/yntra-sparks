package com.yntrasparks.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class VideoRequest {

    @NotBlank(message = "Video title is required")
    private String title;

    @NotBlank(message = "YouTube video ID is required")
    private String youtubeVideoId;

    @Min(value = 0, message = "Sequence must be 0 or greater")
    private int sequence;

    public VideoRequest() {}

    public String getTitle() { return title; }
    public String getYoutubeVideoId() { return youtubeVideoId; }
    public int getSequence() { return sequence; }

    public void setTitle(String title) { this.title = title; }
    public void setYoutubeVideoId(String youtubeVideoId) { this.youtubeVideoId = youtubeVideoId; }
    public void setSequence(int sequence) { this.sequence = sequence; }
}