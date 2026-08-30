package com.campusconnect.backend.controller;

import com.campusconnect.backend.model.TestCourse;
import com.campusconnect.backend.model.TestFaculty;
import com.campusconnect.backend.model.TestSection;
import com.campusconnect.backend.service.TestCourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * TestCourseController – REST endpoints for Test Courses, Test Sections, and Test Faculty.
 *
 * MVC Role: Controller
 * Base URL: /api/test-courses
 */
@RestController
@RequestMapping("/api/test-courses")
@CrossOrigin(origins = "*")
public class TestCourseController {

    private final TestCourseService testCourseService;

    public TestCourseController(TestCourseService testCourseService) {
        this.testCourseService = testCourseService;
    }

    // ── GET /api/test-courses ─────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<TestCourse>> getAllCourses() {
        return ResponseEntity.ok(testCourseService.getAllCourses());
    }

    // ── GET /api/test-courses/{code} ──────────────────────────────
    @GetMapping("/{code}")
    public ResponseEntity<TestCourse> getCourseByCode(@PathVariable String code) {
        return testCourseService.getCourseByCode(code)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ── GET /api/test-courses/faculty ─────────────────────────────
    @GetMapping("/faculty")
    public ResponseEntity<List<TestFaculty>> getAllFaculty() {
        return ResponseEntity.ok(testCourseService.getAllFaculty());
    }

    // ── GET /api/test-courses/sections ────────────────────────────
    @GetMapping("/sections")
    public ResponseEntity<List<Map<String, Object>>> getAllSections(
            @RequestParam(required = false) String courseCode,
            @RequestParam(required = false) String facultyId) {

        List<TestSection> sections;
        if (courseCode != null && !courseCode.isBlank()) {
            sections = testCourseService.getSectionsByCourseCode(courseCode);
        } else if (facultyId != null && !facultyId.isBlank()) {
            sections = testCourseService.getSectionsByFacultyId(facultyId);
        } else {
            sections = testCourseService.getAllSections();
        }

        List<Map<String, Object>> response = sections.stream().map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("sectionId", s.getSectionId());
            m.put("courseCode", s.getCourse().getCode());
            m.put("courseTitle", s.getCourse().getName());
            m.put("credits", s.getCourse().getCredits());
            m.put("department", s.getCourse().getDepartment());
            m.put("sectionNumber", s.getSectionNumber());
            m.put("facultyId", s.getFaculty().getFacultyId());
            m.put("facultyName", s.getFaculty().getName());
            m.put("facultyEmail", s.getFaculty().getEmail());
            m.put("scheduleTime", s.getScheduleTime());
            m.put("room", s.getRoom());
            m.put("totalSeats", s.getTotalSeats());
            m.put("bookedSeats", s.getBookedSeats());
            m.put("seatsRemaining", Math.max(0, s.getTotalSeats() - s.getBookedSeats()));
            m.put("term", s.getTerm());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
