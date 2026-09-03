package com.campusconnect.backend.dto;

/** Request payload for the authenticated deadline-reminder preference. */
public class UpdateReminderPreferenceRequest {
    private Integer reminderHours;

    public Integer getReminderHours() {
        return reminderHours;
    }

    public void setReminderHours(Integer reminderHours) {
        this.reminderHours = reminderHours;
    }
}
