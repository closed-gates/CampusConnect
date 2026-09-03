package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.CourseChannelMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * CourseChannelMemberRepository – Spring Data JPA repository for CourseChannelMember.
 *
 * MVC Role: Repository
 */
@Repository
public interface CourseChannelMemberRepository extends JpaRepository<CourseChannelMember, Long> {

    /** Find all active members for a channel. */
    List<CourseChannelMember> findByChannelIdAndStatus(String channelId, String status);

    /** Find all active channels for a user. */
    List<CourseChannelMember> findByUserIdAndStatus(String userId, String status);

    /** Find membership record for a specific user in a channel. */
    Optional<CourseChannelMember> findByChannelIdAndUserId(String channelId, String userId);

    /** Check if a user has active access to a channel. */
    boolean existsByChannelIdAndUserIdAndStatus(String channelId, String userId, String status);
}
