package com.campusconnect.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * VideoLecture – JPA entity for an uploaded or embedded course lecture.
 *
 * MVC Role: Model
 *
 * Maps to video_lectures. Binary video files are stored on disk;
 * this table holds metadata and optional embed URLs only.
 */
@Entity
@Table(name = "video_lectures")
public class VideoLecture {

    public static final String SOURCE_UPLOAD = "UPLOAD";
    public static final String SOURCE_EMBED  = "EMBED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "course_code", length = 20)
    private String courseCode;

    @Column(name = "course_name", length = 200)
    private String courseName;

    @Column(name = "source_type", nullable = false, length = 20)
    private String sourceType;

    @Column(name = "embed_url", length = 1000)
    private String embedUrl;

    @Column(name = "stored_filename", length = 400)
    private String storedFilename;

    @Column(name = "original_filename", length = 400)
    private String originalFilename;

    @Column(name = "content_type", length = 120)
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "teacher_name", length = 200)
    private String teacherName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public VideoLecture() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }

    public String getEmbedUrl() { return embedUrl; }
    public void setEmbedUrl(String embedUrl) { this.embedUrl = embedUrl; }

    public String getStoredFilename() { return storedFilename; }
    public void setStoredFilename(String storedFilename) { this.storedFilename = storedFilename; }

    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
