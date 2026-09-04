package com.campusconnect.backend.service;

import com.campusconnect.backend.model.UserProfilePicture;
import com.campusconnect.backend.repository.AppUserRepository;
import com.campusconnect.backend.repository.UserProfilePictureRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
public class UserProfilePictureService {
    public static final long MAX_SIZE = 2L * 1024L * 1024L;

    private final UserProfilePictureRepository pictureRepository;
    private final AppUserRepository userRepository;

    public UserProfilePictureService(UserProfilePictureRepository pictureRepository,
                                     AppUserRepository userRepository) {
        this.pictureRepository = pictureRepository;
        this.userRepository = userRepository;
    }

    public UserProfilePicture get(String userId) {
        return pictureRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile picture not found"));
    }

    @Transactional
    public void save(String userId, MultipartFile file) {
        if (!userRepository.existsByUserId(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        String contentType = file.getContentType();
        if (file.isEmpty() || file.getSize() > MAX_SIZE || contentType == null
                || !contentType.toLowerCase().startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Profile photo must be an image smaller than 2 MB.");
        }
        try {
            pictureRepository.save(new UserProfilePicture(userId, contentType, file.getBytes()));
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read uploaded image", ex);
        }
    }
}
