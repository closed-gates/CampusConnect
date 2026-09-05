package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.DirectMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * DirectMessageRepository – Spring Data JPA repository for DirectMessage.
 *
 * MVC Role: Repository
 *
 * Provides persistence and history retrieval for direct messages.
 *
 * Feature: Real-Time Direct Messaging via WebSockets
 */
@Repository
public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {

    /**
     * Returns the last 100 messages for a given room, ordered oldest-first
     * so the UI can display them chronologically (most-recent at bottom).
     *
     * @param roomId deterministic room id shared by both participants
     * @return list of up to 100 messages, oldest first
     */
    List<DirectMessage> findTop100ByRoomIdOrderByCreatedAtAsc(String roomId);
}
