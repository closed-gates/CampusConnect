package com.campusconnect.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * SecurityConfig – Spring Security configuration.
 *
 * Phase 1:
 *   All requests are permitted to allow frontend development without
 *   authentication. CSRF is disabled for REST API usage.
 *
 * TODO (Phase 2 – JWT + RBAC):
 *   1. Inject JwtAuthFilter and add it before UsernamePasswordAuthenticationFilter.
 *   2. Restrict endpoints by role using authorizeHttpRequests():
 *      .requestMatchers("/api/auth/**").permitAll()
 *      .requestMatchers("/api/admin/**").hasRole("ADMINISTRATOR")
 *      .requestMatchers("/api/faculty/**").hasAnyRole("FACULTY", "ADMINISTRATOR")
 *      .anyRequest().authenticated()
 *   3. Add sessionManagement(sm -> sm.sessionCreationPolicy(STATELESS))
 *   4. Register AuthenticationProvider with BCryptPasswordEncoder.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — stateless REST API
            .csrf(AbstractHttpConfigurer::disable)

            // Phase 1: permit all requests
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()  // Auth endpoints always public
                .anyRequest().permitAll()                      // TODO Phase 2: restrict this
            );

        return http.build();
    }
}
