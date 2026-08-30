/**
 * advisingModel.js – Model layer for the Advising page (v2 – full advising system).
 *
 * MVC Role: Model
 * Defines constants used for credit/course limit labelling in the view.
 *
 * Actual limit logic lives in the backend (StudentProfile.java) and is
 * returned per-profile in profile.courseLimit / profile.creditLimit.
 *
 * CGPA-based limits (must mirror StudentProfile.java):
 *   CGPA >= 3.5  → 5 courses, 15 credits
 *   CGPA >= 2.0  → 4 courses, 12 credits
 *   Probationary → 3 courses,  9 credits
 */

export const CREDITS_PER_COURSE     = 3    // every section in STATIC_COURSES = 3 credits

// CGPA thresholds (mirrors backend StudentProfile.java)
export const CGPA_HIGH_THRESHOLD    = 3.5
export const CGPA_MIN_THRESHOLD     = 2.0

// Course / credit limits by tier (mirrors backend StudentProfile.java)
export const HIGH_MAX_COURSES       = 5    // CGPA >= 3.5
export const HIGH_CREDIT_LIMIT      = 15
export const STANDARD_MAX_COURSES   = 4    // CGPA >= 2.0
export const STANDARD_CREDIT_LIMIT  = 12
export const PROBATION_MAX_COURSES  = 3    // CGPA < 2.0
export const PROBATION_CREDIT_LIMIT = 9

// Role constants
export const ROLE_ADVISOR = 'advisor'
export const ROLE_STUDENT = 'student'

// localStorage key for persisting assignments (Phase 1)
export const ADVISING_STORE_KEY = 'cc_advising_assignments_v1'
