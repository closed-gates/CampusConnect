package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.AdvisedCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * AdvisedCourseRepository – Spring Data JPA repository for AdvisedCourse.
 *
 * MVC Role: Repository (data access)
 * Used by AdvisorService to persist/remove advisor-assigned course sections.
 */
@Repository
public interface AdvisedCourseRepository extends JpaRepository<AdvisedCourse, Long> {

    List<AdvisedCourse> findByStudentProfile_StudentId(String studentId);

    boolean existsByStudentProfile_StudentIdAndCourseCode(String studentId, String courseCode);

    /**
     * Removes a specific advised course assignment from a student by its ID.
     * The caller must own the record (verified by studentId).
     */
    @Modifying
    @Query("DELETE FROM AdvisedCourse ac WHERE ac.id = :id AND ac.studentProfile.studentId = :studentId")
    int deleteByIdAndStudentId(@Param("id") Long id, @Param("studentId") String studentId);
}
