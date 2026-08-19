package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Advisor – JPA Entity for academic advisors persisted in Neon PostgreSQL.
 *
 * MVC Role: Model
 * Maps to the {@code advisors} table.
 *
 * Phase 3: Converted from plain POJO to @Entity so advisor data survives
 * restarts and can be managed via the Neon console.
 *
 * Used by: AdvisorRepository, AdvisorService, AdvisorController
 */
@Entity
@Table(name = "advisors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Advisor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /** e.g. "Associate Professor & Academic Advisor" */
    @Column(nullable = false)
    private String title;

    /** Short dept key: "cse", "eee", "bba", "math", "eng" */
    @Column(nullable = false, length = 20)
    private String department;

    /** e.g. "Computer Science & Engineering" */
    @Column(name = "department_label", nullable = false)
    private String departmentLabel;

    /** Areas of expertise stored in a join table */
    @ElementCollection
    @CollectionTable(name = "advisor_specialties", joinColumns = @JoinColumn(name = "advisor_id"))
    @Column(name = "specialty")
    @Builder.Default
    private List<String> specialties = new ArrayList<>();

    /** Days available for advising appointments */
    @ElementCollection
    @CollectionTable(name = "advisor_available_days", joinColumns = @JoinColumn(name = "advisor_id"))
    @Column(name = "day_name")
    @Builder.Default
    private List<String> availableDays = new ArrayList<>();

    /** e.g. "9:00 AM – 3:00 PM" */
    @Column(name = "available_hours", nullable = false)
    private String availableHours;

    @Column(nullable = false)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String bio;

    /** Computed match score — transient, never persisted */
    @Transient
    private int matchScore;
}
