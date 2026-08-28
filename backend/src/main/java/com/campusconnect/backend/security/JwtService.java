package com.campusconnect.backend.security;

import com.campusconnect.backend.model.AppUser;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

/**
 * JwtService – Generates and validates JWT tokens for CampusConnect.
 *
 * MVC Role: Security / Service
 *
 * Token Claims:
 *   sub       → userId (e.g. "STU001")
 *   email     → user email
 *   role      → "STUDENT" | "FACULTY" | "ADMIN"
 *   fullName  → display name
 *   iat       → issued at
 *   exp       → expiry
 *
 * Configuration (via application-prod.properties / .env):
 *   jwt.secret     → Base64-encoded HMAC-SHA256 secret key
 *   jwt.expiry-ms  → token lifetime in milliseconds (default 86400000 = 24h)
 */
@Service
public class JwtService {

    private final Key signingKey;
    private final long expiryMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiry-ms:86400000}") long expiryMs) {
        // Decode Base64 secret → HMAC-SHA key
        byte[] keyBytes = Base64.getDecoder().decode(secret);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expiryMs   = expiryMs;
    }

    // ── Generate token ────────────────────────────────────────

    /**
     * Generate a signed JWT for the given user.
     *
     * @param user The authenticated AppUser
     * @return Compact JWT string
     */
    public String generateToken(AppUser user) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(user.getUserId())
                .claim("email",    user.getEmail())
                .claim("role",     user.getRole())
                .claim("fullName", user.getFullName())
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expiryMs))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // ── Extract claims ────────────────────────────────────────

    /** Extract the userId (sub claim) from a token. */
    public String extractUserId(String token) {
        return parseClaims(token).getSubject();
    }

    /** Extract the role claim from a token. */
    public String extractRole(String token) {
        return (String) parseClaims(token).get("role");
    }

    /** Extract the fullName claim from a token. */
    public String extractFullName(String token) {
        return (String) parseClaims(token).get("fullName");
    }

    /** Extract the email claim from a token. */
    public String extractEmail(String token) {
        return (String) parseClaims(token).get("email");
    }

    /** Return token expiry in milliseconds from epoch. */
    public long getExpiryMs() {
        return expiryMs;
    }

    // ── Validate token ────────────────────────────────────────

    /**
     * Returns true if the token is structurally valid, correctly signed,
     * and not expired.
     *
     * @param token JWT string
     * @return true if valid
     */
    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ── Internal helpers ──────────────────────────────────────

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
