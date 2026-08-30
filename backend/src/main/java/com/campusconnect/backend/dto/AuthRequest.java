package com.campusconnect.backend.dto;

/**
 * AuthRequest – DTO for login and registration requests.
 *
 * MVC Role: DTO
 *
 * Login fields:   identifier (userId OR email) + password
 * Register fields: userId + fullName + email + password + role
 */
public class AuthRequest {

    /** userId (e.g. "STU001") OR email — used as login identifier */
    private String identifier;

    /** Plain-text password (BCrypt-hashed before storage) */
    private String password;

    /** Full display name — registration only */
    private String fullName;

    /** Unique user ID chosen at registration (e.g. "STU042") */
    private String userId;

    /** Email address — registration only */
    private String email;

    /** Role — registration only: STUDENT | FACULTY | ADMIN */
    private String role;

    // ── Constructors ──────────────────────────────────────────
    public AuthRequest() {}

    // ── Getters & Setters ─────────────────────────────────────
    public String getIdentifier()              { return identifier; }
    public void   setIdentifier(String i)      { this.identifier = i; }

    public String getPassword()                { return password; }
    public void   setPassword(String p)        { this.password = p; }

    public String getFullName()                { return fullName; }
    public void   setFullName(String fn)       { this.fullName = fn; }

    public String getUserId()                  { return userId; }
    public void   setUserId(String uid)        { this.userId = uid; }

    public String getEmail()                   { return email; }
    public void   setEmail(String e)           { this.email = e; }

    public String getRole()                    { return role; }
    public void   setRole(String r)            { this.role = r; }
}
