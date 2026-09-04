package com.campusconnect.backend.service;

import com.campusconnect.backend.model.VideoLecture;
import com.campusconnect.backend.model.VideoWatchProgress;
import com.campusconnect.backend.repository.VideoLectureRepository;
import com.campusconnect.backend.repository.VideoWatchProgressRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * VideoLectureCatalogStore – keeps lectures on disk so H2 create-drop restarts
 * do not wipe the Video Lectures catalog.
 *
 * MVC Role: Service helper (video lecture feature)
 */
@Component
public class VideoLectureCatalogStore implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(VideoLectureCatalogStore.class);

    private final VideoLectureRepository lectureRepo;
    private final VideoWatchProgressRepository progressRepo;
    private final ObjectMapper mapper;
    private final Path storageDir;
    private final Path catalogFile;

    public VideoLectureCatalogStore(VideoLectureRepository lectureRepo,
                                    VideoWatchProgressRepository progressRepo) {
        this.lectureRepo = lectureRepo;
        this.progressRepo = progressRepo;
        this.mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        this.storageDir = Paths.get("uploads/video-lectures").toAbsolutePath().normalize();
        this.catalogFile = storageDir.resolve("catalog.json");
        try {
            Files.createDirectories(this.storageDir);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not create video lecture storage directory", ex);
        }
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        restoreIfEmpty();
    }

    @Transactional
    public void persistSnapshot() {
        CatalogSnapshot snapshot = new CatalogSnapshot();
        snapshot.lectures = lectureRepo.findAll().stream().map(CatalogLecture::from).toList();
        snapshot.progress = progressRepo.findAll().stream().map(CatalogProgress::from).toList();
        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(catalogFile.toFile(), snapshot);
        } catch (IOException ex) {
            log.warn("Could not write video lecture catalog: {}", ex.getMessage());
        }
    }

    private void restoreIfEmpty() {
        if (lectureRepo.count() > 0 || !Files.exists(catalogFile)) {
            return;
        }
        try {
            CatalogSnapshot snapshot = mapper.readValue(catalogFile.toFile(), CatalogSnapshot.class);
            if (snapshot.lectures == null) {
                return;
            }
            Map<Long, Long> idMap = new HashMap<>();
            for (CatalogLecture row : snapshot.lectures) {
                if (VideoLecture.SOURCE_UPLOAD.equals(row.sourceType) && row.storedFilename != null) {
                    Path file = storageDir.resolve(row.storedFilename).normalize();
                    if (!file.startsWith(storageDir) || !Files.exists(file)) {
                        log.warn("Skipping restored lecture '{}' because the file is missing", row.title);
                        continue;
                    }
                }
                VideoLecture lecture = row.toEntity();
                VideoLecture saved = lectureRepo.save(lecture);
                if (row.id != null) {
                    idMap.put(row.id, saved.getId());
                }
            }
            if (snapshot.progress != null) {
                for (CatalogProgress row : snapshot.progress) {
                    Long newLectureId = idMap.get(row.lectureId);
                    if (newLectureId == null) {
                        continue;
                    }
                    progressRepo.save(row.toEntity(newLectureId));
                }
            }
            log.info("Restored {} video lectures from disk catalog", idMap.size());
        } catch (IOException ex) {
            log.warn("Could not restore video lecture catalog: {}", ex.getMessage());
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class CatalogSnapshot {
        public List<CatalogLecture> lectures = new ArrayList<>();
        public List<CatalogProgress> progress = new ArrayList<>();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class CatalogLecture {
        public Long id;
        public String title;
        public String description;
        public String courseCode;
        public String courseName;
        public String sourceType;
        public String embedUrl;
        public String storedFilename;
        public String originalFilename;
        public String contentType;
        public Long fileSize;
        public String createdBy;
        public LocalDateTime createdAt;

        static CatalogLecture from(VideoLecture lecture) {
            CatalogLecture row = new CatalogLecture();
            row.id = lecture.getId();
            row.title = lecture.getTitle();
            row.description = lecture.getDescription();
            row.courseCode = lecture.getCourseCode();
            row.courseName = lecture.getCourseName();
            row.sourceType = lecture.getSourceType();
            row.embedUrl = lecture.getEmbedUrl();
            row.storedFilename = lecture.getStoredFilename();
            row.originalFilename = lecture.getOriginalFilename();
            row.contentType = lecture.getContentType();
            row.fileSize = lecture.getFileSize();
            row.createdBy = lecture.getCreatedBy();
            row.createdAt = lecture.getCreatedAt();
            return row;
        }

        VideoLecture toEntity() {
            VideoLecture lecture = new VideoLecture();
            lecture.setTitle(title);
            lecture.setDescription(description);
            lecture.setCourseCode(courseCode);
            lecture.setCourseName(courseName);
            lecture.setSourceType(sourceType);
            lecture.setEmbedUrl(embedUrl);
            lecture.setStoredFilename(storedFilename);
            lecture.setOriginalFilename(originalFilename);
            lecture.setContentType(contentType);
            lecture.setFileSize(fileSize);
            lecture.setCreatedBy(createdBy);
            lecture.setCreatedAt(createdAt != null ? createdAt : LocalDateTime.now());
            return lecture;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class CatalogProgress {
        public Long lectureId;
        public String userId;
        public Double positionSeconds;
        public Double durationSeconds;
        public Integer percentWatched;
        public boolean completed;
        public LocalDateTime updatedAt;

        static CatalogProgress from(VideoWatchProgress progress) {
            CatalogProgress row = new CatalogProgress();
            row.lectureId = progress.getLectureId();
            row.userId = progress.getUserId();
            row.positionSeconds = progress.getPositionSeconds();
            row.durationSeconds = progress.getDurationSeconds();
            row.percentWatched = progress.getPercentWatched();
            row.completed = progress.isCompleted();
            row.updatedAt = progress.getUpdatedAt();
            return row;
        }

        VideoWatchProgress toEntity(Long lectureId) {
            VideoWatchProgress progress = new VideoWatchProgress();
            progress.setLectureId(lectureId);
            progress.setUserId(userId);
            progress.setPositionSeconds(positionSeconds != null ? positionSeconds : 0);
            progress.setDurationSeconds(durationSeconds != null ? durationSeconds : 0);
            progress.setPercentWatched(percentWatched != null ? percentWatched : 0);
            progress.setCompleted(completed);
            progress.setUpdatedAt(updatedAt != null ? updatedAt : LocalDateTime.now());
            return progress;
        }
    }
}
