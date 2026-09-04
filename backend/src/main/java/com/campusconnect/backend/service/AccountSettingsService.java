package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.AccountProfileDTO;
import com.campusconnect.backend.dto.ChangePasswordRequest;
import com.campusconnect.backend.dto.UpdateProfileRequest;
import com.campusconnect.backend.dto.UpdateReminderPreferenceRequest;
import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.model.StudentProfile;
import com.campusconnect.backend.repository.AppUserRepository;
import com.campusconnect.backend.repository.StudentProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

/**
 * AccountSettingsService - Business logic for the Account Preferences and Settings feature.
 * MVC Role: Service
 */
@Service
public class AccountSettingsService {

    private final AppUserRepository        userRepo;
    private final StudentProfileRepository profileRepo;
    private final PasswordEncoder          passwordEncoder;

    public AccountSettingsService(AppUserRepository userRepo,
                                  StudentProfileRepository profileRepo,
                                  PasswordEncoder passwordEncoder) {
        this.userRepo        = userRepo;
        this.profileRepo     = profileRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public AccountProfileDTO getProfile(String userId) {
        AppUser user = userRepo.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found: " + userId));

        AccountProfileDTO dto = new AccountProfileDTO();
        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setIsAdvisor(user.getIsAdvisor());
        dto.setReminderHours(user.getReminderHours());

        if ("STUDENT".equalsIgnoreCase(user.getRole())) {
            Optional<StudentProfile> profileOpt = profileRepo.findById(userId);
            profileOpt.ifPresent(p -> {
                dto.setDepartment(p.getDepartment());
                dto.setYear(p.getYear());
                dto.setCgpa(p.getCgpa());
                dto.setCompletedCredits(p.getCompletedCredits());
                dto.setOnProbation(p.isOnProbation());
                dto.setCourseLimit(p.getCourseLimit());
                dto.setCreditLimit(p.getCreditLimit());
            });
        }

        return dto;
    }

    @Transactional
    public AccountProfileDTO updateProfile(String userId, UpdateProfileRequest req) {
        AppUser user = userRepo.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found: " + userId));

        if (req.getFullName() == null || req.getFullName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name is required.");
        }
        user.setFullName(req.getFullName().trim());

        if (req.getEmail() == null || req.getEmail().isBlank()
                || !req.getEmail().trim().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid email address is required.");
        }
        String newEmail = req.getEmail().trim().toLowerCase();
        if (!newEmail.equalsIgnoreCase(user.getEmail())) {
            boolean emailTaken = userRepo.findByEmail(newEmail)
                    .filter(other -> !other.getUserId().equals(userId))
                    .isPresent();
            if (emailTaken) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "Email is already in use by another account.");
            }
            user.setEmail(newEmail);
        }

        userRepo.save(user);
        profileRepo.findById(userId).ifPresent(profile -> {
            profile.setStudentName(user.getFullName());
            profile.setEmail(user.getEmail());
            profileRepo.save(profile);
        });
        return getProfile(userId);
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordRequest req) {
        AppUser user = userRepo.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found: " + userId));

        if (req.getCurrentPassword() == null
                || !passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Current password is incorrect.");
        }

        if (req.getNewPassword() == null || req.getNewPassword().length() < 8) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "New password must be at least 8 characters.");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepo.save(user);
    }

    @Transactional
    public void updateReminderPreference(String userId, UpdateReminderPreferenceRequest req) {
        AppUser user = userRepo.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));
        Integer hours = req.getReminderHours();
        if (hours == null || !java.util.Set.of(1, 6, 12, 24, 48).contains(hours)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reminder must be 1, 6, 12, 24, or 48 hours.");
        }
        user.setReminderHours(hours);
        userRepo.save(user);
    }
}
