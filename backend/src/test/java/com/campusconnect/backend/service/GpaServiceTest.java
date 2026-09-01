package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.GpaPredictRequest;
import com.campusconnect.backend.dto.GpaRetakeRequest;
import com.campusconnect.backend.model.AdvisedCourse;
import com.campusconnect.backend.model.StudentCompletedCourse;
import com.campusconnect.backend.model.StudentProfile;
import com.campusconnect.backend.repository.StudentCompletedCourseRepository;
import com.campusconnect.backend.repository.StudentProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.offset;
import static org.mockito.Mockito.when;

/**
 * GpaServiceTest – Unit tests for GPA calculation logic.
 *
 * Tests cover:
 *  - Empty transcript (first-semester student)
 *  - Single course GPA
 *  - Weighted average across multiple courses
 *  - WAIVED / pass-fail courses excluded from GPA
 *  - Zero-credit courses excluded from GPA
 *  - Predictive CGPA calculator
 *  - Retake simulator (grade replacement)
 *  - Non-existent course retake simulation
 */
@ExtendWith(MockitoExtension.class)
class GpaServiceTest {

    @Mock
    private StudentCompletedCourseRepository completedCourseRepo;

    @Mock
    private StudentProfileRepository studentRepo;

    @InjectMocks
    private GpaService gpaService;

    private static final String STUDENT_ID = "STU001";
    private StudentProfile profile;

    @BeforeEach
    void setUp() {
        profile = StudentProfile.builder()
                .studentId(STUDENT_ID)
                .studentName("Test Student")
                .email("test@example.com")
                .department("CSE")
                .year(2)
                .cgpa(3.5)
                .completedCredits(30)
                .onProbation(false)
                .completedCourses("")
                .advisedCourses(new ArrayList<>())
                .build();

        when(studentRepo.findById(STUDENT_ID)).thenReturn(Optional.of(profile));
    }

    // ── Transcript Tests ────────────────────────────────────────────────────

    @Test
    void testNoCourses_transcriptIsEmptyAndCgpaIsZero() {
        when(completedCourseRepo.findByStudentId(STUDENT_ID)).thenReturn(Collections.emptyList());

        Map<String, Object> result = gpaService.getTranscript(STUDENT_ID);

        assertThat(result.get("success")).isEqualTo(true);
        assertThat((List<?>) result.get("semesters")).isEmpty();
        assertThat((double) result.get("currentCgpa")).isEqualTo(0.0);
    }

    @Test
    void testSingleCourse_correctGpa() {
        // A = 4.0, 3 credits → GPA = 4.0
        StudentCompletedCourse course = StudentCompletedCourse.builder()
                .studentId(STUDENT_ID).courseCode("CSE110").courseTitle("Programming Language I")
                .credits(3).grade("A").gradePoint(4.0).semester("Summer 2025").isBypassed(false)
                .build();
        when(completedCourseRepo.findByStudentId(STUDENT_ID)).thenReturn(List.of(course));

        Map<String, Object> result = gpaService.getTranscript(STUDENT_ID);

        assertThat((double) result.get("currentCgpa")).isCloseTo(4.0, offset(0.01));
    }

    @Test
    void testMultipleCourses_weightedAverage() {
        // A = 4.0 × 3 credits = 12.0 QP
        // B = 3.0 × 3 credits =  9.0 QP
        // Total QP = 21.0, graded credits = 6 → GPA = 3.50
        StudentCompletedCourse c1 = StudentCompletedCourse.builder()
                .studentId(STUDENT_ID).courseCode("CSE110").courseTitle("Prog I")
                .credits(3).grade("A").gradePoint(4.0).semester("Summer 2025").isBypassed(false)
                .build();
        StudentCompletedCourse c2 = StudentCompletedCourse.builder()
                .studentId(STUDENT_ID).courseCode("MAT110").courseTitle("Calculus I")
                .credits(3).grade("B").gradePoint(3.0).semester("Summer 2025").isBypassed(false)
                .build();
        when(completedCourseRepo.findByStudentId(STUDENT_ID)).thenReturn(List.of(c1, c2));

        Map<String, Object> result = gpaService.getTranscript(STUDENT_ID);

        assertThat((double) result.get("currentCgpa")).isCloseTo(3.5, offset(0.01));
    }

