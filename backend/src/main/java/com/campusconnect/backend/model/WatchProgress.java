package com.campusconnect.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * WatchProgress – JPA Entity representing a student's watch progress for a lecture.
 *
 * MVC Role: Model
 */
@Entity
@Table(name = "watch_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"studentId", "videoLectureId"})
})
public class WatchProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private Long videoLectureId;

    private Integer lastPositionSeconds;

    private Double percentage;

    private Boolean completed;

    private LocalDateTime updatedAt;

    public WatchProgress() {
        this.updatedAt = LocalDateTime.now();
        this.lastPositionSeconds = 0;
        this.percentage = 0.0;
        this.completed = false;
    }

    public WatchProgress(String studentId, Long videoLectureId, Integer lastPositionSeconds, Double percentage, Boolean completed) {
        this.studentId = studentId;
        this.videoLectureId = videoLectureId;
        this.lastPositionSeconds = lastPositionSeconds;
        this.percentage = percentage;
        this.completed = completed;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public Long getVideoLectureId() { return videoLectureId; }
    public void setVideoLectureId(Long videoLectureId) { this.videoLectureId = videoLectureId; }

    public Integer getLastPositionSeconds() { return lastPositionSeconds; }
    public void setLastPositionSeconds(Integer lastPositionSeconds) { this.lastPositionSeconds = lastPositionSeconds; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
