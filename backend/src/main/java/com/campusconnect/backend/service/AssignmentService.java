package com.campusconnect.backend.service;

import com.campusconnect.backend.model.Assignment;
import com.campusconnect.backend.model.Submission;
import com.campusconnect.backend.repository.AssignmentRepository;
import com.campusconnect.backend.repository.SubmissionRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * AssignmentService – Business logic for assignments and submissions.
 *
 * MVC Role: Service (sits between Controller and Repository)
 *
 * Handles assignment CRUD, student submission turn-in/unsubmit with
 * deadline enforcement, and teacher grading.
 *
 * Tables: "assignments", "submissions" (Neon PostgreSQL)
 * Seed data is inserted once on first startup via @PostConstruct.
 */
@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepo;
    private final SubmissionRepository submissionRepo;

    public AssignmentService(AssignmentRepository assignmentRepo,
                             SubmissionRepository submissionRepo) {
        this.assignmentRepo = assignmentRepo;
        this.submissionRepo = submissionRepo;
    }

    // ── Seed data on first startup ────────────────────────────────
    @PostConstruct
    @Transactional
    public void seedData() {
        if (assignmentRepo.count() > 0) return;

        // Assignment 1 — CSE470 Software Engineering
        Assignment a1 = new Assignment();
        a1.setCourseCode("CSE470");
        a1.setCourseName("Software Engineering");
        a1.setTitle("Project Report – Final Submission");
        a1.setDescription(
            "1) Make sure your code link is added in the submitted PDF.\n" +
            "2) One report submission from each group.\n" +
            "3) The report's AI and plagiarism will be checked thoroughly using Turnitin.\n\n" +
            "Your report should include:\n" +
            "- Project overview and architecture diagram\n" +
            "- Technology stack justification\n" +
            "- Individual contribution breakdown\n" +
            "- Screenshots of all major features\n" +
            "- GitHub repository link"
        );
        a1.setTotalPoints(100);
        a1.setDeadline(LocalDateTime.now().plusDays(7).withHour(23).withMinute(59).withSecond(0));
        a1.setCreatedBy("Ahmed Akib Jawad Karim");
        a1.setCreatedAt(LocalDateTime.now().minusDays(5));
        assignmentRepo.save(a1);

        // Assignment 2 — CSE321 Operating Systems
        Assignment a2 = new Assignment();
        a2.setCourseCode("CSE321");
        a2.setCourseName("Operating Systems");
        a2.setTitle("Lab 5 – Process Scheduling Simulator");
        a2.setDescription(
            "Implement a process scheduling simulator in C/Java that supports:\n\n" +
            "- First Come First Served (FCFS)\n" +
            "- Shortest Job First (SJF)\n" +
            "- Round Robin (with configurable quantum)\n\n" +
            "Your program should read process data from a file and output:\n" +
            "- Gantt chart\n" +
            "- Average waiting time\n" +
            "- Average turnaround time\n\n" +
            "Submit your source code + a PDF with sample outputs."
        );
        a2.setTotalPoints(50);
        a2.setDeadline(LocalDateTime.now().plusDays(3).withHour(23).withMinute(59).withSecond(0));
        a2.setCreatedBy("Dr. Md. Rashedul Islam");
        a2.setCreatedAt(LocalDateTime.now().minusDays(2));
        assignmentRepo.save(a2);

        // Assignment 3 — CSE220 Data Structures
        Assignment a3 = new Assignment();
        a3.setCourseCode("CSE220");
        a3.setCourseName("Data Structures");
        a3.setTitle("Homework 3 – Binary Search Tree Operations");
        a3.setDescription(
            "Implement the following BST operations in Java:\n\n" +
            "1. Insert a node\n" +
            "2. Delete a node\n" +
            "3. Search for a value\n" +
            "4. In-order, Pre-order, and Post-order traversals\n" +
            "5. Find the height of the tree\n" +
            "6. Check if the tree is balanced\n\n" +
            "Include a main method with test cases demonstrating each operation.\n" +
            "Submit a single .java file."
        );
        a3.setTotalPoints(30);
        a3.setDeadline(LocalDateTime.now().plusDays(14).withHour(23).withMinute(59).withSecond(0));
        a3.setCreatedBy("Prof. Sadia Sharmin");
        a3.setCreatedAt(LocalDateTime.now().minusDays(1));
        assignmentRepo.save(a3);

        // Assignment 4 — CSE110 Programming Language I (past deadline for testing)
        Assignment a4 = new Assignment();
        a4.setCourseCode("CSE110");
        a4.setCourseName("Programming Language I");
        a4.setTitle("Lab 2 – Loops and Conditionals");
        a4.setDescription(
            "Complete the following exercises:\n\n" +
            "1. Write a program to print the Fibonacci sequence up to N terms\n" +
            "2. Write a program to check if a number is prime\n" +
            "3. Write a program to find the GCD of two numbers using Euclidean algorithm\n" +
            "4. Write a program to print a right-angled triangle pattern of stars\n\n" +
            "Submit a single Python file (.py) with all solutions."
        );
        a4.setTotalPoints(20);
        a4.setDeadline(LocalDateTime.now().minusDays(2).withHour(23).withMinute(59).withSecond(0));
        a4.setCreatedBy("Annajiat Alim Rasel");
        a4.setCreatedAt(LocalDateTime.now().minusDays(10));
        assignmentRepo.save(a4);
    }

    // ── Assignment operations ─────────────────────────────────────

    /**
     * Returns all assignments ordered by deadline (earliest first).
     */
    public List<Assignment> getAllAssignments() {
        return assignmentRepo.findAllByOrderByDeadlineAsc();
    }

    /**
     * Returns a single assignment by ID.
     */
    public Optional<Assignment> getAssignmentById(Long id) {
        return assignmentRepo.findById(id);
    }

    /**
     * Teacher creates a new assignment with optional file attachment.
     */
    @Transactional
    public Assignment createAssignment(String courseCode, String courseName,
                                       String title, String description,
                                       int totalPoints, LocalDateTime deadline,
                                       String createdBy,
                                       String attachmentName, String attachmentType,
                                       byte[] attachmentData) {
        Assignment assignment = new Assignment();
        assignment.setCourseCode(courseCode != null ? courseCode : "GENERAL");
        assignment.setCourseName(courseName != null ? courseName : "General");
        assignment.setTitle(title != null ? title : "Untitled Assignment");
        assignment.setDescription(description != null ? description : "");
        assignment.setTotalPoints(totalPoints);
        assignment.setDeadline(deadline != null ? deadline : LocalDateTime.now().plusWeeks(1));
        assignment.setCreatedBy(createdBy != null ? createdBy : "Teacher");
        assignment.setCreatedAt(LocalDateTime.now());
        assignment.setAttachmentName(attachmentName);
        assignment.setAttachmentType(attachmentType);
        assignment.setAttachmentData(attachmentData);
        return assignmentRepo.save(assignment);
    }

    // ── Submission operations ─────────────────────────────────────

    /**
     * Student turns in work for an assignment.
     * Enforces deadline — throws IllegalStateException if deadline passed.
     */
    @Transactional
    public Submission submitWork(Long assignmentId, String studentId, String studentName,
                                 String fileName, String fileType, byte[] fileData) {
        // Validate assignment exists
        Assignment assignment = assignmentRepo.findById(assignmentId)
            .orElseThrow(() -> new IllegalArgumentException("Assignment not found: " + assignmentId));

        // Enforce deadline
        if (LocalDateTime.now().isAfter(assignment.getDeadline())) {
            throw new IllegalStateException("Deadline has passed. Submissions are no longer accepted.");
        }

        // Check for existing submission (update if exists)
        Optional<Submission> existing = submissionRepo.findByAssignmentIdAndStudentId(assignmentId, studentId);
        Submission submission;
        if (existing.isPresent()) {
            submission = existing.get();
        } else {
            submission = new Submission();
            submission.setAssignmentId(assignmentId);
            submission.setStudentId(studentId);
        }

        submission.setStudentName(studentName != null ? studentName : "Student");
        submission.setStatus("TURNED_IN");
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setFileName(fileName);
        submission.setFileType(fileType);
        submission.setFileData(fileData);
        // Clear any previous grade when resubmitting
        submission.setGrade(null);
        submission.setFeedback(null);

        return submissionRepo.save(submission);
    }

    /**
     * Student unsubmits their work (reverts to DRAFT status).
     * Enforces deadline — cannot unsubmit after deadline.
     */
    @Transactional
    public void unsubmitWork(Long assignmentId, String studentId) {
        Assignment assignment = assignmentRepo.findById(assignmentId)
            .orElseThrow(() -> new IllegalArgumentException("Assignment not found: " + assignmentId));

        if (LocalDateTime.now().isAfter(assignment.getDeadline())) {
            throw new IllegalStateException("Deadline has passed. Cannot unsubmit.");
        }

        Submission submission = submissionRepo.findByAssignmentIdAndStudentId(assignmentId, studentId)
            .orElseThrow(() -> new IllegalArgumentException("No submission found to unsubmit."));

        // Remove the file data and revert status
        submission.setStatus("DRAFT");
        submission.setSubmittedAt(null);
        submission.setFileName(null);
        submission.setFileType(null);
        submission.setFileData(null);
        submissionRepo.save(submission);
    }

    /**
     * Get a student's submission for a specific assignment.
     */
    public Optional<Submission> getSubmission(Long assignmentId, String studentId) {
        return submissionRepo.findByAssignmentIdAndStudentId(assignmentId, studentId);
    }

    /**
     * Teacher views all submissions for an assignment.
     * Returns submissions WITHOUT file data (for list view performance).
     */
    public List<Submission> getSubmissionsForAssignment(Long assignmentId) {
        return submissionRepo.findByAssignmentId(assignmentId);
    }

    /**
     * Get a single submission by its ID.
     */
    public Optional<Submission> getSubmissionById(Long submissionId) {
        return submissionRepo.findById(submissionId);
    }

    /**
     * Teacher grades a student's submission.
     */
    @Transactional
    public Submission gradeSubmission(Long submissionId, int grade, String feedback) {
        Submission submission = submissionRepo.findById(submissionId)
            .orElseThrow(() -> new IllegalArgumentException("Submission not found: " + submissionId));

        submission.setGrade(grade);
        submission.setFeedback(feedback);
        submission.setStatus("GRADED");
        return submissionRepo.save(submission);
    }
}
