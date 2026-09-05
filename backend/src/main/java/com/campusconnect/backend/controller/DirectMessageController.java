package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.DirectMessageDto;
import com.campusconnect.backend.service.DirectMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * DirectMessageController – STOMP WebSocket handler for Direct Messaging.
 *
 * MVC Role: Controller (STOMP)
 *
 * This is NOT a @RestController — it handles inbound STOMP frames and uses
 * SimpMessagingTemplate to push outbound frames to subscribed clients.
 *
 * Message flows:
 *
 *   1. SEND MESSAGE
 *      Client publishes to:   /app/dm.send
 *      Payload:               DirectMessageDto (JSON)
 *      Action:                persist to DB → stamp timestamp → broadcast
 *      Broadcast destination: /topic/dm.{roomId}
 *      Subscribers:           all connected clients who joined this room
 *
 *   2. LOAD HISTORY
 *      Client publishes to:   /app/dm.history
 *      Payload:               DirectMessageDto with roomId set (content empty)
 *      Action:                fetch last 100 messages from DB → broadcast back
 *      Broadcast destination: /topic/dm.{roomId}.history
 *      Subscribers:           the requesting client (subscribed to this topic)
 *
 * Feature: Real-Time Direct Messaging via WebSockets
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class DirectMessageController {

    private final DirectMessageService   directMessageService;
    private final SimpMessagingTemplate  messagingTemplate;

    /**
     * Handles an inbound direct message.
     *
     * Persists the message (best-effort), stamps the server-side timestamp,
     * then broadcasts the enriched DTO to all clients subscribed to the room topic.
     *
     * @param dto the inbound message payload from the sending client
     */
    @MessageMapping("/dm.send")
    public void sendDirectMessage(@Payload DirectMessageDto dto) {
        log.debug("DM received: sender={} → recipient={} room={}",
                dto.senderId(), dto.recipientId(), dto.roomId());

        // Persist and get back DTO with id + createdAt stamped
        DirectMessageDto saved = directMessageService.persist(dto);

        // Broadcast to all subscribers of this conversation room
        String destination = buildRoomTopic(saved.roomId());
        messagingTemplate.convertAndSend(destination, saved);

        log.debug("DM broadcast to {} complete (msgId={})", destination, saved.id());
    }

    /**
     * Handles a history request for a conversation room.
     *
     * The client sends a minimal DTO (with roomId set) and all clients subscribed
     * to the history topic receive the last 100 messages.
     *
     * @param dto payload carrying the roomId
     */
    @MessageMapping("/dm.history")
    public void fetchHistory(@Payload DirectMessageDto dto) {
        if (dto.roomId() == null || dto.roomId().isBlank()) {
            log.warn("DM history request received with blank roomId — ignoring");
            return;
        }
        log.debug("DM history request for room={}", dto.roomId());

        List<DirectMessageDto> history = directMessageService.getHistory(dto.roomId());

        // Send history back on the room-specific history topic
        String historyTopic = buildRoomTopic(dto.roomId()) + ".history";
        messagingTemplate.convertAndSend(historyTopic, history);

        log.debug("Sent {} DM history messages to {}", history.size(), historyTopic);
    }

    /* ── Helpers ──────────────────────────────────────────────────── */

    /**
     * Builds the STOMP broadcast destination for a conversation room.
     * Pattern: /topic/dm.{roomId}
     *
     * Example:
     *   roomId = "STU001__FAC001"
     *   result = "/topic/dm.STU001__FAC001"
     */
    private static String buildRoomTopic(String roomId) {
        return "/topic/dm." + roomId;
    }
}
