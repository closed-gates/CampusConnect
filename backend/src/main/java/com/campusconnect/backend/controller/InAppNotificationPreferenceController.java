package com.campusconnect.backend.controller;

import com.campusconnect.backend.model.InAppNotificationPreference;
import com.campusconnect.backend.service.InAppNotificationPreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/account/preferences/in-app-notifications")
public class InAppNotificationPreferenceController {
    private final InAppNotificationPreferenceService service;

    public InAppNotificationPreferenceController(InAppNotificationPreferenceService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<InAppNotificationPreference> get(Authentication authentication) {
        return ResponseEntity.ok(service.get(authentication.getName()));
    }

    @PutMapping
    public ResponseEntity<InAppNotificationPreference> update(Authentication authentication,
                                                               @RequestBody Map<String, Boolean> values) {
        return ResponseEntity.ok(service.update(authentication.getName(), values));
    }
}
