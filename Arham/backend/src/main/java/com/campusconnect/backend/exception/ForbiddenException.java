package com.campusconnect.backend.exception;

/**
 * ForbiddenException
 *
 * Thrown when an authenticated user attempts to access a resource
 * that their role does not permit. Maps to HTTP 403 Forbidden.
 *
 * Usage:
 *   throw new ForbiddenException("Students are not allowed to access attendance management.");
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }

    public ForbiddenException() {
        super("You do not have permission to perform this action.");
    }
}
