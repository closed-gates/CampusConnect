package com.campusconnect.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Submission – JPA Entity for a student's assignment submission.
 *
 * MVC Role: Model
 *
 * Maps to the "submissions" table in the Neon PostgreSQL database.
 * Tracks the uploaded file, submission status, and optional grade/feedback.
 */
@Entity
@Table(name = "submissions",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"assignment_id", "student_id"},
           name = "uk_submission_assignment_student"
       ))
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assignment_id", nullable = false)
    private Long assignmentId;

    @Column(name = "student_id", nullable = false, length = 20)
    private String studentId;

    @Column(name = "student_name", length = 100)
    private String studentName;

    @Column(name = "status", nullable = false, length = 20)
    private String status;  // TURNED_IN, DRAFT, RETURNED, GRADED

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "file_name", length = 300)
    private String fileName;

    @Column(name = "file_type", length = 100)
    private String fileType;

    @Column(name = "file_data", columnDefinition = "BYTEA")
    private byte[] fileData;

    // ── Constructors ──────────────────────────────────────────
    public Submission() {}

    // ── Getters & Setters ─────────────────────────────────────
    public Long getId()                          { return id; }
    public void setId(Long id)                   { this.id = id; }

    public Long getAssignmentId()                { return assignmentId; }
    public void setAssignmentId(Long a)          { this.assignmentId = a; }

    public String getStudentId()                 { return studentId; }
    public void setStudentId(String s)           { this.studentId = s; }

    public String getStudentName()               { return studentName; }
    public void setStudentName(String n)         { this.studentName = n; }

    public String getStatus()                    { return status; }
    public void setStatus(String s)              { this.status = s; }

    public LocalDateTime getSubmittedAt()        { return submittedAt; }
    public void setSubmittedAt(LocalDateTime s)  { this.submittedAt = s; }

    public String getFileName()                  { return fileName; }
    public void setFileName(String n)            { this.fileName = n; }

    public String getFileType()                  { return fileType; }
    public void setFileType(String t)            { this.fileType = t; }

    public byte[] getFileData()                  { return fileData; }
    public void setFileData(byte[] d)            { this.fileData = d; }
}
