package com.campusconnect.backend.service;

import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.model.CourseChannelMember;
import com.campusconnect.backend.repository.AppUserRepository;
import com.campusconnect.backend.repository.CourseChannelMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ChannelAccessService – Business logic for Admin course channel access management.
 *
 * MVC Role: Service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChannelAccessService {

    private final CourseChannelMemberRepository memberRepo;
    private final AppUserRepository userRepo;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Returns the active members of a channel.
     * Seeds initial members if the channel has no recorded memberships yet.
     */
    @Transactional
    public List<Map<String, Object>> getChannelMembers(String channelId, String courseCode) {
        if (channelId == null) return Collections.emptyList();

        List<CourseChannelMember> activeMembers = memberRepo.findByChannelIdAndStatus(channelId, "ACTIVE");

        // If empty on first access, initialize default channel members from app_users
        if (activeMembers.isEmpty()) {
            activeMembers = seedInitialMembers(channelId, courseCode);
        }

        return activeMembers.stream().map(m -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id",          m.getUserId());
            map.put("userId",      m.getUserId());
            map.put("displayName", m.getUserName());
            map.put("username",    m.getUserEmail() != null ? m.getUserEmail() : m.getUserId());
            map.put("email",       m.getUserEmail());
            map.put("role",        m.getUserRole());
            map.put("status",      "ONLINE");
            map.put("addedBy",     m.getAddedBy());
            map.put("updatedAt",   m.getUpdatedAt() != null ? m.getUpdatedAt().toString() : null);
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * Admin grants channel access to a student or faculty member.
     */
    @Transactional
    public Map<String, Object> addMember(String channelId, String courseCode, String userId, String addedBy) {
        if (channelId == null || userId == null) {
            return Map.of("success", false, "message", "channelId and userId are required");
        }

        AppUser user = userRepo.findByUserId(userId).orElse(null);
        if (user == null) {
            return Map.of("success", false, "message", "User not found: " + userId);
        }

        CourseChannelMember member = memberRepo.findByChannelIdAndUserId(channelId, userId)
                .orElse(new CourseChannelMember());

        member.setChannelId(channelId);
        member.setCourseCode(courseCode != null ? courseCode : extractCourseCode(channelId));
        member.setUserId(user.getUserId());
        member.setUserName(user.getFullName());
        member.setUserRole(user.getRole());
        member.setUserEmail(user.getEmail());
        member.setStatus("ACTIVE");
        member.setAddedBy(addedBy != null ? addedBy : "ADMIN");
        member.setUpdatedAt(Instant.now());

        CourseChannelMember saved = memberRepo.save(member);
        log.info("[ChannelAccessService] Admin {} added {} ({}) to channel {}", addedBy, user.getFullName(), user.getRole(), channelId);

        // Broadcast real-time change to all subscribers
        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("event", "CHANNEL_ACCESS_CHANGED");
        eventPayload.put("action", "ADD");
        eventPayload.put("channelId", channelId);
        eventPayload.put("courseCode", member.getCourseCode());
        eventPayload.put("userId", user.getUserId());
        eventPayload.put("member", Map.of(
                "id", user.getUserId(),
                "userId", user.getUserId(),
                "displayName", user.getFullName(),
                "username", user.getEmail() != null ? user.getEmail() : user.getUserId(),
                "role", user.getRole(),
                "status", "ONLINE"
        ));

        broadcastAccessChange(channelId, user.getUserId(), eventPayload);

        return Map.of(
                "success", true,
                "message", "Access granted to " + user.getFullName() + " for channel " + channelId,
                "member", member
        );
    }

    /**
     * Admin revokes channel access from a student or faculty member.
     */
    @Transactional
    public Map<String, Object> removeMember(String channelId, String userId, String removedBy) {
        if (channelId == null || userId == null) {
            return Map.of("success", false, "message", "channelId and userId are required");
        }

        Optional<CourseChannelMember> opt = memberRepo.findByChannelIdAndUserId(channelId, userId);
        if (opt.isEmpty() || !"ACTIVE".equalsIgnoreCase(opt.get().getStatus())) {
            // Also mark as revoked to explicitly blacklist if previously defaulted
            CourseChannelMember member = opt.orElse(new CourseChannelMember());
            member.setChannelId(channelId);
            member.setUserId(userId);
            member.setStatus("REVOKED");
            member.setUserRole("STUDENT");
            member.setAddedBy(removedBy != null ? removedBy : "ADMIN");
            member.setUpdatedAt(Instant.now());
            memberRepo.save(member);
        } else {
            CourseChannelMember member = opt.get();
            member.setStatus("REVOKED");
            member.setAddedBy(removedBy != null ? removedBy : "ADMIN");
            member.setUpdatedAt(Instant.now());
            memberRepo.save(member);
        }

        log.info("[ChannelAccessService] Admin {} removed {} from channel {}", removedBy, userId, channelId);

        // Broadcast real-time change to all subscribers
        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("event", "CHANNEL_ACCESS_CHANGED");
        eventPayload.put("action", "REMOVE");
        eventPayload.put("channelId", channelId);
        eventPayload.put("userId", userId);

        broadcastAccessChange(channelId, userId, eventPayload);

        return Map.of(
                "success", true,
                "message", "Access revoked for user " + userId + " from channel " + channelId
        );
    }

    /**
     * Checks if a user is revoked from a channel.
     */
    @Transactional(readOnly = true)
    public boolean isRevoked(String channelId, String userId) {
        return memberRepo.findByChannelIdAndUserId(channelId, userId)
                .map(m -> "REVOKED".equalsIgnoreCase(m.getStatus()))
                .orElse(false);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private void broadcastAccessChange(String channelId, String userId, Map<String, Object> payload) {
        try {
            messagingTemplate.convertAndSend("/topic/channel-access", payload);
            messagingTemplate.convertAndSend("/topic/user-" + userId, payload);
            messagingTemplate.convertAndSend("/topic/notifications." + userId, payload);
        } catch (Exception ex) {
            log.warn("[ChannelAccessService] WebSocket broadcast failed: {}", ex.getMessage());
        }
    }

    private String extractCourseCode(String channelId) {
        if (channelId == null) return "COURSE";
        if (channelId.startsWith("ch_")) {
            return channelId.substring(3).toUpperCase();
        }
        return channelId.toUpperCase();
    }

    private List<CourseChannelMember> seedInitialMembers(String channelId, String courseCode) {
        List<CourseChannelMember> seeded = new ArrayList<>();
        String safeCode = courseCode != null ? courseCode : extractCourseCode(channelId);

        // Seed 1 faculty member
        List<AppUser> faculties = userRepo.findByRole("FACULTY");
        if (!faculties.isEmpty()) {
            AppUser fac = faculties.get(0);
            CourseChannelMember m = new CourseChannelMember();
            m.setChannelId(channelId);
            m.setCourseCode(safeCode);
            m.setUserId(fac.getUserId());
            m.setUserName(fac.getFullName());
            m.setUserRole("FACULTY");
            m.setUserEmail(fac.getEmail());
            m.setStatus("ACTIVE");
            m.setAddedBy("SYSTEM");
            m.setUpdatedAt(Instant.now());
            seeded.add(memberRepo.save(m));
        }

        // Seed initial student members
        List<AppUser> students = userRepo.findByRole("STUDENT");
        for (AppUser stu : students) {
            CourseChannelMember m = new CourseChannelMember();
            m.setChannelId(channelId);
            m.setCourseCode(safeCode);
            m.setUserId(stu.getUserId());
            m.setUserName(stu.getFullName());
            m.setUserRole("STUDENT");
            m.setUserEmail(stu.getEmail());
            m.setStatus("ACTIVE");
            m.setAddedBy("SYSTEM");
            m.setUpdatedAt(Instant.now());
            seeded.add(memberRepo.save(m));
        }

        return seeded;
    }
}
