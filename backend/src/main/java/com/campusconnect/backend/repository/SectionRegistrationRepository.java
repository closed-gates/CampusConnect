package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.SectionRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * SectionRegistrationRepository – Spring Data JPA repository for SectionRegistration.
 *
 * MVC Role: Repository (data access)
 *
 * The two most critical methods here are the atomic JPQL UPDATE queries
 * (tryBookSeat / tryReleaseSeat) which are the race-condition guards for
 * concurrent seat booking:
 *
 *   UPDATE course_section SET booked = booked + 1
 *   WHERE id = :id AND booked < total_seats
 *
 * This single statement is evaluated with an implicit PostgreSQL row lock.
 * If rowsAffected == 0 the section was full — RegistrationService returns 409.
 * This is called inside a @Transactional(SERIALIZABLE) boundary in the service.
 *
 * Used by: RegistrationService
 */
@Repository
public interface SectionRegistrationRepository extends JpaRepository<SectionRegistration, Long> {

    /** All registrations for a student in a given term */
    List<SectionRegistration> findByStudentIdAndTerm(String studentId, String term);

    /** Duplicate-registration check */
    boolean existsByStudentIdAndSection_IdAndTerm(String studentId, String sectionId, String term);

    /** Find a specific registration (for drop) */
    Optional<SectionRegistration> findByStudentIdAndSection_IdAndTerm(String studentId, String sectionId, String term);

    /** Count of credits a student has registered for in a term (each section = 3 credits) */
    long countByStudentIdAndTerm(String studentId, String term);

    // ── Atomic seat operations ─────────────────────────────────────

    /**
     * Atomically increments booked by 1 only if there is remaining capacity.
     * Returns the number of rows updated: 1 = success, 0 = section is full.
     *
     * Concurrency guarantee: PostgreSQL evaluates the WHERE clause atomically
     * with a row-level lock. Under SERIALIZABLE isolation, concurrent calls
     * are serialised so only one can succeed for the last available seat.
     */
    @Modifying
    @Query("UPDATE CourseSection cs SET cs.booked = cs.booked + 1 " +
           "WHERE cs.id = :sectionId AND cs.booked < cs.totalSeats")
    int tryBookSeat(@Param("sectionId") String sectionId);

    /**
     * Atomically decrements booked by 1 only if booked > 0 (safety guard).
     * Returns 1 on success, 0 if already at 0 (should never happen in practice).
     */
    @Modifying
    @Query("UPDATE CourseSection cs SET cs.booked = cs.booked - 1 " +
           "WHERE cs.id = :sectionId AND cs.booked > 0")
    int tryReleaseSeat(@Param("sectionId") String sectionId);
}
