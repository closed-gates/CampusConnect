package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * AttendanceRecordRepository – JPA Repository for attendance records.
 *
 * MVC Role: Repository
 *
 * Provides CRUD operations and custom query methods for AttendanceRecord
 * entities stored in the "attendance_records" table on Neon PostgreSQL.
 */
@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    /**
     * Find all attendance records for a specific course on a given date.
     *
     * @param courseId The course identifier (e.g. "CSE470")
     * @param date     ISO date string (e.g. "2026-08-12")
     * @return List of matching AttendanceRecord entities
     */
    List<AttendanceRecord> findByCourseIdAndDate(String courseId, String date);

    /**
     * Find all attendance records for a given course, sorted by date descending.
     *
     * @param courseId The course identifier
     * @return List of AttendanceRecord entities sorted by date desc
     */
    List<AttendanceRecord> findByCourseIdOrderByDateDesc(String courseId);

    /**
     * Check whether a record already exists for a specific course + student + date.
     *
     * @param courseId  Course identifier
     * @param studentId Student identifier
     * @param date      ISO date string
     * @return The matching record, or null if not found
     */
    AttendanceRecord findByCourseIdAndStudentIdAndDate(String courseId, String studentId, String date);

    /**
     * Find all attendance records for a specific student, sorted by date descending.
     *
     * @param studentId Student identifier
     * @return List of AttendanceRecord entities
     */
    List<AttendanceRecord> findByStudentIdOrderByDateDesc(String studentId);

    /**
     * Find all attendance records for a student across all courses.
     *
     * @param studentId Student identifier
     * @return List of AttendanceRecord entities
     */
    List<AttendanceRecord> findByStudentId(String studentId);
}
