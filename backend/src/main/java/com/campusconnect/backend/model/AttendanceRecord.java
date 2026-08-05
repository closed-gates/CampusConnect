package com.campusconnect.backend.model;

/**
 * AttendanceRecord – Domain model for a single attendance entry.
 *
 * MVC Role: Model
 *
 * Represents one student's attendance status for a specific course on a given date.
 *
 * TODO (Phase 3): Map to a JPA entity and persist via AttendanceRepository.
 */
public class AttendanceRecord {

    private Long   id;
    private String courseId;
    private String courseName;
    private String studentId;
    private String studentName;
    private String date;           // ISO date string (e.g. "2026-08-01")
    private String status;         // "PRESENT", "ABSENT", "LATE"
    private String markedBy;       // Faculty name who marked
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
