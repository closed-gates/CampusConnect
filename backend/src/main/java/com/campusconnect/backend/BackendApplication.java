package com.campusconnect.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * CampusConnect – Unified University Portal
 * Main entry point for the Spring Boot backend application.
 */
@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.campusconnect.backend.repository")
@EntityScan(basePackages = "com.campusconnect.backend.model")
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
