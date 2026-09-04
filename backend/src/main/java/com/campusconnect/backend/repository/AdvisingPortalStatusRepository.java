package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.AdvisingPortalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * AdvisingPortalStatusRepository – Persistence layer for the advising portal
 * open/closed toggle (singleton row with id = 1).
 *
 * MVC Role: Repository
 */
@Repository
public interface AdvisingPortalStatusRepository extends JpaRepository<AdvisingPortalStatus, Long> {
}
