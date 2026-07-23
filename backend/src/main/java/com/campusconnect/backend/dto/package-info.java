/**
 * DTO layer — Data Transfer Objects.
 *
 * Responsibilities:
 * - Carry data between the Controller and Service layers.
 * - Decouple the API contract from the internal entity model.
 * - Never expose sensitive fields (e.g., password hashes) in responses.
 * - Use @Valid annotations for request validation.
 *
 * Naming convention:
 * - [Entity]RequestDto.java  — incoming request body
 * - [Entity]ResponseDto.java — outgoing response body
 *
 * Examples:
 * - LoginRequestDto.java
 * - UserResponseDto.java
 * - FacultyResponseDto.java
 */
package com.campusconnect.backend.dto;
