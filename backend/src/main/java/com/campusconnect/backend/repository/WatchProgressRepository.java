package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.WatchProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * WatchProgressRepository – Data Access Object for WatchProgress entities.
 *
 * MVC Role: Repository
 */
@Repository
public interface WatchProgressRepository extends JpaRepository<WatchProgress, Long> {
    Optional<WatchProgress> findByStudentIdAndVideoLectureId(String studentId, Long videoLectureId);
    List<WatchProgress> findByStudentId(String studentId);
}
