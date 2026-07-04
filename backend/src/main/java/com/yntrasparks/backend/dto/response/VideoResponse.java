package com.yntrasparks.backend.dto.response;

import com.yntrasparks.backend.entity.Video;

public class VideoResponse {

    private final Long id;
    private final String title;
    private final String youtubeVideoId;
    private final int sequence;

    private VideoResponse(Long id, String title, String youtubeVideoId, int sequence) {
        this.id = id;
        this.title = title;
        this.youtubeVideoId = youtubeVideoId;
        this.sequence = sequence;
    }

    public static VideoResponse from(Video video) {
        return new VideoResponse(
                video.getId(),
                video.getTitle(),
                video.getYoutubeVideoId(),
                video.getSequence()
        );
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getYoutubeVideoId() { return youtubeVideoId; }
    public int getSequence() { return sequence; }
}