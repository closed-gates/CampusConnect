package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.NotificationDto;
import com.campusconnect.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * NotificationController – REST Controller for in-app student notifications.
 *
 * MVC Role: Controller
 *
 * Endpoints:
 *   GET  /api/notifications               → fetch_notifications (for authenticated student)
 *   PUT  /api/notifications/{id}/read     → mark_as_read
 *   PUT  /api/notifications/read-all      → mark_all_read
 *   POST /api/notifications/trigger/grade → trigger GRADE_PUBLISHED
 *   POST /api/notifications/trigger/announcement → trigger ANNOUNCEMENT_POSTED
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/notifications
     * Fetches all notifications for the current student user.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestParam(value = "userId", required = false) String requestedUserId,
            Authentication authentication) {

        String userId = resolveUserId(requestedUserId, authentication);
        List<NotificationDto> list = notificationService.getNotificationsForUser(userId);
        long unreadCount = notificationService.getUnreadCount(userId);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("userId", userId);
        res.put("unreadCount", unreadCount);
        res.put("count", list.size());
        res.put("data", list);

        return ResponseEntity.ok(res);
    }

    /**
     * PUT /api/notifications/{id}/read
     * Marks a specific notification as read.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable Long id,
            @RequestParam(value = "userId", required = false) String requestedUserId,
            Authentication authentication) {

        String userId = resolveUserId(requestedUserId, authentication);
        boolean updated = notificationService.markAsRead(id, userId);

        Map<String, Object> res = new HashMap<>();
        res.put("success", updated);
        res.put("message", updated ? "Notification marked as read." : "Notification not found or access denied.");
        res.put("unreadCount", notificationService.getUnreadCount(userId));

        return ResponseEntity.ok(res);
    }

    /**
     * PUT /api/notifications/read-all
     * Marks all notifications as read for the student.
     */
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllRead(
            @RequestParam(value = "userId", required = false) String requestedUserId,
            Authentication authentication) {

        String userId = resolveUserId(requestedUserId, authentication);
        int count = notificationService.markAllAsRead(userId);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "All notifications marked as read.");
        res.put("markedCount", count);
        res.put("unreadCount", 0);

        return ResponseEntity.ok(res);
    }

    // ── In-App Trigger Endpoints ─────────────────────────────────────────────────

    /**
     * POST /api/notifications/trigger/grade
     * Triggered when an instructor posts or updates a grade for a student.
     */
    @PostMapping("/trigger/grade")
    public ResponseEntity<Map<String, Object>> triggerGradePublished(
            @RequestBody Map<String, String> payload) {

        String studentId = payload.get("studentId");
        String courseCode = payload.get("courseCode");
        String assignmentTitle = payload.get("assignmentTitle");
        String grade = payload.get("grade");
        String feedback = payload.get("feedback");

        if (studentId == null || studentId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "studentId is required"));
        }

        NotificationDto dto = notificationService.notifyGradePublished(
                studentId,
                courseCode,
                assignmentTitle,
                grade != null ? grade : "A",
                feedback
        );

        return ResponseEntity.ok(Map.of("success", true, "data", dto));
    }

    /**
     * POST /api/notifications/trigger/announcement
     * Triggered when an instructor posts an announcement to a course.
     */
    @PostMapping("/trigger/announcement")
    public ResponseEntity<Map<String, Object>> triggerAnnouncementPosted(
            @RequestBody Map<String, String> payload) {

        String courseCode = payload.get("courseCode");
        String title = payload.get("title");
        String content = payload.get("content");
        String authorName = payload.get("authorName");

        if (courseCode == null || courseCode.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "courseCode is required"));
        }

        List<NotificationDto> list = notificationService.notifyAnnouncementPosted(
                courseCode,
                title != null ? title : "Important Update",
                content != null ? content : "Please check the course portal for announcements.",
                authorName != null ? authorName : "Instructor"
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "broadcastCount", list.size(),
                "data", list
        ));
    }

    /**
     * POST /api/notifications/trigger/deadline
     * Triggered to simulate a deadline approaching alert for a student.
     */
    @PostMapping("/trigger/deadline")
    public ResponseEntity<Map<String, Object>> triggerDeadlineApproaching(
            @RequestBody Map<String, String> payload) {

        String studentId = payload.get("studentId");
        String courseCode = payload.get("courseCode");
        String assignmentTitle = payload.get("assignmentTitle");

        if (studentId == null || studentId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "studentId is required"));
        }

        NotificationDto dto = notificationService.notifyDeadlineApproaching(
                studentId,
                courseCode != null ? courseCode : "CSE470",
                assignmentTitle != null ? assignmentTitle : "Final Project Submission",
                LocalDateTime.now().plusHours(18)
        );

        return ResponseEntity.ok(Map.of("success", true, "data", dto));
    }

    /**
     * POST /api/notifications/trigger/advising
     * Triggered when a student's advising session is confirmed.
     */
    @PostMapping("/trigger/advising")
    public ResponseEntity<Map<String, Object>> triggerAdvisingConfirmed(
            @RequestBody Map<String, String> payload) {

        String studentId = payload.get("studentId");
        String advisorName = payload.get("advisorName");
        int courseCount = 4;
        try {
            if (payload.get("courseCount") != null) {
                courseCount = Integer.parseInt(payload.get("courseCount"));
            }
        } catch (Exception ignored) {}

        if (studentId == null || studentId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "studentId is required"));
        }

        NotificationDto dto = notificationService.notifyAdvisingConfirmed(studentId, advisorName, courseCount);

        return ResponseEntity.ok(Map.of("success", true, "data", dto));
    }

    // ── Helper ───────────────────────────────────────────────────────────────────

    private String resolveUserId(String requestedUserId, Authentication authentication) {
        if (requestedUserId != null && !requestedUserId.isBlank()) {
            return requestedUserId.trim();
        }
        if (authentication != null && authentication.getName() != null && !authentication.getName().isBlank()) {
            return authentication.getName().trim();
        }
        return "STU001"; // Fallback demo student
    }
}
