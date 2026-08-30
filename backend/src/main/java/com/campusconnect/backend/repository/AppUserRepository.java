package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * AppUserRepository – JPA Repository for AppUser entities.
 *
 * MVC Role: Repository
 *
 * Provides lookup methods for authentication:
 *   - findByUserId: login via user ID (e.g. STU001)
 *   - findByEmail: login via email address
 *   - existsByUserId / existsByEmail: duplicate checks during registration
 */
@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    /** Find a user by their unique userId (e.g. "STU001") */
    Optional<AppUser> findByUserId(String userId);

    /** Find a user by their email address */
    Optional<AppUser> findByEmail(String email);

    /** Check if a userId is already taken */
    boolean existsByUserId(String userId);

    /** Check if an email is already registered */
    boolean existsByEmail(String email);

    /** Find all users by role, e.g. "FACULTY" */
    java.util.List<AppUser> findByRole(String role);
}
