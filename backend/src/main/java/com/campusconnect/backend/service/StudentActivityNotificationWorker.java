package com.campusconnect.backend.service;

import com.campusconnect.backend.model.AdvisingPortalStatus;
import com.campusconnect.backend.model.Assignment;
import com.campusconnect.backend.model.AttendanceRecord;
import com.campusconnect.backend.model.CourseMaterial;
import com.campusconnect.backend.model.DirectMessage;
import com.campusconnect.backend.model.StudentNotificationCursor;
import com.campusconnect.backend.model.VideoLecture;
import com.campusconnect.backend.repository.AdvisingPortalStatusRepository;
import com.campusconnect.backend.repository.AssignmentRepository;
import com.campusconnect.backend.repository.AttendanceRecordRepository;
import com.campusconnect.backend.repository.CourseMaterialRepository;
import com.campusconnect.backend.repository.DirectMessageRepository;
import com.campusconnect.backend.repository.StudentNotificationCursorRepository;
import com.campusconnect.backend.repository.VideoLectureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Polls existing tables for student-facing events and dispatches in-app notifications.
 * Leaves assignment, video, material, advising, chat, and attendance services unchanged.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StudentActivityNotificationWorker {

    private static final String CURSOR_ASSIGNMENT = "ASSIGNMENT";
    private static final String CURSOR_VIDEO = "VIDEO";
    private static final String CURSOR_MATERIAL = "MATERIAL";
    private static final String CURSOR_DM = "DM";
    private static final String CURSOR_PORTAL = "PORTAL";
    private static final double ATTENDANCE_THRESHOLD = 70.0;
    private static final int MIN_SESSIONS = 2;

    private final AssignmentRepository assignmentRepository;
    private final VideoLectureRepository videoLectureRepository;
    private final CourseMaterialRepository courseMaterialRepository;
    private final DirectMessageRepository directMessageRepository;
    private final AdvisingPortalStatusRepository portalStatusRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final StudentNotificationCursorRepository cursorRepository;
    private final StudentActivityNotificationService activityNotifications;

    private final Set<String> lowAttendanceNotified = ConcurrentHashMap.newKeySet();

    @Scheduled(fixedRate = 20000, initialDelay = 25000)
    public void scanActivity() {
        scanAssignments();
        scanVideos();
        scanMaterials();
        scanDirectMessages();
        scanAdvisingPortal();
    }

    @Scheduled(fixedRate = 300000, initialDelay = 40000)
    public void scanAttendance() {
        try {
            List<AttendanceRecord> records = attendanceRecordRepository.findAll();
            if (records.isEmpty()) return;

            Map<String, List<AttendanceRecord>> byStudent = new LinkedHashMap<>();
            for (AttendanceRecord record : records) {
                if (record.getStudentId() == null) continue;
                byStudent.computeIfAbsent(record.getStudentId(), k -> new ArrayList<>()).add(record);
            }

            for (Map.Entry<String, List<AttendanceRecord>> studentEntry : byStudent.entrySet()) {
                String studentId = studentEntry.getKey();
                String notifyUserId = activityNotifications.resolveStudentUserId(studentId);
                if (notifyUserId == null) continue;

                Map<String, List<AttendanceRecord>> byCourse = new LinkedHashMap<>();
                for (AttendanceRecord record : studentEntry.getValue()) {
                    String courseId = record.getCourseId() != null ? record.getCourseId() : "COURSE";
                    byCourse.computeIfAbsent(courseId, k -> new ArrayList<>()).add(record);
                }

                for (Map.Entry<String, List<AttendanceRecord>> courseEntry : byCourse.entrySet()) {
                    List<AttendanceRecord> courseRecords = courseEntry.getValue();
                    if (courseRecords.size() < MIN_SESSIONS) continue;

                    long presentOrLate = courseRecords.stream()
                            .filter(r -> {
                                String status = r.getStatus();
                                return "PRESENT".equalsIgnoreCase(status) || "LATE".equalsIgnoreCase(status);
                            })
                            .count();
                    double rate = presentOrLate * 100.0 / courseRecords.size();
                    String cacheKey = notifyUserId + "|" + courseEntry.getKey();

                    if (rate < ATTENDANCE_THRESHOLD) {
                        if (lowAttendanceNotified.add(cacheKey)) {
                            String courseName = courseRecords.get(0).getCourseName();
                            activityNotifications.notifyAttendanceLow(notifyUserId, courseEntry.getKey(), courseName, rate);
                        }
                    } else {
                        lowAttendanceNotified.remove(cacheKey);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("[StudentActivityNotification] attendance scan failed: {}", e.getMessage());
        }
    }

    private void scanAssignments() {
        try {
            List<Assignment> all = assignmentRepository.findAll();
            List<Assignment> newRows = takeNewById(CURSOR_ASSIGNMENT, all, Assignment::getId);
            for (Assignment assignment : newRows) {
                activityNotifications.notifyAssignmentUploaded(assignment);
            }
        } catch (Exception e) {
            log.warn("[StudentActivityNotification] assignment scan failed: {}", e.getMessage());
        }
    }

    private void scanVideos() {
        try {
            List<VideoLecture> all = videoLectureRepository.findAll();
            List<VideoLecture> newRows = takeNewById(CURSOR_VIDEO, all, VideoLecture::getId);
            for (VideoLecture lecture : newRows) {
                activityNotifications.notifyVideoUploaded(lecture);
            }
        } catch (DataAccessException e) {
            log.warn("[StudentActivityNotification] video scan skipped: {}", e.getMessage());
        } catch (Exception e) {
            log.warn("[StudentActivityNotification] video scan failed: {}", e.getMessage());
        }
    }

    private void scanMaterials() {
        try {
            List<CourseMaterial> all = courseMaterialRepository.findAll();
            List<CourseMaterial> newRows = takeNewById(CURSOR_MATERIAL, all, CourseMaterial::getId);
            for (CourseMaterial material : newRows) {
                activityNotifications.notifyCourseMaterialUploaded(material);
            }
        } catch (DataAccessException e) {
            log.warn("[StudentActivityNotification] material scan skipped: {}", e.getMessage());
        } catch (Exception e) {
            log.warn("[StudentActivityNotification] material scan failed: {}", e.getMessage());
        }
    }

    private void scanDirectMessages() {
        try {
            List<DirectMessage> all = directMessageRepository.findAll();
            List<DirectMessage> newRows = takeNewById(CURSOR_DM, all, DirectMessage::getId);
            for (DirectMessage message : newRows) {
                activityNotifications.notifyDirectMessage(message);
            }
        } catch (Exception e) {
            log.warn("[StudentActivityNotification] DM scan failed: {}", e.getMessage());
        }
    }

    private void scanAdvisingPortal() {
        try {
            AdvisingPortalStatus status = portalStatusRepository.findById(1L).orElse(null);
            if (status == null) return;
            boolean open = status.isOpen();

            StudentNotificationCursor cursor = cursorRepository.findById(CURSOR_PORTAL)
                    .orElse(null);
            if (cursor == null || cursor.getLastPortalOpen() == null) {
                savePortalCursor(open);
                return;
            }
            if (cursor.getLastPortalOpen() == open) {
                return;
            }
            activityNotifications.notifyAdvisingPortalChanged(open, status.getMessage());
            savePortalCursor(open);
        } catch (Exception e) {
            log.warn("[StudentActivityNotification] advising portal scan failed: {}", e.getMessage());
        }
    }

    private <T> List<T> takeNewById(String cursorKey, List<T> all, java.util.function.Function<T, Long> idFn) {
        long maxId = all.stream()
                .map(idFn)
                .filter(id -> id != null)
                .mapToLong(Long::longValue)
                .max()
                .orElse(0L);

        StudentNotificationCursor cursor = cursorRepository.findById(cursorKey).orElse(null);
        if (cursor == null || cursor.getLastSeenId() == null) {
            saveIdCursor(cursorKey, maxId);
            return List.of();
        }

        long lastSeen = cursor.getLastSeenId();
        List<T> fresh = new ArrayList<>();
        for (T row : all) {
            Long id = idFn.apply(row);
            if (id != null && id > lastSeen) {
                fresh.add(row);
            }
        }
        fresh.sort(Comparator.comparing(idFn));
        if (maxId > lastSeen) {
            saveIdCursor(cursorKey, maxId);
        }
        return fresh;
    }

    private void saveIdCursor(String key, long lastSeenId) {
        StudentNotificationCursor cursor = cursorRepository.findById(key)
                .orElseGet(() -> new StudentNotificationCursor(key));
        cursor.setLastSeenId(lastSeenId);
        cursorRepository.save(cursor);
    }

    private void savePortalCursor(boolean open) {
        StudentNotificationCursor cursor = cursorRepository.findById(CURSOR_PORTAL)
                .orElseGet(() -> new StudentNotificationCursor(CURSOR_PORTAL));
        cursor.setLastPortalOpen(open);
        cursorRepository.save(cursor);
    }
}
