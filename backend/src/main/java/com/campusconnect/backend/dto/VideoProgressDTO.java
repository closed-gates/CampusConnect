package com.campusconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * VideoProgressDTO – watch-progress payload for one lecture and user.
 *
 * MVC Role: DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoProgressDTO {
    private Long lectureId;
    private String userId;
    private Double positionSeconds;
    private Double durationSeconds;
    private Integer percentWatched;
    private boolean completed;
}
