package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * SubmissionRepository – Data access for Submission entities.
 *
 * MVC Role: Repository
 *
 * Provides JPA query methods for the "submissions" table.
 */
@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    void deleteByAssignmentId(Long assignmentId);

    /**
     * Find a specific student's submission for an assignment.
     */
    Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, String studentId);

    /**
     * All submissions for a given assignment (teacher grading view).
     */
    List<Submission> findByAssignmentId(Long assignmentId);

    /**
     * All submissions by a student across all assignments.
     */
    List<Submission> findByStudentId(String studentId);
}
