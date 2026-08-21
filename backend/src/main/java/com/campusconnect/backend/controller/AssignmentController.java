package com.campusconnect.backend.controller;

import com.campusconnect.backend.model.Assignment;
import com.campusconnect.backend.model.Submission;
import com.campusconnect.backend.service.AssignmentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * AssignmentController – REST handler for assignment & submission endpoints.
 *
 * MVC Role: Controller
 *
 * Base URL: /api/assignments
 *
 * All business logic is delegated to {@link AssignmentService}.
 * This controller is responsible only for:
 *   1. Accepting HTTP requests and extracting parameters
 *   2. Delegating to AssignmentService
 *   3. Returning HTTP responses
 *
 * Endpoints:
 *   GET  /api/assignments                        → list all assignments
 *   GET  /api/assignments/{id}                   → single assignment detail
 *   POST /api/assignments                        → create assignment (multipart)
 *   GET  /api/assignments/{id}/attachment         → download question file
 *   POST /api/assignments/{id}/submit             → student turn in (multipart)
 *   DELETE /api/assignments/{id}/submit           → student unsubmit
 *   GET  /api/assignments/{id}/submission         → get student's submission
 *   GET  /api/assignments/{id}/submissions        → teacher: all submissions
 *   GET  /api/assignments/submissions/{subId}/file → download submission file
 *   POST /api/assignments/submissions/{subId}/grade → teacher grades
 */
