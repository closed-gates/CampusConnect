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

    @Column(name = "student_id", length = 50)
    private String studentId;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "year_semester", length = 100)
    private String yearSemester;

    @Column(name = "interested_teams", columnDefinition = "TEXT")
    private String interestedTeams;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    @Column(name = "has_previous_experience", length = 50)
    private String hasPreviousExperience;

    @Column(name = "experience_description", columnDefinition = "TEXT")
    private String experienceDescription;

    @Column(name = "portfolio_link", length = 500)
    private String portfolioLink;

    @Column(name = "time_commitment", length = 100)
    private String timeCommitment;

    @Column(name = "willing_to_participate", length = 100)
    private String willingToParticipate;

    @Column(name = "bring_to_club", columnDefinition = "TEXT")
    private String bringToClub;

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

    public String getStudentId()                { return studentId; }
    public void   setStudentId(String si)       { this.studentId = si; }

    public String getPhone()                    { return phone; }
    public void   setPhone(String p)            { this.phone = p; }

    public String getDepartment()               { return department; }
    public void   setDepartment(String d)       { this.department = d; }

    public String getYearSemester()             { return yearSemester; }
    public void   setYearSemester(String ys)    { this.yearSemester = ys; }

    public String getInterestedTeams()          { return interestedTeams; }
    public void   setInterestedTeams(String it) { this.interestedTeams = it; }

    public String getSkills()                   { return skills; }
    public void   setSkills(String sk)          { this.skills = sk; }

    public String getHasPreviousExperience()    { return hasPreviousExperience; }
    public void   setHasPreviousExperience(String hpe) { this.hasPreviousExperience = hpe; }

    public String getExperienceDescription()    { return experienceDescription; }
    public void   setExperienceDescription(String ed)  { this.experienceDescription = ed; }

    public String getPortfolioLink()            { return portfolioLink; }
    public void   setPortfolioLink(String pl)   { this.portfolioLink = pl; }

    public String getTimeCommitment()           { return timeCommitment; }
    public void   setTimeCommitment(String tc)  { this.timeCommitment = tc; }

    public String getWillingToParticipate()     { return willingToParticipate; }
    public void   setWillingToParticipate(String wtp)  { this.willingToParticipate = wtp; }

    public String getBringToClub()              { return bringToClub; }
    public void   setBringToClub(String btc)    { this.bringToClub = btc; }
}
