package com.campusconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * VideoLectureDTO – lecture metadata plus the caller's watch progress.
 *
 * MVC Role: DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoLectureDTO {
    private Long id;
    private String title;
    private String description;
    private String courseCode;
    private String courseName;
    private String sourceType;
    private String embedUrl;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private String createdBy;
    private LocalDateTime createdAt;
    private Double positionSeconds;
    private Double durationSeconds;
    private Integer percentWatched;
    private boolean completed;
}
