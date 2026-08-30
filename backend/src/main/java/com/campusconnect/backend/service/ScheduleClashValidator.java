package com.campusconnect.backend.service;

import com.campusconnect.backend.model.CourseSection;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * ScheduleClashValidator – Validates class schedule time clashes and exam day/time clashes.
 *
 * Rules:
 * 1. Class Schedule Clash: Two courses cannot share the same day and overlapping class times.
 * 2. Exam Schedule Clash: Two courses cannot have an exam on the SAME day and SAME time slot.
 *    (Same-day exams at different times are permitted; same day AND same time are prohibited).
 *
 * MVC Role: Service / Component
 */
@Component
public class ScheduleClashValidator {

    private static final Map<String, String> DAY_MAP = Map.of(
            "SUN", "Sunday",
            "MON", "Monday",
            "TUE", "Tuesday",
            "WED", "Wednesday",
            "THU", "Thursday",
            "FRI", "Friday",
            "SAT", "Saturday"
    );

    public record TimeInterval(String day, int startMinutes, int endMinutes, String originalSlot) {}
    public record ExamSlot(String date, int startMinutes, int endMinutes, String originalTime, String examType) {}

    /**
     * Checks for class schedule time conflicts between a candidate section and existing sections.
     * Returns an error description if a clash is detected, or null if clear.
     */
    public String checkClassTimeClash(String candidateTime, String candidateCode, String candidateSection, List<CourseSection> existingSections) {
        if (candidateTime == null || candidateTime.isBlank() || existingSections == null || existingSections.isEmpty()) {
            return null;
        }

        List<TimeInterval> candidateIntervals = parseClassTimeIntervals(candidateTime);

        for (CourseSection existing : existingSections) {
            if (existing == null || existing.getTime() == null || existing.getTime().isBlank()) continue;
            // Skip if it's the exact same section being compared with itself
            if (candidateCode != null && candidateCode.equalsIgnoreCase(existing.getCode()) &&
                candidateSection != null && candidateSection.equalsIgnoreCase(existing.getSection())) {
                continue;
            }

            List<TimeInterval> existingIntervals = parseClassTimeIntervals(existing.getTime());

            for (TimeInterval cInt : candidateIntervals) {
                for (TimeInterval eInt : existingIntervals) {
                    if (cInt.day.equalsIgnoreCase(eInt.day)) {
                        // Check interval overlap: startA < endB && endA > startB
                        if (cInt.startMinutes < eInt.endMinutes && cInt.endMinutes > eInt.startMinutes) {
                            return "Class schedule clash: " + (candidateCode != null ? candidateCode : "This course") +
                                    " clashes with " + existing.getCode() + "-" + existing.getSection() +
                                    " on " + cInt.day + " (" + cInt.originalSlot + ").";
                        }
                    }
                }
            }
        }
        return null;
    }

    /**
     * Checks for exam schedule conflicts (same day + overlapping exam time) between candidate and existing sections.
     * Returns an error description if a clash is detected, or null if clear.
     */
    public String checkExamClash(CourseSection candidate, List<CourseSection> existingSections) {
        if (candidate == null || existingSections == null || existingSections.isEmpty()) {
            return null;
        }

        List<ExamSlot> candidateExams = extractExamSlots(candidate);

        for (CourseSection existing : existingSections) {
            if (existing == null) continue;
            if (candidate.getId() != null && candidate.getId().equalsIgnoreCase(existing.getId())) continue;

            List<ExamSlot> existingExams = extractExamSlots(existing);

            for (ExamSlot cExam : candidateExams) {
                for (ExamSlot eExam : existingExams) {
                    if (cExam.date.equalsIgnoreCase(eExam.date)) {
                        // Same day — check if time intervals overlap
                        if (cExam.startMinutes < eExam.endMinutes && cExam.endMinutes > eExam.startMinutes) {
                            return cExam.examType + " exam clash: " + candidate.getCode() + "-" + candidate.getSection() +
                                    " and " + existing.getCode() + "-" + existing.getSection() +
                                    " are both scheduled on " + cExam.date + " at " + cExam.originalTime + ".";
                        }
                    }
                }
            }
        }
        return null;
    }

