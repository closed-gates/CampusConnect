package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.TestFaculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * TestFacultyRepository – Spring Data JPA Repository for TestFaculty.
 *
 * MVC Role: Repository
 */
@Repository
public interface TestFacultyRepository extends JpaRepository<TestFaculty, Long> {
    Optional<TestFaculty> findByFacultyId(String facultyId);
    Optional<TestFaculty> findByUserId(String userId);
    Optional<TestFaculty> findByEmail(String email);
    List<TestFaculty> findByDepartmentIgnoreCase(String department);
    boolean existsByFacultyId(String facultyId);
    boolean existsByEmail(String email);
}
