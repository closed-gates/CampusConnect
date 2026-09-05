package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.StudentNotificationCursor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentNotificationCursorRepository extends JpaRepository<StudentNotificationCursor, String> {
}
