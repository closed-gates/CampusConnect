package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.FacultyDirectoryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/** Database access for faculty and staff directory records. */
@Repository
public interface FacultyDirectoryRepository extends JpaRepository<FacultyDirectoryEntry, Long> {
    Optional<FacultyDirectoryEntry> findByEmailIgnoreCase(String email);
}
