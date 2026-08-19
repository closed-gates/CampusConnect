package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.ExamSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ExamScheduleRepository – Spring Data JPA repository for ExamSchedule.
 *
 * MVC Role: Repository (data access)
 * Used by: ExamScheduleService, ExamScheduleController
 */
@Repository
public interface ExamScheduleRepository extends JpaRepository<ExamSchedule, Long> {

    /** Find exam schedule for a specific course code. */
    Optional<ExamSchedule> findByCourseCode(String courseCode);

    /** Find exam schedules for a set of course codes (used to filter by enrolled courses). */
    List<ExamSchedule> findByCourseCodeIn(List<String> courseCodes);
}
