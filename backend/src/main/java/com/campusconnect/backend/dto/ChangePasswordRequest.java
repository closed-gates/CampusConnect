package com.campusconnect.backend.dto;

/**
 * ChangePasswordRequest - Request body for PUT /api/account/password/{userId}.
 * MVC Role: DTO
 */
public class ChangePasswordRequest {
    private String currentPassword;
    private String newPassword;

    public ChangePasswordRequest() {}
    public String getCurrentPassword()         { return currentPassword; }
    public void   setCurrentPassword(String v) { this.currentPassword = v; }
    public String getNewPassword()             { return newPassword; }
    public void   setNewPassword(String v)     { this.newPassword = v; }
}