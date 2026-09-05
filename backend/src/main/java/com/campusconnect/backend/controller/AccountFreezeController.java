package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.AccountFreezeDTO;
import com.campusconnect.backend.service.AccountFreezeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/account-freezes")
public class AccountFreezeController {
    private final AccountFreezeService service;

    public AccountFreezeController(AccountFreezeService service) {
        this.service = service;
    }

    @GetMapping
    public List<AccountFreezeDTO> list(Authentication authentication) {
        return service.listManageableAccounts(authentication.getName());
    }

    @GetMapping("/me")
    public Map<String, Boolean> currentAccountState(Authentication authentication) {
        return Map.of("frozen", service.isFrozen(authentication.getName()));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<AccountFreezeDTO> setFrozen(@PathVariable String userId,
                                                       @RequestBody Map<String, Boolean> body,
                                                       Authentication authentication) {
        return ResponseEntity.ok(service.setFrozen(authentication.getName(), userId,
                Boolean.TRUE.equals(body.get("frozen"))));
    }
}
