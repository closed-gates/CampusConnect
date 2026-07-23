package com.campusconnect.backend.exception;

/**
 * ResourceNotFoundException
 *
 * Thrown when a requested resource (e.g., User, Faculty, Club) does not
 * exist in the database. Maps to HTTP 404 Not Found.
 *
 * Usage:
 *   throw new ResourceNotFoundException("Faculty member not found with id: " + id);
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }
}
