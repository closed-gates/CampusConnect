package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * ApplicationRepository – JPA Repository for club applications.
 *
 * MVC Role: Repository
 *
 * Provides CRUD operations for Application entities
 * stored in the "club_applications" table on Neon PostgreSQL.
 */
@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    // Standard JPA CRUD operations are sufficient for now.
    // Future: findByClubName(), findByStudentEmail(), findByStatus() etc.
}
