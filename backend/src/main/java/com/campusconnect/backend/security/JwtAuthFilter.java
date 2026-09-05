package com.campusconnect.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JwtAuthFilter – Intercepts every HTTP request and validates the JWT.
 *
 * MVC Role: Security / Filter
 *
 * Flow:
 *   1. Read the "Authorization: Bearer <token>" header
 *   2. If missing or malformed → continue chain (Spring Security blocks if route is protected)
 *   3. If present → validate via JwtService
 *   4. If valid → set Authentication in SecurityContextHolder
 *   5. Continue filter chain
 *
 * This filter is registered before UsernamePasswordAuthenticationFilter
 * in SecurityConfig.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest  request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain         filterChain
    ) throws ServletException, IOException {

        final String token = resolveToken(request);

        // No token → skip authentication (public endpoints pass through;
        // protected ones are rejected by SecurityConfig)
        if (token == null || token.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!jwtService.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract user info from the token
        String userId  = jwtService.extractUserId(token);
        String role    = jwtService.extractRole(token);

        // Build Spring Security authentication with the user's role
        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
        var auth = new UsernamePasswordAuthenticationToken(userId, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }

    /**
     * HTML {@code <video src>} cannot send Authorization headers, so uploaded
     * lecture streams also accept {@code ?access_token=} on the stream path only.
     */
    private static String resolveToken(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        String path = request.getRequestURI();
        if (path != null && path.contains("/api/video-lectures/") && path.endsWith("/stream")) {
            String queryToken = request.getParameter("access_token");
            if (queryToken != null && !queryToken.isBlank()) {
                return queryToken;
            }
        }
        return null;
    }
}
