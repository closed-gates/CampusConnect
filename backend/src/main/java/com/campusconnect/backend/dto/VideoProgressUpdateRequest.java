package com.campusconnect.backend.dto;

import lombok.Data;

/**
 * VideoProgressUpdateRequest – playback position reported by the player.
 *
 * MVC Role: DTO
 */
@Data
public class VideoProgressUpdateRequest {
    private Double positionSeconds;
    private Double durationSeconds;
}
