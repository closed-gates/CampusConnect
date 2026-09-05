package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.AiChatRequest;
import com.campusconnect.backend.model.*;
import com.campusconnect.backend.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AiChatService – Core service for the AI chatbot assistant.
 *
 * MVC Role: Service
 *
 * Responsibilities:
 *   1. Classify the incoming user message via TopicClassifier
 *   2. Fetch real per-user data from existing repositories
 *   3. Build a structured system prompt with scope restrictions + user context
 *   4. Call the Anthropic Claude API (/v1/messages)
 *   5. Return the assistant's reply (or the verbatim fallback)
 *
 * The API key is read from the environment via application-prod.properties.
 * It is NEVER returned to the frontend.
 */
@Service
public class AiChatService {

    private static final Logger log = LoggerFactory.getLogger(AiChatService.class);

    private static final String FALLBACK_MESSAGE =
        "I do not have the information you need. Please contact the admin or desired department for further assistance.";

    private static final String OPENAI_API_URL    = "https://api.openai.com/v1/chat/completions";
    private static final String DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL       = "claude-3-5-haiku-20241022";
    private static final int    MAX_HISTORY_TURNS  = 6;  // keep last 3 user+assistant pairs

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String openaiModel;

    @Value("${anthropic.api.key:}")
    private String anthropicApiKey;

    // ── Repositories injected for data context ────────────────────────────────
    private final StudentProfileRepository      studentProfileRepo;
    private final AdvisorRepository             advisorRepo;
    private final AssignmentRepository          assignmentRepo;
    private final AttendanceRecordRepository    attendanceRepo;
    private final PaymentRecordRepository       paymentRepo;
    private final CourseSectionRepository       courseSectionRepo;
    private final AdvisedCourseRepository       advisedCourseRepo;
    private final AppUserRepository             appUserRepo;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient   httpClient   = HttpClient.newHttpClient();

