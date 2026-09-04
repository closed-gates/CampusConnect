package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.ClubPanelAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClubPanelAssignmentRepository extends JpaRepository<ClubPanelAssignment, Long> {
    List<ClubPanelAssignment> findByStudentIdIgnoreCaseOrderByClubName(String studentId);
    boolean existsByStudentIdIgnoreCaseAndClubNameIgnoreCase(String studentId, String clubName);
}
