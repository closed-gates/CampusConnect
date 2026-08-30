package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * TestFaculty – JPA Entity representing a faculty member in the test dataset.
 *
 * MVC Role: Model
 * Table: `test_faculties` (isolated test table, separate from existing catalogue)
 *
 * Relational Link:
 *   - Linked to `app_users` via `userId` (foreign identifier for authentication & login).
 *   - One Faculty can teach multiple `TestSection` entries.
 */
@Entity
@Table(name = "test_faculties")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestFaculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique faculty identifier (e.g. "FAC101") */
    @Column(name = "faculty_id", nullable = false, unique = true, length = 50)
    private String facultyId;

    /** Full display name (e.g. "Dr. Sadia Rahman") */
    @Column(name = "name", nullable = false, length = 120)
    private String name;

    /** Unique institutional email (e.g. "sadia.rahman@campus.edu") */
    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    /** Academic department (e.g. "Computer Science and Engineering") */
    @Column(name = "department", nullable = false, length = 150)
    private String department;

    /** Academic designation (e.g. "Professor", "Associate Professor", "Assistant Professor", "Lecturer") */
    @Column(name = "designation", nullable = false, length = 80)
    private String designation;

    /**
     * User account identifier linking to AppUser.userId in `app_users` table.
     * Guarantees faculty members can log in using their credentials.
     */
    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    /** Faculty room/office location */
    @Column(name = "office_room", length = 60)
    private String officeRoom;

    /** Flag indicating if this faculty member has been designated as an Advisor by Admin */
    @Column(name = "is_advisor")
    @Builder.Default
    private Boolean isAdvisor = false;

    /** ISO timestamp when record was created */
    @Column(name = "created_at", length = 40)
    private String createdAt;
}
