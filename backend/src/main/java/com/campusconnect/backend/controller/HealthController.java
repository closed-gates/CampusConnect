package com.campusconnect.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * HealthController
 *
 * Provides a simple health-check endpoint to verify that the backend
 * server is running and reachable. No authentication required.
 *
 * Endpoint:  GET /api/health
 * Access:    Public
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * Returns the application health status.
     *
     * @return 200 OK with a JSON body containing status and timestamp.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = Map.of(
                "status",      "UP",
                "message",     "CampusConnect backend is running",
                "application", "Unified University Portal",
                "version",     "0.1.0-SNAPSHOT",
                "timestamp",   LocalDateTime.now().toString()
        );
        return ResponseEntity.ok(response);
    }
}
