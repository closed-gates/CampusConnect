package com.campusconnect.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * VideoLecture – JPA Entity representing a video lecture module.
 *
 * MVC Role: Model
 */
@Entity
@Table(name = "video_lectures")
public class VideoLecture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 20)
    private String courseCode;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, length = 500)
    private String videoUrl;

    @Column(nullable = false)
    private String teacherName;

    private Integer durationSeconds;

    private LocalDateTime createdAt;

    public VideoLecture() {
        this.createdAt = LocalDateTime.now();
    }

    public VideoLecture(String title, String courseCode, String description, String videoUrl, String teacherName, Integer durationSeconds) {
        this.title = title;
        this.courseCode = courseCode;
        this.description = description;
        this.videoUrl = videoUrl;
        this.teacherName = teacherName;
        this.durationSeconds = durationSeconds;
        this.createdAt = LocalDateTime.now();
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
}
