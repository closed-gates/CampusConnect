package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * TestSection – JPA Entity representing a course section offering in the test dataset.
 *
 * MVC Role: Model
 * Table: `test_sections` (isolated test table, separate from existing course_section)
 *
 * Relational Structure:
 *   - Section ➔ Course (ManyToOne foreign key: course_id)
 *   - Section ➔ Faculty (ManyToOne foreign key: faculty_id)
 */
@Entity
@Table(name = "test_sections")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique section code identifier (e.g. "CSE110T-01") */
    @Column(name = "section_id", nullable = false, unique = true, length = 60)
    private String sectionId;

    /** Relational foreign key: Section ➔ Course */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private TestCourse course;

    /** Relational foreign key: Section ➔ Faculty */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    private TestFaculty faculty;

    /** Section number within course (e.g. "01", "02", "03", "04") */
    @Column(name = "section_number", nullable = false, length = 20)
    private String sectionNumber;

    /**
     * Weekly schedule slot pattern:
     * e.g. "SUNDAY(08:00 AM-09:20 AM) ; TUESDAY(08:00 AM-09:20 AM)"
     */
    @Column(name = "schedule_time", nullable = false, length = 150)
    private String scheduleTime;

    /** Classroom / lab room number (e.g. "UB04-01A", "NAC09-02") */
    @Column(name = "room", nullable = false, length = 60)
    private String room;

    /** Total seating capacity */
    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    /** Number of booked seats */
    @Column(name = "booked_seats", nullable = false)
    private Integer bookedSeats;

    /** Semester / academic term (e.g. "Summer2026") */
    @Column(name = "term", nullable = false, length = 30)
    private String term;
}
