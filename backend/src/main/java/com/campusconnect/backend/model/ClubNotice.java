package com.campusconnect.backend.model;

import jakarta.persistence.*;

/**
 * ClubNotice – JPA Entity for a club notice post.
 *
 * MVC Role: Model
 *
 * Maps to the "club_notices" table in the Neon PostgreSQL database.
 */
@Entity
@Table(name = "club_notices")
public class ClubNotice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "club_name", nullable = false, length = 100)
    private String clubName;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "posted_by", length = 100)
    private String postedBy;

    @Column(name = "posted_at", length = 40)
    private String postedAt;

    @Column(name = "pinned", nullable = false)
    private boolean pinned;

    // ── Constructors ──────────────────────────────────────────
    public ClubNotice() {}

    public ClubNotice(Long id, String clubName, String title,
                      String body, String postedBy, String postedAt, boolean pinned) {
        this.id       = id;
        this.clubName = clubName;
        this.title    = title;
        this.body     = body;
        this.postedBy = postedBy;
        this.postedAt = postedAt;
        this.pinned   = pinned;
    }

    // ── Getters & Setters ─────────────────────────────────────
    public Long    getId()                   { return id; }
    public void    setId(Long id)            { this.id = id; }

    public String  getClubName()             { return clubName; }
    public void    setClubName(String n)     { this.clubName = n; }

    public String  getTitle()                { return title; }
    public void    setTitle(String t)        { this.title = t; }

    public String  getBody()                 { return body; }
    public void    setBody(String b)         { this.body = b; }

    public String  getPostedBy()             { return postedBy; }
    public void    setPostedBy(String p)     { this.postedBy = p; }

    public String  getPostedAt()             { return postedAt; }
    public void    setPostedAt(String p)     { this.postedAt = p; }

    public boolean isPinned()                { return pinned; }
    public void    setPinned(boolean pinned) { this.pinned = pinned; }
}
