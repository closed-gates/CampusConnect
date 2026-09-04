package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.FacultyDirectoryEntryDTO;
import com.campusconnect.backend.model.FacultyDirectoryEntry;
import com.campusconnect.backend.repository.FacultyDirectoryRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Business logic and initial database import for the directory feature. */
@Service
public class FacultyDirectoryService {

    private static final Map<String, Integer> CATEGORY_ORDER = categoryOrder();
    private final FacultyDirectoryRepository repository;

    public FacultyDirectoryService(FacultyDirectoryRepository repository) {
        this.repository = repository;
    }

    /** Imports the verified document dataset only when the new database table is empty. */
    @PostConstruct
    @Transactional
    public void seedDirectory() throws IOException {
        if (repository.count() > 0) {
            return;
        }

        ClassPathResource resource = new ClassPathResource("faculty-directory.tsv");
        List<FacultyDirectoryEntry> entries = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                resource.getInputStream(), StandardCharsets.UTF_8))) {
            reader.readLine();
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                String[] values = line.split("\\t", -1);
                if (values.length != 7) {
                    throw new IllegalStateException("Invalid faculty directory seed row: " + line);
                }
                entries.add(FacultyDirectoryEntry.builder()
                        .category(values[0])
                        .name(values[1])
                        .position(values[2])
                        .email(values[3].toLowerCase(Locale.ROOT))
                        .profileUrl(values[4])
                        .thesisStatus(values[5])
                        .thesisLevel(values[6])
                        .build());
            }
        }
        repository.saveAll(entries);
    }

    @Transactional(readOnly = true)
    public List<FacultyDirectoryEntryDTO> search(String query, String category, String thesisStatus) {
        String needle = normalize(query);
        String requestedCategory = normalize(category);
        String requestedStatus = normalize(thesisStatus);

        return repository.findAll().stream()
                .filter(entry -> needle.isEmpty() || searchable(entry).contains(needle))
                .filter(entry -> requestedCategory.isEmpty()
                        || normalize(entry.getCategory()).equals(requestedCategory))
                .filter(entry -> requestedStatus.isEmpty()
                        || normalize(entry.getThesisStatus()).equals(requestedStatus))
                .sorted(Comparator
                        .comparingInt((FacultyDirectoryEntry entry) ->
                                CATEGORY_ORDER.getOrDefault(entry.getCategory(), Integer.MAX_VALUE))
                        .thenComparing(FacultyDirectoryEntry::getName, String.CASE_INSENSITIVE_ORDER))
                .map(this::toDTO)
                .toList();
    }

    private String searchable(FacultyDirectoryEntry entry) {
        return normalize(String.join(" ",
                entry.getName(), entry.getPosition(), entry.getEmail(), entry.getCategory(),
                entry.getThesisStatus(), entry.getThesisLevel()));
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private FacultyDirectoryEntryDTO toDTO(FacultyDirectoryEntry entry) {
        return FacultyDirectoryEntryDTO.builder()
                .id(entry.getId())
                .category(entry.getCategory())
                .name(entry.getName())
                .position(entry.getPosition())
                .email(entry.getEmail())
                .profileUrl(entry.getProfileUrl())
                .thesisStatus(entry.getThesisStatus())
                .thesisLevel(entry.getThesisLevel())
                .build();
    }

    private static Map<String, Integer> categoryOrder() {
        Map<String, Integer> order = new LinkedHashMap<>();
        order.put("Department Leadership", 0);
        order.put("Professors", 1);
        order.put("Associate Professors", 2);
        order.put("Assistant Professors", 3);
        order.put("Senior Lecturers", 4);
        order.put("Lecturers", 5);
        order.put("Adjunct Lecturers", 6);
        order.put("Research Assistants", 7);
        order.put("Department Coordination Officers", 8);
        order.put("Lab Technical Officer", 9);
        return order;
    }
}
