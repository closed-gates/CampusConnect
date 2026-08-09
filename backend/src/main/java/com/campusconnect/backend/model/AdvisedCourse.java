package com.campusconnect.backend.model;

/**
 * AdvisedCourse – Domain model for a single advisor-assigned course section.
 *
 * MVC Role: Model
 *
 * Represents a course section (from the routine/schedule catalog) that
 * an advisor has assigned to a specific student.
 *
 * TODO (Phase 3): Map to a JPA entity and persist via AdvisedCourseRepository.
 */
public class AdvisedCourse {

    private String id;           // e.g. "CSE110-01"
    private String studentId;
    private String courseCode;   // e.g. "CSE110"
    private String courseTitle;  // e.g. "Programming Language I"
    private String section;      // e.g. "01"
    private int    credits;      // default 3 per section
    private String time;         // e.g. "SUN-TUE 08:00 AM–09:20 AM"
    private String room;
    private String faculty;
    private String assignedAt;   // ISO datetime
    private String assignedBy;   // advisor name

    // ── Constructors ──────────────────────────────────────────────
    public AdvisedCourse() {}

    public AdvisedCourse(String id, String studentId, String courseCode,
                         String courseTitle, String section, int credits,
                         String time, String room, String faculty,
                         String assignedAt, String assignedBy) {
        this.id          = id;
        this.studentId   = studentId;
        this.courseCode  = courseCode;
        this.courseTitle = courseTitle;
        this.section     = section;
        this.credits     = credits;
        this.time        = time;
        this.room        = room;
        this.faculty     = faculty;
        this.assignedAt  = assignedAt;
        this.assignedBy  = assignedBy;
    }

    // ── Getters & Setters ─────────────────────────────────────────
    public String getId()                        { return id; }
    public void   setId(String id)               { this.id = id; }

    public String getStudentId()                 { return studentId; }
    public void   setStudentId(String sid)       { this.studentId = sid; }

    public String getCourseCode()                { return courseCode; }
    public void   setCourseCode(String cc)       { this.courseCode = cc; }

    public String getCourseTitle()               { return courseTitle; }
    public void   setCourseTitle(String ct)      { this.courseTitle = ct; }

    public String getSection()                   { return section; }
    public void   setSection(String s)           { this.section = s; }

    public int    getCredits()                   { return credits; }
    public void   setCredits(int c)              { this.credits = c; }

    public String getTime()                      { return time; }
    public void   setTime(String t)              { this.time = t; }

    public String getRoom()                      { return room; }
    public void   setRoom(String r)              { this.room = r; }

    public String getFaculty()                   { return faculty; }
    public void   setFaculty(String f)           { this.faculty = f; }

    public String getAssignedAt()                { return assignedAt; }
    public void   setAssignedAt(String a)        { this.assignedAt = a; }

    public String getAssignedBy()                { return assignedBy; }
    public void   setAssignedBy(String ab)       { this.assignedBy = ab; }
}
