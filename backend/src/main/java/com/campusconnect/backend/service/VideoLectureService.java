package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.VideoLectureDto;
import com.campusconnect.backend.dto.WatchProgressDto;
import com.campusconnect.backend.model.VideoLecture;
import com.campusconnect.backend.model.WatchProgress;
import com.campusconnect.backend.repository.VideoLectureRepository;
import com.campusconnect.backend.repository.WatchProgressRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * VideoLectureService – Business logic for video lecture streaming & watch progress.
 *
 * MVC Role: Service
 */
@Service
public class VideoLectureService {

    private final VideoLectureRepository lectureRepository;
    private final WatchProgressRepository progressRepository;
    private final RegistrationService registrationService;

    public VideoLectureService(VideoLectureRepository lectureRepository,
                               WatchProgressRepository progressRepository,
                               RegistrationService registrationService) {
        this.lectureRepository = lectureRepository;
        this.progressRepository = progressRepository;
        this.registrationService = registrationService;
    }

    @PostConstruct
    public void seedInitialLectures() {
        if (lectureRepository.count() == 0) {
            List<VideoLecture> seeds = List.of(
                new VideoLecture(
                    "Lecture 1: Introduction to Software Architecture & MVC Pattern",
                    "CSE470",
                    "Overview of modern web architectural patterns, strict MVC separation, and client-server decoupling.",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                    "Dr. Sadia Kazi",
                    596
                ),
                new VideoLecture(
                    "Lecture 2: System Requirements & Agile Workflow",
                    "CSE470",
                    "Deep dive into user stories, operational constraints, feature isolation, and documentation.",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                    "Dr. Sadia Kazi",
                    653
                ),
                new VideoLecture(
                    "Lecture 1: Syntax Analysis & Lexical Parsing",
                    "CSE420",
                    "Introduction to lexical analyzer generators, finite automata, and context-free grammars.",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                    "Prof. Mahbub Alam",
                    480
                ),
                new VideoLecture(
                    "Lecture 1: Programming Fundamentals & Loops",
                    "CSE110",
                    "Basic control structures, conditional branching, iteration, and algorithmic thinking in Java.",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                    "Lecturer Ahmed Hossain",
                    720
                )
            );
            lectureRepository.saveAll(seeds);
        }
    }

    /**
     * Get lectures for a user.
     * If user is a student, filter lectures to ONLY include courses the student is enrolled in.
     */
    public List<VideoLectureDto> getLectures(String studentId, String userRole, String courseCodeFilter) {
        List<VideoLecture> rawLectures;

        if ("student".equalsIgnoreCase(userRole) && studentId != null && !studentId.isBlank()) {
            // Fetch enrolled section registrations
            List<Map<String, Object>> myRegs = registrationService.getStudentRegistrations(studentId);
            Set<String> enrolledCourses = myRegs.stream()
                    .map(reg -> {
                        String sectionId = (String) reg.get("sectionId"); // e.g. "CSE470-01"
                        if (sectionId != null && sectionId.contains("-")) {
                            return sectionId.split("-")[0];
                        }
                        return (String) reg.get("courseCode");
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            // Default fallback if no registrations exist yet in DB so student gets demo courses (CSE470, CSE110)
            if (enrolledCourses.isEmpty()) {
                enrolledCourses.add("CSE470");
                enrolledCourses.add("CSE110");
            }

            if (courseCodeFilter != null && !courseCodeFilter.isBlank() && !"all".equalsIgnoreCase(courseCodeFilter)) {
                if (enrolledCourses.contains(courseCodeFilter)) {
                    rawLectures = lectureRepository.findByCourseCode(courseCodeFilter);
                } else {
                    rawLectures = Collections.emptyList();
                }
            } else {
                rawLectures = lectureRepository.findByCourseCodeIn(new ArrayList<>(enrolledCourses));
            }
        } else {
            // Faculty / Admin can view all lectures
            if (courseCodeFilter != null && !courseCodeFilter.isBlank() && !"all".equalsIgnoreCase(courseCodeFilter)) {
                rawLectures = lectureRepository.findByCourseCode(courseCodeFilter);
            } else {
                rawLectures = lectureRepository.findAll();
            }
        }

        // Map progress if studentId is supplied
        Map<Long, WatchProgress> progressMap = new HashMap<>();
        if (studentId != null && !studentId.isBlank()) {
            List<WatchProgress> progressList = progressRepository.findByStudentId(studentId);
            for (WatchProgress wp : progressList) {
                progressMap.put(wp.getVideoLectureId(), wp);
            }
        }

        return rawLectures.stream().map(lec -> {
            VideoLectureDto dto = new VideoLectureDto(
                lec.getId(),
                lec.getTitle(),
                lec.getCourseCode(),
                lec.getDescription(),
                lec.getVideoUrl(),
                lec.getTeacherName(),
                lec.getDurationSeconds(),
                lec.getCreatedAt()
            );
            WatchProgress wp = progressMap.get(lec.getId());
            if (wp != null) {
                dto.setLastPositionSeconds(wp.getLastPositionSeconds());
                dto.setPercentage(wp.getPercentage());
                dto.setCompleted(wp.getCompleted());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Upload a new video lecture.
     */
    @Transactional
    public VideoLectureDto uploadLecture(VideoLectureDto dto) {
        VideoLecture lecture = new VideoLecture(
            dto.getTitle(),
            dto.getCourseCode().toUpperCase(),
            dto.getDescription(),
            dto.getVideoUrl(),
            dto.getTeacherName() != null ? dto.getTeacherName() : "Faculty Instructor",
            dto.getDurationSeconds() != null ? dto.getDurationSeconds() : 600
        );
        VideoLecture saved = lectureRepository.save(lecture);
        return new VideoLectureDto(
            saved.getId(),
            saved.getTitle(),
            saved.getCourseCode(),
            saved.getDescription(),
            saved.getVideoUrl(),
            saved.getTeacherName(),
            saved.getDurationSeconds(),
            saved.getCreatedAt()
        );
    }

    /**
     * Delete a video lecture.
     */
    @Transactional
    public void deleteLecture(Long id) {
        lectureRepository.deleteById(id);
    }

    /**
     * Update watch progress for a student.
     */
    @Transactional
    public WatchProgress updateProgress(WatchProgressDto dto) {
        String studentId = dto.getStudentId() != null ? dto.getStudentId() : "STU001";
        Long videoId = dto.getVideoLectureId();
        int pos = dto.getLastPositionSeconds() != null ? dto.getLastPositionSeconds() : 0;
        int total = dto.getTotalDurationSeconds() != null && dto.getTotalDurationSeconds() > 0 ? dto.getTotalDurationSeconds() : 600;

        double pct = Math.min(100.0, Math.round(((double) pos / total) * 100.0 * 10.0) / 10.0);
        boolean completed = pct >= 90.0;

        Optional<WatchProgress> existing = progressRepository.findByStudentIdAndVideoLectureId(studentId, videoId);
        WatchProgress progress;
        if (existing.isPresent()) {
            progress = existing.get();
            progress.setLastPositionSeconds(pos);
            progress.setPercentage(pct);
            if (completed) progress.setCompleted(true);
            progress.setUpdatedAt(LocalDateTime.now());
        } else {
            progress = new WatchProgress(studentId, videoId, pos, pct, completed);
        }
        return progressRepository.save(progress);
    }
}
