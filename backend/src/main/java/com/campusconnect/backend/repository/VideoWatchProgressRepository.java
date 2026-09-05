package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.VideoWatchProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * VideoWatchProgressRepository – persistence for video_watch_progress.
 *
 * MVC Role: Repository
 */
@Repository
public interface VideoWatchProgressRepository extends JpaRepository<VideoWatchProgress, Long> {
    Optional<VideoWatchProgress> findByLectureIdAndUserId(Long lectureId, String userId);
    List<VideoWatchProgress> findByUserId(String userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM VideoWatchProgress p WHERE p.lectureId = :lectureId")
    void deleteByLectureId(Long lectureId);
}
