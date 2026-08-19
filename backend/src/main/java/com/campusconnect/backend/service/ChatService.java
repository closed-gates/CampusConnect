package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.AttachmentDto;
import com.campusconnect.backend.dto.ChatMessageDto;
import com.campusconnect.backend.model.ChatMessage;
import com.campusconnect.backend.repository.ChatMessageRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ChatService – Business logic for the Course Chat WebSocket feature.
 *
 * MVC Role: Service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ObjectMapper           objectMapper;

    /* ── Persistence ──────────────────────────────────────────────── */

    public ChatMessageDto persist(ChatMessageDto dto) {
        try {
            ChatMessage entity = toEntity(dto);
            ChatMessage saved  = chatMessageRepository.save(entity);
            log.debug("Persisted chat message id={} course={} sub={}",
                    saved.getId(), saved.getCourseId(), saved.getSubChannelId());
            return toDto(saved);
        } catch (Exception ex) {
            log.warn("Could not persist chat message (DB may be unavailable): {}", ex.getMessage());
            return dto.withTimestamp();
        }
    }

    /* ── History ──────────────────────────────────────────────────── */

    public List<ChatMessageDto> getHistory(String courseId, String subChannelId) {
        try {
            return chatMessageRepository
                    .findTop50ByCourseIdAndSubChannelIdOrderByCreatedAtAsc(courseId, subChannelId)
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            log.warn("Could not fetch chat history (DB may be unavailable): {}", ex.getMessage());
            return Collections.emptyList();
        }
    }

    /* ── Mapping helpers ──────────────────────────────────────────── */

    private ChatMessage toEntity(ChatMessageDto dto) {
        ChatMessage e = new ChatMessage();
        e.setCourseId(dto.courseId());
        e.setSubChannelId(dto.subChannelId());
        e.setAuthorId(dto.authorId());
        e.setAuthorName(dto.authorName());
        e.setAuthorRole(dto.authorRole() != null ? dto.authorRole() : "STUDENT");
        e.setContent(dto.content());
        if (dto.attachments() != null && !dto.attachments().isEmpty()) {
            try {
                e.setAttachmentsJson(objectMapper.writeValueAsString(dto.attachments()));
            } catch (Exception ex) {
                log.warn("Could not serialize attachments to JSON: {}", ex.getMessage());
            }
        }
        return e;
    }

    private ChatMessageDto toDto(ChatMessage e) {
        List<AttachmentDto> attachments = null;
        if (e.getAttachmentsJson() != null && !e.getAttachmentsJson().isBlank()) {
            try {
                attachments = objectMapper.readValue(e.getAttachmentsJson(), new TypeReference<>() {});
            } catch (Exception ex) {
                log.warn("Could not deserialize attachments JSON: {}", ex.getMessage());
            }
        }
        return new ChatMessageDto(
                e.getId(),
                e.getCourseId(),
                e.getSubChannelId(),
                e.getAuthorId(),
                e.getAuthorName(),
                e.getAuthorRole(),
                e.getContent(),
                e.getCreatedAt(),
                attachments
        );
    }
}
