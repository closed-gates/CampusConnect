package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.TestSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * TestSectionRepository – Spring Data JPA Repository for TestSection.
 *
 * MVC Role: Repository
 */
@Repository
public interface TestSectionRepository extends JpaRepository<TestSection, Long> {
    Optional<TestSection> findBySectionId(String sectionId);
    List<TestSection> findByCourse_Code(String courseCode);
    List<TestSection> findByFaculty_FacultyId(String facultyId);
    List<TestSection> findByFaculty_Id(Long facultyPk);
    boolean existsBySectionId(String sectionId);
}
