package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.AiChatRequest;
import com.campusconnect.backend.service.AiChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AiChatController – REST controller for the AI chatbot assistant.
 *
 * MVC Role: Controller
 *
 * Endpoint: POST /api/ai/chat
 * Access:   All authenticated roles (STUDENT, FACULTY, ADMIN)
 *
 * Security:
 *   - Requires valid JWT (enforced by Spring Security filter chain)
 *   - User identity is read from the JWT, not from the request body
 *   - The Anthropic API key never leaves the server
 */
@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    private final AiChatService aiChatService;

    public AiChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    /**
     * POST /api/ai/chat
     *
     * Accepts the user's message and optional conversation history.
     * Returns the assistant's reply, the classified topic, and a fallback flag.
     *
     * Request body: AiChatRequest { message, history[] }
     * Response:     { reply: String, topic: String, fallback: boolean }
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody AiChatRequest request) {
        // Extract user identity from the JWT (already validated by security filter)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();  // userId from JWT subject claim

        // Extract role from JWT authorities
        String role = auth.getAuthorities().stream()
            .map(a -> a.getAuthority())
            .filter(a -> a.startsWith("ROLE_"))
            .map(a -> a.substring(5))  // strip "ROLE_" prefix → STUDENT / FACULTY / ADMIN
            .findFirst()
            .orElse("STUDENT");

        Map<String, Object> result = aiChatService.chat(userId, role, request);
        return ResponseEntity.ok(result);
    }
}
