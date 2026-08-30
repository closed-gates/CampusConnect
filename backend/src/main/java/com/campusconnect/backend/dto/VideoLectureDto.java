package com.campusconnect.backend.dto;

import java.time.LocalDateTime;

/**
 * VideoLectureDto – Payload for video lecture details and watch progress.
 *
 * MVC Role: DTO (Model payload)
 */
public class VideoLectureDto {

    private Long id;
    private String title;
    private String courseCode;
    private String description;
    private String videoUrl;
    private String teacherName;
    private Integer durationSeconds;
    private LocalDateTime createdAt;

    // Student specific watch progress details
    private Integer lastPositionSeconds;
    private Double percentage;
    private Boolean completed;

    public VideoLectureDto() {}

    public VideoLectureDto(Long id, String title, String courseCode, String description, String videoUrl, String teacherName, Integer durationSeconds, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.courseCode = courseCode;
        this.description = description;
        this.videoUrl = videoUrl;
        this.teacherName = teacherName;
        this.durationSeconds = durationSeconds;
        this.createdAt = createdAt;
        this.lastPositionSeconds = 0;
        this.percentage = 0.0;
        this.completed = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Integer getLastPositionSeconds() { return lastPositionSeconds; }
    public void setLastPositionSeconds(Integer lastPositionSeconds) { this.lastPositionSeconds = lastPositionSeconds; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
}