    public AiChatService(
        StudentProfileRepository   studentProfileRepo,
        AdvisorRepository          advisorRepo,
        AssignmentRepository       assignmentRepo,
        AttendanceRecordRepository attendanceRepo,
        PaymentRecordRepository    paymentRepo,
        CourseSectionRepository    courseSectionRepo,
        AdvisedCourseRepository    advisedCourseRepo,
        AppUserRepository          appUserRepo
    ) {
        this.studentProfileRepo = studentProfileRepo;
        this.advisorRepo        = advisorRepo;
        this.assignmentRepo     = assignmentRepo;
        this.attendanceRepo     = attendanceRepo;
        this.paymentRepo        = paymentRepo;
        this.courseSectionRepo  = courseSectionRepo;
        this.advisedCourseRepo  = advisedCourseRepo;
        this.appUserRepo        = appUserRepo;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Process a chat message from the authenticated user.
     *
     * @param userId  The authenticated user's ID (from JWT)
     * @param role    The user's role (STUDENT / FACULTY / ADMIN)
     * @param request The chat request containing message + optional history
     * @return Map with keys: reply (String), topic (String), fallback (boolean)
     */
    public Map<String, Object> chat(String userId, String role, AiChatRequest request) {
        String userMessage = request.getMessage();
        if (userMessage == null || userMessage.isBlank()) {
            return buildResult(FALLBACK_MESSAGE, "NONE", true);
        }

        // ── Layer 1: Topic classification (no Claude needed for out-of-scope) ──
        TopicClassifier.Topic topic = TopicClassifier.classify(userMessage);
        if (topic == TopicClassifier.Topic.OUT_OF_SCOPE) {
            return buildResult(FALLBACK_MESSAGE, "OUT_OF_SCOPE", true);
        }

        // ── Layer 2: Fetch real user context ──────────────────────────────────
        String contextBlock = buildContextBlock(userId, role, topic);

        // ── Layer 3: Call AI model with system prompt + context ─────────────────
        try {
            String systemPrompt = buildSystemPrompt(contextBlock);
            String effectiveOpenAiKey = getEffectiveOpenAiKey();
            String reply;
            if (effectiveOpenAiKey != null) {
                log.info("[AiChatService] Generating reply via OpenAI ({})", (openaiModel != null && !openaiModel.isBlank()) ? openaiModel : DEFAULT_OPENAI_MODEL);
                reply = callOpenAI(effectiveOpenAiKey, systemPrompt, request.getHistory(), userMessage);
            } else if (hasValidAnthropicKey()) {
                log.info("[AiChatService] Generating reply via Anthropic ({})", CLAUDE_MODEL);
                reply = callClaude(systemPrompt, request.getHistory(), userMessage);
            } else {
                log.warn("[AiChatService] No valid AI provider key is configured");
                return buildResult(
                    "The AI assistant is not configured yet. Please ask an administrator to set OPENAI_API_KEY or ANTHROPIC_API_KEY on the backend service.",
                    topic.name(), true
                );
            }
            return buildResult(reply, topic.name(), false);
        } catch (Exception e) {
            log.error("[AiChatService] AI API error for user {}: {}", userId, e.getMessage());
            return buildResult(
                "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
                topic.name(), false
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Context building — fetches real DB data per topic
    // ─────────────────────────────────────────────────────────────────────────

    private String buildContextBlock(String userId, String role, TopicClassifier.Topic topic) {
        StringBuilder sb = new StringBuilder();
        sb.append("=== USER CONTEXT ===\n");
        sb.append("User ID: ").append(userId).append("\n");
        sb.append("Role: ").append(role).append("\n\n");

        boolean isStudent = "STUDENT".equalsIgnoreCase(role);

        switch (topic) {
            case PAYMENT_METHODS -> appendPaymentContext(sb, userId, isStudent);
            case ADVISING_SCHEDULE -> appendAdvisingScheduleContext(sb, userId, isStudent);
            case CREDIT_LIMITS -> appendCreditLimitContext(sb, userId, isStudent);
            case ADVISED_COURSES -> appendAdvisedCoursesContext(sb, userId, isStudent);
            case ASSIGNMENTS, ASSIGNMENT_DUE_DATES -> appendAssignmentContext(sb, userId, role);
            case ADVISOR_EMAIL -> appendAdvisorEmailContext(sb, userId, isStudent);
            case ATTENDANCE -> appendAttendanceContext(sb, userId, isStudent);
            case COURSE_SEAT_AVAILABILITY -> appendSeatContext(sb);
            case COURSE_MATERIALS -> sb.append(
                "COURSE MATERIALS NOTE: The portal stores assignment files and attachments. " +
                "Lecture slides and syllabi are not yet in the digital system — " +
                "students should check with their course faculty directly or visit the course page on the portal.\n"
            );
            case ADMIN_QUERIES -> sb.append(
                "ADMIN PROCEDURES:\n" +
                "- Official Transcript: Submit a request at the Registrar's office or via the admin portal.\n" +
                "- Leave Application: Submit through the student portal under Academic Services.\n" +
                "- Bonafide / Enrollment Certificate: Request from the Registrar with a 3–5 working day turnaround.\n" +
                "- ID Card Issues: Contact the IT/Admin office directly.\n"
            );
            case PASSWORD_CHANGE -> sb.append(
                "PASSWORD CHANGE STEPS:\n" +
                "1. On the login page, click 'Forgot Password'.\n" +
                "2. Enter your registered email address.\n" +
                "3. Check your email for a reset link.\n" +
                "4. Follow the link to set a new password.\n" +
                "5. If the email doesn't arrive within 5 minutes, check your spam folder.\n" +
                "6. If still stuck, contact the IT Help Desk or admin.\n"
            );
            default -> sb.append("No additional context available for this topic.\n");
        }

        sb.append("\n=== END CONTEXT ===\n");
        return sb.toString();
    }

    private void appendPaymentContext(StringBuilder sb, String userId, boolean isStudent) {
        sb.append("PAYMENT INFORMATION:\n");
        if (!isStudent) {
            sb.append("Faculty/Admin viewing payment context — only student payment records are accessible.\n");
            return;
        }
        List<PaymentRecord> records = paymentRepo.findByStudentIdOrderByPaidAtDesc(userId);
        if (records.isEmpty()) {
            sb.append("No payment records found for this student.\n");
            sb.append("Accepted payment methods: Online via Stripe (credit/debit card), Offline bank deposit.\n");
            sb.append("Contact the Accounts department for installment arrangements or late payment queries.\n");
        } else {
            PaymentRecord latest = records.get(0);
            sb.append("Latest payment record:\n");
            sb.append("  Receipt No.: ").append(latest.getReceiptNumber()).append("\n");
            sb.append("  Term: ").append(latest.getTerm()).append("\n");
            sb.append("  Net Payable: ").append(latest.getNetPayable()).append(" BDT\n");
            sb.append("  Payment Method: ").append(latest.getPaymentMethod()).append("\n");
            sb.append("  Status: ").append(latest.getPaymentStatus()).append("\n");
            sb.append("  Paid At: ").append(latest.getPaidAt()).append("\n");
            sb.append("Total payment records on file: ").append(records.size()).append("\n");
            sb.append("Accepted methods: Stripe online (card), offline bank deposit.\n");
        }
    }

    private void appendAdvisingScheduleContext(StringBuilder sb, String userId, boolean isStudent) {
        sb.append("ADVISING SCHEDULE:\n");
        if (isStudent) {
            Optional<StudentProfile> profileOpt = studentProfileRepo.findById(userId);
            profileOpt.ifPresent(p -> {
                sb.append("  Student: ").append(p.getStudentName()).append("\n");
                sb.append("  Advising Confirmed: ").append(p.isAdvisingConfirmed() ? "Yes" : "No").append("\n");
                if (p.isAdvisingConfirmed() && p.getAdvisingConfirmedAt() != null) {
                    sb.append("  Confirmed At: ").append(p.getAdvisingConfirmedAt()).append("\n");
                }
            });
        }
        // Provide all advisor availability info
        List<Advisor> advisors = advisorRepo.findAll();
        if (!advisors.isEmpty()) {
            sb.append("Advisor availability:\n");
            advisors.stream().limit(5).forEach(a -> {
                sb.append("  - ").append(a.getName())
                  .append(" (").append(a.getDepartmentLabel()).append(")")
                  .append(": ").append(String.join(", ", a.getAvailableDays()))
                  .append(", Hours: ").append(a.getAvailableHours()).append("\n");
            });
        }
        sb.append("Advising is conducted in-person and online (contact your advisor to confirm mode).\n");
    }

    private void appendCreditLimitContext(StringBuilder sb, String userId, boolean isStudent) {
        sb.append("CREDIT LIMITS:\n");
        if (!isStudent) {
            sb.append("Credit limit rules: CGPA >= 3.5 → 5 courses/15 credits; CGPA >= 2.0 → 4 courses/12 credits; CGPA < 2.0 → 3 courses/9 credits.\n");
            return;
        }
        Optional<StudentProfile> profileOpt = studentProfileRepo.findById(userId);
        if (profileOpt.isEmpty()) {
            sb.append("Student profile not found.\n");
            return;
        }
        StudentProfile p = profileOpt.get();
        sb.append("  Student: ").append(p.getStudentName()).append("\n");
        sb.append("  CGPA: ").append(p.getCgpa()).append("\n");
        sb.append("  On Probation: ").append(p.isOnProbation() ? "Yes" : "No").append("\n");
        sb.append("  Max Courses Allowed: ").append(p.getCourseLimit()).append("\n");
        sb.append("  Max Credits Allowed: ").append(p.getCreditLimit()).append("\n");
        sb.append("  Credits Currently Registered: ").append(p.getCurrentCredits()).append("\n");
        sb.append("  Remaining Credits: ").append(p.getRemainingCredits()).append("\n");
        sb.append("  Completed Credits: ").append(p.getCompletedCredits()).append("\n");
    }

    private void appendAdvisedCoursesContext(StringBuilder sb, String userId, boolean isStudent) {
        sb.append("ADVISED/REGISTERED COURSES THIS SEMESTER:\n");
        if (!isStudent) {
            sb.append("This context is only available for students.\n");
            return;
        }
        List<AdvisedCourse> courses = advisedCourseRepo.findByStudentProfile_StudentId(userId);
        if (courses.isEmpty()) {
            sb.append("No advised courses found for this student this semester.\n");
            sb.append("If advising has not yet taken place, please contact your academic advisor.\n");
        } else {
            courses.forEach(c -> sb.append("  - ")
                .append(c.getCourseCode()).append(": ").append(c.getCourseTitle())
                .append(" | Section: ").append(c.getSection())
                .append(" | Faculty: ").append(c.getFaculty())
                .append(" | Credits: ").append(c.getCredits())
                .append(" | Time: ").append(c.getTime()).append("\n")
            );
            sb.append("Advised by: ").append(courses.get(0).getAssignedBy()).append("\n");
        }
    }

    private void appendAssignmentContext(StringBuilder sb, String userId, String role) {
        sb.append("ASSIGNMENTS:\n");
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        LocalDateTime now = LocalDateTime.now();

        if ("STUDENT".equalsIgnoreCase(role)) {
            // Get courses this student is registered for
            List<AdvisedCourse> advised = advisedCourseRepo.findByStudentProfile_StudentId(userId);
            List<String> courseCodes = advised.stream().map(AdvisedCourse::getCourseCode).collect(Collectors.toList());
            List<Assignment> assignments = courseCodes.isEmpty()
                ? assignmentRepo.findAllByOrderByDeadlineAsc()
                : assignmentRepo.findByCourseCodeInOrderByDeadlineAsc(courseCodes);
            if (assignments.isEmpty()) {
                sb.append("No assignments found for your registered courses.\n");
            } else {
                sb.append("Upcoming/recent assignments:\n");
                assignments.stream().limit(10).forEach(a -> {
                    boolean upcoming = a.getDeadline() != null && a.getDeadline().isAfter(now);
                    sb.append("  - [").append(upcoming ? "UPCOMING" : "PAST").append("] ")
                      .append(a.getCourseCode()).append(": ").append(a.getTitle())
                      .append(" | Due: ").append(a.getDeadline() != null ? a.getDeadline().format(fmt) : "TBD")
                      .append(" | Points: ").append(a.getTotalPoints()).append("\n");
                });
            }
        } else if ("FACULTY".equalsIgnoreCase(role)) {
            AppUser user = appUserRepo.findByUserId(userId).orElse(null);
            String name = user != null ? user.getFullName() : userId;
            List<Assignment> myAssignments = assignmentRepo.findByCreatedByOrderByDeadlineAsc(name);
            if (myAssignments.isEmpty()) {
                myAssignments = assignmentRepo.findByCreatedByOrderByDeadlineAsc(userId);
            }
            sb.append("Assignments you created:\n");
            myAssignments.stream().limit(10).forEach(a ->
                sb.append("  - ").append(a.getCourseCode()).append(": ").append(a.getTitle())
                  .append(" | Due: ").append(a.getDeadline() != null ? a.getDeadline().format(fmt) : "TBD").append("\n")
            );
        } else {
            List<Assignment> all = assignmentRepo.findAllByOrderByDeadlineAsc();
            sb.append("All assignments (admin view), total: ").append(all.size()).append("\n");
        }
    }

    private void appendAdvisorEmailContext(StringBuilder sb, String userId, boolean isStudent) {
        sb.append("ADVISOR / FACULTY CONTACT:\n");
        if (isStudent) {
            // Find the advisor who assigned courses to this student
            List<AdvisedCourse> courses = advisedCourseRepo.findByStudentProfile_StudentId(userId);
            if (!courses.isEmpty()) {
                String advisorName = courses.get(0).getAssignedBy();
                sb.append("Your assigned advisor: ").append(advisorName).append("\n");
                // Try to find matching Advisor entity
                advisorRepo.findAll().stream()
                    .filter(a -> a.getName().equalsIgnoreCase(advisorName))
                    .findFirst()
                    .ifPresentOrElse(
                        a -> sb.append("  Email: ").append(a.getEmail()).append("\n")
                               .append("  Available: ").append(String.join(", ", a.getAvailableDays()))
                               .append(", ").append(a.getAvailableHours()).append("\n"),
                        () -> sb.append("  (Email not found in advisor directory — contact the department office)\n")
                    );
            } else {
                sb.append("No advisor assignment found. Please contact the department office.\n");
            }
        }
        // List all advisors with emails
        sb.append("\nAll advisors in the system:\n");
        advisorRepo.findAll().forEach(a ->
            sb.append("  - ").append(a.getName())
              .append(" (").append(a.getDepartmentLabel()).append(")")
              .append(": ").append(a.getEmail()).append("\n")
        );
    }

    private void appendAttendanceContext(StringBuilder sb, String userId, boolean isStudent) {
        sb.append("ATTENDANCE:\n");
        if (!isStudent) {
            sb.append("Attendance records are only available for students.\n");
            return;
        }
        List<AttendanceRecord> records = attendanceRepo.findByStudentId(userId);
        if (records.isEmpty()) {
            sb.append("No attendance records found for this student.\n");
            return;
        }
        // Group by course and compute percentages
        Map<String, List<AttendanceRecord>> byCourse = records.stream()
            .collect(Collectors.groupingBy(AttendanceRecord::getCourseId));

        byCourse.forEach((courseId, recs) -> {
            long total   = recs.size();
            long present = recs.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();
            long late    = recs.stream().filter(r -> "LATE".equalsIgnoreCase(r.getStatus())).count();
            double pct   = total > 0 ? (double)(present + late) / total * 100 : 0;
            String name  = recs.get(0).getCourseName();
            boolean eligible = pct >= 75.0;
            sb.append("  - ").append(courseId).append(" (").append(name).append(")")
              .append(": ").append(String.format("%.1f%%", pct))
              .append(" (").append(present).append(" present, ").append(late).append(" late, ")
              .append(total - present - late).append(" absent out of ").append(total).append(" classes)")
              .append(" | Exam Eligible: ").append(eligible ? "YES ✓" : "NO ✗ (< 75%)").append("\n");
        });
        sb.append("Exam eligibility threshold: 75% attendance required.\n");
        sb.append("For regularization, contact your course faculty or the Dean's office.\n");
    }

    private void appendSeatContext(StringBuilder sb) {
        sb.append("COURSE SEAT AVAILABILITY (current term):\n");
        List<CourseSection> sections = courseSectionRepo.findAll();
        long openCount = sections.stream().filter(s -> s.getBooked() < s.getTotalSeats()).count();
        long fullCount = sections.stream().filter(s -> s.getBooked() >= s.getTotalSeats()).count();
        sb.append("  Total sections: ").append(sections.size()).append("\n");
        sb.append("  Sections with open seats: ").append(openCount).append("\n");
        sb.append("  Full sections: ").append(fullCount).append("\n");
        sb.append("  To check a specific course section, please specify the course code and section.\n");
        sb.append("  (Detailed seat data is available in the Courses page of the portal.)\n");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // System prompt builder
    // ─────────────────────────────────────────────────────────────────────────

    private String buildSystemPrompt(String contextBlock) {
        return """
            You are CampusConnect AI Assistant — a helpful academic portal assistant for university students, faculty, and administrators.

            ## STRICT SCOPE RESTRICTION
            You may ONLY answer questions about these 12 topics:
            1. Course materials (lecture slides, syllabus, reading lists, lab manuals, past exams)
            2. Payment methods (tuition fees, payment options, receipts, late fees)
            3. Advising schedule (advising sessions, appointments, advisor hours, online/in-person)
            4. Credit limits (registration limits, full-time status, remaining credits, graduation credits)
            5. Courses taken in advising (advisor-approved/recommended courses this semester)
            6. Assignments for courses (pending assignments, grading status, submission format)
            7. Assignment due dates (deadlines, extensions, final project dates)
            8. Advisor / faculty email (contact information for advisors and faculty)
            9. Admin queries (official transcripts, leave applications, bonafide certificates, ID cards)
            10. Password change (portal password reset, login issues)
            11. Attendance (attendance percentage, exam eligibility, regularization)
            12. Course seat availability (open seats, full sections, waitlists)

            ## FALLBACK RULE — THIS IS MANDATORY
            For ANY question outside these 12 topics, you MUST reply with EXACTLY this sentence and nothing else:
            "I do not have the information you need. Please contact the admin or desired department for further assistance."

            Do NOT attempt to answer general knowledge questions, personal advice, jokes, weather, geography, university rankings, or anything else — even if you know the answer. Scope enforcement is your highest priority.

            ## RESPONSE STYLE
            - Be concise, friendly, and professional
            - Use the user context data below to give accurate, personalized answers
            - If the context says "not found" or data is missing, say so honestly and suggest who to contact
            - Do not fabricate data — only use what is in the context block below
            - Format responses clearly; use bullet points where appropriate

            ## USER CONTEXT (real-time data fetched from the database)
            """ + contextBlock;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Claude API call
    // ─────────────────────────────────────────────────────────────────────────

    private String callClaude(String systemPrompt,
                              List<AiChatRequest.Turn> history,
                              String userMessage) throws Exception {

        // Build messages array
        ArrayNode messagesArray = objectMapper.createArrayNode();

        // Include recent history (max MAX_HISTORY_TURNS turns = pairs)
        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - MAX_HISTORY_TURNS);
            for (int i = start; i < history.size(); i++) {
                AiChatRequest.Turn turn = history.get(i);
                ObjectNode msg = objectMapper.createObjectNode();
                msg.put("role", turn.getRole());
                msg.put("content", turn.getContent());
                messagesArray.add(msg);
            }
        }

        // Add current user message
        ObjectNode userMsg = objectMapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messagesArray.add(userMsg);

        // Build request body
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", CLAUDE_MODEL);
        body.put("max_tokens", 1024);
        body.put("system", systemPrompt);
        body.set("messages", messagesArray);

        String requestBody = objectMapper.writeValueAsString(body);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(ANTHROPIC_API_URL))
            .header("Content-Type", "application/json")
            .header("x-api-key", anthropicApiKey)
            .header("anthropic-version", "2023-06-01")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("[AiChatService] Anthropic API returned {}: {}", response.statusCode(), response.body());
            throw new RuntimeException("Anthropic API error: HTTP " + response.statusCode());
        }

        JsonNode json = objectMapper.readTree(response.body());
        return json.path("content").path(0).path("text").asText(FALLBACK_MESSAGE);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OpenAI API call
    // ─────────────────────────────────────────────────────────────────────────

    private String getEffectiveOpenAiKey() {
        if (openaiApiKey != null && !openaiApiKey.isBlank() && !openaiApiKey.contains("replace")) {
            return openaiApiKey.trim();
        }
        if (anthropicApiKey != null && anthropicApiKey.startsWith("sk-proj-")) {
            return anthropicApiKey.trim();
        }
        return null;
    }

    private boolean hasValidAnthropicKey() {
        return anthropicApiKey != null
            && !anthropicApiKey.isBlank()
            && anthropicApiKey.startsWith("sk-ant-")
            && !anthropicApiKey.contains("replace");
    }

    private String callOpenAI(String apiKey,
                              String systemPrompt,
                              List<AiChatRequest.Turn> history,
                              String userMessage) throws Exception {

        ArrayNode messagesArray = objectMapper.createArrayNode();

        // 1. System prompt message
        ObjectNode sysMsg = objectMapper.createObjectNode();
        sysMsg.put("role", "system");
        sysMsg.put("content", systemPrompt);
        messagesArray.add(sysMsg);

        // 2. Recent history turns
        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - MAX_HISTORY_TURNS);
            for (int i = start; i < history.size(); i++) {
                AiChatRequest.Turn turn = history.get(i);
                ObjectNode msg = objectMapper.createObjectNode();
                msg.put("role", turn.getRole());
                msg.put("content", turn.getContent());
                messagesArray.add(msg);
            }
        }

        // 3. Current user message
        ObjectNode userMsg = objectMapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);
        messagesArray.add(userMsg);

        // Build request body
        ObjectNode body = objectMapper.createObjectNode();
        String model = (openaiModel != null && !openaiModel.isBlank()) ? openaiModel : DEFAULT_OPENAI_MODEL;
        body.put("model", model);
        body.put("max_tokens", 1024);
        body.put("temperature", 0.3);
        body.set("messages", messagesArray);

        String requestBody = objectMapper.writeValueAsString(body);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(OPENAI_API_URL))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + apiKey)
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("[AiChatService] OpenAI API returned {}: {}", response.statusCode(), response.body());
            throw new RuntimeException("OpenAI API error: HTTP " + response.statusCode() + " - " + response.body());
        }

        JsonNode json = objectMapper.readTree(response.body());
        return json.path("choices").path(0).path("message").path("content").asText(FALLBACK_MESSAGE);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────────────────────────────────

    private Map<String, Object> buildResult(String reply, String topic, boolean fallback) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("reply", reply);
        result.put("topic", topic);
        result.put("fallback", fallback);
        return result;
    }
}
