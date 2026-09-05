package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * DirectMessage – JPA entity for persisted Direct Messages.
 *
 * MVC Role: Model
 *
 * Table: direct_messages
 *
 * Each row represents one message exchanged between two users in a
 * deterministic room (roomId = sorted concatenation of the two user IDs).
 *
 * Feature: Real-Time Direct Messaging via WebSockets
 */
@Entity
@Table(name = "direct_messages", indexes = {
        @Index(name = "idx_dm_room_created", columnList = "roomId, createdAt")
})
@Getter
@Setter
@NoArgsConstructor
public class DirectMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Deterministic room identifier shared by both participants.
     * Derived on the frontend as: sorted([senderId, recipientId]).join('__')
     */
    @Column(nullable = false, length = 256)
    private String roomId;

    /** User ID of the sender (e.g. "STU001"). */
    @Column(nullable = false, length = 128)
    private String senderId;

    /** Display name of the sender (e.g. "John Doe"). */
    @Column(nullable = false, length = 128)
    private String senderName;

    /** Role of the sender: "STUDENT" | "FACULTY" | "ADMIN". */
    @Column(length = 32)
    private String senderRole;

    /** User ID of the recipient. */
    @Column(nullable = false, length = 128)
    private String recipientId;

    /** Display name of the recipient. */
    @Column(length = 128)
    private String recipientName;

    /** Role of the recipient. */
    @Column(length = 32)
    private String recipientRole;

    /** Message text body — max 4000 chars. */
    @Column(length = 4000)
    private String content;

    /** JSON-serialised file attachments list (optional). */
    @Column(length = 8000)
    private String attachmentsJson;

    /** UTC timestamp when the message was received and persisted by the backend. */
    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    private void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
