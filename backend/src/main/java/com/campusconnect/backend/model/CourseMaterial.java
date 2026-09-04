package com.campusconnect.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * CourseMaterial – lecture notes, slides, and documents for a course.
 *
 * MVC Role: Model
 *
 * Files live on disk; this table stores catalog metadata.
 */
@Entity
@Table(name = "course_materials")
public class CourseMaterial {

    public static final String KIND_NOTES  = "NOTES";
    public static final String KIND_SLIDES = "SLIDES";
    public static final String KIND_DOC    = "DOCUMENT";

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

    @Column(name = "kind", nullable = false, length = 30)
    private String kind;

    @Column(name = "stored_filename", nullable = false, length = 400)
    private String storedFilename;

    @Column(name = "original_filename", nullable = false, length = 400)
    private String originalFilename;

    @Column(name = "content_type", length = 160)
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public CourseMaterial() {}

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

    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
