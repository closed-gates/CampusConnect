package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.Advisor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * AdvisorRepository – Spring Data JPA repository for Advisor.
 *
 * MVC Role: Repository (data access)
 * Used by AdvisorService to query advisors from Neon PostgreSQL.
 */
@Repository
public interface AdvisorRepository extends JpaRepository<Advisor, Long> {

    /** Filter advisors by their department short key (e.g. "cse", "eee") */
    List<Advisor> findByDepartmentIgnoreCase(String department);
}
