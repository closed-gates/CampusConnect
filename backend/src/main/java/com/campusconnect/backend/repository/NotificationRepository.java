package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * NotificationRepository – Spring Data JPA repository for student notifications.
 *
 * MVC Role: Repository (data access)
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** Find all notifications for a student, newest first. */
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    /** Count unread notifications for a student. */
    long countByUserIdAndIsReadFalse(String userId);

    /** Find single notification by id and userId. */
    Optional<Notification> findByIdAndUserId(Long id, String userId);

    /** Mark all unread notifications as read for a given student. */
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    int markAllAsRead(@Param("userId") String userId);

    /** Check if a similar notification already exists for deduplication. */
    boolean existsByUserIdAndTypeAndTitle(String userId, String type, String title);
}
