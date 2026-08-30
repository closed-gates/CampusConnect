package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.VideoLectureDto;
import com.campusconnect.backend.dto.WatchProgressDto;
import com.campusconnect.backend.model.WatchProgress;
import com.campusconnect.backend.service.VideoLectureService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * VideoLectureController – REST Endpoints for Video Lectures & Watch Progress.
 *
 * MVC Role: Controller
 * Base URL: /api/lectures
 */
@RestController
@RequestMapping("/api/lectures")
@CrossOrigin(origins = "*")
public class VideoLectureController {

    private final VideoLectureService lectureService;

    public VideoLectureController(VideoLectureService lectureService) {
        this.lectureService = lectureService;
    }

    /**
     * GET /api/lectures
     * Query params: studentId, userRole, courseCode
     */
    @GetMapping
    public ResponseEntity<List<VideoLectureDto>> getLectures(
            @RequestParam(defaultValue = "STU001") String studentId,
            @RequestParam(defaultValue = "student") String userRole,
            @RequestParam(required = false) String courseCode) {
        return ResponseEntity.ok(lectureService.getLectures(studentId, userRole, courseCode));
    }

    /**
     * POST /api/lectures
     * Upload a new video lecture (Teacher / Admin)
     */
    @PostMapping
    public ResponseEntity<VideoLectureDto> uploadLecture(@RequestBody VideoLectureDto dto) {
        if (dto.getTitle() == null || dto.getTitle().isBlank() ||
            dto.getCourseCode() == null || dto.getCourseCode().isBlank() ||
            dto.getVideoUrl() == null || dto.getVideoUrl().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        VideoLectureDto created = lectureService.uploadLecture(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * DELETE /api/lectures/{id}
     * Delete a video lecture
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteLecture(@PathVariable Long id) {
        lectureService.deleteLecture(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Lecture deleted successfully."));
    }

    /**
     * POST /api/lectures/{id}/progress
     * Update watch progress for a video lecture
     */
    @PostMapping("/{id}/progress")
    public ResponseEntity<WatchProgress> updateProgress(
            @PathVariable Long id,
            @RequestBody WatchProgressDto dto) {
        dto.setVideoLectureId(id);
        WatchProgress updated = lectureService.updateProgress(dto);
        return ResponseEntity.ok(updated);
    }
}
