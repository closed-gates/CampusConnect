package com.campusconnect.backend.service;

import com.campusconnect.backend.model.TestCourse;
import com.campusconnect.backend.model.TestFaculty;
import com.campusconnect.backend.model.TestSection;
import com.campusconnect.backend.repository.TestCourseRepository;
import com.campusconnect.backend.repository.TestFacultyRepository;
import com.campusconnect.backend.repository.TestSectionRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * TestCourseService – Service layer for the Test Course Catalogue & Sections.
 *
 * MVC Role: Service
 * Handles business logic for querying test courses, sections, and faculty,
 * and validates faculty time schedule conflicts.
 */
@Service
public class TestCourseService {

    private final TestCourseRepository courseRepo;
    private final TestFacultyRepository facultyRepo;
    private final TestSectionRepository sectionRepo;

    public TestCourseService(TestCourseRepository courseRepo,
                             TestFacultyRepository facultyRepo,
                             TestSectionRepository sectionRepo) {
        this.courseRepo  = courseRepo;
        this.facultyRepo = facultyRepo;
        this.sectionRepo = sectionRepo;
    }

    public List<TestCourse> getAllCourses() {
        return courseRepo.findAll();
    }

    public Optional<TestCourse> getCourseByCode(String code) {
        return courseRepo.findByCode(code);
    }

    public List<TestFaculty> getAllFaculty() {
        return facultyRepo.findAll();
    }

    public Optional<TestFaculty> getFacultyById(String facultyId) {
        return facultyRepo.findByFacultyId(facultyId);
    }

    public List<TestSection> getAllSections() {
        return sectionRepo.findAll();
    }

    public List<TestSection> getSectionsByCourseCode(String courseCode) {
        return sectionRepo.findByCourse_Code(courseCode);
    }

    public List<TestSection> getSectionsByFacultyId(String facultyId) {
        return sectionRepo.findByFaculty_FacultyId(facultyId);
    }

    /**
     * Checks whether two schedule time strings have any overlapping time slot on the same day.
     * Schedule format: "SUNDAY(08:00 AM-09:20 AM) ; TUESDAY(08:00 AM-09:20 AM)"
     *
     * @param schedule1 First schedule
     * @param schedule2 Second schedule
     * @return true if there is a conflict/overlap, false otherwise
     */
    public boolean hasTimeConflict(String schedule1, String schedule2) {
        if (schedule1 == null || schedule2 == null || schedule1.isBlank() || schedule2.isBlank()) {
            return false;
        }

        Set<String> cells1 = parseScheduleToCells(schedule1);
        Set<String> cells2 = parseScheduleToCells(schedule2);

        for (String c1 : cells1) {
            if (cells2.contains(c1)) {
                return true;
            }
        }
        return false;
    }

    private Set<String> parseScheduleToCells(String schedule) {
        Set<String> cells = new LinkedHashSet<>();
        if (schedule == null || schedule.isBlank()) return cells;

        String[] parts = schedule.split(";");
        Pattern timePattern = Pattern.compile("(\\d{1,2}:\\d{2}\\s*[AP]M\\s*-\\s*\\d{1,2}:\\d{2}\\s*[AP]M)", Pattern.CASE_INSENSITIVE);

        for (String part : parts) {
            String trimmed = part.trim();
            int parenIdx = trimmed.indexOf('(');
            if (parenIdx > 0) {
                String day = trimmed.substring(0, parenIdx).trim().toUpperCase();
                Matcher m = timePattern.matcher(trimmed);
                if (m.find()) {
                    String slot = m.group(1).replaceAll("\\s+", " ").trim();
                    cells.add(day + "|" + slot);
                }
            }
        }
        return cells;
    }
}
