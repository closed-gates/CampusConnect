package com.campusconnect.backend.dto;

/**
 * AuthRequest – DTO for login and register requests.
 *
 * Phase 1: Plain POJO with no validation (used as stub).
 *
 * TODO (Phase 2):
 *   - Add @NotBlank, @Email, @Size annotations
 *   - Add role field for registration: String role
 *   - Consider separating into LoginRequest / RegisterRequest
 */
public class AuthRequest {

    /** Username or email (used for login) */
    private String username;

    /** Plain-text password (will be BCrypt-hashed in Phase 2) */
    private String password;

    /** Full name — used only for registration, null on login */
    private String fullName;

    /** Email address — used only for registration */
    private String email;

    // ── Constructors ──────────────────────────────────────────
    public AuthRequest() {}

    public AuthRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // ── Getters & Setters ─────────────────────────────────────
    public String getUsername()            { return username; }
    public void   setUsername(String u)    { this.username = u; }

    public String getPassword()            { return password; }
    public void   setPassword(String p)    { this.password = p; }

    public String getFullName()            { return fullName; }
    public void   setFullName(String fn)   { this.fullName = fn; }

    public String getEmail()               { return email; }
    public void   setEmail(String e)       { this.email = e; }
}
