package com.campusconnect.backend.model;

import jakarta.persistence.*;

/**
 * Recruitment – JPA Entity for a club recruitment posting.
 *
 * MVC Role: Model
 *
 * Maps to the "recruitments" table in the Neon PostgreSQL database.
 */
@Entity
@Table(name = "recruitments")
public class Recruitment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "club_name", nullable = false, length = 100)
    private String clubName;

    @Column(name = "role", nullable = false, length = 100)
    private String role;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "deadline", length = 20)
    private String deadline;

    @Column(name = "slots", nullable = false)
    private int slots;

    @Column(name = "posted_at", length = 40)
    private String postedAt;

    @Column(name = "active", nullable = false)
    private boolean active;

    // ── Constructors ──────────────────────────────────────────
    public Recruitment() {}

    public Recruitment(Long id, String clubName, String role, String description,
                       String deadline, int slots, String postedAt, boolean active) {
        this.id          = id;
        this.clubName    = clubName;
        this.role        = role;
        this.description = description;
        this.deadline    = deadline;
        this.slots       = slots;
        this.postedAt    = postedAt;
        this.active      = active;
    }

    // ── Getters & Setters ─────────────────────────────────────
    public Long    getId()                   { return id; }
    public void    setId(Long id)            { this.id = id; }

    public String  getClubName()             { return clubName; }
    public void    setClubName(String n)     { this.clubName = n; }

    public String  getRole()                 { return role; }
    public void    setRole(String r)         { this.role = r; }

    public String  getDescription()          { return description; }
    public void    setDescription(String d)  { this.description = d; }

    public String  getDeadline()             { return deadline; }
    public void    setDeadline(String d)     { this.deadline = d; }

    public int     getSlots()                { return slots; }
    public void    setSlots(int s)           { this.slots = s; }

    public String  getPostedAt()             { return postedAt; }
    public void    setPostedAt(String p)     { this.postedAt = p; }

    public boolean isActive()                { return active; }
    public void    setActive(boolean active) { this.active = active; }
}