    /**
     * Parses standard BRACU schedule string into structured day & minute intervals.
     */
    public List<TimeInterval> parseClassTimeIntervals(String timeStr) {
        List<TimeInterval> intervals = new ArrayList<>();
        if (timeStr == null || timeStr.isBlank()) return intervals;

        // Format 1: "SUNDAY(2:00 PM-3:20 PM-11F-39L) ; TUESDAY(2:00 PM-3:20 PM-11F-39L)"
        if (timeStr.contains("(") && timeStr.contains(")")) {
            String[] segments = timeStr.split(";");
            Pattern timePattern = Pattern.compile("(\\d{1,2}:\\d{2}\\s*[AaPp][Mm])\\s*[-–]\\s*(\\d{1,2}:\\d{2}\\s*[AaPp][Mm])");

            for (String seg : segments) {
                String trimmed = seg.trim();
                int parenStart = trimmed.indexOf('(');
                if (parenStart > 0) {
                    String rawDay = trimmed.substring(0, parenStart).trim().toUpperCase();
                    String resolvedDay = resolveDay(rawDay);

                    Matcher m = timePattern.matcher(trimmed);
                    if (resolvedDay != null && m.find()) {
                        String startStr = m.group(1).trim();
                        String endStr = m.group(2).trim();
                        int startMin = parseTimeToMinutes(startStr);
                        int endMin = parseTimeToMinutes(endStr);
                        String originalSlot = startStr + " - " + endStr;
                        intervals.add(new TimeInterval(resolvedDay, startMin, endMin, originalSlot));
                    }
                }
            }
            if (!intervals.isEmpty()) return intervals;
        }

        // Format 2: "SUN-TUE 08:00 AM-09:20 AM"
        Pattern p2 = Pattern.compile("([A-Za-z\\-]+)\\s+(\\d{1,2}:\\d{2}\\s*[AaPp][Mm])\\s*[-–]\\s*(\\d{1,2}:\\d{2}\\s*[AaPp][Mm])");
        Matcher m2 = p2.matcher(timeStr);
        if (m2.find()) {
            String daysToken = m2.group(1).toUpperCase();
            String startStr = m2.group(2).trim();
            String endStr = m2.group(3).trim();
            int startMin = parseTimeToMinutes(startStr);
            int endMin = parseTimeToMinutes(endStr);
            String originalSlot = startStr + " - " + endStr;

            for (Map.Entry<String, String> entry : DAY_MAP.entrySet()) {
                if (daysToken.contains(entry.getKey())) {
                    intervals.add(new TimeInterval(entry.getValue(), startMin, endMin, originalSlot));
                }
            }
        }

        return intervals;
    }

    private List<ExamSlot> extractExamSlots(CourseSection sec) {
        List<ExamSlot> slots = new ArrayList<>();
        if (sec == null) return slots;

        // 1. Midterm exam
        if (sec.getMidtermExam() != null && !sec.getMidtermExam().isBlank()) {
            ExamSlot ms = parseExamString(sec.getMidtermExam(), "Midterm");
            if (ms != null) slots.add(ms);
        }

        // 2. Final exam (examDay)
        if (sec.getExamDay() != null && !sec.getExamDay().isBlank()) {
            ExamSlot fs = parseExamString(sec.getExamDay(), "Final");
            if (fs != null) slots.add(fs);
        }

        return slots;
    }

    /**
     * Parses exam strings such as:
     * "Monday, July 27, 2026 2:00 PM - 4:00 PM"
     * "Jul 25, 2026 11:00 AM - 1:00 PM"
     * "2026-11-21 2:00 PM - 4:00 PM"
     */
    private ExamSlot parseExamString(String examStr, String examType) {
        if (examStr == null || examStr.isBlank()) return null;

        Pattern timePat = Pattern.compile("(\\d{1,2}:\\d{2}\\s*[AaPp][Mm])\\s*[-–]\\s*(\\d{1,2}:\\d{2}\\s*[AaPp][Mm])");
        Matcher m = timePat.matcher(examStr);
        if (m.find()) {
            String startStr = m.group(1).trim();
            String endStr = m.group(2).trim();
            int startMin = parseTimeToMinutes(startStr);
            int endMin = parseTimeToMinutes(endStr);
            String originalTime = startStr + " - " + endStr;

            // Date is the portion before the matched time
            String datePart = examStr.substring(0, m.start()).replaceAll("[,\\s]+$", "").trim();
            if (datePart.isBlank()) datePart = "Exam Day";

            return new ExamSlot(datePart, startMin, endMin, originalTime, examType);
        }
        return null;
    }

    private String resolveDay(String rawDay) {
        for (Map.Entry<String, String> entry : DAY_MAP.entrySet()) {
            if (rawDay.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }

    private int parseTimeToMinutes(String timeStr) {
        if (timeStr == null) return 0;
        String clean = timeStr.trim().toUpperCase();
        boolean isPm = clean.endsWith("PM");
        boolean isAm = clean.endsWith("AM");
        String noAmPm = clean.replace("AM", "").replace("PM", "").trim();

        String[] parts = noAmPm.split(":");
        int hours = Integer.parseInt(parts[0].trim());
        int minutes = parts.length > 1 ? Integer.parseInt(parts[1].trim()) : 0;

        if (isPm && hours < 12) hours += 12;
        if (isAm && hours == 12) hours = 0;

        return hours * 60 + minutes;
    }
}
