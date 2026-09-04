package com.campusconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * CourseMaterialDTO – catalog row for lecture notes, slides, and documents.
 *
 * MVC Role: DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseMaterialDTO {
    private Long id;
    private String title;
    private String description;
    private String courseCode;
    private String courseName;
    private String kind;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private String createdBy;
    private LocalDateTime createdAt;
}
