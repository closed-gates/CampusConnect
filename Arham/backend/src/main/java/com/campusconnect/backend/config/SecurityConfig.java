package com.campusconnect.backend.config;

import com.campusconnect.backend.config.CorsConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * SecurityConfig — Phase 1 Stub
 *
 * Temporarily permits all requests during Phase 1 so we can
 * verify the server starts and the health endpoint responds.
 *
 * ⚠️  THIS WILL BE REPLACED in Phase 2 with full JWT-based
 *     authentication and Role-Based Access Control (RBAC).
 *
 * Phase 2 changes:
 * - Add JwtAuthFilter before UsernamePasswordAuthenticationFilter
 * - Restrict endpoints by role (STUDENT, FACULTY, STAFF, ADMIN)
 * - Configure stateless session management
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CorsConfig corsConfig;

    public SecurityConfig(CorsConfig corsConfig) {
        this.corsConfig = corsConfig;
    }

    /**
     * Security filter chain.
     * Phase 1: All requests permitted (no auth enforced yet).
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Apply CORS configuration from CorsConfig bean
            .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))

            // Disable CSRF — using JWT (stateless), CSRF protection not needed
            .csrf(AbstractHttpConfigurer::disable)

            // Phase 1: permit all requests
            // TODO Phase 2: replace with role-based restrictions
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            );

        return http.build();
    }
}
