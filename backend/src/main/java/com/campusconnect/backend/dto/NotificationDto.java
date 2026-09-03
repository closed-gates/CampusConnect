package com.campusconnect.backend.dto;

import com.campusconnect.backend.model.Notification;
import java.time.Instant;

/**
 * NotificationDto – DTO for In-App Notifications (REST & STOMP WebSocket frames).
 *
 * MVC Role: DTO
 */
public record NotificationDto(
        Long id,
        String userId,
        String type,
        String title,
        String payload,
        String link,
        Boolean isRead,
        Instant createdAt
) {
    public static NotificationDto fromEntity(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getUserId(),
                n.getType(),
                n.getTitle(),
                n.getPayload(),
                n.getLink(),
                n.getIsRead(),
                n.getCreatedAt()
        );
    }
}
