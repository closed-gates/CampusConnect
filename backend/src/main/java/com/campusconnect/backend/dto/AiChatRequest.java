package com.campusconnect.backend.dto;

import java.util.List;

/**
 * AiChatRequest – DTO for the AI chatbot endpoint.
 *
 * MVC Role: DTO
 *
 * Carries the user's message and optional conversation history
 * (for multi-turn context) to POST /api/ai/chat.
 */
public class AiChatRequest {

    /** The current message from the user */
    private String message;

    /**
     * Previous turns in the conversation.
     * Each entry has "role" (user|assistant) and "content" (text).
     * Frontend sends up to the last N turns for short-term memory.
     */
    private List<Turn> history;

    // ── Getters & Setters ─────────────────────────────────────────
    public String getMessage()                  { return message; }
    public void   setMessage(String message)    { this.message = message; }

    public List<Turn> getHistory()              { return history; }
    public void       setHistory(List<Turn> h)  { this.history = h; }

    // ── Inner class for conversation turns ───────────────────────
    public static class Turn {
        private String role;     // "user" or "assistant"
        private String content;

        public String getRole()               { return role; }
        public void   setRole(String role)    { this.role = role; }

        public String getContent()            { return content; }
        public void   setContent(String c)    { this.content = c; }
    }
}
