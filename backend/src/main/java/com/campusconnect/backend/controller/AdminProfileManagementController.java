package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.AdminManagedProfileDTO;
import com.campusconnect.backend.dto.AdminProfileUpdateRequest;
import com.campusconnect.backend.model.UserProfilePicture;
import com.campusconnect.backend.service.AdminProfileManagementService;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin/profile-management")
public class AdminProfileManagementController {
    private final AdminProfileManagementService service;

    public AdminProfileManagementController(AdminProfileManagementService service) { this.service = service; }

    @GetMapping("/{userId}")
    public AdminManagedProfileDTO find(Authentication auth, @PathVariable String userId) {
        requireAdmin(auth); return service.find(userId);
    }

    @PutMapping("/{userId}")
    public AdminManagedProfileDTO update(Authentication auth, @PathVariable String userId,
                                         @RequestBody AdminProfileUpdateRequest request) {
        requireAdmin(auth); return service.update(userId, request);
    }

    @GetMapping("/{userId}/profile-picture")
    public ResponseEntity<byte[]> picture(Authentication auth, @PathVariable String userId) {
        requireAdmin(auth);
        UserProfilePicture picture = service.getPicture(userId);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(picture.getContentType()))
                .cacheControl(CacheControl.noStore()).body(picture.getImageData());
    }

    @PutMapping(value = "/{userId}/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> savePicture(Authentication auth, @PathVariable String userId,
                                            @RequestPart("file") MultipartFile file) {
        requireAdmin(auth); service.savePicture(userId, file); return ResponseEntity.noContent().build();
    }

    private void requireAdmin(Authentication auth) {
        boolean admin = auth != null && auth.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (!admin) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Administrator access required.");
    }
}
