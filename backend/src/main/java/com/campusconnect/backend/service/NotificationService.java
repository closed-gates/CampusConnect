package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.NotificationDto;
import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.model.Notification;
import com.campusconnect.backend.model.SectionRegistration;
import com.campusconnect.backend.repository.AppUserRepository;
import com.campusconnect.backend.repository.NotificationRepository;
import com.campusconnect.backend.repository.SectionRegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * NotificationService – Event-driven engine and dispatcher for in-app student notifications.
 *
 * MVC Role: Service
 *
 * Strictly supports 3 in-app trigger types:
 *   1. GRADE_PUBLISHED: Instructor posts or updates a student's grade
 *   2. DEADLINE_APPROACHING: Automated reminder 24h prior to submission cutoff
 *   3. ANNOUNCEMENT_POSTED: Course-wide broadcast to enrolled students
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    public static final String TYPE_GRADE_PUBLISHED      = "GRADE_PUBLISHED";
    public static final String TYPE_DEADLINE_APPROACHING = "DEADLINE_APPROACHING";
    public static final String TYPE_ANNOUNCEMENT_POSTED  = "ANNOUNCEMENT_POSTED";
    public static final String TYPE_ADVISING_CONFIRMED   = "ADVISING_CONFIRMED";

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final SectionRegistrationRepository sectionRegistrationRepository;
    private final AppUserRepository appUserRepository;

    // ── Core Dispatcher ──────────────────────────────────────────────────────────

    /**
     * Dispatches an in-app notification to a single student user:
     *   1. Inserts a record into the notifications table
     *   2. Emits a real-time 'new_notification' WebSocket event to the student's room
     */
    @Transactional
    public NotificationDto dispatch(String userId, String type, String title, String payload, String link) {
        if (userId == null || userId.isBlank()) {
            log.warn("[NotificationService] Cannot dispatch notification: userId is blank");
            return null;
        }

        Notification notification = new Notification();
        notification.setUserId(userId.trim());
        notification.setType(type);
        notification.setTitle(title);
        notification.setPayload(payload);
        notification.setLink(link != null ? link : "/dashboard");
        notification.setIsRead(false);
        notification.setCreatedAt(Instant.now());

        Notification saved = notificationRepository.save(notification);
        NotificationDto dto = NotificationDto.fromEntity(saved);

        // ── Real-Time STOMP Delivery ──────────────────────────────────────────
        // Deliver to user-scoped STOMP channels:
        // /topic/notifications.{userId} and /topic/user-{userId}
        Map<String, Object> socketFrame = new HashMap<>();
        socketFrame.put("event", "new_notification");
        socketFrame.put("payload", dto);

        try {
            messagingTemplate.convertAndSend("/topic/notifications." + userId, socketFrame);
            messagingTemplate.convertAndSend("/topic/user-" + userId, socketFrame);
            log.info("[NotificationService] Dispatched {} to user={} id={}", type, userId, saved.getId());
        } catch (Exception e) {
            log.warn("[NotificationService] WebSocket delivery error for user {}: {}", userId, e.getMessage());
        }

        return dto;
    }

    // ── Trigger 1: GRADE_PUBLISHED ───────────────────────────────────────────────

    /**
     * Triggered when an instructor posts/updates a grade for a student.
     */
    public NotificationDto notifyGradePublished(String studentId, String courseCode, String assignmentTitle, String grade, String feedback) {
        String safeCourse = (courseCode != null && !courseCode.isBlank()) ? courseCode : "Course";
        String safeTitle = (assignmentTitle != null && !assignmentTitle.isBlank()) ? assignmentTitle : "Assignment";
        String title = "Grade Published: " + safeTitle;

        StringBuilder sb = new StringBuilder();
        sb.append("Your grade for ").append(safeTitle).append(" (").append(safeCourse).append(") is: ").append(grade);
        if (feedback != null && !feedback.isBlank()) {
            sb.append(". Feedback: ").append(feedback);
        }

        return dispatch(studentId, TYPE_GRADE_PUBLISHED, title, sb.toString(), "/assignments");
    }

    // ── Trigger 2: DEADLINE_APPROACHING ──────────────────────────────────────────

    /**
     * Triggered via internal schedule/worker (e.g. 24h before cutoff).
     */
    public NotificationDto notifyDeadlineApproaching(String studentId, String courseCode, String assignmentTitle, LocalDateTime deadline) {
        String safeCourse = (courseCode != null && !courseCode.isBlank()) ? courseCode : "Course";
        String safeTitle = (assignmentTitle != null && !assignmentTitle.isBlank()) ? assignmentTitle : "Assignment";
        String title = "Deadline Approaching: " + safeTitle;

        String formattedDeadline = deadline != null
                ? deadline.format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a"))
                : "soon";

        String payload = "Assignment '" + safeTitle + "' for " + safeCourse + " is due in less than 24 hours (" + formattedDeadline + "). Please turn in your work.";

        return dispatch(studentId, TYPE_DEADLINE_APPROACHING, title, payload, "/assignments");
    }

    // ── Trigger 3: ANNOUNCEMENT_POSTED ───────────────────────────────────────────

    /**
     * Broadcast to all enrolled students of a course.
     */
    public List<NotificationDto> notifyAnnouncementPosted(String courseCode, String title, String content, String authorName) {
        String safeCourse = (courseCode != null && !courseCode.isBlank()) ? courseCode.toUpperCase() : "COURSE";
        String heading = "New Announcement in " + safeCourse;
        String payload = (title != null ? title + ": " : "") + (content != null ? content : "");
        String link = "/courses";

        // Find enrolled student IDs
        Set<String> recipientStudentIds = findEnrolledStudentsForCourse(safeCourse);

        // Fallback for demo/testing if section registrations are empty
        if (recipientStudentIds.isEmpty()) {
            recipientStudentIds = appUserRepository.findByRole("STUDENT").stream()
                    .map(AppUser::getUserId)
                    .collect(Collectors.toSet());
        }

        List<NotificationDto> dispatched = new ArrayList<>();
        for (String studentId : recipientStudentIds) {
            NotificationDto dto = dispatch(studentId, TYPE_ANNOUNCEMENT_POSTED, heading, payload, link);
            if (dto != null) {
                dispatched.add(dto);
            }
        }
        return dispatched;
    }

    // ── Trigger 4: ADVISING_CONFIRMED ────────────────────────────────────────────

    /**
     * Triggered when a student's advising session gets confirmed.
     */
    public NotificationDto notifyAdvisingConfirmed(String studentId, String advisorName, int courseCount) {
        String title = "Advising Confirmed";
        String who = (advisorName != null && !advisorName.isBlank()) ? advisorName : "your academic advisor";
        String payload = "Your advising session has been confirmed by " + who + " (" + courseCount + " courses approved).";

        return dispatch(studentId, TYPE_ADVISING_CONFIRMED, title, payload, "/advising");
    }

    // ── Helper: Enrolled Student Resolution ──────────────────────────────────────

    private Set<String> findEnrolledStudentsForCourse(String courseCode) {
        Set<String> students = new HashSet<>();
        try {
            List<SectionRegistration> allRegs = sectionRegistrationRepository.findAll();
            for (SectionRegistration reg : allRegs) {
                if (reg.getSection() != null) {
                    String sectionCode = reg.getSection().getCode();
                    String sectionId = reg.getSection().getId();
                    if ((sectionCode != null && sectionCode.equalsIgnoreCase(courseCode)) ||
                        (sectionId != null && sectionId.toUpperCase().startsWith(courseCode.toUpperCase()))) {
                        students.add(reg.getStudentId());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("[NotificationService] Error querying course enrollments: {}", e.getMessage());
        }
        return students;
    }

    // ── Query & Mutation APIs ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<NotificationDto> getNotificationsForUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public boolean markAsRead(Long id, String userId) {
        Optional<Notification> opt = notificationRepository.findByIdAndUserId(id, userId);
        if (opt.isPresent()) {
            Notification n = opt.get();
            n.setIsRead(true);
            notificationRepository.save(n);
            return true;
        }
        return false;
    }

    @Transactional
    public int markAllAsRead(String userId) {
        return notificationRepository.markAllAsRead(userId);
    }
}
