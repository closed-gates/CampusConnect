package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.VideoLecture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * VideoLectureRepository – persistence for video_lectures.
 *
 * MVC Role: Repository
 */
@Repository
public interface VideoLectureRepository extends JpaRepository<VideoLecture, Long> {
    List<VideoLecture> findAllByOrderByCreatedAtDesc();
}
