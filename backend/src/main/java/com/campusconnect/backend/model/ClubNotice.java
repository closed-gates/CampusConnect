package com.campusconnect.backend.model;

/**
 * ClubNotice – Domain model for a club notice post.
 *
 * MVC Role: Model
 *
 * TODO (Phase 3): Map this class to a JPA entity (@Entity, @Table("club_notices"))
 *   and persist via ClubNoticeRepository (JpaRepository).
 */
public class ClubNotice {

    private Long    id;
    private String  clubName;
    private String  title;
    private String  body;
    private String  postedBy;
    private String  postedAt;
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
