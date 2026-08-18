package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * StudentProfileRepository – Spring Data JPA repository for StudentProfile.
 *
 * MVC Role: Repository (data access)
 * Used by AdvisorService and RegistrationService.
 */
@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, String> {

    /**
     * Returns all students ordered by completedCredits descending —
     * used to determine advising priority (high credits = earlier window).
     */
    @Query("SELECT s FROM StudentProfile s ORDER BY s.completedCredits DESC")
    List<StudentProfile> findAllByPriority();
}
