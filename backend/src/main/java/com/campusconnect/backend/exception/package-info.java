/**
 * Exception layer — Centralized Error Handling.
 *
 * Responsibilities:
 * - Define custom exception classes.
 * - Provide a centralized @RestControllerAdvice handler that maps
 *   exceptions to meaningful HTTP responses.
 * - Ensure consistent error response format across all endpoints.
 *
 * Key classes:
 * - GlobalExceptionHandler.java — @RestControllerAdvice catch-all
 * - ResourceNotFoundException.java   — 404 Not Found
 * - UnauthorizedException.java       — 401 Unauthorized
 * - ForbiddenException.java          — 403 Forbidden
 * - ValidationException.java         — 400 Bad Request (input errors)
 */
package com.campusconnect.backend.exception;
