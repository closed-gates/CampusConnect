package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.AuthRequest;
import com.campusconnect.backend.dto.AuthResponse;
import org.springframework.stereotype.Service;

/**
 * AuthService – Business logic for authentication operations.
 *
 * MVC Role: Controller's delegate (Service layer)
 *
 * Phase 1: All operations are stubs — no real authentication occurs.
 *
 * TODO (Phase 2 – Database + JWT Integration):
 *   login():
 *     1. Look up user by username/email in UserRepository.
 *     2. Validate BCrypt-hashed password with PasswordEncoder.
 *     3. Generate JWT token using JwtService.
 *     4. Return AuthResponse with token, role, userId, expiresIn.
 *
 *   register():
 *     1. Check for duplicate username/email.
 *     2. Hash password with BCrypt PasswordEncoder.
 *     3. Save new User entity with default STUDENT role.
 *     4. Generate JWT and return AuthResponse.
 *
 *   logout():
 *     1. (Optional) Add token to a server-side blacklist / Redis cache.
 */
@Service
public class AuthService {

    /**
     * Authenticate a user with the provided credentials.
     *
     * @param request AuthRequest containing username and password
     * @return AuthResponse indicating success/failure
     */
    public AuthResponse login(AuthRequest request) {
        /*
         * ── Phase 1 stub ──────────────────────────────────────
         * Accepts any credentials and returns success.
         * Replace this block in Phase 2 with real authentication.
         * ─────────────────────────────────────────────────────
         */
        return new AuthResponse(
            true,
            "Login successful – Phase 1 stub. Database integration pending."
        );
    }

    /**
     * Register a new user account.
     *
     * @param request AuthRequest containing fullName, username, email, password
     * @return AuthResponse indicating success/failure
     */
    public AuthResponse register(AuthRequest request) {
        /*
         * ── Phase 1 stub ──────────────────────────────────────
         * Accepts any registration data and returns success.
         * Replace this block in Phase 2 with real user creation.
         * ─────────────────────────────────────────────────────
         */
        return new AuthResponse(
            true,
            "Registration successful – Phase 1 stub. Database integration pending."
        );
    }

    /**
     * Invalidate an authenticated user's session.
     *
     * @return AuthResponse confirming logout
     */
    public AuthResponse logout() {
        /*
         * ── Phase 1 stub ──────────────────────────────────────
         * In Phase 2: invalidate the JWT token server-side.
         * ─────────────────────────────────────────────────────
         */
        return new AuthResponse(
            true,
            "Logout successful – Phase 1 stub."
        );
    }
}
