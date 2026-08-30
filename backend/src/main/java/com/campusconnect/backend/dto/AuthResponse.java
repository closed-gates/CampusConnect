package com.campusconnect.backend.dto;

/**
 * AuthResponse – DTO returned by login, register, and logout endpoints.
 *
 * MVC Role: DTO
 *
 * On success: success=true + JWT token + user metadata
 * On failure: success=false + error message
 */
public class AuthResponse {

    private boolean success;
    private String  message;

    // ── Auth payload (populated on successful login/register) ─
    private String token;
    private String role;
    private String userId;
    private String fullName;
    private String email;
    private long   expiresIn;   // token TTL in milliseconds
    private boolean isAdvisor;

    // ── Constructors ──────────────────────────────────────────
    public AuthResponse() {}

    /** Error response */
    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    /** Success response with full auth payload */
    public AuthResponse(boolean success, String message,
                        String token, String role,
                        String userId, String fullName,
                        String email, long expiresIn) {
        this(success, message, token, role, userId, fullName, email, expiresIn, false);
    }

    public AuthResponse(boolean success, String message,
                        String token, String role,
                        String userId, String fullName,
                        String email, long expiresIn, boolean isAdvisor) {
        this.success   = success;
        this.message   = message;
        this.token     = token;
        this.role      = role;
        this.userId    = userId;
        this.fullName  = fullName;
        this.email     = email;
        this.expiresIn = expiresIn;
        this.isAdvisor = isAdvisor;
    }

    // ── Getters & Setters ─────────────────────────────────────
    public boolean isSuccess()              { return success; }
    public void    setSuccess(boolean s)    { this.success = s; }

    public String  getMessage()             { return message; }
    public void    setMessage(String m)     { this.message = m; }

    public String  getToken()               { return token; }
    public void    setToken(String t)       { this.token = t; }

    public String  getRole()                { return role; }
    public void    setRole(String r)        { this.role = r; }

    public String  getUserId()              { return userId; }
    public void    setUserId(String uid)    { this.userId = uid; }

    public String  getFullName()            { return fullName; }
    public void    setFullName(String fn)   { this.fullName = fn; }

    public String  getEmail()               { return email; }
    public void    setEmail(String e)       { this.email = e; }

    public long    getExpiresIn()           { return expiresIn; }
    public void    setExpiresIn(long ms)    { this.expiresIn = ms; }

    public boolean getIsAdvisor()           { return isAdvisor; }
    public void    setIsAdvisor(boolean a)  { this.isAdvisor = a; }
}
