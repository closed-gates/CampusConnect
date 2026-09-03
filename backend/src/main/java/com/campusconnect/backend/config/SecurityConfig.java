package com.campusconnect.backend.config;

import com.campusconnect.backend.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * SecurityConfig – JWT-based stateless security configuration.
 *
 * MVC Role: Config
 *
 * Public endpoints (no token required):
 *   POST /api/auth/login
 *   POST /api/auth/register
 *   GET  /api/health
 *   WS   /ws/**
 *
 * All other endpoints require a valid JWT Bearer token.
 * Roles are encoded in the token and enforced at the controller level.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CorsConfig     corsConfig;
    private final JwtAuthFilter  jwtAuthFilter;

    public SecurityConfig(CorsConfig corsConfig, JwtAuthFilter jwtAuthFilter) {
        this.corsConfig    = corsConfig;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Apply CORS from CorsConfig bean
            .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))

            // Disable CSRF — stateless JWT API, no session cookies
            .csrf(AbstractHttpConfigurer::disable)

            // Stateless session — never create an HTTP session
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Route authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public — authentication endpoints
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/register").permitAll()
                .requestMatchers("/api/auth/logout").permitAll()
                // Public — health check
                .requestMatchers("/api/health").permitAll()
                // Public — WebSocket handshake
                .requestMatchers("/ws/**").permitAll()
                // Public — User directory for direct messaging
                .requestMatchers("/api/users/**").permitAll()
                // Everything else requires a valid JWT
                .anyRequest().authenticated()
            )

            // Register JWT filter before Spring's username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
