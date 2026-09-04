package com.campusconnect.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Database record for one person in the Faculty and Staff Directory. */
@Entity
@Table(name = "faculty_directory_entries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacultyDirectoryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(nullable = false, length = 180)
    private String position;

    @Column(nullable = false, unique = true, length = 220)
    private String email;

    @Column(name = "profile_url", length = 500)
    private String profileUrl;

    @Column(name = "thesis_status", nullable = false, length = 30)
    private String thesisStatus;

    @Column(name = "thesis_level", length = 20)
    private String thesisLevel;
}
