package com.campusconnect.backend.controller;

import com.campusconnect.backend.service.ChannelAccessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ChannelAccessController – REST endpoints for Admin course channel access management.
 *
 * MVC Role: Controller
 *
 * Endpoints:
 *   GET    /api/channels/{channelId}/members         → list channel members
 *   POST   /api/channels/{channelId}/members         → add student/faculty access
 *   DELETE /api/channels/{channelId}/members/{userId} → remove student/faculty access
 */
@RestController
@RequestMapping("/api/channels")
@RequiredArgsConstructor
@Slf4j
public class ChannelAccessController {

    private final ChannelAccessService channelAccessService;

    /**
     * GET /api/channels/{channelId}/members
     */
    @GetMapping("/{channelId}/members")
    public ResponseEntity<Map<String, Object>> getChannelMembers(
            @PathVariable String channelId,
            @RequestParam(value = "courseCode", required = false) String courseCode) {

        List<Map<String, Object>> members = channelAccessService.getChannelMembers(channelId, courseCode);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "channelId", channelId,
                "count", members.size(),
                "data", members
        ));
    }

    /**
     * POST /api/channels/{channelId}/members
     * Admin grants access to a student or faculty member.
     */
    @PostMapping("/{channelId}/members")
    public ResponseEntity<Map<String, Object>> addMember(
            @PathVariable String channelId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        String userId = body.get("userId");
        String courseCode = body.get("courseCode");
        String addedBy = authentication != null ? authentication.getName() : "ADMIN";

        Map<String, Object> res = channelAccessService.addMember(channelId, courseCode, userId, addedBy);
        return ResponseEntity.ok(res);
    }

    /**
     * DELETE /api/channels/{channelId}/members/{userId}
     * Admin removes student or faculty access from a channel.
     */
    @DeleteMapping("/{channelId}/members/{userId}")
    public ResponseEntity<Map<String, Object>> removeMember(
            @PathVariable String channelId,
            @PathVariable String userId,
            Authentication authentication) {

        String removedBy = authentication != null ? authentication.getName() : "ADMIN";
        Map<String, Object> res = channelAccessService.removeMember(channelId, userId, removedBy);
        return ResponseEntity.ok(res);
    }
}
