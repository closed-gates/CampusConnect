package com.campusconnect.backend.dto;

/**
 * AuthResponse – DTO returned by login, register, and logout endpoints.
 *
 * Phase 1: Returns success flag + message only.
 *
 * TODO (Phase 2):
 *   - Add String token  (JWT access token)
 *   - Add String role   (user role: STUDENT | FACULTY | STAFF | ADMIN)
 *   - Add Long   userId
 *   - Add String username
 *   - Add long   expiresIn (token TTL in seconds)
 */
public class AuthResponse {

    private boolean success;
    private String  message;

    // ── Phase 2 fields (uncomment when ready) ────────────────
    // private String token;
    // private String role;
    // private Long   userId;
    // private String username;
    // private long   expiresIn;

    // ── Constructors ──────────────────────────────────────────
    public AuthResponse() {}

    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // ── Getters & Setters ─────────────────────────────────────
    public boolean isSuccess()            { return success; }
    public void    setSuccess(boolean s)  { this.success = s; }

    public String  getMessage()           { return message; }
    public void    setMessage(String m)   { this.message = m; }
}
