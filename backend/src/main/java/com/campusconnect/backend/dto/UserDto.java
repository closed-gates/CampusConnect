package com.campusconnect.backend.dto;

/**
 * UserDto – Safe public projection of an AppUser.
 *
 * MVC Role: DTO
 *
 * Exposes non-sensitive user profile attributes from the app_users table.
 * The passwordHash is strictly excluded.
 */
public class UserDto {

    private String userId;
    private String fullName;
    private String email;
    private String role;
    private Boolean isAdvisor;

    public UserDto() {}

    public UserDto(String userId, String fullName, String email, String role, Boolean isAdvisor) {
        this.userId    = userId;
        this.fullName  = fullName;
        this.email     = email;
        this.role      = role;
        this.isAdvisor = isAdvisor != null ? isAdvisor : false;
    }

    public String  getUserId()             { return userId; }
    public void    setUserId(String v)     { this.userId = v; }

    public String  getFullName()           { return fullName; }
    public void    setFullName(String v)   { this.fullName = v; }

    public String  getEmail()              { return email; }
    public void    setEmail(String v)      { this.email = v; }

    public String  getRole()               { return role; }
    public void    setRole(String v)       { this.role = v; }

    public Boolean getIsAdvisor()          { return isAdvisor; }
    public void    setIsAdvisor(Boolean v) { this.isAdvisor = v != null ? v : false; }
}
