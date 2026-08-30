package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.StudentCompletedCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * StudentCompletedCourseRepository – Spring Data JPA repository for StudentCompletedCourse.
 *
 * MVC Role: Repository
 */
@Repository
public interface StudentCompletedCourseRepository extends JpaRepository<StudentCompletedCourse, Long> {

    List<StudentCompletedCourse> findByStudentIdOrderByBypassedAtDesc(String studentId);

    List<StudentCompletedCourse> findByStudentId(String studentId);

    boolean existsByStudentIdAndCourseCode(String studentId, String courseCode);

    Optional<StudentCompletedCourse> findByStudentIdAndCourseCode(String studentId, String courseCode);

    void deleteByStudentIdAndId(String studentId, Long id);
}
