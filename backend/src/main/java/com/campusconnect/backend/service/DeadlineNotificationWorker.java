package com.campusconnect.backend.service;

import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.model.Assignment;
import com.campusconnect.backend.model.SectionRegistration;
import com.campusconnect.backend.repository.AppUserRepository;
import com.campusconnect.backend.repository.AssignmentRepository;
import com.campusconnect.backend.repository.SectionRegistrationRepository;
import com.campusconnect.backend.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * DeadlineNotificationWorker – Internal scheduled worker for DEADLINE_APPROACHING notifications.
 *
 * Checks for assignments using each student's persisted reminder lead time.
 * Dispatches notifications to enrolled students who have not yet turned in their work.
 * Uses an in-memory set to prevent duplicate notifications within the same deadline window.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DeadlineNotificationWorker {

    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final SectionRegistrationRepository sectionRegistrationRepository;
    private final AppUserRepository appUserRepository;
    private final NotificationService notificationService;

    // Cache of already notified studentId + assignmentId combinations
    private final Set<String> notifiedCache = ConcurrentHashMap.newKeySet();

    /**
     * Runs periodically every 5 minutes to check approaching deadlines.
     */
    @Scheduled(fixedRate = 300000, initialDelay = 15000)
    public void checkApproachingDeadlines() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowEnd = now.plusHours(48);

        try {
            List<Assignment> allAssignments = assignmentRepository.findAll();
            for (Assignment assignment : allAssignments) {
                LocalDateTime deadline = assignment.getDeadline();
                if (deadline == null) continue;

                // Check if deadline is within the next 24 hours
                if (deadline.isAfter(now) && deadline.isBefore(windowEnd)) {
                    processUpcomingAssignment(assignment, now);
                }
            }
        } catch (Exception e) {
            log.warn("[DeadlineNotificationWorker] Error running scheduled deadline check: {}", e.getMessage());
        }
    }

    private void processUpcomingAssignment(Assignment assignment, LocalDateTime now) {
        String courseCode = assignment.getCourseCode();
        Set<String> candidateStudents = findEnrolledStudents(courseCode);

        // Fallback to all students if registrations not found (e.g. initial demo state)
        if (candidateStudents.isEmpty()) {
            candidateStudents = appUserRepository.findByRole("STUDENT").stream()
                    .map(AppUser::getUserId)
                    .collect(java.util.stream.Collectors.toSet());
        }

        for (String studentId : candidateStudents) {
            int reminderHours = appUserRepository.findByUserId(studentId)
                    .map(AppUser::getReminderHours)
                    .orElse(24);
            if (assignment.getDeadline().isAfter(now.plusHours(reminderHours))) {
                continue;
            }
            String cacheKey = studentId + "_" + assignment.getId();
            if (notifiedCache.contains(cacheKey)) {
                continue; // Already notified
            }

            // Check if student has already submitted
            boolean hasSubmitted = submissionRepository
                    .findByAssignmentIdAndStudentId(assignment.getId(), studentId)
                    .isPresent();

            if (!hasSubmitted) {
                notificationService.notifyDeadlineApproaching(
                        studentId,
                        assignment.getCourseCode(),
                        assignment.getTitle(),
                        assignment.getDeadline()
                );
                notifiedCache.add(cacheKey);
            }
        }
    }

    private Set<String> findEnrolledStudents(String courseCode) {
        Set<String> students = new HashSet<>();
        if (courseCode == null || courseCode.isBlank()) return students;

        try {
            List<SectionRegistration> allRegs = sectionRegistrationRepository.findAll();
            for (SectionRegistration reg : allRegs) {
                if (reg.getSection() != null) {
                    String code = reg.getSection().getCode();
                    String id = reg.getSection().getId();
                    if ((code != null && code.equalsIgnoreCase(courseCode)) ||
                        (id != null && id.toUpperCase().startsWith(courseCode.toUpperCase()))) {
                        students.add(reg.getStudentId());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("[DeadlineNotificationWorker] Error checking registrations: {}", e.getMessage());
        }
        return students;
    }
}