    @Test
    void testWaivedCourseExcludedFromGpa() {
        // A = 4.0 × 3 credits → GPA = 4.0
        // WAIVED = null gradePoint → must NOT affect GPA
        StudentCompletedCourse graded = StudentCompletedCourse.builder()
                .studentId(STUDENT_ID).courseCode("CSE110").courseTitle("Prog I")
                .credits(3).grade("A").gradePoint(4.0).semester("Summer 2025").isBypassed(false)
                .build();
        StudentCompletedCourse waived = StudentCompletedCourse.builder()
                .studentId(STUDENT_ID).courseCode("ENG101").courseTitle("English")
                .credits(3).grade("WAIVED").gradePoint(null).semester("Transferred / Bypassed").isBypassed(true)
                .build();
        when(completedCourseRepo.findByStudentId(STUDENT_ID)).thenReturn(List.of(graded, waived));

        Map<String, Object> result = gpaService.getTranscript(STUDENT_ID);

        assertThat((double) result.get("currentCgpa")).isCloseTo(4.0, offset(0.01));
    }

    @Test
    void testZeroCreditCourse_noGpaImpact() {
        // Normal 3-credit A course
        StudentCompletedCourse normal = StudentCompletedCourse.builder()
                .studentId(STUDENT_ID).courseCode("CSE110").courseTitle("Prog I")
                .credits(3).grade("A").gradePoint(4.0).semester("Summer 2025").isBypassed(false)
                .build();
        // Zero-credit course — should be excluded from GPA calculation
        StudentCompletedCourse zeroCr = StudentCompletedCourse.builder()
                .studentId(STUDENT_ID).courseCode("ORI000").courseTitle("Orientation")
                .credits(0).grade("P").gradePoint(null).semester("Summer 2025").isBypassed(false)
                .build();
        when(completedCourseRepo.findByStudentId(STUDENT_ID)).thenReturn(List.of(normal, zeroCr));

        Map<String, Object> result = gpaService.getTranscript(STUDENT_ID);

        assertThat((double) result.get("currentCgpa")).isCloseTo(4.0, offset(0.01));
    }

    @Test
    void testPassFailCourseExcludedFromGpa() {
        StudentCompletedCourse graded = StudentCompletedCourse.builder()
                .studentId(STUDENT_ID).courseCode("CSE110").courseTitle("Prog I")
                .credits(3).grade("B+").gradePoint(3.3).semester("Summer 2025").isBypassed(false)
                .build();
        StudentCompletedCourse pass = StudentCompletedCourse.builder()
                .studentId(STUDENT_ID).courseCode("GED001").courseTitle("Gen Ed Lab")
                .credits(1).grade("P").gradePoint(null).semester("Summer 2025").isBypassed(false)
                .build();
        when(completedCourseRepo.findByStudentId(STUDENT_ID)).thenReturn(List.of(graded, pass));

        Map<String, Object> result = gpaService.getTranscript(STUDENT_ID);

        assertThat((double) result.get("currentCgpa")).isCloseTo(3.3, offset(0.01));
    }

    // ── Predictive CGPA Tests ───────────────────────────────────────────────

    @Test
    void testPredictCgpa_firstSemesterStudentNoHistory() {
        when(completedCourseRepo.findByStudentId(STUDENT_ID)).thenReturn(Collections.emptyList());

        GpaPredictRequest req = new GpaPredictRequest(List.of(
                new GpaPredictRequest.CourseGradePair("CSE110", "Prog I", 3.0, "A"),
                new GpaPredictRequest.CourseGradePair("MAT110", "Calculus", 3.0, "B+")
        ));

        Map<String, Object> result = gpaService.predictCgpa(STUDENT_ID, req);

        assertThat(result.get("success")).isEqualTo(true);
        // Sem GPA: (3*4.0 + 3*3.3) / 6 = (12 + 9.9) / 6 = 21.9 / 6 = 3.65
        assertThat((double) result.get("predictedSemGpa")).isCloseTo(3.65, offset(0.01));
        // No history → overall predicted CGPA = same as sem GPA
        assertThat((double) result.get("predictedCgpa")).isCloseTo(3.65, offset(0.01));
        assertThat(result.get("simulated")).isEqualTo(true);
    }

