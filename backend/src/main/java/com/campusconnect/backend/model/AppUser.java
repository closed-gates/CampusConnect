package com.campusconnect.backend.model;

import jakarta.persistence.*;

/**
 * AppUser – JPA Entity representing a registered user in CampusConnect.
 *
 * MVC Role: Model
 *
 * Maps to the "app_users" table in the Neon PostgreSQL database.
 * Supports three roles: STUDENT, FACULTY, ADMIN.
 * Password is stored as a BCrypt hash — never plain-text.
 */
@Entity
@Table(name = "app_users")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique user identifier (e.g. STU001, FAC001). Used for login. */
    @Column(name = "user_id", nullable = false, unique = true, length = 50)
    private String userId;

    /** User's display name */
    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    /** Unique email address. Used for login as alternative to userId. */
    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    /** BCrypt-hashed password — never stored plain-text */
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    /** Role: STUDENT | FACULTY | ADMIN */
    @Column(name = "role", nullable = false, length = 20)
    private String role;

    /** ISO timestamp of account creation */
    @Column(name = "created_at", length = 40)
    private String createdAt;

    // ── Constructors ──────────────────────────────────────────
    public AppUser() {}

    public AppUser(String userId, String fullName, String email,
                   String passwordHash, String role, String createdAt) {
        this.userId       = userId;
        this.fullName     = fullName;
        this.email        = email;
        this.passwordHash = passwordHash;
        this.role         = role;
        this.createdAt    = createdAt;
    }

    // ── Getters & Setters ─────────────────────────────────────
    public Long   getId()                           { return id; }
    public void   setId(Long id)                    { this.id = id; }

    public String getUserId()                       { return userId; }
    public void   setUserId(String userId)          { this.userId = userId; }

    public String getFullName()                     { return fullName; }
    public void   setFullName(String fullName)      { this.fullName = fullName; }

    public String getEmail()                        { return email; }
    public void   setEmail(String email)            { this.email = email; }

    public String getPasswordHash()                 { return passwordHash; }
    public void   setPasswordHash(String h)         { this.passwordHash = h; }

    public String getRole()                         { return role; }
    public void   setRole(String role)              { this.role = role; }

    public String getCreatedAt()                    { return createdAt; }
    public void   setCreatedAt(String createdAt)    { this.createdAt = createdAt; }
}
