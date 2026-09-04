package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * AdvisingPortalStatus – Singleton entity that stores the global open/closed
 * state of the Student Advising Portal.
 *
 * Only one row (id = 1) should ever exist in the table.
 * Admins toggle this flag; RegistrationService reads it before allowing
 * student self-registration.
 *
 * MVC Role: Model
 */
@Entity
@Table(name = "advising_portal_status")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdvisingPortalStatus {

    @Id
    private Long id;                         // always 1

    @Column(name = "is_open", nullable = false)
    private boolean open;                    // true = portal open, false = closed

    @Column(name = "updated_by")
    private String updatedBy;                // admin user ID who last toggled

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "message", length = 512)
    private String message;                  // optional custom message shown to students
}
