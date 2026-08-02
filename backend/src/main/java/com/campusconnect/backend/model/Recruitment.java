package com.campusconnect.backend.model;

/**
 * Recruitment – Domain model for a club recruitment posting.
 *
 * MVC Role: Model
 *
 * TODO (Phase 3): Map to a JPA entity and persist via RecruitmentRepository.
 */
public class Recruitment {

    private Long    id;
    private String  clubName;
    private String  role;
    private String  description;
    private String  deadline;
    private int     slots;
    private String  postedAt;
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
