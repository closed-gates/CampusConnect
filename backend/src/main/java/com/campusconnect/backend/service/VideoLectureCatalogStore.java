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
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
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
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper mapper;
    private final Path storageDir;
    private final Path catalogFile;

    public VideoLectureCatalogStore(VideoLectureRepository lectureRepo,
                                    VideoWatchProgressRepository progressRepo,
                                    JdbcTemplate jdbcTemplate) {
        this.lectureRepo = lectureRepo;
        this.progressRepo = progressRepo;
        this.jdbcTemplate = jdbcTemplate;
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
    public void run(ApplicationArguments args) {
        ensureSchema();
        restoreIfEmpty();
    }

    /**
     * Neon/prod may not have had these tables if Hibernate update did not run.
     * CREATE IF NOT EXISTS is safe on PostgreSQL and H2.
     * Runs outside any active transaction (NOT_SUPPORTED) so a DDL failure
     * does not leave a PostgreSQL transaction in an error state.
     */
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void ensureSchema() {
        try {
            jdbcTemplate.execute((ConnectionCallback<Void>) connection -> {
                boolean previous = connection.getAutoCommit();
                connection.setAutoCommit(true);
                try (var statement = connection.createStatement()) {
                    statement.execute("""
                            CREATE TABLE IF NOT EXISTS video_lectures (
                                id BIGSERIAL PRIMARY KEY,
                                title VARCHAR(300) NOT NULL,
                                description TEXT,
                                course_code VARCHAR(20),
                                course_name VARCHAR(200),
                                source_type VARCHAR(20) NOT NULL,
                                embed_url VARCHAR(1000),
                                stored_filename VARCHAR(400),
                                original_filename VARCHAR(400),
                                content_type VARCHAR(120),
                                file_size BIGINT,
                                created_by VARCHAR(100),
                                created_at TIMESTAMP
                            )
                            """);
                    statement.execute("""
                            CREATE TABLE IF NOT EXISTS video_watch_progress (
                                id BIGSERIAL PRIMARY KEY,
                                lecture_id BIGINT NOT NULL,
                                user_id VARCHAR(80) NOT NULL,
                                position_seconds DOUBLE PRECISION NOT NULL DEFAULT 0,
                                duration_seconds DOUBLE PRECISION NOT NULL DEFAULT 0,
                                percent_watched INTEGER NOT NULL DEFAULT 0,
                                completed BOOLEAN NOT NULL DEFAULT FALSE,
                                updated_at TIMESTAMP
                            )
                            """);
                    statement.execute("""
                            CREATE UNIQUE INDEX IF NOT EXISTS uk_vl_progress_lecture_user
                            ON video_watch_progress (lecture_id, user_id)
                            """);
                } finally {
                    connection.setAutoCommit(previous);
                }
                return null;
            });
        } catch (Exception ex) {
            log.warn("Could not ensure video lecture tables exist: {}", ex.getMessage());
        }
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

    @Transactional
    public void restoreIfEmpty() {
        try {
            if (lectureRepo.count() > 0 || !Files.exists(catalogFile)) {
                return;
            }
        } catch (DataAccessException ex) {
            log.warn("Video lecture restore skipped: {}", ex.getMessage());
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
