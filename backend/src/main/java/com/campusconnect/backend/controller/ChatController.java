package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.ChatMessageDto;
import com.campusconnect.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * ChatController – STOMP WebSocket message handler for course chat.
 *
 * MVC Role: Controller (STOMP)
 *
 * This controller is NOT a @RestController — it handles inbound STOMP
 * frames and uses SimpMessagingTemplate to broadcast outbound frames.
 *
 * Message flows:
 *
 *   1. SEND MESSAGE
 *      Client sends to:     /app/chat.sendMessage
 *      Payload:             ChatMessageDto (JSON)
 *      Controller:          persists → stamps → broadcasts
 *      Broadcast topic:     /topic/course.{courseId}.{subChannelId}
 *
 *   2. FETCH HISTORY
 *      Client sends to:     /app/chat.history
 *      Payload:             ChatMessageDto with courseId + subChannelId set (content can be empty)
 *      Controller:          fetches last 50 from DB → broadcasts to requester
 *      Broadcast topic:     /topic/course.{courseId}.{subChannelId}.history
 *
 * RBAC Note:
 *   Full JWT-based enrollment verification is deferred to Phase 3.
 *   Currently the authorId + authorName from the STOMP payload are trusted
 *   as passed by the client (consistent with the rest of the app's auth stub).
 *
 * Feature: Real-Time Course Chat via WebSockets
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService          chatService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handles an inbound chat message.
     *
     * Persists it (best-effort, DB optional), stamps the canonical timestamp,
     * then broadcasts the enriched DTO to all clients subscribed to the
     * course sub-channel topic.
     *
     * @param dto the inbound message payload from the client
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDto dto) {
        log.debug("Received chat message from={} course={} sub={}",
                dto.authorId(), dto.courseId(), dto.subChannelId());

        // Persist (best-effort) and get back a DTO with id + createdAt
        ChatMessageDto saved = chatService.persist(dto);

        // Broadcast to all subscribers of this course sub-channel
        String destination = buildTopic(saved.courseId(), saved.subChannelId());
        messagingTemplate.convertAndSend(destination, saved);

        log.debug("Broadcast to {} complete", destination);
    }

    /**
     * Handles a history request for a given course sub-channel.
     *
     * The client sends a minimal DTO (with courseId + subChannelId set)
     * and receives the last 50 messages on the history topic.
     *
     * @param dto payload carrying courseId and subChannelId
     */
    @MessageMapping("/chat.history")
    public void fetchHistory(@Payload ChatMessageDto dto) {
        log.debug("History request for course={} sub={}", dto.courseId(), dto.subChannelId());

        List<ChatMessageDto> history = chatService.getHistory(dto.courseId(), dto.subChannelId());

        // Send history back on a dedicated topic the client can subscribe to once
        String historyTopic = buildTopic(dto.courseId(), dto.subChannelId()) + ".history";
        messagingTemplate.convertAndSend(historyTopic, history);

        log.debug("Sent {} history messages to {}", history.size(), historyTopic);
    }

    /* ── Helpers ──────────────────────────────────────────────────── */

    /**
     * Builds the STOMP broadcast destination for a given course sub-channel.
     * Pattern: /topic/course.{courseId}.{subChannelId}
     *
     * Examples:
     *   /topic/course.cse470.general
     *   /topic/course.cse_305.q-and-a
     */
    private static String buildTopic(String courseId, String subChannelId) {
        return "/topic/course." + courseId + "." + subChannelId;
    }
}
