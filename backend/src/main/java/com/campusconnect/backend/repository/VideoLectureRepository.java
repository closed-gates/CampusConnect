package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.VideoLecture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * VideoLectureRepository – Data Access Object for VideoLecture entities.
 *
 * MVC Role: Repository
 */
@Repository
public interface VideoLectureRepository extends JpaRepository<VideoLecture, Long> {
    List<VideoLecture> findByCourseCodeIn(List<String> courseCodes);
    List<VideoLecture> findByCourseCode(String courseCode);
}
