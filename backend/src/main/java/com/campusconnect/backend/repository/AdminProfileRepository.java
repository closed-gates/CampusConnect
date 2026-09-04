package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminProfileRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUserIdIgnoreCase(String userId);
    Optional<AppUser> findByEmailIgnoreCase(String email);
}
