package com.campusconnect.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Assignment – JPA Entity for a teacher-created assignment.
 *
 * MVC Role: Model
 *
 * Maps to the "assignments" table in the Neon PostgreSQL database.
 * Stores assignment metadata, deadline, and an optional attached question file.
 */
@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_code", nullable = false, length = 20)
    private String courseCode;

    @Column(name = "course_name", nullable = false, length = 200)
    private String courseName;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** Maximum score for the assignment. Existing database schema requires a value. */
    @Column(name = "total_points", nullable = false)
    private Integer totalPoints = 100;



    @Column(name = "deadline", nullable = false)
    private LocalDateTime deadline;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "attachment_name", length = 300)
    private String attachmentName;

    @Column(name = "attachment_type", length = 100)
    private String attachmentType;

    @Column(name = "attachment_data", columnDefinition = "BYTEA")
    private byte[] attachmentData;

    // ── Constructors ──────────────────────────────────────────
    public Assignment() {}

    // ── Getters & Setters ─────────────────────────────────────
    public Long getId()                          { return id; }
    public void setId(Long id)                   { this.id = id; }

    public String getCourseCode()                { return courseCode; }
    public void setCourseCode(String c)          { this.courseCode = c; }

    public String getCourseName()                { return courseName; }
    public void setCourseName(String n)          { this.courseName = n; }

    public String getTitle()                     { return title; }
    public void setTitle(String t)               { this.title = t; }

    public String getDescription()               { return description; }
    public void setDescription(String d)         { this.description = d; }

    public Integer getTotalPoints()              { return totalPoints; }
    public void setTotalPoints(Integer p)        { this.totalPoints = p; }



    public LocalDateTime getDeadline()           { return deadline; }
    public void setDeadline(LocalDateTime d)     { this.deadline = d; }

    public String getCreatedBy()                 { return createdBy; }
    public void setCreatedBy(String c)           { this.createdBy = c; }

    public LocalDateTime getCreatedAt()          { return createdAt; }
    public void setCreatedAt(LocalDateTime c)    { this.createdAt = c; }

    public String getAttachmentName()            { return attachmentName; }
    public void setAttachmentName(String n)      { this.attachmentName = n; }

    public String getAttachmentType()            { return attachmentType; }
    public void setAttachmentType(String t)      { this.attachmentType = t; }

    public byte[] getAttachmentData()            { return attachmentData; }
    public void setAttachmentData(byte[] d)      { this.attachmentData = d; }
}
