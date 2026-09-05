package com.campusconnect.backend.service;

import com.campusconnect.backend.model.Assignment;
import com.campusconnect.backend.model.Submission;
import com.campusconnect.backend.repository.AssignmentRepository;
import com.campusconnect.backend.repository.SubmissionRepository;
import com.campusconnect.backend.repository.SectionRegistrationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class AssignmentAccessTest {
    private final AssignmentRepository assignments = mock(AssignmentRepository.class);
    private final SubmissionRepository submissions = mock(SubmissionRepository.class);
    private final AssignmentService service = new AssignmentService(assignments, submissions, mock(SectionRegistrationRepository.class));

    private Assignment assignment() {
        Assignment a = new Assignment(); a.setId(1L); a.setCreatedBy("faculty1");
        when(assignments.findById(1L)).thenReturn(Optional.of(a));
        return a;
    }

    @Test void ownerDeletesSubmissionsBeforeAssignment() {
        Assignment a = assignment();
        service.deleteAssignment(1L, "faculty1", "FACULTY");
        var order = inOrder(submissions, assignments);
        order.verify(submissions).deleteByAssignmentId(1L);
        order.verify(assignments).delete(a);
    }

    @Test void adminCanDeleteAnotherOwnersAssignment() {
        Assignment a = assignment();
        service.deleteAssignment(1L, "admin", "ADMIN");
        verify(assignments).delete(a);
    }

    @Test void otherFacultyCannotDelete() {
        assignment();
        assertThatThrownBy(() -> service.deleteAssignment(1L, "other", "FACULTY"))
            .isInstanceOf(ResponseStatusException.class).hasMessageContaining("403");
        verifyNoInteractions(submissions);
        verify(assignments, never()).delete(any());
    }

    @Test void studentCannotDelete() {
        assertThatThrownBy(() -> service.deleteAssignment(1L, "student", "STUDENT"))
            .isInstanceOf(ResponseStatusException.class).hasMessageContaining("403");
        verifyNoInteractions(assignments, submissions);
    }

    @Test void missingAssignmentReturns404() {
        when(assignments.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.deleteAssignment(1L, "admin", "ADMIN"))
            .isInstanceOf(ResponseStatusException.class).hasMessageContaining("404");
    }

    private Submission submission() {
        Submission s = new Submission(); s.setId(2L); s.setAssignmentId(1L);
        s.setStudentId("student1"); s.setFileData(new byte[]{1, 2});
        when(submissions.findById(2L)).thenReturn(Optional.of(s));
        return s;
    }

    @Test void studentCanReadOwnFileButNotAnotherStudentsFile() {
        Submission s = submission();
        assertThat(service.getAccessibleSubmissionFile(2L, "student1", "STUDENT")).isSameAs(s);
        assertThatThrownBy(() -> service.getAccessibleSubmissionFile(2L, "student2", "STUDENT"))
            .isInstanceOf(ResponseStatusException.class).hasMessageContaining("403");
    }

    @Test void facultyAccessIsLimitedToOwnedAssignments() {
        Submission s = submission();
        Assignment a = new Assignment(); a.setId(1L);
        when(assignments.findByCreatedByOrderByDeadlineAsc("faculty1")).thenReturn(List.of(a));
        when(assignments.findByCreatedByOrderByDeadlineAsc("other")).thenReturn(List.of());
        assertThat(service.getAccessibleSubmissionFile(2L, "faculty1", "FACULTY")).isSameAs(s);
        assertThatThrownBy(() -> service.getAccessibleSubmissionFile(2L, "other", "FACULTY"))
            .isInstanceOf(ResponseStatusException.class).hasMessageContaining("403");
        assertThat(service.getAccessibleSubmissionFile(2L, "admin", "ADMIN")).isSameAs(s);
    }

    @Test void removedFileReturns404() {
        submission().setFileData(null);
        assertThatThrownBy(() -> service.getAccessibleSubmissionFile(2L, "student1", "STUDENT"))
            .isInstanceOf(ResponseStatusException.class).hasMessageContaining("404");
    }
}
