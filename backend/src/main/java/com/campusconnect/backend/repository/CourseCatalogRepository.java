package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.CourseCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * CourseCatalogRepository – Spring Data JPA repository for CourseCatalog.
 *
 * MVC Role: Repository (data access)
 */
@Repository
public interface CourseCatalogRepository extends JpaRepository<CourseCatalog, Long> {

    List<CourseCatalog> findByFacultyId(String facultyId);

    List<CourseCatalog> findByYear(Integer year);

    List<CourseCatalog> findBySemester(String semester);

    List<CourseCatalog> findByFacultyIdAndYear(String facultyId, Integer year);

    List<CourseCatalog> findByFacultyIdAndSemester(String facultyId, String semester);
}
