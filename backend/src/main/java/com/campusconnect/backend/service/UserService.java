package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.UserDto;
import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.repository.AppUserRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * UserService – Service layer for application user queries.
 *
 * MVC Role: Service
 */
@Service
public class UserService {

    private final AppUserRepository userRepo;

    public UserService(AppUserRepository userRepo) {
        this.userRepo = userRepo;
    }

    /**
     * Retrieve all registered users as safe DTOs (excluding password hashes).
     *
     * @param excludeUserId Optional userId to omit (e.g. Current logged-in user)
     * @return List of UserDto sorted by role and name
     */
    public List<UserDto> getAllUsers(String excludeUserId) {
        return userRepo.findAll().stream()
                .filter(u -> excludeUserId == null || excludeUserId.isBlank() || !excludeUserId.equalsIgnoreCase(u.getUserId()))
                .map(this::toDto)
                .sorted(Comparator.comparing(UserDto::getRole, (r1, r2) -> {
                    // Faculty first, then Students, then Admins
                    int rank1 = getRoleRank(r1);
                    int rank2 = getRoleRank(r2);
                    return Integer.compare(rank1, rank2);
                }).thenComparing(UserDto::getFullName, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    private int getRoleRank(String role) {
        if (role == null) return 99;
        switch (role.toUpperCase()) {
            case "FACULTY": return 1;
            case "STUDENT": return 2;
            case "ADMIN":   return 3;
            default:        return 4;
        }
    }

    private UserDto toDto(AppUser user) {
        return new UserDto(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isAdvisor()
        );
    }
}
