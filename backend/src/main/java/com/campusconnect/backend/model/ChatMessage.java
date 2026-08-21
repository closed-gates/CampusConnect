package com.campusconnect.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * ChatMessage – JPA entity for persisted course-channel messages.
 *
 * MVC Role: Model
 *
 * Table: chat_messages
 *
 * Each row represents one message sent in a specific sub-channel
 * (e.g., "general") of a specific course channel (e.g., "cse470").
 *
 * Feature: Real-Time Course Chat via WebSockets
 */
@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_course_sub", columnList = "courseId, subChannelId"),
        @Index(name = "idx_chat_created",    columnList = "createdAt")
})
@Getter
@Setter
@NoArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Course channel identifier, e.g. "cse470" (derived from course code). */
    @Column(nullable = false, length = 64)
    @NotBlank
    private String courseId;

    /** Sub-channel identifier within the course, e.g. "general", "q-and-a". */
    @Column(nullable = false, length = 64)
    @NotBlank
    private String subChannelId;

    /** Unique user ID of the sender, e.g. "usr_eusha_001". */
    @Column(nullable = false, length = 128)
    @NotBlank
    private String authorId;

    /** Display name of the sender, e.g. "Eusha Kayenat". */
    @Column(nullable = false, length = 128)
    @NotBlank
    private String authorName;

    /** Role of the sender: "STUDENT" or "FACULTY". */
    @Column(nullable = false, length = 32)
    private String authorRole;

    /** Message body — max 2000 chars. */
    @Column(length = 2000)
    @Size(max = 2000)
    private String content;

    /** JSON string representation of file attachments list. */
    @Column(length = 4000)
    private String attachmentsJson;

    /** UTC timestamp when the message was persisted. */
    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    private void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
