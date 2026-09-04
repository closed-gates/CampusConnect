package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.UserProfilePicture;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminProfilePictureRepository extends JpaRepository<UserProfilePicture, String> {}
