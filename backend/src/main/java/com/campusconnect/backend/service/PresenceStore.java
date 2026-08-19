package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.PresenceDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * PresenceStore – In-memory presence registry with TTL-based expiry.
 *
 * MVC Role: Service / Component
 *
 * Tracks which users are currently online by mapping each userId to
 * the timestamp of their last heartbeat. A scheduled sweep runs every
 * 20 seconds to evict entries that have not been refreshed within the
 * configured TTL (60 seconds), broadcasting an OFFLINE event for each
 * evicted user.
 *
 * Thread-safety is guaranteed by ConcurrentHashMap.
 *
 * No Redis dependency — suitable for single-node deployments.
 *
 * Feature: Online/Offline Presence Indicators
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PresenceStore {

    /** Broadcast destination for all presence delta events. */
    public static final String PRESENCE_TOPIC = "/topic/presence";

    /** How long (seconds) a heartbeat entry stays alive without renewal. */
    private static final long TTL_SECONDS = 60L;

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * userId → { displayName, lastHeartbeatAt }
     */
    private final ConcurrentHashMap<String, UserPresence> store = new ConcurrentHashMap<>();

    /* ── Record ──────────────────────────────────────────────────── */

    private record UserPresence(String displayName, Instant lastHeartbeatAt) {}

    /* ── Public API ──────────────────────────────────────────────── */

    /**
     * Marks a user as online (or refreshes their TTL).
     * Broadcasts ONLINE only on first appearance (not on heartbeats).
     */
    public void markOnline(String userId, String displayName) {
        boolean isNew = !store.containsKey(userId);
        store.put(userId, new UserPresence(displayName, Instant.now()));

        if (isNew) {
            broadcast(userId, displayName, "ONLINE");
            log.debug("Presence: {} ({}) is now ONLINE", displayName, userId);
        }
    }

    /**
     * Refreshes the TTL for an existing online user (heartbeat).
     * Silent — no broadcast to avoid flooding.
     */
    public void refreshHeartbeat(String userId) {
        store.computeIfPresent(userId, (id, prev) ->
                new UserPresence(prev.displayName(), Instant.now()));
    }

    /**
     * Marks a user as offline immediately (explicit disconnect).
     * Broadcasts OFFLINE.
     */
    public void markOffline(String userId) {
        UserPresence prev = store.remove(userId);
        if (prev != null) {
            broadcast(userId, prev.displayName(), "OFFLINE");
            log.debug("Presence: {} ({}) is now OFFLINE", prev.displayName(), userId);
        }
    }

    /**
     * Returns a snapshot Set of currently online user IDs.
     */
    public Set<String> getOnlineUserIds() {
        Instant cutoff = Instant.now().minusSeconds(TTL_SECONDS);
        return store.entrySet().stream()
                .filter(e -> e.getValue().lastHeartbeatAt().isAfter(cutoff))
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());
    }

    public boolean isOnline(String userId) {
        UserPresence p = store.get(userId);
        if (p == null) return false;
        return p.lastHeartbeatAt().isAfter(Instant.now().minusSeconds(TTL_SECONDS));
    }

    /* ── TTL Sweep ───────────────────────────────────────────────── */

    /**
     * Runs every 20 seconds. Evicts entries older than TTL_SECONDS and
     * broadcasts an OFFLINE event for each one — handles clients that
     * drop without sending an explicit disconnect.
     */
    @Scheduled(fixedDelay = 20_000)
    public void sweepExpiredEntries() {
        Instant cutoff = Instant.now().minusSeconds(TTL_SECONDS);
        store.entrySet().removeIf(entry -> {
            if (entry.getValue().lastHeartbeatAt().isBefore(cutoff)) {
                broadcast(entry.getKey(), entry.getValue().displayName(), "OFFLINE");
                log.debug("Presence sweep: evicted {} (last seen {})",
                        entry.getValue().displayName(), entry.getValue().lastHeartbeatAt());
                return true;
            }
            return false;
        });
    }

    /* ── Broadcast helper ────────────────────────────────────────── */

    private void broadcast(String userId, String displayName, String status) {
        try {
            PresenceDto dto = new PresenceDto(userId, displayName, status, Instant.now());
            messagingTemplate.convertAndSend(PRESENCE_TOPIC, dto);
        } catch (Exception ex) {
            log.warn("Presence broadcast failed for {}: {}", userId, ex.getMessage());
        }
    }
}
