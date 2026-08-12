package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * EnrollmentRepository – Spring Data JPA repository for Enrollment.
 *
 * MVC Role: Repository (data access)
 */
@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByStudentId(String studentId);

    Optional<Enrollment> findByStudentIdAndCourseId(String studentId, Long courseId);

    boolean existsByStudentIdAndCourseId(String studentId, Long courseId);
}
