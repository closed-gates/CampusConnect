package com.campusconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** API representation of a database-backed faculty directory entry. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacultyDirectoryEntryDTO {
    private Long id;
    private String category;
    private String name;
    private String position;
    private String email;
    private String profileUrl;
    private String thesisStatus;
    private String thesisLevel;
}
