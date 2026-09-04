package com.campusconnect.backend.service;

import com.campusconnect.backend.model.CourseMaterial;
import com.campusconnect.backend.repository.CourseMaterialRepository;
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
import java.util.List;

/**
 * CourseMaterialCatalogStore – restores materials after H2 create-drop restarts.
 *
 * MVC Role: Service helper (course materials feature)
 */
@Component
public class CourseMaterialCatalogStore implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(CourseMaterialCatalogStore.class);

    private final CourseMaterialRepository materialRepo;
    private final ObjectMapper mapper;
    private final Path storageDir;
    private final Path catalogFile;

    public CourseMaterialCatalogStore(CourseMaterialRepository materialRepo) {
        this.materialRepo = materialRepo;
        this.mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        this.storageDir = Paths.get("uploads/course-materials").toAbsolutePath().normalize();
        this.catalogFile = storageDir.resolve("catalog.json");
        try {
            Files.createDirectories(this.storageDir);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not create course materials storage directory", ex);
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
        snapshot.materials = materialRepo.findAll().stream().map(CatalogRow::from).toList();
        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(catalogFile.toFile(), snapshot);
        } catch (IOException ex) {
            log.warn("Could not write course materials catalog: {}", ex.getMessage());
        }
    }

    private void restoreIfEmpty() {
        if (materialRepo.count() > 0 || !Files.exists(catalogFile)) {
            return;
        }
        try {
            CatalogSnapshot snapshot = mapper.readValue(catalogFile.toFile(), CatalogSnapshot.class);
            if (snapshot.materials == null) {
                return;
            }
            int restored = 0;
            for (CatalogRow row : snapshot.materials) {
                if (row.storedFilename == null) {
                    continue;
                }
                Path file = storageDir.resolve(row.storedFilename).normalize();
                if (!file.startsWith(storageDir) || !Files.exists(file)) {
                    log.warn("Skipping restored material '{}' because the file is missing", row.title);
                    continue;
                }
                materialRepo.save(row.toEntity());
                restored++;
            }
            log.info("Restored {} course materials from disk catalog", restored);
        } catch (IOException ex) {
            log.warn("Could not restore course materials catalog: {}", ex.getMessage());
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class CatalogSnapshot {
        public List<CatalogRow> materials = new ArrayList<>();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class CatalogRow {
        public String title;
        public String description;
        public String courseCode;
        public String courseName;
        public String kind;
        public String storedFilename;
        public String originalFilename;
        public String contentType;
        public Long fileSize;
        public String createdBy;
        public LocalDateTime createdAt;

        static CatalogRow from(CourseMaterial material) {
            CatalogRow row = new CatalogRow();
            row.title = material.getTitle();
            row.description = material.getDescription();
            row.courseCode = material.getCourseCode();
            row.courseName = material.getCourseName();
            row.kind = material.getKind();
            row.storedFilename = material.getStoredFilename();
            row.originalFilename = material.getOriginalFilename();
            row.contentType = material.getContentType();
            row.fileSize = material.getFileSize();
            row.createdBy = material.getCreatedBy();
            row.createdAt = material.getCreatedAt();
            return row;
        }

        CourseMaterial toEntity() {
            CourseMaterial material = new CourseMaterial();
            material.setTitle(title);
            material.setDescription(description);
            material.setCourseCode(courseCode);
            material.setCourseName(courseName);
            material.setKind(kind);
            material.setStoredFilename(storedFilename);
            material.setOriginalFilename(originalFilename);
            material.setContentType(contentType);
            material.setFileSize(fileSize);
            material.setCreatedBy(createdBy);
            material.setCreatedAt(createdAt != null ? createdAt : LocalDateTime.now());
            return material;
        }
    }
}
