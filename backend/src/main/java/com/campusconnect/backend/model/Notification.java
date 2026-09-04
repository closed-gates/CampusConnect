package com.campusconnect.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Notification – JPA Entity for in-app student notifications.
 *
 * MVC Role: Model
 *
 * Table: notifications
 *
 * Strict trigger types:
 *   - GRADE_PUBLISHED
 *   - DEADLINE_APPROACHING
 *   - ANNOUNCEMENT_POSTED
 */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notif_user", columnList = "user_id"),
        @Index(name = "idx_notif_created", columnList = "created_at"),
        @Index(name = "idx_notif_user_read", columnList = "user_id, is_read")
})
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The target student user ID (e.g., "STU001", "STU007"). */
    @Column(name = "user_id", nullable = false, length = 64)
    @NotBlank
    private String userId;

    /** Strict trigger type: GRADE_PUBLISHED, DEADLINE_APPROACHING, ANNOUNCEMENT_POSTED. */
    @Column(name = "type", nullable = false, length = 64)
    @NotBlank
    private String type;

    /** Short title/heading for the notification. */
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    /** Notification payload content (description / details / json). */
    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload;

    /** Optional in-app redirect path (e.g., "/assignments", "/courses", "/gpa"). */
    @Column(name = "link", length = 255)
    private String link;

    /** Whether the notification has been read by the student. */
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    /** Timestamp when the notification was created. */
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    private void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (isRead == null) {
            isRead = false;
        }
    }
}
