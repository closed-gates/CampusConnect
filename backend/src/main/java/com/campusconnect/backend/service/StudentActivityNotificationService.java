package com.campusconnect.backend.service;

import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.model.Assignment;
import com.campusconnect.backend.model.CourseMaterial;
import com.campusconnect.backend.model.DirectMessage;
import com.campusconnect.backend.model.SectionRegistration;
import com.campusconnect.backend.model.VideoLecture;
import com.campusconnect.backend.repository.AppUserRepository;
import com.campusconnect.backend.repository.NotificationRepository;
import com.campusconnect.backend.repository.SectionRegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Student-only in-app notifications for new campus activity.
 * Calls the existing dispatcher; does not replace DeadlineNotificationWorker.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudentActivityNotificationService {

    public static final String TYPE_ASSIGNMENT_UPLOADED = "ASSIGNMENT_UPLOADED";
    public static final String TYPE_VIDEO_UPLOADED = "VIDEO_UPLOADED";
    public static final String TYPE_COURSE_MATERIAL_UPLOADED = "COURSE_MATERIAL_UPLOADED";
    public static final String TYPE_ADVISING_PORTAL = "ADVISING_PORTAL";
    public static final String TYPE_DM_MESSAGE = "DM_MESSAGE";
    public static final String TYPE_ATTENDANCE_LOW = "ATTENDANCE_LOW";

    private final NotificationService notificationService;
    private final AppUserRepository appUserRepository;
    private final SectionRegistrationRepository sectionRegistrationRepository;
    private final NotificationRepository notificationRepository;

    public void notifyAssignmentUploaded(Assignment assignment) {
        if (assignment == null) return;
        String course = safe(assignment.getCourseCode(), "Course");
        String title = "New assignment: " + safe(assignment.getTitle(), "Assignment");
        String payload = course + " — " + safe(assignment.getTitle(), "Assignment")
                + " has been posted. Open Assignments to view details and the deadline.";
        dispatchToCourseStudents(course, TYPE_ASSIGNMENT_UPLOADED, title, payload, "/assignments");
    }

    public void notifyVideoUploaded(VideoLecture lecture) {
        if (lecture == null) return;
        String course = safe(lecture.getCourseCode(), "Course");
        String title = "New video lecture: " + safe(lecture.getTitle(), "Lecture");
        String payload = course + " — a new lecture is available in Video Lectures.";
        dispatchToCourseStudents(course, TYPE_VIDEO_UPLOADED, title, payload, "/video-lectures");
    }

    public void notifyCourseMaterialUploaded(CourseMaterial material) {
        if (material == null) return;
        String course = safe(material.getCourseCode(), "Course");
        String title = "New course material: " + safe(material.getTitle(), "Material");
        String payload = course + " — new notes or files were uploaded in Course Materials.";
        dispatchToCourseStudents(course, TYPE_COURSE_MATERIAL_UPLOADED, title, payload, "/course-materials");
    }

    public void notifyAdvisingPortalChanged(boolean open, String message) {
        String title = open ? "Advising portal is open" : "Advising portal is closed";
        String payload = (message != null && !message.isBlank())
                ? message
                : (open
                ? "You can now register for courses in Advising."
                : "Course registration is closed. Check back when the portal reopens.");
        for (String studentId : allStudentIds()) {
            notificationService.dispatch(studentId, TYPE_ADVISING_PORTAL, title, payload, "/advising");
        }
    }

    public void notifyDirectMessage(DirectMessage message) {
        if (message == null) return;
        String recipientId = message.getRecipientId();
        if (recipientId == null || recipientId.isBlank()) return;
        if (recipientId.equalsIgnoreCase(message.getSenderId())) return;
        if (!isStudent(recipientId)) return;

        String sender = safe(message.getSenderName(), safe(message.getSenderId(), "Someone"));
        String preview = message.getContent() != null ? message.getContent().trim() : "";
        if (preview.isEmpty() && message.getAttachmentsJson() != null && !message.getAttachmentsJson().isBlank()) {
            preview = "Sent an attachment";
        }
        if (preview.length() > 140) {
            preview = preview.substring(0, 137) + "...";
        }
        String title = "New message from " + sender;
        String payload = preview.isEmpty() ? "You have a new direct message." : preview;
        notificationService.dispatch(recipientId, TYPE_DM_MESSAGE, title, payload, "/messaging");
    }

    public void notifyAttendanceLow(String studentId, String courseId, String courseName, double rate) {
        if (!isStudent(studentId)) return;
        String course = safe(courseName, safe(courseId, "a course"));
        String title = "Attendance below 70% — " + course;
        if (notificationRepository.existsByUserIdAndTypeAndTitle(studentId, TYPE_ATTENDANCE_LOW, title)) {
            return;
        }
        String payload = "Your attendance in " + course + " is " + Math.round(rate * 10.0) / 10.0
                + "%. Keep attending so you stay eligible.";
        notificationService.dispatch(studentId, TYPE_ATTENDANCE_LOW, title, payload, "/attendance");
    }

    public boolean isStudent(String userId) {
        if (userId == null || userId.isBlank()) return false;
        return appUserRepository.findByUserId(userId.trim())
                .map(u -> "STUDENT".equalsIgnoreCase(u.getRole()))
                .orElse(false);
    }

    /** Maps attendance/roster ids to the login userId students actually use. */
    public String resolveStudentUserId(String rosterId) {
        if (isStudent(rosterId)) return rosterId.trim();
        if ("21201001".equals(rosterId)) return "STU001";
        return null;
    }

    public Set<String> allStudentIds() {
        return appUserRepository.findByRole("STUDENT").stream()
                .map(AppUser::getUserId)
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toSet());
    }

    private void dispatchToCourseStudents(String courseCode, String type, String title, String payload, String link) {
        for (String studentId : recipientsForCourse(courseCode)) {
            notificationService.dispatch(studentId, type, title, payload, link);
        }
    }

    private Set<String> recipientsForCourse(String courseCode) {
        Set<String> students = allStudentIds();
        Set<String> enrolled = findEnrolledStudents(courseCode);
        if (enrolled.isEmpty()) {
            return students;
        }
        enrolled.retainAll(students);
        return enrolled.isEmpty() ? students : enrolled;
    }

    private Set<String> findEnrolledStudents(String courseCode) {
        Set<String> students = new HashSet<>();
        if (courseCode == null || courseCode.isBlank()) return students;
        try {
            List<SectionRegistration> allRegs = sectionRegistrationRepository.findAll();
            for (SectionRegistration reg : allRegs) {
                if (reg.getSection() == null) continue;
                String code = reg.getSection().getCode();
                String id = reg.getSection().getId();
                if ((code != null && code.equalsIgnoreCase(courseCode)) ||
                        (id != null && id.toUpperCase().startsWith(courseCode.toUpperCase()))) {
                    students.add(reg.getStudentId());
                }
            }
        } catch (Exception e) {
            log.warn("[StudentActivityNotification] enrollment lookup failed: {}", e.getMessage());
        }
        return students;
    }

    private static String safe(String value, String fallback) {
        return (value != null && !value.isBlank()) ? value.trim() : fallback;
    }
}
