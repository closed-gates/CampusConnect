package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.CourseCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * CourseCatalogRepository – Spring Data JPA repository for CourseCatalog.
 *
 * MVC Role: Repository (data access)
 * Schema v2: Added queries for department, school, isGenEd, and keyword search.
 */
@Repository
public interface CourseCatalogRepository extends JpaRepository<CourseCatalog, Long> {

    // ── Legacy queries (kept for backward compatibility) ──────────────────────

    List<CourseCatalog> findByFacultyId(String facultyId);

    List<CourseCatalog> findByYear(Integer year);

    List<CourseCatalog> findBySemester(String semester);

    List<CourseCatalog> findByFacultyIdAndYear(String facultyId, Integer year);

    List<CourseCatalog> findByFacultyIdAndSemester(String facultyId, String semester);

    // ── New queries for real BRACU data ──────────────────────────────────────

    /** Find all courses in a department (case-insensitive exact match) */
    List<CourseCatalog> findByDepartmentIgnoreCase(String department);

    /** Find all courses in a school/faculty grouping (case-insensitive exact match) */
    List<CourseCatalog> findBySchoolIgnoreCase(String school);

    /** Find all General Education courses */
    List<CourseCatalog> findByIsGenEd(Boolean isGenEd);

    /** Find by academic degree level */
    List<CourseCatalog> findByAcademicDegree(String academicDegree);

    /**
     * Full-text keyword search across code, name, department, and school.
     * Case-insensitive, ordered by department then code.
     */
    @Query("SELECT c FROM CourseCatalog c WHERE " +
           "LOWER(c.code) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.department) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(c.school) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY c.department ASC, c.code ASC")
    List<CourseCatalog> searchByKeyword(@Param("q") String keyword);

    /** Returns all distinct department names (sorted alphabetically) */
    @Query("SELECT DISTINCT c.department FROM CourseCatalog c WHERE c.department IS NOT NULL ORDER BY c.department ASC")
    List<String> findDistinctDepartments();

    /** Returns all distinct school names (sorted alphabetically) */
    @Query("SELECT DISTINCT c.school FROM CourseCatalog c WHERE c.school IS NOT NULL ORDER BY c.school ASC")
    List<String> findDistinctSchools();

    /** Find a catalog course by its unique code (e.g. "CSE110" or "CST301") */
    java.util.Optional<CourseCatalog> findByCode(String code);
}
