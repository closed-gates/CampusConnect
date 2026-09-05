package com.campusconnect.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * CorsConfig
 *
 * Configures Cross-Origin Resource Sharing (CORS) to allow the React
 * frontend development server to communicate with this backend.
 *
 * Development origin:  http://localhost:3000  (React default)
 * Production origins:  Update this list with the deployed frontend URL.
 *
 * This bean is consumed by SecurityConfig (Phase 2) via
 * HttpSecurity.cors(cors -> cors.configurationSource(corsConfigurationSource())).
 */
@Configuration
public class CorsConfig {

    /**
     * Defines allowed origins, methods, and headers for CORS requests.
     *
     * @return CorsConfigurationSource used by the Spring Security filter chain.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allowed origins for Render production deployment
        String frontendUrl = System.getenv("FRONTEND_URL");
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            configuration.setAllowedOriginPatterns(List.of(
                    "https://*.onrender.com",
                    frontendUrl.trim()
            ));
        } else {
            configuration.setAllowedOriginPatterns(List.of(
                    "https://*.onrender.com"
            ));
        }

        // Allowed HTTP methods
        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        // Allowed headers
        configuration.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "Upgrade",            // Required for WebSocket protocol upgrade
                "Connection"
        ));

        // Expose the Authorization header to the frontend for JWT
        configuration.setExposedHeaders(List.of(
                "Authorization",
                "Accept-Ranges",
                "Content-Range",
                "Content-Length",
                "Content-Type"
        ));

        // Allow credentials (needed for JWT Authorization header)
        configuration.setAllowCredentials(true);

        // Cache pre-flight response for 1 hour (3600 seconds)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        source.registerCorsConfiguration("/ws/**",  configuration);  // SockJS WebSocket

        return source;
    }
}
