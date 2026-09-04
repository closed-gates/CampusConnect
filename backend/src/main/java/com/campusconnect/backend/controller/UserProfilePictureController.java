package com.campusconnect.backend.controller;

import com.campusconnect.backend.model.UserProfilePicture;
import com.campusconnect.backend.service.UserProfilePictureService;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/account/profile-picture")
public class UserProfilePictureController {
    private final UserProfilePictureService service;

    public UserProfilePictureController(UserProfilePictureService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<byte[]> get(Authentication authentication) {
        UserProfilePicture picture = service.get(authentication.getName());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(picture.getContentType()))
                .cacheControl(CacheControl.noStore())
                .body(picture.getImageData());
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> save(Authentication authentication,
                                     @RequestPart("file") MultipartFile file) {
        service.save(authentication.getName(), file);
        return ResponseEntity.noContent().build();
    }
}
