package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ChatMessageRepository – Spring Data JPA repository for ChatMessage.
 *
 * MVC Role: Repository
 *
 * Provides persistence and history retrieval for course chat messages.
 *
 * Feature: Real-Time Course Chat via WebSockets
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /**
     * Returns the last 50 messages for a given course channel and sub-channel,
     * ordered oldest-first so the UI can display them chronologically.
     *
     * @param courseId     e.g. "cse470"
     * @param subChannelId e.g. "general"
     * @return list of up to 50 messages, oldest first
     */
    List<ChatMessage> findTop50ByCourseIdAndSubChannelIdOrderByCreatedAtAsc(
            String courseId,
            String subChannelId
    );
}
