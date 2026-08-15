package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.ClubNotice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ClubNoticeRepository – JPA Repository for club notices.
 *
 * MVC Role: Repository
 *
 * Provides CRUD operations and sorting for ClubNotice entities
 * stored in the "club_notices" table on Neon PostgreSQL.
 */
@Repository
public interface ClubNoticeRepository extends JpaRepository<ClubNotice, Long> {

    /**
     * Returns all notices sorted by pinned status (pinned first),
     * then by posted date descending.
     *
     * @return Sorted list of ClubNotice entities
     */
    List<ClubNotice> findAllByOrderByPinnedDescPostedAtDesc();
}
