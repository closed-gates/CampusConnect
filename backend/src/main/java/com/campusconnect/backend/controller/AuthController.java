package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.AuthRequest;
import com.campusconnect.backend.dto.AuthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController – Stub authentication REST endpoints.
 *
 * Base URL: /api/auth
 *
 * Phase 1 behaviour:
 *   All endpoints accept any input and return a stub success response.
 *   No validation, no database lookup, no JWT token issued.
 *
 * TODO (Phase 2 – Database + JWT Integration):
 *   POST /api/auth/login
 *     1. Look up user by username/email in the User repository.
 *     2. Validate BCrypt-hashed password.
 *     3. Generate JWT using JwtService.
 *     4. Return AuthResponse with token, role, userId, expiresIn.
 *
 *   POST /api/auth/register
 *     1. Check for duplicate username/email.
 *     2. Hash password with BCrypt.
 *     3. Save new User entity with default STUDENT role.
 *     4. Generate JWT and return AuthResponse.
 *
 *   POST /api/auth/logout
 *     1. (Optional) Add token to a server-side blacklist / Redis cache.
 *     2. Instruct client to remove the token.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // ── POST /api/auth/login ──────────────────────────────────
    /**
     * Login endpoint.
     *
     * @param request AuthRequest containing username and password
     * @return AuthResponse with success=true (Phase 1 stub)
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        /*
         * ── Phase 1 stub ──────────────────────────────────────
         * Accepts any credentials and returns success.
         * Replace this block in Phase 2 with real authentication.
         * ─────────────────────────────────────────────────────
         */
        AuthResponse response = new AuthResponse(
            true,
            "Login successful – Phase 1 stub. Database integration pending."
        );
        return ResponseEntity.ok(response);
    }

    // ── POST /api/auth/register ───────────────────────────────
    /**
     * Registration endpoint.
     *
     * @param request AuthRequest containing fullName, username, email, password
     * @return AuthResponse with success=true (Phase 1 stub)
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
        /*
         * ── Phase 1 stub ──────────────────────────────────────
         * Accepts any registration data and returns success.
         * Replace this block in Phase 2 with real user creation.
         * ─────────────────────────────────────────────────────
         */
        AuthResponse response = new AuthResponse(
            true,
            "Registration successful – Phase 1 stub. Database integration pending."
        );
        return ResponseEntity.ok(response);
    }

    // ── POST /api/auth/logout ─────────────────────────────────
    /**
     * Logout endpoint.
     *
     * @return AuthResponse with success=true (Phase 1 stub)
     */
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout() {
        /*
         * ── Phase 1 stub ──────────────────────────────────────
         * In Phase 2: invalidate the JWT token server-side.
         * ─────────────────────────────────────────────────────
         */
        AuthResponse response = new AuthResponse(
            true,
            "Logout successful – Phase 1 stub."
        );
        return ResponseEntity.ok(response);
    }
}
