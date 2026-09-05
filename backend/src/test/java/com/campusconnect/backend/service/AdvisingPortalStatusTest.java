package com.campusconnect.backend.service;

import com.campusconnect.backend.model.AdvisingPortalStatus;
import com.campusconnect.backend.model.StudentProfile;
import com.campusconnect.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdvisingPortalStatusTest {
    private final AdvisingPortalStatusRepository portalRepo = mock(AdvisingPortalStatusRepository.class);
    private final StudentProfileRepository students = mock(StudentProfileRepository.class);
    private final CourseSectionRepository sections = mock(CourseSectionRepository.class);
    private final SectionRegistrationRepository registrations = mock(SectionRegistrationRepository.class);
    private final RegistrationService registration = new RegistrationService(registrations, sections, students,
        mock(AdvisedCourseRepository.class), mock(SimpMessagingTemplate.class), mock(ScheduleClashValidator.class));
    private final AdminAdvisingService admin = new AdminAdvisingService(mock(AppUserRepository.class),
        mock(TestFacultyRepository.class), sections, mock(CourseCatalogRepository.class), mock(TestCourseRepository.class),
        mock(TestSectionRepository.class), registrations, students, mock(AdvisedCourseRepository.class), portalRepo,
        mock(SimpMessagingTemplate.class), mock(ScheduleClashValidator.class));
    private final AdvisingPortalStatus portal = AdvisingPortalStatus.builder().id(1L).open(true).build();
    private final StudentProfile student = StudentProfile.builder().studentId("student").completedCredits(70).build();

    @BeforeEach void setup() {
        ReflectionTestUtils.setField(registration, "portalStatusRepo", portalRepo);
        when(portalRepo.findById(1L)).thenReturn(Optional.of(portal));
        when(students.findById("student")).thenReturn(Optional.of(student));
        when(students.findAllByPriority()).thenReturn(List.of(student));
    }

    @Test void closingAndReopeningImmediatelyChangesStudentWindow() {
        assertThat(registration.getAdvisingWindow("student")).containsEntry("open", true);
        admin.setAdvisingPortalStatus(false, "admin", "Closed for maintenance");
        assertThat(registration.getAdvisingWindow("student"))
            .containsEntry("open", false).containsEntry("portalOpen", false)
            .containsEntry("message", "Closed for maintenance")
            .containsEntry("opensAt", "Awaiting administrator reopening");
        admin.setAdvisingPortalStatus(true, "admin", "Registration resumed");
        assertThat(registration.getAdvisingWindow("student"))
            .containsEntry("open", true).containsEntry("portalMessage", "Registration resumed");
        verify(portalRepo, times(2)).save(portal);
    }

    @Test void noticeCanChangeWhilePortalRemainsClosed() {
        admin.setAdvisingPortalStatus(false, "admin", "Reopens Monday");
        admin.setAdvisingPortalStatus(false, "admin", "Reopens Tuesday");
        assertThat(registration.getAdvisingWindow("student"))
            .containsEntry("open", false).containsEntry("message", "Reopens Tuesday");
    }

    @Test void openingPortalGrantsAccessRegardlessOfStudentPriorityTier() {
        student.setCompletedCredits(12);
        admin.setAdvisingPortalStatus(true, "admin", "Priority registration open");
        assertThat(registration.getAdvisingWindow("student"))
            .containsEntry("portalOpen", true).containsEntry("open", true).containsEntry("tier", 3)
            .containsEntry("opensAt", "Now open");
    }

    @Test void closedPortalBlocksRegistrationBeforeAnySeatMutation() {
        admin.setAdvisingPortalStatus(false, "admin", "Closed");
        assertThat(registration.registerSection("student", "CSE110-01"))
            .containsEntry("success", false).containsEntry("message", "Closed");
        verifyNoInteractions(sections, registrations);
    }
}
