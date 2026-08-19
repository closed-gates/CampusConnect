package com.campusconnect.backend.dto;

import java.time.Instant;

/**
 * PresenceDto – Data Transfer Object for the Presence Indicator system.
 *
 * MVC Role: DTO
 *
 * Broadcast payload on /topic/presence whenever a user transitions
 * between ONLINE and OFFLINE states.
 *
 * Feature: Online/Offline Presence Indicators
 */
public record PresenceDto(

        /** User ID of the user whose presence changed. e.g. "usr_eusha_001" */
        String userId,

        /** Display name — included so subscribers don't need a separate lookup. */
        String displayName,

        /** "ONLINE" or "OFFLINE" */
        String status,

        /** UTC timestamp of the transition. */
        Instant lastActiveAt
) {}
