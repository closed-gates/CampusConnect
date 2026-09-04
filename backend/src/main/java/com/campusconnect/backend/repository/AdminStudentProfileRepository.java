package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminStudentProfileRepository extends JpaRepository<StudentProfile, String> {}
