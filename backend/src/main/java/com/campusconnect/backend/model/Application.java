package com.campusconnect.backend.model;

/**
 * Application – Domain model for a student club application.
 *
 * MVC Role: Model
 *
 * TODO (Phase 3): Map to a JPA entity and persist via ApplicationRepository.
 */
public class Application {

    private Long   id;
    private String recruitmentId;
    private String clubName;
    private String role;
    private String studentName;
    private String studentEmail;
    private String motivation;
    private String appliedAt;
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
