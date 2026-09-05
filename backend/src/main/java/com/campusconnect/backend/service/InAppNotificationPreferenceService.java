package com.campusconnect.backend.service;

import com.campusconnect.backend.model.InAppNotificationPreference;
import com.campusconnect.backend.repository.AppUserRepository;
import com.campusconnect.backend.repository.InAppNotificationPreferenceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class InAppNotificationPreferenceService {
    private final InAppNotificationPreferenceRepository repository;
    private final AppUserRepository userRepository;

    public InAppNotificationPreferenceService(InAppNotificationPreferenceRepository repository,
                                              AppUserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public InAppNotificationPreference get(String userId) {
        return repository.findById(userId).orElseGet(() -> new InAppNotificationPreference(userId));
    }

    @Transactional
    public InAppNotificationPreference update(String userId, Map<String, Boolean> values) {
        if (!userRepository.existsByUserId(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        InAppNotificationPreference preference = get(userId);
        if (values.containsKey("assignments")) preference.setAssignments(Boolean.TRUE.equals(values.get("assignments")));
        if (values.containsKey("grades")) preference.setGrades(Boolean.TRUE.equals(values.get("grades")));
        if (values.containsKey("advising")) preference.setAdvising(Boolean.TRUE.equals(values.get("advising")));
        if (values.containsKey("exams")) preference.setExams(Boolean.TRUE.equals(values.get("exams")));
        if (values.containsKey("announcements")) preference.setAnnouncements(Boolean.TRUE.equals(values.get("announcements")));
        return repository.save(preference);
    }

    public boolean allows(String userId, String notificationType) {
        InAppNotificationPreference p = get(userId);
        return switch (notificationType) {
            case NotificationService.TYPE_DEADLINE_APPROACHING -> p.isAssignments();
            case NotificationService.TYPE_GRADE_PUBLISHED -> p.isGrades();
            case NotificationService.TYPE_ADVISING_CONFIRMED -> p.isAdvising();
            case NotificationService.TYPE_EXAM_SCHEDULED -> p.isExams();
            case NotificationService.TYPE_ANNOUNCEMENT_POSTED -> p.isAnnouncements();
            case StudentActivityNotificationService.TYPE_ASSIGNMENT_UPLOADED -> p.isAssignments();
            case StudentActivityNotificationService.TYPE_ADVISING_PORTAL -> p.isAdvising();
            case StudentActivityNotificationService.TYPE_COURSE_MATERIAL_UPLOADED -> p.isAnnouncements();
            default -> true;
        };
    }
}
