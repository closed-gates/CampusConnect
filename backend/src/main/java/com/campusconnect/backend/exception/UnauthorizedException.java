package com.campusconnect.backend.exception;

/**
 * UnauthorizedException
 *
 * Thrown when a request is made by an unauthenticated user who must be
 * logged in to access a resource. Maps to HTTP 401 Unauthorized.
 *
 * Usage:
 *   throw new UnauthorizedException("You must be logged in to access this resource.");
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException() {
        super("Authentication required. Please log in.");
    }
}
