package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.AdminManagedProfileDTO;
import com.campusconnect.backend.dto.AdminProfileUpdateRequest;
import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.model.StudentProfile;
import com.campusconnect.backend.model.UserProfilePicture;
import com.campusconnect.backend.repository.AdminProfilePictureRepository;
import com.campusconnect.backend.repository.AdminProfileRepository;
import com.campusconnect.backend.repository.AdminStudentProfileRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Set;

@Service
public class AdminProfileManagementService {
    private static final long MAX_IMAGE_SIZE = 2L * 1024L * 1024L;
    private static final Set<String> ROLES = Set.of("STUDENT", "FACULTY", "ADMIN");

    private final AdminProfileRepository users;
    private final AdminStudentProfileRepository students;
    private final AdminProfilePictureRepository pictures;

    public AdminProfileManagementService(AdminProfileRepository users,
                                         AdminStudentProfileRepository students,
                                         AdminProfilePictureRepository pictures) {
        this.users = users;
        this.students = students;
        this.pictures = pictures;
    }

    public AdminManagedProfileDTO find(String userId) {
        AppUser user = requireUser(userId);
        StudentProfile student = students.findById(user.getUserId()).orElse(null);
        return toDto(user, student);
    }

    @Transactional
    public AdminManagedProfileDTO update(String userId, AdminProfileUpdateRequest request) {
        AppUser user = requireUser(userId);
        String name = request.getFullName() == null ? "" : request.getFullName().trim();
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        String role = request.getRole() == null ? "" : request.getRole().trim().toUpperCase();
        if (name.isBlank()) throw badRequest("Full name is required.");
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) throw badRequest("A valid email is required.");
        if (!ROLES.contains(role)) throw badRequest("Role must be STUDENT, FACULTY, or ADMIN.");
        users.findByEmailIgnoreCase(email)
                .filter(other -> !other.getUserId().equalsIgnoreCase(user.getUserId()))
                .ifPresent(other -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use."); });

        user.setFullName(name);
        user.setEmail(email);
        user.setRole(role);
        user.setIsAdvisor("FACULTY".equals(role) && Boolean.TRUE.equals(request.getIsAdvisor()));
        users.save(user);

        StudentProfile student = students.findById(user.getUserId()).orElse(null);
        if (student != null) {
            student.setStudentName(name);
            student.setEmail(email);
            if (request.getDepartment() != null && !request.getDepartment().isBlank()) student.setDepartment(request.getDepartment().trim());
            if (request.getYear() != null) {
                if (request.getYear() < 1 || request.getYear() > 4) throw badRequest("Year must be between 1 and 4.");
                student.setYear(request.getYear());
            }
            if (request.getCgpa() != null) {
                if (request.getCgpa() < 0 || request.getCgpa() > 4) throw badRequest("CGPA must be between 0 and 4.");
                student.setCgpa(request.getCgpa());
                student.setOnProbation(request.getCgpa() < StudentProfile.CGPA_MIN_THRESHOLD);
            }
            if (request.getCompletedCredits() != null) {
                if (request.getCompletedCredits() < 0) throw badRequest("Completed credits cannot be negative.");
                student.setCompletedCredits(request.getCompletedCredits());
            }
            students.save(student);
        }
        return toDto(user, student);
    }

    public UserProfilePicture getPicture(String userId) {
        requireUser(userId);
        return pictures.findById(userId.toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile picture not found."));
    }

    @Transactional
    public void savePicture(String userId, MultipartFile file) {
        AppUser user = requireUser(userId);
        String contentType = file.getContentType();
        if (file.isEmpty() || file.getSize() > MAX_IMAGE_SIZE || contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw badRequest("Profile photo must be an image smaller than 2 MB.");
        }
        try {
            pictures.save(new UserProfilePicture(user.getUserId(), contentType, file.getBytes()));
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read uploaded image.", exception);
        }
    }

    private AppUser requireUser(String userId) {
        String normalized = userId == null ? "" : userId.trim();
        if (normalized.isBlank()) throw badRequest("User ID is required.");
        return users.findByUserIdIgnoreCase(normalized)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + normalized));
    }

    private AdminManagedProfileDTO toDto(AppUser user, StudentProfile student) {
        AdminManagedProfileDTO dto = new AdminManagedProfileDTO();
        dto.setUserId(user.getUserId()); dto.setFullName(user.getFullName()); dto.setEmail(user.getEmail());
        dto.setRole(user.getRole()); dto.setCreatedAt(user.getCreatedAt()); dto.setIsAdvisor(user.getIsAdvisor());
        if (student != null) {
            dto.setDepartment(student.getDepartment()); dto.setYear(student.getYear()); dto.setCgpa(student.getCgpa());
            dto.setCompletedCredits(student.getCompletedCredits());
        }
        return dto;
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
