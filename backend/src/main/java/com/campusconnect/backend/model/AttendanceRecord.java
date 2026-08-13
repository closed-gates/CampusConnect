package com.campusconnect.backend.model;

import jakarta.persistence.*;

/**
 * AttendanceRecord – JPA Entity for a single attendance entry.
 *
 * MVC Role: Model
 *
 * Maps to the "attendance_records" table in the Neon PostgreSQL database.
 * Represents one student's attendance status for a specific course on a given date.
 */
@Entity
@Table(name = "attendance_records")
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_id", nullable = false, length = 20)
    private String courseId;

    @Column(name = "course_name", nullable = false, length = 120)
    private String courseName;

    @Column(name = "student_id", nullable = false, length = 20)
    private String studentId;

    @Column(name = "student_name", nullable = false, length = 120)
    private String studentName;

    @Column(name = "date", nullable = false, length = 10)
    private String date;           // ISO date string (e.g. "2026-08-01")

    @Column(name = "status", nullable = false, length = 10)
    private String status;         // "PRESENT", "ABSENT", "LATE"

    @Column(name = "marked_by", length = 120)
    private String markedBy;       // Faculty name who marked

    @Column(name = "marked_at", length = 40)
    private String markedAt;       // ISO datetime when marked

    // ── Constructors ──────────────────────────────────────────
    public AttendanceRecord() {}

    public AttendanceRecord(Long id, String courseId, String courseName,
                            String studentId, String studentName,
                            String date, String status,
                            String markedBy, String markedAt) {
        this.id          = id;
        this.courseId     = courseId;
        this.courseName  = courseName;
        this.studentId   = studentId;
        this.studentName = studentName;
        this.date        = date;
        this.status      = status;
        this.markedBy    = markedBy;
        this.markedAt    = markedAt;
    }

    // ── Getters & Setters ─────────────────────────────────────
    public Long   getId()                        { return id; }
    public void   setId(Long id)                 { this.id = id; }

    public String getCourseId()                  { return courseId; }
    public void   setCourseId(String cid)        { this.courseId = cid; }

    public String getCourseName()                { return courseName; }
    public void   setCourseName(String cn)       { this.courseName = cn; }

    public String getStudentId()                 { return studentId; }
    public void   setStudentId(String sid)       { this.studentId = sid; }

    public String getStudentName()               { return studentName; }
    public void   setStudentName(String sn)      { this.studentName = sn; }

    public String getDate()                      { return date; }
    public void   setDate(String d)              { this.date = d; }

    public String getStatus()                    { return status; }
    public void   setStatus(String s)            { this.status = s; }

    public String getMarkedBy()                  { return markedBy; }
    public void   setMarkedBy(String mb)         { this.markedBy = mb; }

    public String getMarkedAt()                  { return markedAt; }
    public void   setMarkedAt(String ma)         { this.markedAt = ma; }
}
