package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.TestCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * TestCourseRepository – Spring Data JPA Repository for TestCourse.
 *
 * MVC Role: Repository
 */
@Repository
public interface TestCourseRepository extends JpaRepository<TestCourse, Long> {
    Optional<TestCourse> findByCode(String code);
    List<TestCourse> findByDepartmentIgnoreCase(String department);
    boolean existsByCode(String code);
}
