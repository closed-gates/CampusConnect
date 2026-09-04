package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.CourseMaterialDTO;
import com.campusconnect.backend.model.CourseMaterial;
import com.campusconnect.backend.repository.CourseMaterialRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * CourseMaterialService – upload, list, download, and delete course files.
 *
 * MVC Role: Service
 */
@Service
public class CourseMaterialService {

    public static final long MAX_UPLOAD_BYTES = 25L * 1024L * 1024L;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx",
            "txt", "csv", "zip", "png", "jpg", "jpeg", "gif", "webp"
    );

    private final CourseMaterialRepository materialRepo;
    private final CourseMaterialCatalogStore catalogStore;
    private final Path storageDir;

    public CourseMaterialService(CourseMaterialRepository materialRepo,
                                 CourseMaterialCatalogStore catalogStore) {
        this.materialRepo = materialRepo;
        this.catalogStore = catalogStore;
        this.storageDir = Paths.get("uploads/course-materials").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageDir);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not create course materials storage directory", ex);
        }
    }

    @Transactional(readOnly = true)
    public List<CourseMaterialDTO> listMaterials() {
        return materialRepo.findAllByOrderByCreatedAtDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public CourseMaterialDTO createMaterial(String title,
                                            String description,
                                            String courseCode,
                                            String courseName,
                                            String kind,
                                            MultipartFile file,
                                            String createdBy) {
        if (!StringUtils.hasText(title)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required.");
        }
        String normalizedKind = normalizeKind(kind);
        CourseMaterial material = new CourseMaterial();
        material.setTitle(title.trim());
        material.setDescription(description);
        material.setCourseCode(courseCode);
        material.setCourseName(courseName);
        material.setKind(normalizedKind);
        material.setCreatedBy(createdBy);
        material.setCreatedAt(LocalDateTime.now());
        storeFile(material, file);
        CourseMaterialDTO created = toDto(materialRepo.save(material));
        catalogStore.persistSnapshot();
        return created;
    }

    @Transactional
    public void deleteMaterial(Long id) {
        CourseMaterial material = requireMaterial(id);
        Path file = storageDir.resolve(material.getStoredFilename()).normalize();
        if (file.startsWith(storageDir)) {
            try {
                Files.deleteIfExists(file);
            } catch (IOException ignored) {
                // Catalog row is still removed.
            }
        }
        materialRepo.delete(material);
        catalogStore.persistSnapshot();
    }

    public void downloadMaterial(Long id, HttpServletResponse response) throws IOException {
        writeFile(id, response, false);
    }

    public void viewMaterial(Long id, HttpServletResponse response) throws IOException {
        writeFile(id, response, true);
    }

    private void writeFile(Long id, HttpServletResponse response, boolean inline) throws IOException {
        CourseMaterial material = requireMaterial(id);
        Path file = storageDir.resolve(material.getStoredFilename()).normalize();
        if (!file.startsWith(storageDir) || !Files.exists(file)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The file is no longer on disk.");
        }
        String filename = material.getOriginalFilename() != null ? material.getOriginalFilename() : "material";
        String contentType = resolveContentType(material.getContentType(), filename);
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
        String disposition = inline ? "inline" : "attachment";
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType(contentType);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                disposition + "; filename=\"" + filename.replace("\"", "") + "\"; filename*=UTF-8''" + encoded);
        response.setContentLengthLong(Files.size(file));
        try (InputStream in = Files.newInputStream(file)) {
            in.transferTo(response.getOutputStream());
            response.getOutputStream().flush();
        }
    }

    private String resolveContentType(String storedType, String filename) {
        if (storedType != null && storedType.contains("/") && !storedType.equals("application/octet-stream")) {
            return storedType;
        }
        String ext = "";
        int dot = filename.lastIndexOf('.');
        if (dot >= 0) {
            ext = filename.substring(dot + 1).toLowerCase(Locale.ROOT);
        }
        return switch (ext) {
            case "pdf" -> "application/pdf";
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "txt" -> "text/plain";
            case "csv" -> "text/csv";
            case "ppt" -> "application/vnd.ms-powerpoint";
            case "pptx" -> "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls" -> "application/vnd.ms-excel";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            default -> storedType != null && storedType.contains("/") ? storedType : "application/octet-stream";
        };
    }

    private void storeFile(CourseMaterial material, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A file is required.");
        }
        if (file.getSize() > MAX_UPLOAD_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Files must be 25 MB or smaller.");
        }
        String original = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "material");
        String extension = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0 && dot < original.length() - 1) {
            extension = original.substring(dot + 1).toLowerCase(Locale.ROOT);
        }
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "That file type is not allowed. Use PDF, Office, ZIP, text, or image files.");
        }
        String stored = UUID.randomUUID() + "_" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path target = storageDir.resolve(stored).normalize();
        if (!target.startsWith(storageDir)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name.");
        }
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store the file.");
        }
        material.setStoredFilename(stored);
        material.setOriginalFilename(original);
        String contentType = file.getContentType();
        material.setContentType(contentType != null && !contentType.isBlank() ? contentType : "application/octet-stream");
        material.setFileSize(file.getSize());
    }

    private String normalizeKind(String kind) {
        String value = kind == null ? "" : kind.trim().toUpperCase(Locale.ROOT);
        if (CourseMaterial.KIND_NOTES.equals(value) || CourseMaterial.KIND_SLIDES.equals(value) || CourseMaterial.KIND_DOC.equals(value)) {
            return value;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "kind must be NOTES, SLIDES, or DOCUMENT.");
    }

    private CourseMaterial requireMaterial(Long id) {
        return materialRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course material not found."));
    }

    private CourseMaterialDTO toDto(CourseMaterial material) {
        return CourseMaterialDTO.builder()
                .id(material.getId())
                .title(material.getTitle())
                .description(material.getDescription())
                .courseCode(material.getCourseCode())
                .courseName(material.getCourseName())
                .kind(material.getKind())
                .originalFilename(material.getOriginalFilename())
                .contentType(material.getContentType())
                .fileSize(material.getFileSize())
                .createdBy(material.getCreatedBy())
                .createdAt(material.getCreatedAt())
                .build();
    }
}
