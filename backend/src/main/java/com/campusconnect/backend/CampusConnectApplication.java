package com.campusconnect.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * CampusConnect Shared Backend – Spring Boot entry point.
 *
 * Phase 1: Stub auth endpoints only (no database).
 * Phase 2: Add JWT, UserDetailsService, JPA, RBAC.
 */
@SpringBootApplication
public class CampusConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusConnectApplication.class, args);
    }
}
