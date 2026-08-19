package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.ExamScheduleDTO;
import com.campusconnect.backend.service.ExamScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ExamScheduleController – REST API for exam schedule data.
 *
 * MVC Role: Controller
 *
 * Endpoints:
 *   GET /api/exam-schedule?studentId=  – Exam schedule for a student's enrolled courses
 *   GET /api/exam-schedule/all         – All course exam schedules (used by Routine Builder)
 *   GET /api/exam-schedule/{code}      – Exam schedule for a single course code
 *
 * All responses are JSON arrays/objects of ExamScheduleDTO.
 * Days-left values are pre-computed in ExamScheduleService.
 */
@RestController
@RequestMapping("/api/exam-schedule")
@CrossOrigin(origins = "*")
public class ExamScheduleController {

    private final ExamScheduleService examService;

    public ExamScheduleController(ExamScheduleService examService) {
        this.examService = examService;
    }

    // ── GET /api/exam-schedule?studentId= ────────────────────────────────────
    /**
     * Returns the exam schedule for all courses a student is registered in
     * (via section_registrations table). Sorted by nearest final exam first.
     */
    @GetMapping
    public ResponseEntity<List<ExamScheduleDTO>> getForStudent(
            @RequestParam("studentId") String studentId) {
        return ResponseEntity.ok(examService.getExamScheduleForStudent(studentId));
    }

    // ── GET /api/exam-schedule/all ────────────────────────────────────────────
    /**
     * Returns exam schedules for all courses in the DB.
     * Used by the Routine Builder page to show exam dates alongside catalog entries.
     */
    @GetMapping("/all")
    public ResponseEntity<List<ExamScheduleDTO>> getAll() {
        return ResponseEntity.ok(examService.getAllExamSchedules());
    }

    // ── GET /api/exam-schedule/{code} ─────────────────────────────────────────
    /**
     * Returns the exam schedule for a single course code.
     * Returns 404 if no schedule exists for that code.
     */
    @GetMapping("/{code}")
    public ResponseEntity<ExamScheduleDTO> getByCode(@PathVariable("code") String code) {
        ExamScheduleDTO dto = examService.getExamScheduleByCode(code.toUpperCase());
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

    // ── POST /api/exam-schedule/reseed ────────────────────────────────────────
    /**
     * Force-clears the exam_schedules table and re-seeds all course exam dates.
     * Call this after adding new courses to course_catalog.
     */
    @PostMapping("/reseed")
    public ResponseEntity<Map<String, Object>> reseed() {
        examService.reseedExamSchedules();
        return ResponseEntity.ok(Map.of(
                "message", "exam_schedules table reseeded successfully.",
                "count", examService.getAllExamSchedules().size()
        ));
    }
}
