package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.AuthRequest;
import com.campusconnect.backend.dto.AuthResponse;
import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.repository.AppUserRepository;
import com.campusconnect.backend.security.JwtService;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * AuthService – Real JWT-based authentication business logic.
 *
 * MVC Role: Service
 *
 * Responsibilities:
 *   login()    → look up user by userId OR email → validate BCrypt → issue JWT
 *   register() → validate no duplicates → hash password → save → issue JWT
 *   logout()   → stateless; client discards token
 *   seedDefaultUsers() → inserts 3 default accounts on first boot if table is empty
 */
@Service
public class AuthService {

    private final AppUserRepository userRepo;
    private final JwtService        jwtService;
    private final PasswordEncoder   passwordEncoder;

    public AuthService(AppUserRepository userRepo,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.userRepo        = userRepo;
        this.jwtService      = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    // ── Seed default accounts on first boot ───────────────────

    /**
     * Inserts one default account for each role if the app_users table is empty.
     * Runs automatically after the bean is constructed.
     *
     * Default credentials:
     *   STUDENT  → STU001 / student@campus.edu  / student123
     *   FACULTY  → FAC001 / faculty@campus.edu  / faculty123
     *   ADMIN    → ADM001 / admin@campus.edu    / admin123
     */
    @PostConstruct
    @Transactional
    public void seedDefaultUsers() {
        if (userRepo.count() > 0) return;   // Already seeded — skip

        String now = LocalDateTime.now().toString();

        userRepo.save(new AppUser(
            "STU001", "Alex Johnson", "student@campus.edu",
            passwordEncoder.encode("student123"), "STUDENT", now
        ));
        userRepo.save(new AppUser(
            "FAC001", "Dr. Mahbubur Rahman", "faculty@campus.edu",
            passwordEncoder.encode("faculty123"), "FACULTY", now
        ));
        userRepo.save(new AppUser(
            "ADM001", "Campus Admin", "admin@campus.edu",
            passwordEncoder.encode("admin123"), "ADMIN", now
        ));
    }

    // ── Login ─────────────────────────────────────────────────

    /**
     * Authenticate a user with identifier (userId OR email) + password.
     *
     * @param request AuthRequest with identifier and password
     * @return AuthResponse with JWT token on success, error message on failure
     */
    public AuthResponse login(AuthRequest request) {
        if (request.getIdentifier() == null || request.getPassword() == null) {
            return new AuthResponse(false, "Identifier and password are required.");
        }

        String id = request.getIdentifier().trim();

        // Look up by userId first, then by email
        Optional<AppUser> userOpt = userRepo.findByUserId(id);
        if (userOpt.isEmpty()) {
            userOpt = userRepo.findByEmail(id);
        }

        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "No account found with that User ID or email.");
        }

        AppUser user = userOpt.get();

        // Validate BCrypt password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return new AuthResponse(false, "Incorrect password. Please try again.");
        }

        // Issue JWT
        String token = jwtService.generateToken(user);
        return new AuthResponse(
            true, "Login successful.",
            token, user.getRole(), user.getUserId(),
            user.getFullName(), user.getEmail(),
            jwtService.getExpiryMs(),
            user.isAdvisor()
        );
    }

    // ── Register ──────────────────────────────────────────────

    /**
     * Register a new user account.
     *
     * @param request AuthRequest with userId, fullName, email, password, role
     * @return AuthResponse with JWT token on success, error message on failure
     */
    @Transactional
    public AuthResponse register(AuthRequest request) {
        // Validate required fields
        if (request.getUserId()  == null || request.getUserId().isBlank()  ||
            request.getEmail()   == null || request.getEmail().isBlank()   ||
            request.getPassword()== null || request.getPassword().isBlank() ||
            request.getFullName()== null || request.getFullName().isBlank()) {
            return new AuthResponse(false, "All fields are required.");
        }

        // Check for duplicates
        if (userRepo.existsByUserId(request.getUserId().trim())) {
            return new AuthResponse(false, "User ID \"" + request.getUserId() + "\" is already taken.");
        }
        if (userRepo.existsByEmail(request.getEmail().trim())) {
            return new AuthResponse(false, "An account with that email already exists.");
        }

        // Determine role (default STUDENT if not specified)
        String role = request.getRole() != null ? request.getRole().toUpperCase() : "STUDENT";
        if (!role.equals("STUDENT") && !role.equals("FACULTY") && !role.equals("ADMIN")) {
            role = "STUDENT";
        }

        // Create and persist new user
        AppUser newUser = new AppUser(
            request.getUserId().trim(),
            request.getFullName().trim(),
            request.getEmail().trim().toLowerCase(),
            passwordEncoder.encode(request.getPassword()),
            role,
            LocalDateTime.now().toString(),
            false
        );
        userRepo.save(newUser);

        // Issue JWT
        String token = jwtService.generateToken(newUser);
        return new AuthResponse(
            true, "Account created successfully.",
            token, newUser.getRole(), newUser.getUserId(),
            newUser.getFullName(), newUser.getEmail(),
            jwtService.getExpiryMs(),
            newUser.isAdvisor()
        );
    }

    // ── Logout ────────────────────────────────────────────────

    /**
     * Logout is stateless — the client discards the JWT.
     * In a future iteration, a token blacklist / Redis cache can be added.
     */
    public AuthResponse logout() {
        return new AuthResponse(true, "Logged out successfully.");
    }
}
