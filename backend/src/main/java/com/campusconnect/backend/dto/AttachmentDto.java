package com.campusconnect.backend.dto;

/**
 * AttachmentDto – Data Transfer Object for course chat file attachments.
 *
 * MVC Role: DTO
 *
 * Feature: Course Resources Channel File Attachments
 */
public record AttachmentDto(
        /** Original filename, e.g. "Lecture01_Intro.pdf". */
        String name,

        /** Absolute or relative URL to download/view the file. */
        String fileUrl,

        /** Formatted size, e.g. "2.4 MB". */
        String size,

        /** Extension or MIME type, e.g. "pdf", "image/png". */
        String type
) {}
