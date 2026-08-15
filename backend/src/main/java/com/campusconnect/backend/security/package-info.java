/**
 * Security layer — Authentication and Authorization.
 *
 * Responsibilities:
 * - Implement JWT token generation, parsing, and validation.
 * - Define UserDetailsService implementation.
 * - Create Spring Security filter chain (JwtAuthFilter).
 * - Enforce Role-Based Access Control (RBAC).
 *
 * Key classes (implemented in Phase 2):
 * - JwtService.java          — Token creation & validation
 * - JwtAuthFilter.java       — Intercepts requests to validate JWT
 * - UserDetailsServiceImpl.java — Loads user from database for Spring Security
 */
package com.campusconnect.backend.security;
