package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.AccountFreezeDTO;
import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.repository.AppUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
public class AccountFreezeService {
    private final AppUserRepository userRepository;

    public AccountFreezeService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AccountFreezeDTO> listManageableAccounts(String adminId) {
        requireAdmin(adminId);
        return userRepository.findAll().stream()
                .filter(user -> "STUDENT".equalsIgnoreCase(user.getRole()) || "FACULTY".equalsIgnoreCase(user.getRole()))
                .sorted(Comparator.comparing(AppUser::getRole).thenComparing(AppUser::getFullName, String.CASE_INSENSITIVE_ORDER))
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public AccountFreezeDTO setFrozen(String adminId, String userId, boolean frozen) {
        requireAdmin(adminId);
        AppUser target = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found: " + userId));
        if (!("STUDENT".equalsIgnoreCase(target.getRole()) || "FACULTY".equalsIgnoreCase(target.getRole()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only student and faculty accounts can be frozen.");
        }
        target.setActive(!frozen);
        return toDto(userRepository.save(target));
    }

    private void requireAdmin(String userId) {
        AppUser requester = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found."));
        if (!"ADMIN".equalsIgnoreCase(requester.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Administrator access is required.");
        }
    }

    private AccountFreezeDTO toDto(AppUser user) {
        return new AccountFreezeDTO(user.getUserId(), user.getFullName(), user.getEmail(), user.getRole(), !user.isActive());
    }
}
