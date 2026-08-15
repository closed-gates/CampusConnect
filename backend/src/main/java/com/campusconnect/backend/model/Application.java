package com.campusconnect.backend.model;

import jakarta.persistence.*;

/**
 * Application – JPA Entity for a student club application.
 *
 * MVC Role: Model
 *
 * Maps to the "club_applications" table in the Neon PostgreSQL database.
 */
@Entity
@Table(name = "club_applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recruitment_id", length = 20)
    private String recruitmentId;

    @Column(name = "club_name", nullable = false, length = 100)
    private String clubName;

    @Column(name = "role", nullable = false, length = 100)
    private String role;

    @Column(name = "student_name", nullable = false, length = 120)
    private String studentName;

    @Column(name = "student_email", nullable = false, length = 200)
    private String studentEmail;

    @Column(name = "motivation", columnDefinition = "TEXT")
    private String motivation;

    @Column(name = "applied_at", length = 40)
    private String appliedAt;

    @Column(name = "status", length = 20)
    private String status;     // e.g. "PENDING", "ACCEPTED", "REJECTED"

    // ── Constructors ──────────────────────────────────────────
    public Application() {}

    // ── Getters & Setters ─────────────────────────────────────
    public Long   getId()                       { return id; }
    public void   setId(Long id)                { this.id = id; }

    public String getRecruitmentId()            { return recruitmentId; }
    public void   setRecruitmentId(String rid)  { this.recruitmentId = rid; }

    public String getClubName()                 { return clubName; }
    public void   setClubName(String n)         { this.clubName = n; }

    public String getRole()                     { return role; }
    public void   setRole(String r)             { this.role = r; }

    public String getStudentName()              { return studentName; }
    public void   setStudentName(String sn)     { this.studentName = sn; }

    public String getStudentEmail()             { return studentEmail; }
    public void   setStudentEmail(String se)    { this.studentEmail = se; }

    public String getMotivation()               { return motivation; }
    public void   setMotivation(String m)       { this.motivation = m; }

    public String getAppliedAt()                { return appliedAt; }
    public void   setAppliedAt(String a)        { this.appliedAt = a; }

    public String getStatus()                   { return status; }
    public void   setStatus(String s)           { this.status = s; }
}
