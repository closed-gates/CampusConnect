package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.FacultyDirectoryEntryDTO;
import com.campusconnect.backend.service.FacultyDirectoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Read-only REST API for the database-backed Faculty and Staff Directory. */
@RestController
@RequestMapping("/api/faculty-directory")
@CrossOrigin(origins = "*")
public class FacultyDirectoryController {

    private final FacultyDirectoryService service;

    public FacultyDirectoryController(FacultyDirectoryService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<FacultyDirectoryEntryDTO>> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String thesisStatus) {
        return ResponseEntity.ok(service.search(query, category, thesisStatus));
    }
}
