package com.campusconnect.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "in_app_notification_preferences")
public class InAppNotificationPreference {
    @Id
    @Column(name = "user_id", length = 50)
    private String userId;
    private boolean assignments = true;
    private boolean grades = true;
    private boolean advising = true;
    private boolean exams = true;
    private boolean announcements = true;

    public InAppNotificationPreference() {}
    public InAppNotificationPreference(String userId) { this.userId = userId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public boolean isAssignments() { return assignments; }
    public void setAssignments(boolean value) { assignments = value; }
    public boolean isGrades() { return grades; }
    public void setGrades(boolean value) { grades = value; }
    public boolean isAdvising() { return advising; }
    public void setAdvising(boolean value) { advising = value; }
    public boolean isExams() { return exams; }
    public void setExams(boolean value) { exams = value; }
    public boolean isAnnouncements() { return announcements; }
    public void setAnnouncements(boolean value) { announcements = value; }
}
