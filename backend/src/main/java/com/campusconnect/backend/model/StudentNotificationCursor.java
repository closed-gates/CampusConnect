package com.campusconnect.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * High-water marks for student activity notifications.
 * Prevents backfill spam after Render restarts without changing feature services.
 */
@Entity
@Table(name = "student_notification_cursors")
public class StudentNotificationCursor {

    @Id
    @Column(name = "source_key", length = 40)
    private String sourceKey;

    @Column(name = "last_seen_id")
    private Long lastSeenId;

    @Column(name = "last_portal_open")
    private Boolean lastPortalOpen;

    public StudentNotificationCursor() {}

    public StudentNotificationCursor(String sourceKey) {
        this.sourceKey = sourceKey;
    }

    public String getSourceKey() { return sourceKey; }
    public void setSourceKey(String sourceKey) { this.sourceKey = sourceKey; }

    public Long getLastSeenId() { return lastSeenId; }
    public void setLastSeenId(Long lastSeenId) { this.lastSeenId = lastSeenId; }

    public Boolean getLastPortalOpen() { return lastPortalOpen; }
    public void setLastPortalOpen(Boolean lastPortalOpen) { this.lastPortalOpen = lastPortalOpen; }
}
