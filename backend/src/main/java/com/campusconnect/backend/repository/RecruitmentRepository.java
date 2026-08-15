package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.Recruitment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * RecruitmentRepository – JPA Repository for club recruitment postings.
 *
 * MVC Role: Repository
 *
 * Provides CRUD operations and filtering for Recruitment entities
 * stored in the "recruitments" table on Neon PostgreSQL.
 */
@Repository
public interface RecruitmentRepository extends JpaRepository<Recruitment, Long> {

    /**
     * Returns all active recruitment postings.
     *
     * @return List of active Recruitment entities
     */
    List<Recruitment> findByActiveTrue();
}
