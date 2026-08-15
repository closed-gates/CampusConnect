package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.AuthRequest;
import com.campusconnect.backend.dto.AuthResponse;
import com.campusconnect.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController – Thin REST handler for authentication endpoints.
 *
 * MVC Role: Controller
 *
 * Base URL: /api/auth
 *
 * All business logic has been moved to {@link AuthService}.
 * This controller is responsible only for:
 *   1. Accepting HTTP requests and extracting parameters
 *   2. Delegating to AuthService
 *   3. Returning HTTP responses
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ── POST /api/auth/login ──────────────────────────────────
    /**
     * Login endpoint.
     *
     * @param request AuthRequest containing username and password
     * @return AuthResponse with success=true (Phase 1 stub)
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
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
        return ResponseEntity.ok(authService.register(request));
    }

    // ── POST /api/auth/logout ─────────────────────────────────
    /**
     * Logout endpoint.
     *
     * @return AuthResponse with success=true (Phase 1 stub)
     */
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout() {
        return ResponseEntity.ok(authService.logout());
    }
}
