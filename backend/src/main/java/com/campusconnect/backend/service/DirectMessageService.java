package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.AttachmentDto;
import com.campusconnect.backend.dto.DirectMessageDto;
import com.campusconnect.backend.model.DirectMessage;
import com.campusconnect.backend.repository.DirectMessageRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DirectMessageService – Business logic for the Direct Messaging feature.
 *
 * MVC Role: Service
 *
 * Responsibilities:
 *   1. persist(dto)    — save an inbound DM to the database; return a stamped DTO
 *   2. getHistory(roomId) — retrieve last 100 messages for a conversation room
 *
 * All DB operations are best-effort: if the database is unavailable the service
 * logs a warning and returns an empty list / timestamp-only DTO so the broadcast
 * can still proceed and messages still reach connected clients in real time.
 *
 * Feature: Real-Time Direct Messaging via WebSockets
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DirectMessageService {

    private final DirectMessageRepository directMessageRepository;
    private final ObjectMapper            objectMapper;

    /* ── Persistence ──────────────────────────────────────────────── */

    /**
     * Persists the inbound direct message and returns a DTO with the
     * backend-assigned id and createdAt timestamp populated.
     *
     * @param dto inbound message from the STOMP client
     * @return saved DTO (with id + createdAt) or a timestamp-only DTO on DB error
     */
    public DirectMessageDto persist(DirectMessageDto dto) {
        try {
            DirectMessage entity = toEntity(dto);
            DirectMessage saved  = directMessageRepository.save(entity);
            log.debug("Persisted DM id={} room={} sender={}", saved.getId(), saved.getRoomId(), saved.getSenderId());
            return toDto(saved);
        } catch (Exception ex) {
            log.warn("Could not persist direct message (DB may be unavailable): {}", ex.getMessage());
            return dto.withTimestamp();
        }
    }

    /* ── History ──────────────────────────────────────────────────── */

    /**
     * Retrieves the last 100 messages for a conversation room, oldest-first.
     *
     * @param roomId deterministic room ID shared by both participants
     * @return list of up to 100 messages, or empty list on DB error
     */
    public List<DirectMessageDto> getHistory(String roomId) {
        try {
            return directMessageRepository
                    .findTop100ByRoomIdOrderByCreatedAtAsc(roomId)
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            log.warn("Could not fetch DM history for room={}: {}", roomId, ex.getMessage());
            return Collections.emptyList();
        }
    }

    /* ── Mapping helpers ──────────────────────────────────────────── */

    private DirectMessage toEntity(DirectMessageDto dto) {
        DirectMessage e = new DirectMessage();
        e.setRoomId(dto.roomId() != null ? dto.roomId() : "");
        e.setSenderId(dto.senderId() != null ? dto.senderId() : "");
        e.setSenderName(dto.senderName() != null ? dto.senderName() : dto.senderId());
        e.setSenderRole(dto.senderRole() != null ? dto.senderRole() : "STUDENT");
        e.setRecipientId(dto.recipientId() != null ? dto.recipientId() : "");
        e.setRecipientName(dto.recipientName() != null ? dto.recipientName() : dto.recipientId());
        e.setRecipientRole(dto.recipientRole() != null ? dto.recipientRole() : "STUDENT");
        e.setContent(dto.content());

        if (dto.attachments() != null && !dto.attachments().isEmpty()) {
            try {
                e.setAttachmentsJson(objectMapper.writeValueAsString(dto.attachments()));
            } catch (Exception ex) {
                log.warn("Could not serialize DM attachments: {}", ex.getMessage());
            }
        }
        return e;
    }

    private DirectMessageDto toDto(DirectMessage e) {
        List<AttachmentDto> attachments = null;
        if (e.getAttachmentsJson() != null && !e.getAttachmentsJson().isBlank()) {
            try {
                attachments = objectMapper.readValue(e.getAttachmentsJson(), new TypeReference<>() {});
            } catch (Exception ex) {
                log.warn("Could not deserialize DM attachments JSON: {}", ex.getMessage());
            }
        }
        return new DirectMessageDto(
                e.getId(),
                e.getRoomId(),
                e.getSenderId(),
                e.getSenderName(),
                e.getSenderRole(),
                e.getRecipientId(),
                e.getRecipientName(),
                e.getRecipientRole(),
                e.getContent(),
                attachments,
                e.getCreatedAt()
        );
    }
}