@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    // ── GET /api/assignments ──────────────────────────────────────
    /**
     * Returns all assignments ordered by deadline.
     * Excludes attachment data for performance.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllAssignments() {
        List<Assignment> all = assignmentService.getAllAssignments();
        // Strip binary attachment data from list response for performance
        List<Map<String, Object>> data = all.stream().map(this::toSummaryMap).toList();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count",   data.size(),
            "data",    data
        ));
    }

    // ── GET /api/assignments/{id} ─────────────────────────────────
    /**
     * Returns a single assignment with full details (excludes binary attachment).
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getAssignment(@PathVariable Long id) {
        Optional<Assignment> opt = assignmentService.getAssignmentById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("success", false, "message", "Assignment not found."));
        }
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data",    toDetailMap(opt.get())
        ));
    }

    // ── POST /api/assignments ─────────────────────────────────────
    /**
     * Teacher creates a new assignment. Accepts multipart form data:
     *   - courseCode, courseName, title, description, totalPoints, deadline, createdBy (form fields)
     *   - file (optional attachment)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> createAssignment(
            @RequestParam("courseCode")   String courseCode,
            @RequestParam("courseName")  String courseName,
            @RequestParam("title")       String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("deadline")    String deadline,
            @RequestParam(value = "createdBy", required = false) String createdBy,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        try {
            LocalDateTime deadlineDt = LocalDateTime.parse(deadline);
            byte[] fileData   = (file != null && !file.isEmpty()) ? file.getBytes() : null;
            String fileName   = (file != null && !file.isEmpty()) ? file.getOriginalFilename() : null;
            String fileType   = (file != null && !file.isEmpty()) ? file.getContentType() : null;

            Assignment created = assignmentService.createAssignment(
                courseCode, courseName, title, description,
                deadlineDt, createdBy,
                fileName, fileType, fileData
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Assignment created successfully.",
                "data",    toDetailMap(created)
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── GET /api/assignments/{id}/attachment ───────────────────────
    /**
     * Download the teacher's question file attachment.
     */
    @GetMapping("/{id}/attachment")
    public ResponseEntity<byte[]> downloadAttachment(@PathVariable Long id) {
        Optional<Assignment> opt = assignmentService.getAssignmentById(id);
        if (opt.isEmpty() || opt.get().getAttachmentData() == null) {
            return ResponseEntity.notFound().build();
        }
        Assignment a = opt.get();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + a.getAttachmentName() + "\"")
            .contentType(MediaType.parseMediaType(
                a.getAttachmentType() != null ? a.getAttachmentType() : "application/octet-stream"))
            .body(a.getAttachmentData());
    }

    // ── POST /api/assignments/{id}/submit ─────────────────────────
    /**
     * Student turns in their work. Accepts multipart form data:
     *   - studentId, studentName (form fields)
     *   - file (required — the submission file)
     */
    @PostMapping(value = "/{id}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> submitWork(
            @PathVariable Long id,
            @RequestParam("studentId")   String studentId,
            @RequestParam(value = "studentName", required = false) String studentName,
            @RequestPart("file")         MultipartFile file) {

        try {
            byte[] fileData = file.getBytes();
            Submission submission = assignmentService.submitWork(
                id, studentId, studentName,
                file.getOriginalFilename(), file.getContentType(), fileData
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Work turned in successfully.");
            response.put("data", toSubmissionMap(submission));
            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            // Deadline passed
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── DELETE /api/assignments/{id}/submit ────────────────────────
    /**
     * Student unsubmits their work.
     */
    @DeleteMapping("/{id}/submit")
    public ResponseEntity<Map<String, Object>> unsubmitWork(
            @PathVariable Long id,
            @RequestParam("studentId") String studentId) {

        try {
            assignmentService.unsubmitWork(id, studentId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Work unsubmitted successfully."
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── GET /api/assignments/{id}/submission ───────────────────────
    /**
     * Get a student's submission for an assignment.
     */
    @GetMapping("/{id}/submission")
    public ResponseEntity<Map<String, Object>> getSubmission(
            @PathVariable Long id,
            @RequestParam("studentId") String studentId) {

        Optional<Submission> opt = assignmentService.getSubmission(id, studentId);
        if (opt.isEmpty()) {
            Map<String, Object> emptyResponse = new HashMap<>();
            emptyResponse.put("success", true);
            emptyResponse.put("data", null);
            return ResponseEntity.ok(emptyResponse);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", toSubmissionMap(opt.get()));
        return ResponseEntity.ok(response);
    }

    // ── GET /api/assignments/{id}/submissions ─────────────────────
    /**
     * Teacher: Get all submissions for an assignment (grading view).
     */
    @GetMapping("/{id}/submissions")
    public ResponseEntity<Map<String, Object>> getSubmissions(@PathVariable Long id) {
        List<Submission> subs = assignmentService.getSubmissionsForAssignment(id);
        List<Map<String, Object>> data = subs.stream().map(this::toSubmissionMap).toList();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count",   data.size(),
            "data",    data
        ));
    }

    // ── GET /api/assignments/submissions/{subId}/file ─────────────
    /**
     * Download a student's submitted file.
     */
    @GetMapping("/submissions/{subId}/file")
    public ResponseEntity<byte[]> downloadSubmissionFile(@PathVariable Long subId) {
        Optional<Submission> opt = assignmentService.getSubmissionById(subId);
        if (opt.isEmpty() || opt.get().getFileData() == null) {
            return ResponseEntity.notFound().build();
        }

        Submission s = opt.get();

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + s.getFileName() + "\"")
            .contentType(MediaType.parseMediaType(
                s.getFileType() != null ? s.getFileType() : "application/octet-stream"))
            .body(s.getFileData());
    }

    // ── Private helper: Assignment → JSON map (summary, no binary) ──
    private Map<String, Object> toSummaryMap(Assignment a) {
        Map<String, Object> map = new HashMap<>();
        map.put("id",             a.getId());
        map.put("courseCode",     a.getCourseCode());
        map.put("courseName",    a.getCourseName());
        map.put("title",         a.getTitle());
        map.put("deadline",      a.getDeadline() != null ? a.getDeadline().toString() : null);
        map.put("createdBy",     a.getCreatedBy());
        map.put("createdAt",     a.getCreatedAt() != null ? a.getCreatedAt().toString() : null);
        map.put("hasAttachment", a.getAttachmentData() != null);
        map.put("attachmentName", a.getAttachmentName());
        return map;
    }

    // ── Private helper: Assignment → JSON map (detail, no binary) ──
    private Map<String, Object> toDetailMap(Assignment a) {
        Map<String, Object> map = toSummaryMap(a);
        map.put("description",    a.getDescription());
        map.put("attachmentType", a.getAttachmentType());
        return map;
    }

    // ── Private helper: Submission → JSON map (no binary) ──
    private Map<String, Object> toSubmissionMap(Submission s) {
        Map<String, Object> map = new HashMap<>();
        map.put("id",           s.getId());
        map.put("assignmentId", s.getAssignmentId());
        map.put("studentId",    s.getStudentId());
        map.put("studentName",  s.getStudentName());
        map.put("status",       s.getStatus());
        map.put("submittedAt",  s.getSubmittedAt() != null ? s.getSubmittedAt().toString() : null);
        map.put("fileName",     s.getFileName());
        map.put("fileType",     s.getFileType());
        map.put("hasFile",      s.getFileData() != null);
        return map;
    }
}
