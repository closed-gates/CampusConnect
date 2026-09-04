package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.CourseMaterialDTO;
import com.campusconnect.backend.service.CourseMaterialService;
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
 * CourseMaterialController – REST API for the course materials repository.
 *
 * MVC Role: Controller
 *
 *   GET    /api/course-materials              list (all authenticated roles)
 *   POST   /api/course-materials              upload (FACULTY, ADMIN)
 *   DELETE /api/course-materials/{id}         delete (FACULTY, ADMIN)
 *   GET    /api/course-materials/{id}/download download file
 */
@RestController
@RequestMapping("/api/course-materials")
public class CourseMaterialController {

    private final CourseMaterialService courseMaterialService;

    public CourseMaterialController(CourseMaterialService courseMaterialService) {
        this.courseMaterialService = courseMaterialService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(Authentication authentication) {
        requireUserId(authentication);
        List<CourseMaterialDTO> data = courseMaterialService.listMaterials();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", data.size(),
                "data", data
        ));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> create(
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String courseCode,
            @RequestParam(required = false) String courseName,
            @RequestParam String kind,
            @RequestParam MultipartFile file,
            Authentication authentication) {
        requireManager(authentication);
        CourseMaterialDTO created = courseMaterialService.createMaterial(
                title, description, courseCode, courseName, kind, file, requireUserId(authentication)
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "data", created
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id, Authentication authentication) {
        requireManager(authentication);
        courseMaterialService.deleteMaterial(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/{id}/download")
    public void download(@PathVariable Long id, Authentication authentication, HttpServletResponse response) throws IOException {
        requireUserId(authentication);
        courseMaterialService.downloadMaterial(id, response);
    }

    @GetMapping("/{id}/view")
    public void view(@PathVariable Long id, Authentication authentication, HttpServletResponse response) throws IOException {
        requireUserId(authentication);
        courseMaterialService.viewMaterial(id, response);
    }

    private void requireManager(Authentication authentication) {
        if (hasRole(authentication, "FACULTY") || hasRole(authentication, "ADMIN")) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only faculty and admins can manage course materials.");
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
