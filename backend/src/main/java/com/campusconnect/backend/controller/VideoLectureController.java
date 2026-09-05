package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.VideoLectureDTO;
import com.campusconnect.backend.dto.VideoProgressDTO;
import com.campusconnect.backend.dto.VideoProgressUpdateRequest;
import com.campusconnect.backend.service.VideoLectureService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

import java.util.List;
import java.util.Map;

/**
 * VideoLectureController – REST API for lecture streaming, embedding, and progress.
 *
 * MVC Role: Controller
 *
 *   GET    /api/video-lectures                 list (all authenticated roles)
 *   GET    /api/video-lectures/{id}            detail
 *   POST   /api/video-lectures                 create upload or embed (FACULTY, ADMIN)
 *   DELETE /api/video-lectures/{id}            delete (FACULTY, ADMIN)
 *   GET    /api/video-lectures/{id}/stream     stream uploaded file
 *   GET    /api/video-lectures/{id}/progress   current user's progress
 *   PUT    /api/video-lectures/{id}/progress   save current user's progress
 */
@RestController
@RequestMapping("/api/video-lectures")
public class VideoLectureController {

    private final VideoLectureService videoLectureService;

    public VideoLectureController(VideoLectureService videoLectureService) {
        this.videoLectureService = videoLectureService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(Authentication authentication) {
        String userId = requireUserId(authentication);
        List<VideoLectureDTO> data = videoLectureService.listLectures(userId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", data.size(),
                "data", data
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable Long id, Authentication authentication) {
        String userId = requireUserId(authentication);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", videoLectureService.getLecture(id, userId)
        ));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> create(
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String courseCode,
            @RequestParam(required = false) String courseName,
            @RequestParam String sourceType,
            @RequestParam(required = false) String embedUrl,
            @RequestParam(required = false) MultipartFile file,
            Authentication authentication) {
        requireManager(authentication);
        VideoLectureDTO created = videoLectureService.createLecture(
                title, description, courseCode, courseName, sourceType, embedUrl, file, requireUserId(authentication)
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "data", created
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id, Authentication authentication) {
        requireManager(authentication);
        videoLectureService.deleteLecture(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/{id}/stream")
    public void stream(
            @PathVariable Long id,
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {
        requireUserId(authentication);
        videoLectureService.streamLecture(id, request, response);
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<Map<String, Object>> getProgress(@PathVariable Long id, Authentication authentication) {
        String userId = requireUserId(authentication);
        VideoProgressDTO data = videoLectureService.getProgress(id, userId);
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<Map<String, Object>> saveProgress(
            @PathVariable Long id,
            @RequestBody VideoProgressUpdateRequest request,
            Authentication authentication) {
        String userId = requireUserId(authentication);
        VideoProgressDTO data = videoLectureService.saveProgress(id, userId, request);
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    private void requireManager(Authentication authentication) {
        if (hasRole(authentication, "FACULTY") || hasRole(authentication, "ADMIN")) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only faculty and admins can manage video lectures.");
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }

    private String requireUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        }
        return authentication.getName();
    }
}
