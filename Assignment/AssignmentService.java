package com.campusconnect.assignment;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AssignmentService {

    private final AssignmentRepository repository;

    public AssignmentService(AssignmentRepository repository) {
        this.repository = repository;
    }

    public List<Assignment> getAllSortedByDueDate() {
        return repository.findAllByOrderByDueDateAsc();
    }

    public Assignment create(Assignment assignment) {
        return repository.save(assignment);
    }
}
