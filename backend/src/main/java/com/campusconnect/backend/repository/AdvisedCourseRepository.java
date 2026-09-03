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

    @Query("SELECT ac FROM AdvisedCourse ac WHERE ac.studentProfile.studentId = :studentId AND (ac.term = :term OR (ac.term IS NULL AND :term = 'Fall2026'))")
    List<AdvisedCourse> findForTerm(@Param("studentId") String studentId, @Param("term") String term);

    boolean existsByStudentProfile_StudentIdAndCourseCode(String studentId, String courseCode);

    @Query("SELECT COUNT(ac) > 0 FROM AdvisedCourse ac WHERE ac.studentProfile.studentId = :studentId AND UPPER(ac.courseCode) = UPPER(:courseCode) AND (ac.term = :term OR (ac.term IS NULL AND :term = 'Fall2026'))")
    boolean existsForTerm(@Param("studentId") String studentId, @Param("courseCode") String courseCode, @Param("term") String term);

    /**
     * Removes a specific advised course assignment from a student by its ID.
     * The caller must own the record (verified by studentId).
     */
    @Modifying
    @Query("DELETE FROM AdvisedCourse ac WHERE ac.id = :id AND ac.studentProfile.studentId = :studentId")
    int deleteByIdAndStudentId(@Param("id") Long id, @Param("studentId") String studentId);
}
