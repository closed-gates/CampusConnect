package com.campusconnect.backend.security;

import com.campusconnect.backend.exception.ForbiddenException;
import org.springframework.security.core.Authentication;

/** Identity checks on the JWT-authenticated caller (principal name = userId). */
public final class CurrentUser {

    private CurrentUser() {}

    public static boolean hasRole(Authentication auth, String role) {
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }

    public static boolean isStaff(Authentication auth) {
        return hasRole(auth, "ADMIN") || hasRole(auth, "FACULTY");
    }

    /** Students may only touch their own records; faculty and admins may touch any. */
    public static void requireSelfOrStaff(Authentication auth, String studentId) {
        if (isStaff(auth)) return;
        if (auth == null || studentId == null || !auth.getName().equalsIgnoreCase(studentId)) {
            throw new ForbiddenException("You can only access your own records.");
        }
    }
}
