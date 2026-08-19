package com.campusconnect.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

/**
 * ChatMessageDto – Data Transfer Object for the Course Chat WebSocket feature.
 *
 * MVC Role: DTO (shared between inbound STOMP payload and outbound broadcast)
 *
 * Feature: Real-Time Course Chat via WebSockets with File Attachments
 */
public record ChatMessageDto(

        /** Auto-assigned by the backend on persistence; null when sent by client. */
        Long id,

        /** Course channel id, e.g. "cse470". Derived from course code on client. */
        @NotBlank String courseId,

        /** Sub-channel within the course, e.g. "general", "resources". */
        @NotBlank String subChannelId,

        /** Sender's user ID, e.g. "usr_eusha_001". */
        @NotBlank String authorId,

        /** Sender's display name, e.g. "Eusha Kayenat". */
        @NotBlank String authorName,

        /** Sender's role: "STUDENT" or "FACULTY". */
        String authorRole,

        /** Message text body (max 2000 chars; optional if attachments present). */
        @Size(max = 2000) String content,

        /** UTC timestamp — populated by backend before broadcast; may be null from client. */
        Instant createdAt,

        /** List of file attachments (populated for #resources channel messages). */
        List<AttachmentDto> attachments
) {
    /**
     * Convenience factory: stamps the current UTC time onto the DTO.
     */
    public ChatMessageDto withTimestamp() {
        return new ChatMessageDto(id, courseId, subChannelId, authorId, authorName, authorRole, content, Instant.now(), attachments);
    }
}

