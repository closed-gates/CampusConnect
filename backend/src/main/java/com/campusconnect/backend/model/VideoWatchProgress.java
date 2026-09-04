package com.campusconnect.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * VideoWatchProgress – per-user playback position for a lecture.
 *
 * MVC Role: Model
 */
@Entity
@Table(
    name = "video_watch_progress",
    uniqueConstraints = @UniqueConstraint(name = "uk_video_progress_lecture_user", columnNames = {"lecture_id", "user_id"})
)
public class VideoWatchProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lecture_id", nullable = false)
    private Long lectureId;

    @Column(name = "user_id", nullable = false, length = 80)
    private String userId;

    @Column(name = "position_seconds", nullable = false)
    private Double positionSeconds = 0.0;

    @Column(name = "duration_seconds", nullable = false)
    private Double durationSeconds = 0.0;

    @Column(name = "percent_watched", nullable = false)
    private Integer percentWatched = 0;

    @Column(name = "completed", nullable = false)
    private boolean completed = false;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public VideoWatchProgress() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLectureId() { return lectureId; }
    public void setLectureId(Long lectureId) { this.lectureId = lectureId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Double getPositionSeconds() { return positionSeconds; }
    public void setPositionSeconds(Double positionSeconds) { this.positionSeconds = positionSeconds; }

    public Double getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Double durationSeconds) { this.durationSeconds = durationSeconds; }

    public Integer getPercentWatched() { return percentWatched; }
    public void setPercentWatched(Integer percentWatched) { this.percentWatched = percentWatched; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
