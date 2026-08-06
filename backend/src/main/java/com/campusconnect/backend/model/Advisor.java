package com.campusconnect.backend.model;

import java.util.List;

/**
 * Advisor – Domain model for a human academic advisor.
 *
 * MVC Role: Model
 *
 * Represents a faculty member or professional advisor who can be matched
 * to students based on department, specialties, and availability.
 *
 * TODO (Phase 3): Map to a JPA entity and persist via AdvisorRepository.
 */
public class Advisor {

    private Long         id;
    private String       name;
    private String       title;            // e.g. "Associate Professor"
    private String       department;       // short key, e.g. "cse", "eee"
    private String       departmentLabel;  // e.g. "Computer Science & Engineering"
    private List<String> specialties;      // e.g. ["Machine Learning", "Software Eng."]
    private List<String> availableDays;    // e.g. ["Monday", "Wednesday", "Friday"]
    private String       availableHours;   // e.g. "10:00 AM – 4:00 PM"
    private String       email;
    private String       bio;
    private int          matchScore;       // computed by AdvisorService, not stored

    // ── Constructors ──────────────────────────────────────────────
    public Advisor() {}

    public Advisor(Long id, String name, String title,
                   String department, String departmentLabel,
                   List<String> specialties,
                   List<String> availableDays, String availableHours,
                   String email, String bio) {
        this.id               = id;
        this.name             = name;
        this.title            = title;
        this.department       = department;
        this.departmentLabel  = departmentLabel;
        this.specialties      = specialties;
        this.availableDays    = availableDays;
        this.availableHours   = availableHours;
        this.email            = email;
        this.bio              = bio;
        this.matchScore       = 0;
    }

    // ── Getters & Setters ─────────────────────────────────────────
    public Long         getId()                          { return id; }
    public void         setId(Long id)                   { this.id = id; }

    public String       getName()                        { return name; }
    public void         setName(String name)             { this.name = name; }

    public String       getTitle()                       { return title; }
    public void         setTitle(String title)           { this.title = title; }

    public String       getDepartment()                  { return department; }
    public void         setDepartment(String dept)       { this.department = dept; }

    public String       getDepartmentLabel()             { return departmentLabel; }
    public void         setDepartmentLabel(String dl)    { this.departmentLabel = dl; }

    public List<String> getSpecialties()                 { return specialties; }
    public void         setSpecialties(List<String> s)   { this.specialties = s; }

    public List<String> getAvailableDays()               { return availableDays; }
    public void         setAvailableDays(List<String> d) { this.availableDays = d; }

    public String       getAvailableHours()              { return availableHours; }
    public void         setAvailableHours(String h)      { this.availableHours = h; }

    public String       getEmail()                       { return email; }
    public void         setEmail(String email)           { this.email = email; }

    public String       getBio()                         { return bio; }
    public void         setBio(String bio)               { this.bio = bio; }

    public int          getMatchScore()                  { return matchScore; }
    public void         setMatchScore(int score)         { this.matchScore = score; }
}
