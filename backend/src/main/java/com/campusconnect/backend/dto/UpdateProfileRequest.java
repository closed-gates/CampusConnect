package com.campusconnect.backend.dto;

/**
 * UpdateProfileRequest - Request body for PUT /api/account/profile/{userId}.
 * MVC Role: DTO
 */
public class UpdateProfileRequest {
    private String fullName;
    private String email;

    public UpdateProfileRequest() {}
    public String getFullName()         { return fullName; }
    public void   setFullName(String v) { this.fullName = v; }
    public String getEmail()            { return email; }
    public void   setEmail(String v)    { this.email = v; }
}