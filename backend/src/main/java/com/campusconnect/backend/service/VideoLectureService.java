package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.VideoLectureDTO;
import com.campusconnect.backend.dto.VideoProgressDTO;
import com.campusconnect.backend.dto.VideoProgressUpdateRequest;
import com.campusconnect.backend.model.VideoLecture;
import com.campusconnect.backend.model.VideoWatchProgress;
import com.campusconnect.backend.repository.VideoLectureRepository;
import com.campusconnect.backend.repository.VideoWatchProgressRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * VideoLectureService – create, stream, delete lectures and persist watch progress.
 *
 * MVC Role: Service
 */
@Service
public class VideoLectureService {

    public static final long MAX_UPLOAD_BYTES = 200L * 1024L * 1024L;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "video/mp4",
            "video/webm",
            "video/ogg",
            "video/quicktime",
            "video/x-matroska"
    );

    private final VideoLectureRepository lectureRepo;
    private final VideoWatchProgressRepository progressRepo;
    private final VideoLectureCatalogStore catalogStore;
    private final Path storageDir;

    public VideoLectureService(VideoLectureRepository lectureRepo,
                               VideoWatchProgressRepository progressRepo,
                               VideoLectureCatalogStore catalogStore) {
        this.lectureRepo = lectureRepo;
        this.progressRepo = progressRepo;
        this.catalogStore = catalogStore;
        this.storageDir = Paths.get("uploads/video-lectures").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageDir);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not create video lecture storage directory", ex);
        }
    }

    @Transactional(readOnly = true)
    public List<VideoLectureDTO> listLectures(String userId) {
        Map<Long, VideoWatchProgress> progressByLecture = progressRepo.findByUserId(userId).stream()
                .filter(progress -> progress.getLectureId() != null)
                .collect(Collectors.toMap(VideoWatchProgress::getLectureId, p -> p, (a, b) -> a));
        return lectureRepo.findAllByOrderByCreatedAtDesc().stream()
                .map(lecture -> toDto(lecture, progressByLecture.get(lecture.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public VideoLectureDTO getLecture(Long id, String userId) {
        VideoLecture lecture = requireLecture(id);
        VideoWatchProgress progress = progressRepo.findByLectureIdAndUserId(id, userId).orElse(null);
        return toDto(lecture, progress);
    }

    @Transactional
    public VideoLectureDTO createLecture(String title,
                                         String description,
                                         String courseCode,
                                         String courseName,
                                         String sourceType,
                                         String embedUrl,
                                         MultipartFile file,
                                         String createdBy) {
        if (!StringUtils.hasText(title)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required.");
        }

        String type = sourceType == null ? "" : sourceType.trim().toUpperCase(Locale.ROOT);
        VideoLecture lecture = new VideoLecture();
        lecture.setTitle(title.trim());
        lecture.setDescription(description);
        lecture.setCourseCode(courseCode);
        lecture.setCourseName(courseName);
        lecture.setCreatedBy(createdBy);
        lecture.setCreatedAt(LocalDateTime.now());

        if (VideoLecture.SOURCE_EMBED.equals(type)) {
            String normalized = normalizeEmbedUrl(embedUrl);
            lecture.setSourceType(VideoLecture.SOURCE_EMBED);
            lecture.setEmbedUrl(normalized);
        } else if (VideoLecture.SOURCE_UPLOAD.equals(type)) {
            storeUpload(lecture, file);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sourceType must be UPLOAD or EMBED.");
        }

        VideoLectureDTO created = toDto(lectureRepo.save(lecture), null);
        catalogStore.persistSnapshot();
        return created;
    }

    @Transactional
    public void deleteLecture(Long id) {
        VideoLecture lecture = requireLecture(id);
        progressRepo.deleteByLectureId(id);
        if (VideoLecture.SOURCE_UPLOAD.equals(lecture.getSourceType()) && lecture.getStoredFilename() != null) {
            Path file = storageDir.resolve(lecture.getStoredFilename()).normalize();
            if (file.startsWith(storageDir)) {
                try {
                    Files.deleteIfExists(file);
                } catch (IOException ignored) {
                    // Metadata is still removed so the lecture disappears from the catalog.
                }
            }
        }
        lectureRepo.delete(lecture);
        catalogStore.persistSnapshot();
    }

    public void streamLecture(Long id, HttpServletRequest request, HttpServletResponse response) throws IOException {
        VideoLecture lecture = requireLecture(id);
        if (!VideoLecture.SOURCE_UPLOAD.equals(lecture.getSourceType()) || lecture.getStoredFilename() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This lecture is an embed and has no uploaded file.");
        }
        Path file = storageDir.resolve(lecture.getStoredFilename()).normalize();
        if (!file.startsWith(storageDir) || !Files.exists(file)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Video file was not found on disk. Uploaded files do not survive Render restarts; re-upload the lecture or use a YouTube/Vimeo embed.");
        }
        String contentType = lecture.getContentType();
        if (contentType == null || contentType.isBlank() || !contentType.contains("/")) {
            contentType = "video/mp4";
        }
        writeRangedVideo(file, contentType, request, response);
    }

    private void writeRangedVideo(Path file, String contentType, HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        long length = Files.size(file);
        response.setHeader(HttpHeaders.ACCEPT_RANGES, "bytes");
        response.setContentType(contentType);

        String rangeHeader = request.getHeader(HttpHeaders.RANGE);
        if (rangeHeader == null || rangeHeader.isBlank()) {
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentLengthLong(length);
            Files.copy(file, response.getOutputStream());
            response.getOutputStream().flush();
            return;
        }

        String spec = rangeHeader.trim();
        if (!spec.startsWith("bytes=")) {
            response.setStatus(HttpServletResponse.SC_REQUESTED_RANGE_NOT_SATISFIABLE);
            response.setHeader(HttpHeaders.CONTENT_RANGE, "bytes */" + length);
            return;
        }
        spec = spec.substring(6);
        int comma = spec.indexOf(',');
        if (comma >= 0) {
            spec = spec.substring(0, comma);
        }
        int dash = spec.indexOf('-');
        if (dash < 0) {
            response.setStatus(HttpServletResponse.SC_REQUESTED_RANGE_NOT_SATISFIABLE);
            response.setHeader(HttpHeaders.CONTENT_RANGE, "bytes */" + length);
            return;
        }

        long start;
        long end = length - 1;
        try {
            String startPart = spec.substring(0, dash).trim();
            String endPart = spec.substring(dash + 1).trim();
            if (startPart.isEmpty()) {
                long suffix = Long.parseLong(endPart);
                start = Math.max(0, length - suffix);
            } else {
                start = Long.parseLong(startPart);
                if (!endPart.isEmpty()) {
                    end = Long.parseLong(endPart);
                }
            }
        } catch (NumberFormatException ex) {
            response.setStatus(HttpServletResponse.SC_REQUESTED_RANGE_NOT_SATISFIABLE);
            response.setHeader(HttpHeaders.CONTENT_RANGE, "bytes */" + length);
            return;
        }

        if (start < 0 || start >= length || end < start) {
            response.setStatus(HttpServletResponse.SC_REQUESTED_RANGE_NOT_SATISFIABLE);
            response.setHeader(HttpHeaders.CONTENT_RANGE, "bytes */" + length);
            return;
        }
        end = Math.min(end, length - 1);
        long contentLength = end - start + 1;
        response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
        response.setHeader(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + length);
        response.setContentLengthLong(contentLength);
        try (InputStream in = Files.newInputStream(file)) {
            in.skipNBytes(start);
            copyLimited(in, response.getOutputStream(), contentLength);
        }
    }

    private static void copyLimited(InputStream in, OutputStream out, long count) throws IOException {
        byte[] buffer = new byte[8192];
        long remaining = count;
        while (remaining > 0) {
            int read = in.read(buffer, 0, (int) Math.min(buffer.length, remaining));
            if (read < 0) {
                break;
            }
            out.write(buffer, 0, read);
            remaining -= read;
        }
        out.flush();
    }

    @Transactional
    public VideoProgressDTO saveProgress(Long lectureId, String userId, VideoProgressUpdateRequest request) {
        requireLecture(lectureId);
        if (request == null || request.getPositionSeconds() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "positionSeconds is required.");
        }

        double position = Math.max(0, request.getPositionSeconds());
        double duration = request.getDurationSeconds() == null ? 0 : Math.max(0, request.getDurationSeconds());
        int percent = duration > 0 ? (int) Math.min(100, Math.round((position / duration) * 100.0)) : 0;
        boolean completed = percent >= 95;

        VideoWatchProgress progress = progressRepo.findByLectureIdAndUserId(lectureId, userId)
                .orElseGet(() -> {
                    VideoWatchProgress created = new VideoWatchProgress();
                    created.setLectureId(lectureId);
                    created.setUserId(userId);
                    return created;
                });

        if (Boolean.TRUE.equals(progress.isCompleted())) {
            completed = true;
            percent = Math.max(percent, 100);
        }

        progress.setPositionSeconds(position);
        progress.setDurationSeconds(duration);
        progress.setPercentWatched(completed ? Math.max(percent, 95) : percent);
        progress.setCompleted(completed);
        progress.setUpdatedAt(LocalDateTime.now());
        progressRepo.save(progress);
        catalogStore.persistSnapshot();
        return toProgressDto(progress);
    }

    @Transactional(readOnly = true)
    public VideoProgressDTO getProgress(Long lectureId, String userId) {
        requireLecture(lectureId);
        return progressRepo.findByLectureIdAndUserId(lectureId, userId)
                .map(this::toProgressDto)
                .orElse(VideoProgressDTO.builder()
                        .lectureId(lectureId)
                        .userId(userId)
                        .positionSeconds(0.0)
                        .durationSeconds(0.0)
                        .percentWatched(0)
                        .completed(false)
                        .build());
    }

    private void storeUpload(VideoLecture lecture, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A video file is required for uploads.");
        }
        if (file.getSize() > MAX_UPLOAD_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Video files must be 200 MB or smaller.");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        String original = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "lecture.mp4");
        if (!ALLOWED_CONTENT_TYPES.contains(contentType) && !original.toLowerCase(Locale.ROOT).matches(".*\\.(mp4|webm|ogg|mov|mkv)$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only MP4, WebM, OGG, MOV, or MKV videos are allowed.");
        }
        String stored = UUID.randomUUID() + "_" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path target = storageDir.resolve(stored).normalize();
        if (!target.startsWith(storageDir)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name.");
        }
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store the video file.");
        }
        lecture.setSourceType(VideoLecture.SOURCE_UPLOAD);
        lecture.setStoredFilename(stored);
        lecture.setOriginalFilename(original);
        lecture.setContentType(contentType.isBlank() ? "video/mp4" : contentType);
        lecture.setFileSize(file.getSize());
    }

    static String normalizeEmbedUrl(String raw) {
        if (!StringUtils.hasText(raw)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "An embed URL is required.");
        }
        String url = raw.trim();
        if (!(url.startsWith("https://") || url.startsWith("http://"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Embed URL must start with http:// or https://.");
        }

        String youtubeId = extractYouTubeId(url);
        if (youtubeId != null) {
            return "https://www.youtube.com/embed/" + youtubeId + "?enablejsapi=1&rel=0";
        }
        String vimeoId = extractVimeoId(url);
        if (vimeoId != null) {
            return "https://player.vimeo.com/video/" + vimeoId;
        }
        return url;
    }

    private static String extractYouTubeId(String url) {
        boolean youtube = url.contains("youtu.be") || url.contains("youtube.com");
        if (!youtube) {
            return null;
        }
        try {
            if (url.contains("youtu.be/")) {
                String id = url.substring(url.indexOf("youtu.be/") + 9);
                int cut = indexOfQuery(id);
                id = cut >= 0 ? id.substring(0, cut) : id;
                return id.isBlank() ? null : id;
            }
            if (url.contains("youtube.com/embed/")) {
                String id = url.substring(url.indexOf("youtube.com/embed/") + 18);
                int cut = indexOfQuery(id);
                id = cut >= 0 ? id.substring(0, cut) : id;
                return id.isBlank() ? null : id;
            }
            if (url.contains("youtube.com/shorts/")) {
                String id = url.substring(url.indexOf("youtube.com/shorts/") + 19);
                int cut = indexOfQuery(id);
                id = cut >= 0 ? id.substring(0, cut) : id;
                return id.isBlank() ? null : id;
            }
            if (url.contains("v=")) {
                int start = url.indexOf("v=") + 2;
                String id = url.substring(start);
                int cut = indexOfQuery(id);
                id = cut >= 0 ? id.substring(0, cut) : id;
                return id.isBlank() ? null : id;
            }
        } catch (IndexOutOfBoundsException ignored) {
            return null;
        }
        return null;
    }

    private static String extractVimeoId(String url) {
        if (!url.contains("vimeo.com")) {
            return null;
        }
        String[] parts = url.split("/");
        if (parts.length == 0) {
            return null;
        }
        String last = parts[parts.length - 1];
        int cut = indexOfQuery(last);
        last = cut >= 0 ? last.substring(0, cut) : last;
        return last.matches("\\d+") ? last : null;
    }

    private static int indexOfQuery(String value) {
        int amp = value.indexOf('&');
        int q = value.indexOf('?');
        if (amp < 0) return q;
        if (q < 0) return amp;
        return Math.min(amp, q);
    }

    private VideoLecture requireLecture(Long id) {
        return lectureRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video lecture not found."));
    }

    private VideoLectureDTO toDto(VideoLecture lecture, VideoWatchProgress progress) {
        return VideoLectureDTO.builder()
                .id(lecture.getId())
                .title(lecture.getTitle())
                .description(lecture.getDescription())
                .courseCode(lecture.getCourseCode())
                .courseName(lecture.getCourseName())
                .sourceType(lecture.getSourceType())
                .embedUrl(lecture.getEmbedUrl())
                .originalFilename(lecture.getOriginalFilename())
                .contentType(lecture.getContentType())
                .fileSize(lecture.getFileSize())
                .createdBy(lecture.getCreatedBy())
                .createdAt(lecture.getCreatedAt())
                .positionSeconds(progress != null ? progress.getPositionSeconds() : 0.0)
                .durationSeconds(progress != null ? progress.getDurationSeconds() : 0.0)
                .percentWatched(progress != null ? progress.getPercentWatched() : 0)
                .completed(progress != null && progress.isCompleted())
                .build();
    }

    private VideoProgressDTO toProgressDto(VideoWatchProgress progress) {
        return VideoProgressDTO.builder()
                .lectureId(progress.getLectureId())
                .userId(progress.getUserId())
                .positionSeconds(progress.getPositionSeconds())
                .durationSeconds(progress.getDurationSeconds())
                .percentWatched(progress.getPercentWatched())
                .completed(progress.isCompleted())
                .build();
    }
}
