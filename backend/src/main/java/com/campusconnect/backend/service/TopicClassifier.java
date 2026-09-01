package com.campusconnect.backend.service;

import java.util.regex.Pattern;

/**
 * TopicClassifier – Classifies user messages against the 12 allowed chatbot topics.
 *
 * MVC Role: Service (helper)
 *
 * Two-layer scope enforcement strategy:
 *   Layer 1 (this class): Fast keyword/regex pre-screen. If a message matches
 *     no known topic, returns OUT_OF_SCOPE immediately — Claude is never called.
 *   Layer 2 (system prompt): Claude is instructed to use the fallback for
 *     anything outside the 12 categories even if Layer 1 passed.
 *
 * This saves API cost and provides deterministic fallback for obvious out-of-scope queries.
 */
public class TopicClassifier {

    public enum Topic {
        COURSE_MATERIALS,
        PAYMENT_METHODS,
        ADVISING_SCHEDULE,
        CREDIT_LIMITS,
        ADVISED_COURSES,
        ASSIGNMENTS,
        ASSIGNMENT_DUE_DATES,
        ADVISOR_EMAIL,
        ADMIN_QUERIES,
        PASSWORD_CHANGE,
        ATTENDANCE,
        COURSE_SEAT_AVAILABILITY,
        OUT_OF_SCOPE
    }

    // ── Keyword patterns for each topic ─────────────────────────────────────────

    private static final Pattern COURSE_MATERIALS = Pattern.compile(
        "(?i)(lecture|slide|syllabus|reading list|lab manual|past exam|exam paper|" +
        "course material|study material|handout|textbook|reference book|download.*course|" +
        "course content|module|chapter|notes|reading)",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern PAYMENT_METHODS = Pattern.compile(
        "(?i)(payment|pay|tuition|fee|installment|late payment|credit card|receipt|" +
        "invoice|billing|due amount|outstanding|stripe|bank deposit|semester fee|" +
        "gross payable|net payable|pay.*semester|how.*pay)",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern ADVISING_SCHEDULE = Pattern.compile(
        "(?i)(advising|advisor session|advising appointment|advising slot|advising hour|" +
        "book.*appointment|reschedule.*advis|next advis|advis.*online|advis.*person|" +
        "advis.*available|when.*advis|advis.*time|advis.*schedule)",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern CREDIT_LIMITS = Pattern.compile(
        "(?i)(credit limit|credit hour|register.*credit|maximum credit|minimum credit|" +
        "full.?time|credits.*graduate|credits left|credits remaining|how many credit|" +
        "credit.*semester|registration limit|course limit|exceed.*credit|credit.*approval)",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern ADVISED_COURSES = Pattern.compile(
        "(?i)(advised course|advising course|advisor.*approve|approved.*course|" +
        "advisor.*recommend|courses.*advisor|last advis|advis.*session.*course|" +
        "advisor.*approve.*course|courses.*this semester.*advisor|advis.*list)",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern ASSIGNMENTS = Pattern.compile(
        "(?i)(assignment|homework|task.*course|pending.*assignment|assignment.*grade|" +
        "how many assignment|submission format|assignment.*submit|submit.*assignment|" +
        "assignment.*graded|lab.*report|project.*submit|coursework)",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern DUE_DATES = Pattern.compile(
        "(?i)(due date|deadline|when.*due|assignment.*due|next.*deadline|due.*assignment|" +
        "extension.*assignment|final project.*deadline|submission.*deadline|due.*project|" +
        "project.*due|when.*submit|submit.*by)",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern ADVISOR_EMAIL = Pattern.compile(
        "(?i)(advisor.*email|advisor.*contact|contact.*advisor|faculty.*email|" +
        "email.*advisor|email.*faculty|email.*teacher|email.*professor|" +
        "who.*advisor|assigned advisor|my advisor|advisor.*this semester|faculty.*contact|" +
        "how.*contact.*faculty|reach.*advisor|advisor.*address)",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern ADMIN_QUERIES = Pattern.compile(
        "(?i)(transcript|official transcript|leave application|bonafide|enrollment certificate|" +
        "id card|student id|clearance|academic record|certificate.*enrollment|" +
        "degree certificate|migration certificate|admin|administration|registrar|" +
        "document.*request|request.*document|bank statement.*student|verification letter)",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern PASSWORD_CHANGE = Pattern.compile(
        "(?i)(password|reset password|forgot password|change password|login.*problem|" +
        "cannot.*login|can't.*login|locked.*account|account.*locked|email.*password|" +
        "portal.*password|new password|update.*password|password.*email)",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern ATTENDANCE = Pattern.compile(
        "(?i)(attendance|present|absent|late|attendance.*percentage|attendance.*eligible|" +
        "sit.*exam.*attendance|exam.*eligible|attendance.*regulariz|regulariz.*attendance|" +
        "how many.*class|class.*miss|missed.*class|attendance.*record|mark.*attendance)",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern SEAT_AVAILABILITY = Pattern.compile(
        "(?i)(seat|available.*course|course.*available|open seat|full.*course|course.*full|" +
        "waitlist|wait list|join.*course|course.*capacity|course.*seat|register.*course.*seat|" +
        "seat.*available|any.*seat|enrollment.*open|section.*full|section.*available)",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * Classify the user message against the 12 allowed topics.
     *
     * @param message The raw user message
     * @return The matching Topic, or OUT_OF_SCOPE if no pattern matches
     */
    public static Topic classify(String message) {
        if (message == null || message.isBlank()) return Topic.OUT_OF_SCOPE;

        // Order matters: more specific patterns first
        if (ADVISED_COURSES.matcher(message).find())    return Topic.ADVISED_COURSES;
        if (ADVISING_SCHEDULE.matcher(message).find())  return Topic.ADVISING_SCHEDULE;
        if (ADVISOR_EMAIL.matcher(message).find())      return Topic.ADVISOR_EMAIL;
        if (DUE_DATES.matcher(message).find())          return Topic.ASSIGNMENT_DUE_DATES;
        if (ASSIGNMENTS.matcher(message).find())        return Topic.ASSIGNMENTS;
        if (COURSE_MATERIALS.matcher(message).find())   return Topic.COURSE_MATERIALS;
        if (CREDIT_LIMITS.matcher(message).find())      return Topic.CREDIT_LIMITS;
        if (PAYMENT_METHODS.matcher(message).find())    return Topic.PAYMENT_METHODS;
        if (ATTENDANCE.matcher(message).find())         return Topic.ATTENDANCE;
        if (SEAT_AVAILABILITY.matcher(message).find()) return Topic.COURSE_SEAT_AVAILABILITY;
        if (ADMIN_QUERIES.matcher(message).find())      return Topic.ADMIN_QUERIES;
        if (PASSWORD_CHANGE.matcher(message).find())    return Topic.PASSWORD_CHANGE;

        return Topic.OUT_OF_SCOPE;
    }
}
