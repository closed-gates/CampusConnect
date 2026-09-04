package com.campusconnect.backend.dto;

/** Safe admin projection for freeze-account management. */
public record AccountFreezeDTO(
        String userId,
        String fullName,
        String email,
        String role,
        boolean frozen
) {}
