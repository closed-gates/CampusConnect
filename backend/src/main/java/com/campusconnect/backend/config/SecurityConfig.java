package com.campusconnect.backend.config;

import com.campusconnect.backend.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
 *   WS   /ws/**  (handshake only; STOMP CONNECT requires a JWT, see WebSocketAuthInterceptor)
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
                // Profile mutation is restricted to administrators. Read-only
                // access remains available to each authenticated account.
                .requestMatchers(HttpMethod.PUT, "/api/account/profile").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/account/profile-picture").hasRole("ADMIN")
                .requestMatchers("/api/admin/profile-management/**").hasRole("ADMIN")
                // Public — health check
                .requestMatchers("/api/health").permitAll()
                // Chat attachments are opened by plain links (no auth header); names start with a random UUID.
                .requestMatchers(HttpMethod.GET, "/api/chat/files/**").permitAll()
                // Public — WebSocket handshake
                .requestMatchers("/ws/**").permitAll()
                // Payments: money-changing admin actions
                .requestMatchers(HttpMethod.POST, "/api/payments/bypass").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/payments/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/payments/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/payments/students").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/exam-schedule/reseed").hasRole("ADMIN")
                // Course channel membership changes are staff-only; reads need a login
                .requestMatchers(HttpMethod.POST, "/api/channels/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.DELETE, "/api/channels/**").hasAnyRole("ADMIN", "FACULTY")
                // Everything else requires a valid JWT
                .anyRequest().authenticated()
            )

            // Register JWT filter before Spring's username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
