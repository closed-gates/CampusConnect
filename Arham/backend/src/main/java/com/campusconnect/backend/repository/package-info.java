/**
 * Repository layer — Database Access.
 *
 * Responsibilities:
 * - Handle all database read/write operations via Spring Data JPA.
 * - Extend JpaRepository or CrudRepository for standard CRUD operations.
 * - Define custom @Query methods where needed.
 * - Only accessed by the Service layer (never from controllers directly).
 *
 * Naming convention: [Entity]Repository.java  (e.g., UserRepository.java)
 */
package com.campusconnect.backend.repository;
