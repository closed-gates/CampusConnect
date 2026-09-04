package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.AccountProfileDTO;
import com.campusconnect.backend.dto.ChangePasswordRequest;
import com.campusconnect.backend.dto.UpdateProfileRequest;
import com.campusconnect.backend.dto.UpdateReminderPreferenceRequest;
import com.campusconnect.backend.service.AccountSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * AccountSettingsController - REST endpoints for Account Preferences and Settings.
 * MVC Role: Controller
 *
 * The account identity always comes from the validated JWT principal.
 */
@RestController
@RequestMapping("/api/account")
public class AccountSettingsController {

    private final AccountSettingsService service;

    public AccountSettingsController(AccountSettingsService service) {
        this.service = service;
    }

    @GetMapping("/profile")
    public ResponseEntity<AccountProfileDTO> getProfile(Authentication authentication) {
        return ResponseEntity.ok(service.getProfile(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<AccountProfileDTO> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(service.updateProfile(authentication.getName(), req));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest req) {
        service.changePassword(authentication.getName(), req);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/preferences/reminder")
    public ResponseEntity<Void> updateReminderPreference(
            Authentication authentication,
            @RequestBody UpdateReminderPreferenceRequest req) {
        service.updateReminderPreference(authentication.getName(), req);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleAccountError(ResponseStatusException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", ex.getStatusCode().value());
        body.put("error", ex.getStatusCode().toString());
        body.put("message", ex.getReason());
        body.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }
}
