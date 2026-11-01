package com.campusconnect.backend.security;

import com.campusconnect.backend.repository.AppUserRepository;
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
    private final AppUserRepository userRepo;

    public JwtAuthFilter(JwtService jwtService, AppUserRepository userRepo) {
        this.jwtService = jwtService;
        this.userRepo = userRepo;
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

        // Freezing must take effect immediately, not when the 24h token expires.
        // The /me status route stays open so the client can show the frozen dialog.
        var user = userRepo.findByUserId(userId);
        if (user.isEmpty()) {          // deleted account → treated as no token (401)
            filterChain.doFilter(request, response);
            return;
        }
        if (!user.get().isActive() && !request.getRequestURI().equals("/api/admin/account-freezes/me")) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"ACCOUNT_FROZEN\"}");
            return;
        }

        String role = user.get().getRole();   // DB role, so demotions apply at once
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
