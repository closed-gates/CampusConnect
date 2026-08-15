package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.CourseSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * CourseSectionRepository – Spring Data JPA repository for CourseSection.
 *
 * MVC Role: Repository (data access)
 * Used by the Routine Builder page (Pre-Registration module).
 */
@Repository
public interface CourseSectionRepository extends JpaRepository<CourseSection, String> {

    List<CourseSection> findByCode(String code);

    /** Case-insensitive search across code and title */
    @Query("SELECT s FROM CourseSection s WHERE " +
           "LOWER(s.code) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.section) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<CourseSection> search(@Param("q") String query);
}
