package com.campusconnect.backend.model;

import java.util.ArrayList;
import java.util.List;

/**
 * StudentProfile – Domain model for a student's academic profile.
 *
 * MVC Role: Model
 *
 * Used by the advisor to check status, credit load, and probation
 * before assigning courses.
 *
 * TODO (Phase 3): Map to a JPA entity and persist via StudentRepository.
 */
public class StudentProfile {

    private String            studentId;
    private String            studentName;
    private String            email;
    private String            department;
    private int               year;
    private double            cgpa;
    private int               completedCredits;   // credits finished so far
    private boolean           onProbation;         // CGPA < 2.0 → probationary
    private List<AdvisedCourse> advisedCourses;    // assigned this semester

    // ── Credit / course limits (derived from CGPA and probation status) ──
    // CGPA >= 3.5 (High standing):    5 courses, 15 credits
    // CGPA >= 2.0 (Good standing):    4 courses, 12 credits
    // CGPA <  2.0 (Probationary):     3 courses, 9  credits
    public static final double CGPA_HIGH_THRESHOLD    = 3.5;
    public static final double CGPA_MIN_THRESHOLD     = 2.0;
    public static final int    HIGH_MAX_COURSES        = 5;
    public static final int    STANDARD_MAX_COURSES    = 4;
    public static final int    PROBATION_MAX_COURSES   = 3;
    public static final int    CREDITS_PER_COURSE      = 3;

    // ── Constructors ──────────────────────────────────────────────
    public StudentProfile() {
        this.advisedCourses = new ArrayList<>();
    }

    public StudentProfile(String studentId, String studentName, String email,
                          String department, int year, double cgpa,
                          int completedCredits, boolean onProbation) {
        this.studentId        = studentId;
        this.studentName      = studentName;
        this.email            = email;
        this.department       = department;
        this.year             = year;
        this.cgpa             = cgpa;
        this.completedCredits = completedCredits;
        this.onProbation      = onProbation;
        this.advisedCourses   = new ArrayList<>();
    }

    // ── Derived helpers ───────────────────────────────────────────
    public int getCurrentCredits()  { return advisedCourses.stream().mapToInt(AdvisedCourse::getCredits).sum(); }

    public int getCourseLimit() {
        if (onProbation || cgpa < CGPA_MIN_THRESHOLD) return PROBATION_MAX_COURSES;
        if (cgpa >= CGPA_HIGH_THRESHOLD)              return HIGH_MAX_COURSES;
        return STANDARD_MAX_COURSES;
    }

    public int getCreditLimit()      { return getCourseLimit() * CREDITS_PER_COURSE; }
    public int getRemainingCredits() { return getCreditLimit() - getCurrentCredits(); }
    public int getRemainingCourses() { return getCourseLimit() - advisedCourses.size(); }

    // ── Getters & Setters ─────────────────────────────────────────
    public String             getStudentId()                         { return studentId; }
    public void               setStudentId(String id)               { this.studentId = id; }

    public String             getStudentName()                       { return studentName; }
    public void               setStudentName(String n)              { this.studentName = n; }

    public String             getEmail()                             { return email; }
    public void               setEmail(String e)                    { this.email = e; }

    public String             getDepartment()                        { return department; }
    public void               setDepartment(String d)               { this.department = d; }

    public int                getYear()                              { return year; }
    public void               setYear(int y)                        { this.year = y; }

    public double             getCgpa()                              { return cgpa; }
    public void               setCgpa(double c)                     { this.cgpa = c; }

    public int                getCompletedCredits()                  { return completedCredits; }
    public void               setCompletedCredits(int cc)           { this.completedCredits = cc; }

    public boolean            isOnProbation()                        { return onProbation; }
    public void               setOnProbation(boolean p)             { this.onProbation = p; }

    public List<AdvisedCourse> getAdvisedCourses()                  { return advisedCourses; }
    public void               setAdvisedCourses(List<AdvisedCourse> courses) { this.advisedCourses = courses; }
}
