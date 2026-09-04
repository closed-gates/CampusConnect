package com.campusconnect.backend.service;

import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.model.AttendanceRecord;
import com.campusconnect.backend.model.CourseSection;
import com.campusconnect.backend.repository.AppUserRepository;
import com.campusconnect.backend.repository.AttendanceRecordRepository;
import com.campusconnect.backend.repository.CourseSectionRepository;
import com.campusconnect.backend.repository.SectionRegistrationRepository;
import com.campusconnect.backend.repository.TestSectionRepository;
import org.springframework.stereotype.Service;
import com.campusconnect.backend.exception.ForbiddenException;
import com.campusconnect.backend.exception.UnauthorizedException;

import java.util.*;
import java.util.stream.Collectors;

/** Server-side role and ownership checks for every attendance operation. */
@Service
public class AttendanceAccessService {
    private final AppUserRepository users;
    private final AttendanceRecordRepository attendance;
    private final CourseSectionRepository sections;
    private final TestSectionRepository testSections;
    private final SectionRegistrationRepository registrations;

    public AttendanceAccessService(AppUserRepository users, AttendanceRecordRepository attendance,
                                   CourseSectionRepository sections, TestSectionRepository testSections,
                                   SectionRegistrationRepository registrations) {
        this.users = users; this.attendance = attendance; this.sections = sections;
        this.testSections = testSections; this.registrations = registrations;
    }

    public AppUser requireUser(String userId) {
        return users.findByUserId(userId).orElseThrow(() ->
                new UnauthorizedException("Authenticated user not found."));
    }

    public void requireStudentSelf(String requesterId, String studentId) {
        AppUser user = requireUser(requesterId);
        if (!"STUDENT".equalsIgnoreCase(user.getRole()) || !requesterId.equalsIgnoreCase(studentId))
            throw new ForbiddenException("Students may only view their own attendance.");
    }

    public void requireReadSection(String requesterId, String sectionOrCourse) {
        AppUser user = requireUser(requesterId);
        if ("ADMIN".equalsIgnoreCase(user.getRole())) return;
        if (!"FACULTY".equalsIgnoreCase(user.getRole()) || !facultyCourseKeys(user).contains(sectionOrCourse.toUpperCase()))
            throw new ForbiddenException("You are not assigned to this section.");
    }

    public void requireMarkSection(String requesterId, String sectionOrCourse) {
        AppUser user = requireUser(requesterId);
        if (!"FACULTY".equalsIgnoreCase(user.getRole()) || !facultyCourseKeys(user).contains(sectionOrCourse.toUpperCase()))
            throw new ForbiddenException("Only the assigned faculty member can mark attendance.");
    }

    public List<Map<String, Object>> visibleSections(String requesterId) {
        AppUser user = requireUser(requesterId);
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            Map<String, Long> counts = registrations.findAll().stream().filter(r -> r.getSection() != null)
                    .collect(Collectors.groupingBy(r -> r.getSection().getId(), Collectors.counting()));
            return sections.findAllOrderByCodeAndSection().stream().map(s -> sectionMap(s, counts.getOrDefault(s.getId(), 0L))).toList();
        }
        if (!"FACULTY".equalsIgnoreCase(user.getRole()))
            throw new ForbiddenException("Faculty or administrator access is required.");

        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        testSections.findByFaculty_FacultyId(user.getUserId()).forEach(s -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("courseId", s.getCourse().getCode()); row.put("sectionId", s.getSectionId());
            row.put("courseName", s.getCourse().getName()); row.put("section", s.getSectionNumber());
            row.put("studentCount", 0L); result.put(s.getCourse().getCode(), row);
        });
        attendance.findByMarkedBy(user.getFullName()).forEach(r -> result.computeIfAbsent(r.getCourseId(), key -> {
            Map<String, Object> row = new LinkedHashMap<>(); row.put("courseId", key); row.put("sectionId", key);
            row.put("courseName", r.getCourseName()); row.put("section", "Assigned"); row.put("studentCount", 0L); return row;
        }));
        result.values().forEach(row -> row.put("studentCount", registrations.findAll().stream()
                .filter(reg -> reg.getSection() != null && row.get("courseId").toString().equalsIgnoreCase(reg.getSection().getCode())).count()));
        return new ArrayList<>(result.values());
    }

    public String attendanceCourseId(String sectionOrCourse) {
        return sections.findById(sectionOrCourse).map(CourseSection::getCode)
                .orElseGet(() -> testSections.findBySectionId(sectionOrCourse)
                        .map(s -> s.getCourse().getCode()).orElse(sectionOrCourse));
    }

    private Set<String> facultyCourseKeys(AppUser user) {
        Set<String> keys = new HashSet<>();
        testSections.findByFaculty_FacultyId(user.getUserId()).forEach(s -> { keys.add(s.getSectionId().toUpperCase()); keys.add(s.getCourse().getCode().toUpperCase()); });
        attendance.findByMarkedBy(user.getFullName()).forEach(r -> keys.add(r.getCourseId().toUpperCase()));
        return keys;
    }

    private Map<String, Object> sectionMap(CourseSection section, long studentCount) {
        Map<String, Object> row = new LinkedHashMap<>(); row.put("courseId", section.getId()); row.put("sectionId", section.getId());
        row.put("courseCode", section.getCode()); row.put("courseName", section.getTitle()); row.put("section", section.getSection());
        row.put("faculty", section.getFaculty()); row.put("studentCount", studentCount); return row;
    }
}