    @Test
    void testPredictCgpa_combinedWithExistingHistory() {
        // Existing: 3 credits A = 4.0 → QP = 12
        StudentCompletedCourse existing = StudentCompletedCourse.builder()
                .studentId(STUDENT_ID).courseCode("CSE110").courseTitle("Prog I")
                .credits(3).grade("A").gradePoint(4.0).semester("Spring 2025").isBypassed(false)
                .build();
        when(completedCourseRepo.findByStudentId(STUDENT_ID)).thenReturn(List.of(existing));

        // Predict: 3 credits B = 3.0 → QP = 9
        GpaPredictRequest req = new GpaPredictRequest(List.of(
                new GpaPredictRequest.CourseGradePair("CSE111", "Prog II", 3.0, "B")
        ));

        Map<String, Object> result = gpaService.predictCgpa(STUDENT_ID, req);

        // Combined: (12 + 9) / 6 = 21 / 6 = 3.5
        assertThat((double) result.get("predictedCgpa")).isCloseTo(3.5, offset(0.01));
    }

    @Test
    void testPredictCgpa_skipsCourseWithBlankGrade() {
        when(completedCourseRepo.findByStudentId(STUDENT_ID)).thenReturn(Collections.emptyList());

        GpaPredictRequest req = new GpaPredictRequest(List.of(
                new GpaPredictRequest.CourseGradePair("CSE110", "Prog I", 3.0, "A"),
                new GpaPredictRequest.CourseGradePair("MAT110", "Calc",   3.0, "")   // blank → skip
        ));

        Map<String, Object> result = gpaService.predictCgpa(STUDENT_ID, req);

        // Only CSE110 A=4.0 counted → sem GPA = 4.0
        assertThat((double) result.get("predictedSemGpa")).isCloseTo(4.0, offset(0.01));
    }

    // ── Retake Simulator Tests ──────────────────────────────────────────────

    @Test
    void testRetakeSimulation_gradeReplacement_cgpaImproves() {
        // Existing: C = 2.0 × 3 credits + A = 4.0 × 3 credits → QP = 18, credits = 6 → CGPA = 3.0
        StudentCompletedCourse c1 = StudentCompletedCourse.builder()
                .studentId(STUDENT_ID).courseCode("CSE110").courseTitle("Prog I")
                .credits(3).grade("C").gradePoint(2.0).semester("Spring 2025").isBypassed(false)
                .build();
        StudentCompletedCourse c2 = StudentCompletedCourse.builder()
                .studentId(STUDENT_ID).courseCode("MAT110").courseTitle("Calculus")
                .credits(3).grade("A").gradePoint(4.0).semester("Spring 2025").isBypassed(false)
                .build();
        when(completedCourseRepo.findByStudentId(STUDENT_ID)).thenReturn(List.of(c1, c2));

        // Retake CSE110, hypothetical A = 4.0 → new QP = 12+12=24, credits = 6 → CGPA = 4.0
        GpaRetakeRequest req = new GpaRetakeRequest("CSE110", "A");
        Map<String, Object> result = gpaService.simulateRetake(STUDENT_ID, req);

        assertThat(result.get("success")).isEqualTo(true);
        assertThat((double) result.get("beforeCgpa")).isCloseTo(3.0, offset(0.01));
        assertThat((double) result.get("afterCgpa")).isCloseTo(4.0, offset(0.01));
        assertThat((double) result.get("cgpaChange")).isCloseTo(1.0, offset(0.01));
        assertThat(result.get("improved")).isEqualTo(true);
        assertThat(result.get("simulated")).isEqualTo(true);
        assertThat(result.get("retakePolicy")).isEqualTo("GRADE_REPLACEMENT");
    }

    @Test
    void testRetakeSimulation_courseNotFound_returnsError() {
        when(completedCourseRepo.findByStudentId(STUDENT_ID)).thenReturn(Collections.emptyList());

        GpaRetakeRequest req = new GpaRetakeRequest("CSE999", "A");
        Map<String, Object> result = gpaService.simulateRetake(STUDENT_ID, req);

        assertThat(result.get("success")).isEqualTo(false);
        assertThat(result.get("message").toString()).contains("CSE999");
    }

    @Test
    void testRetakeSimulation_invalidGrade_returnsError() {
        when(completedCourseRepo.findByStudentId(STUDENT_ID)).thenReturn(Collections.emptyList());

        GpaRetakeRequest req = new GpaRetakeRequest("CSE110", "Z+");
        Map<String, Object> result = gpaService.simulateRetake(STUDENT_ID, req);

        assertThat(result.get("success")).isEqualTo(false);
    }

    @Test
    void testStudentNotFound_transcriptReturnsError() {
        when(studentRepo.findById("UNKNOWN")).thenReturn(Optional.empty());

        Map<String, Object> result = gpaService.getTranscript("UNKNOWN");

        assertThat(result.get("success")).isEqualTo(false);
    }
}
