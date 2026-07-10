package com.yntrasparks.backend.dto.response;

import com.yntrasparks.backend.entity.ContactMessage;

import java.time.LocalDateTime;

public class ContactMessageResponse {

    private final Long id;
    private final String name;
    private final String email;
    private final String subject;
    private final String message;
    private final LocalDateTime createdAt;

    private ContactMessageResponse(Long id, String name, String email, String subject,
                                   String message, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.subject = subject;
        this.message = message;
        this.createdAt = createdAt;
    }

    public static ContactMessageResponse from(ContactMessage message) {
        return new ContactMessageResponse(
                message.getId(),
                message.getName(),
                message.getEmail(),
                message.getSubject(),
                message.getMessage(),
                message.getCreatedAt()
        );
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getSubject() { return subject; }
    public String getMessage() { return message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
