package com.campusconnect.backend.dto;

import java.time.Instant;
import java.util.List;

/**
 * DirectMessageDto – Data Transfer Object for Direct Messaging over WebSocket.
 *
 * MVC Role: DTO
 *
 * Used for both inbound STOMP payloads (client → /app/dm.send) and outbound
 * broadcasts (server → /topic/dm.{roomId}).
 *
 * Field names intentionally mirror the frontend dmService.js message shape so
 * no field remapping is needed on either side.
 *
 * Feature: Real-Time Direct Messaging via WebSockets
 */
public record DirectMessageDto(

        /** Backend-assigned id; null when sent by client, populated after persistence. */
        Long id,

        /**
         * Deterministic room ID shared by both participants.
         * Frontend derives it as: [senderId, recipientId].sort().join('__')
         */
        String roomId,

        /** Sender's user ID (e.g. "STU001"). */
        String senderId,

        /** Sender's display name. */
        String senderName,

        /** Sender's role: "STUDENT" | "FACULTY" | "ADMIN". */
        String senderRole,

        /** Recipient's user ID. */
        String recipientId,

        /** Recipient's display name. */
        String recipientName,

        /** Recipient's role. */
        String recipientRole,

        /** Message text (may be empty if attachments are present). */
        String content,

        /** File attachments (optional). */
        List<AttachmentDto> attachments,

        /** UTC timestamp — null from client; stamped by backend before broadcast. */
        Instant createdAt

) {
    /** Convenience: returns a new DTO with the current UTC instant stamped. */
    public DirectMessageDto withTimestamp() {
        return new DirectMessageDto(
                id, roomId,
                senderId, senderName, senderRole,
                recipientId, recipientName, recipientRole,
                content, attachments,
                Instant.now()
        );
    }
}
