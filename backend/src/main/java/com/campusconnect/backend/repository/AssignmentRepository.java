package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * AssignmentRepository – Data access for Assignment entities.
 *
 * MVC Role: Repository
 *
 * Provides JPA query methods for the "assignments" table.
 */
@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    /**
     * All assignments ordered by deadline (earliest first).
     */
    List<Assignment> findAllByOrderByDeadlineAsc();

    /**
     * Assignments for a specific course.
     */
    List<Assignment> findByCourseCode(String courseCode);
}
