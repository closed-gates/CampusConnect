package com.campusconnect.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * CourseChannelMember – JPA Entity tracking membership and access for course channels.
 *
 * MVC Role: Model
 *
 * Table: course_channel_members
 */
@Entity
@Table(name = "course_channel_members",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_channel_member",
                columnNames = {"channel_id", "user_id"}
        ),
        indexes = {
                @Index(name = "idx_ch_member_channel", columnList = "channel_id"),
                @Index(name = "idx_ch_member_user",    columnList = "user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class CourseChannelMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Channel identifier, e.g. "ch_cse110" or "ch_advisor_001". */
    @Column(name = "channel_id", nullable = false, length = 64)
    @NotBlank
    private String channelId;

    /** Course code, e.g. "CSE110". */
    @Column(name = "course_code", length = 32)
    private String courseCode;

    /** Unique user ID (e.g. "STU001", "FAC001"). */
    @Column(name = "user_id", nullable = false, length = 64)
    @NotBlank
    private String userId;

    /** Full display name of the user. */
    @Column(name = "user_name", length = 128)
    private String userName;

    /** Role of the user: "STUDENT", "FACULTY", or "ADMIN". */
    @Column(name = "user_role", nullable = false, length = 32)
    private String userRole;

    /** Email of the user. */
    @Column(name = "user_email", length = 128)
    private String userEmail;

    /** Status of channel membership: "ACTIVE" or "REVOKED". */
    @Column(name = "status", nullable = false, length = 32)
    private String status = "ACTIVE";

    /** Admin who granted or modified this access. */
    @Column(name = "added_by", length = 64)
    private String addedBy;

    /** Timestamp when access was granted or updated. */
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    private void touch() {
        if (updatedAt == null) {
            updatedAt = Instant.now();
        }
        if (status == null) {
            status = "ACTIVE";
        }
    }
}
