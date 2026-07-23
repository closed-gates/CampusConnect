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

    public Assignment getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
    }

    public List<Assignment> getByCourseCode(String courseCode) {
        return repository.findByCourseCode(courseCode);
    }

    public Assignment update(Long id, Assignment assignmentDetails) {
        Assignment assignment = getById(id);
        assignment.setTitle(assignmentDetails.getTitle());
        assignment.setDescription(assignmentDetails.getDescription());
        assignment.setCourseCode(assignmentDetails.getCourseCode());
        assignment.setDueDate(assignmentDetails.getDueDate());
        return repository.save(assignment);
    }

    public void delete(Long id) {
        Assignment assignment = getById(id);
        repository.delete(assignment);
    }
}
