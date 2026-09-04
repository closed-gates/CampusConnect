package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.InAppNotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InAppNotificationPreferenceRepository
        extends JpaRepository<InAppNotificationPreference, String> {}
