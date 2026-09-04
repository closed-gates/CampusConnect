package com.campusconnect.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "club_panel_assignments", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "club_name"}))
public class ClubPanelAssignment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "student_id", nullable = false, length = 50)
    private String studentId;
    @Column(name = "club_name", nullable = false, length = 100)
    private String clubName;
    @Column(name = "assigned_by", nullable = false, length = 50)
    private String assignedBy;
    @Column(name = "assigned_at", nullable = false, length = 40)
    private String assignedAt;

    public Long getId() { return id; }
    public void setId(Long v) { id = v; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String v) { studentId = v; }
    public String getClubName() { return clubName; }
    public void setClubName(String v) { clubName = v; }
    public String getAssignedBy() { return assignedBy; }
    public void setAssignedBy(String v) { assignedBy = v; }
    public String getAssignedAt() { return assignedAt; }
    public void setAssignedAt(String v) { assignedAt = v; }
}
