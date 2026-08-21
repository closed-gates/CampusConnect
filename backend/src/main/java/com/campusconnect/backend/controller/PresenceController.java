package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.PresenceDto;
import com.campusconnect.backend.service.PresenceStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpAttributesContextHolder;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/**
 * PresenceController – STOMP handler for the Presence Indicator system.
 *
 * MVC Role: Controller (STOMP)
 *
 * Message flows:
 *
 *   1. CLIENT CONNECT
 *      Client sends to:  /app/presence.connect
 *      Payload:          PresenceDto (userId, displayName, status ignored)
 *      Action:           markOnline → broadcasts ONLINE to /topic/presence
 *
 *   2. CLIENT HEARTBEAT  (every ~25s)
 *      Client sends to:  /app/presence.heartbeat
 *      Payload:          PresenceDto (userId only required)
 *      Action:           refreshes TTL silently (no broadcast)
 *
 *   3. CLIENT DISCONNECT (explicit)
 *      Client sends to:  /app/presence.disconnect
 *      Payload:          PresenceDto (userId)
 *      Action:           markOffline → broadcasts OFFLINE to /topic/presence
 *
 *   4. ABRUPT DISCONNECT (tab close / network drop)
 *      Spring fires:     SessionDisconnectEvent
 *      Action:           markOffline via userId stored in STOMP session attrs
 *
 * Feature: Online/Offline Presence Indicators
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class PresenceController {

    private final PresenceStore    presenceStore;
    private final SimpMessagingTemplate messagingTemplate;

    /* ── connect ─────────────────────────────────────────────────── */

    /**
     * Called once when a client's WebSocket session is fully established
     * and ready to participate in presence tracking.
     *
     * The userId is stored in the STOMP session attributes so that
     * SessionDisconnectEvent can look it up without requiring the client
     * to send an explicit disconnect frame.
     */
    @MessageMapping("/presence.connect")
    public void onConnect(
            @Payload PresenceDto dto,
            StompHeaderAccessor headerAccessor
    ) {
        log.debug("Presence connect: userId={} displayName={}", dto.userId(), dto.displayName());
        presenceStore.markOnline(dto.userId(), dto.displayName());

        // Store userId in session so disconnect event can retrieve it
        if (headerAccessor.getSessionAttributes() != null) {
            headerAccessor.getSessionAttributes().put("presenceUserId",   dto.userId());
            headerAccessor.getSessionAttributes().put("presenceUserName", dto.displayName());
        }
    }

    /* ── heartbeat ───────────────────────────────────────────────── */

    /**
     * Silent TTL refresh — no database write, no broadcast.
     * Called by the client every ~25 seconds to keep the presence entry alive.
     */
    @MessageMapping("/presence.heartbeat")
    public void onHeartbeat(@Payload PresenceDto dto) {
        presenceStore.refreshHeartbeat(dto.userId());
    }

    /* ── explicit disconnect ─────────────────────────────────────── */

    /**
     * Explicit logout / graceful disconnect.
     * Client should call this before closing the connection.
     */
    @MessageMapping("/presence.disconnect")
    public void onDisconnect(@Payload PresenceDto dto) {
        log.debug("Presence explicit disconnect: userId={}", dto.userId());
        presenceStore.markOffline(dto.userId());
    }

    /* ── abrupt disconnect (tab close / network drop) ────────────── */

    /**
     * Spring fires this event when a STOMP WebSocket session closes
     * without an explicit DISCONNECT frame (e.g., browser tab closed).
     *
     * We retrieve the userId from the session attributes we stored in
     * onConnect() and mark the user offline.
     */
    @EventListener
    public void onSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getSessionAttributes() == null) return;

        String userId = (String) accessor.getSessionAttributes().get("presenceUserId");
        if (userId != null) {
            log.debug("Presence session disconnect (abrupt): userId={}", userId);
            presenceStore.markOffline(userId);
        }
    }
}
