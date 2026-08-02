import { useState, useMemo } from 'react'
import Sidebar from '../components/Sidebar'

/**
 * RoutinePage – Create Routine
 *
 * Phase 1: all course data is static.
 * TODO (Phase 2): Replace STATIC_COURSES with
 *   GET /api/courses/available  (with search query param)
 *   POST /api/routine/save      (save selected routine)
 */

/* ── Static course data (Phase 1 placeholder) ─────────────── */
const STATIC_COURSES = [
  // ── CSE110 – Programming Language I (10 sections) ──────────
  { id: 'CSE110-01', code: 'CSE110', section: '01', title: 'Programming Language I',             faculty: 'Dr. Ahmed',     time: 'SUN-TUE 08:00 AM–09:20 AM', room: 'NAC-09A-05C', examDay: 'Dec 10, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 35 },
  { id: 'CSE110-02', code: 'CSE110', section: '02', title: 'Programming Language I',             faculty: 'Dr. Ahmed',     time: 'MON-WED 09:30 AM–10:50 AM', room: 'NAC-09A-06C', examDay: 'Dec 10, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 38 },
  { id: 'CSE110-03', code: 'CSE110', section: '03', title: 'Programming Language I',             faculty: 'Mr. Karim',     time: 'SUN-TUE 11:00 AM–12:20 PM', room: 'NAC-10B-07C', examDay: 'Dec 10, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 20 },
  { id: 'CSE110-04', code: 'CSE110', section: '04', title: 'Programming Language I',             faculty: 'Mr. Karim',     time: 'TUE-THU 09:30 AM–10:50 AM', room: 'NAC-10B-08C', examDay: 'Dec 10, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 40 },
  { id: 'CSE110-05', code: 'CSE110', section: '05', title: 'Programming Language I',             faculty: 'Ms. Sultana',   time: 'MON-WED 11:00 AM–12:20 PM', room: 'NAC-11A-01C', examDay: 'Dec 10, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 15 },
  { id: 'CSE110-06', code: 'CSE110', section: '06', title: 'Programming Language I',             faculty: 'Ms. Sultana',   time: 'SUN-TUE 12:30 PM–01:50 PM', room: 'NAC-11A-02C', examDay: 'Dec 10, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 32 },
  { id: 'CSE110-07', code: 'CSE110', section: '07', title: 'Programming Language I',             faculty: 'Dr. Ahmed',     time: 'MON-WED 02:00 PM–03:20 PM', room: 'NAC-11A-03C', examDay: 'Dec 10, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 28 },
  { id: 'CSE110-08', code: 'CSE110', section: '08', title: 'Programming Language I',             faculty: 'Mr. Karim',     time: 'TUE-THU 11:00 AM–12:20 PM', room: 'NAC-11B-04C', examDay: 'Dec 10, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 40 },
  { id: 'CSE110-09', code: 'CSE110', section: '09', title: 'Programming Language I',             faculty: 'Ms. Sultana',   time: 'SUN-TUE 03:30 PM–04:50 PM', room: 'NAC-11B-05C', examDay: 'Dec 10, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 10 },
  { id: 'CSE110-10', code: 'CSE110', section: '10', title: 'Programming Language I',             faculty: 'Dr. Ahmed',     time: 'MON-WED 03:30 PM–04:50 PM', room: 'NAC-11B-06C', examDay: 'Dec 10, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 22 },

  // ── CSE220 – Data Structures (10 sections) ─────────────────
  { id: 'CSE220-01', code: 'CSE220', section: '01', title: 'Data Structures',                    faculty: 'Dr. Rahman',    time: 'MON-WED 08:00 AM–09:20 AM', room: 'SAC-07F-22L', examDay: 'Dec 12, 2026 2:00 PM–4:00 PM', totalSeats: 35, booked: 33 },
  { id: 'CSE220-02', code: 'CSE220', section: '02', title: 'Data Structures',                    faculty: 'Dr. Rahman',    time: 'SUN-TUE 09:30 AM–10:50 AM', room: 'SAC-07F-23L', examDay: 'Dec 12, 2026 2:00 PM–4:00 PM', totalSeats: 35, booked: 18 },
  { id: 'CSE220-03', code: 'CSE220', section: '03', title: 'Data Structures',                    faculty: 'Prof. Hossain', time: 'TUE-THU 08:00 AM–09:20 AM', room: 'SAC-08A-01L', examDay: 'Dec 12, 2026 2:00 PM–4:00 PM', totalSeats: 35, booked: 35 },
  { id: 'CSE220-04', code: 'CSE220', section: '04', title: 'Data Structures',                    faculty: 'Prof. Hossain', time: 'MON-WED 11:00 AM–12:20 PM', room: 'SAC-08A-02L', examDay: 'Dec 12, 2026 2:00 PM–4:00 PM', totalSeats: 35, booked: 12 },
  { id: 'CSE220-05', code: 'CSE220', section: '05', title: 'Data Structures',                    faculty: 'Dr. Rahman',    time: 'SUN-TUE 11:00 AM–12:20 PM', room: 'SAC-08A-03L', examDay: 'Dec 12, 2026 2:00 PM–4:00 PM', totalSeats: 35, booked: 27 },
  { id: 'CSE220-06', code: 'CSE220', section: '06', title: 'Data Structures',                    faculty: 'Dr. Islam',     time: 'TUE-THU 12:30 PM–01:50 PM', room: 'SAC-08B-01L', examDay: 'Dec 12, 2026 2:00 PM–4:00 PM', totalSeats: 35, booked: 30 },
  { id: 'CSE220-07', code: 'CSE220', section: '07', title: 'Data Structures',                    faculty: 'Dr. Islam',     time: 'MON-WED 12:30 PM–01:50 PM', room: 'SAC-08B-02L', examDay: 'Dec 12, 2026 2:00 PM–4:00 PM', totalSeats: 35, booked: 8  },
  { id: 'CSE220-08', code: 'CSE220', section: '08', title: 'Data Structures',                    faculty: 'Prof. Hossain', time: 'SUN-TUE 02:00 PM–03:20 PM', room: 'SAC-08B-03L', examDay: 'Dec 12, 2026 2:00 PM–4:00 PM', totalSeats: 35, booked: 20 },
  { id: 'CSE220-09', code: 'CSE220', section: '09', title: 'Data Structures',                    faculty: 'Dr. Rahman',    time: 'TUE-THU 03:30 PM–04:50 PM', room: 'SAC-09A-01L', examDay: 'Dec 12, 2026 2:00 PM–4:00 PM', totalSeats: 35, booked: 35 },
  { id: 'CSE220-10', code: 'CSE220', section: '10', title: 'Data Structures',                    faculty: 'Dr. Islam',     time: 'MON-WED 03:30 PM–04:50 PM', room: 'SAC-09A-02L', examDay: 'Dec 12, 2026 2:00 PM–4:00 PM', totalSeats: 35, booked: 14 },

  // ── CSE321 – Computer Organization (10 sections) ───────────
  { id: 'CSE321-01', code: 'CSE321', section: '01', title: 'Computer Organization',               faculty: 'Dr. Islam',     time: 'TUE-THU 12:30 PM–01:50 PM', room: 'NTR-10G-32L', examDay: 'Dec 14, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 40 },
  { id: 'CSE321-02', code: 'CSE321', section: '02', title: 'Computer Organization',               faculty: 'Prof. Hasan',   time: 'MON-WED 11:00 AM–12:20 PM', room: 'NTR-10G-33L', examDay: 'Dec 14, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 22 },
  { id: 'CSE321-03', code: 'CSE321', section: '03', title: 'Computer Organization',               faculty: 'Prof. Hasan',   time: 'SUN-TUE 08:00 AM–09:20 AM', room: 'NTR-11A-01L', examDay: 'Dec 14, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 38 },
  { id: 'CSE321-04', code: 'CSE321', section: '04', title: 'Computer Organization',               faculty: 'Dr. Chowdhury', time: 'MON-WED 09:30 AM–10:50 AM', room: 'NTR-11A-02L', examDay: 'Dec 14, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 15 },
  { id: 'CSE321-05', code: 'CSE321', section: '05', title: 'Computer Organization',               faculty: 'Dr. Chowdhury', time: 'TUE-THU 09:30 AM–10:50 AM', room: 'NTR-11A-03L', examDay: 'Dec 14, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 29 },
  { id: 'CSE321-06', code: 'CSE321', section: '06', title: 'Computer Organization',               faculty: 'Dr. Islam',     time: 'SUN-TUE 11:00 AM–12:20 PM', room: 'NTR-11B-01L', examDay: 'Dec 14, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 40 },
  { id: 'CSE321-07', code: 'CSE321', section: '07', title: 'Computer Organization',               faculty: 'Prof. Hasan',   time: 'MON-WED 02:00 PM–03:20 PM', room: 'NTR-11B-02L', examDay: 'Dec 14, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 18 },
  { id: 'CSE321-08', code: 'CSE321', section: '08', title: 'Computer Organization',               faculty: 'Dr. Chowdhury', time: 'TUE-THU 11:00 AM–12:20 PM', room: 'NTR-11B-03L', examDay: 'Dec 14, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 36 },
  { id: 'CSE321-09', code: 'CSE321', section: '09', title: 'Computer Organization',               faculty: 'Dr. Islam',     time: 'SUN-TUE 03:30 PM–04:50 PM', room: 'NTR-11C-01L', examDay: 'Dec 14, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 10 },
  { id: 'CSE321-10', code: 'CSE321', section: '10', title: 'Computer Organization',               faculty: 'Prof. Hasan',   time: 'MON-WED 03:30 PM–04:50 PM', room: 'NTR-11C-02L', examDay: 'Dec 14, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 25 },

  // ── CSE370 – Digital Logic Design (10 sections) ────────────
  { id: 'CSE370-01', code: 'CSE370', section: '01', title: 'Digital Logic Design',                faculty: 'Dr. Chowdhury', time: 'SUN-TUE 02:00 PM–03:20 PM', room: 'SAC-09B-04C', examDay: 'Dec 16, 2026 2:00 PM–4:00 PM', totalSeats: 38, booked: 30 },
  { id: 'CSE370-02', code: 'CSE370', section: '02', title: 'Digital Logic Design',                faculty: 'Dr. Nizam',     time: 'MON-WED 08:00 AM–09:20 AM', room: 'SAC-09B-05C', examDay: 'Dec 16, 2026 2:00 PM–4:00 PM', totalSeats: 38, booked: 38 },
  { id: 'CSE370-03', code: 'CSE370', section: '03', title: 'Digital Logic Design',                faculty: 'Dr. Nizam',     time: 'TUE-THU 08:00 AM–09:20 AM', room: 'SAC-09C-01C', examDay: 'Dec 16, 2026 2:00 PM–4:00 PM', totalSeats: 38, booked: 12 },
  { id: 'CSE370-04', code: 'CSE370', section: '04', title: 'Digital Logic Design',                faculty: 'Dr. Chowdhury', time: 'SUN-TUE 09:30 AM–10:50 AM', room: 'SAC-09C-02C', examDay: 'Dec 16, 2026 2:00 PM–4:00 PM', totalSeats: 38, booked: 26 },
  { id: 'CSE370-05', code: 'CSE370', section: '05', title: 'Digital Logic Design',                faculty: 'Prof. Miah',    time: 'MON-WED 11:00 AM–12:20 PM', room: 'SAC-10A-01C', examDay: 'Dec 16, 2026 2:00 PM–4:00 PM', totalSeats: 38, booked: 38 },
  { id: 'CSE370-06', code: 'CSE370', section: '06', title: 'Digital Logic Design',                faculty: 'Prof. Miah',    time: 'TUE-THU 11:00 AM–12:20 PM', room: 'SAC-10A-02C', examDay: 'Dec 16, 2026 2:00 PM–4:00 PM', totalSeats: 38, booked: 20 },
  { id: 'CSE370-07', code: 'CSE370', section: '07', title: 'Digital Logic Design',                faculty: 'Dr. Nizam',     time: 'SUN-TUE 12:30 PM–01:50 PM', room: 'SAC-10A-03C', examDay: 'Dec 16, 2026 2:00 PM–4:00 PM', totalSeats: 38, booked: 5  },
  { id: 'CSE370-08', code: 'CSE370', section: '08', title: 'Digital Logic Design',                faculty: 'Dr. Chowdhury', time: 'MON-WED 12:30 PM–01:50 PM', room: 'SAC-10B-01C', examDay: 'Dec 16, 2026 2:00 PM–4:00 PM', totalSeats: 38, booked: 33 },
  { id: 'CSE370-09', code: 'CSE370', section: '09', title: 'Digital Logic Design',                faculty: 'Prof. Miah',    time: 'TUE-THU 02:00 PM–03:20 PM', room: 'SAC-10B-02C', examDay: 'Dec 16, 2026 2:00 PM–4:00 PM', totalSeats: 38, booked: 38 },
  { id: 'CSE370-10', code: 'CSE370', section: '10', title: 'Digital Logic Design',                faculty: 'Dr. Nizam',     time: 'SUN-TUE 05:00 PM–06:20 PM', room: 'SAC-10B-03C', examDay: 'Dec 16, 2026 2:00 PM–4:00 PM', totalSeats: 38, booked: 15 },

  // ── CSE421 – Algorithm Design (10 sections) ─────────────────
  { id: 'CSE421-01', code: 'CSE421', section: '01', title: 'Algorithm Design',                    faculty: 'Dr. Nizam',     time: 'MON-WED 03:30 PM–04:50 PM', room: 'NAC-08A-03C', examDay: 'Dec 18, 2026 9:00 AM–11:00 AM', totalSeats: 35, booked: 28 },
  { id: 'CSE421-02', code: 'CSE421', section: '02', title: 'Algorithm Design',                    faculty: 'Dr. Kamal',     time: 'SUN-TUE 08:00 AM–09:20 AM', room: 'NAC-08A-04C', examDay: 'Dec 18, 2026 9:00 AM–11:00 AM', totalSeats: 35, booked: 35 },
  { id: 'CSE421-03', code: 'CSE421', section: '03', title: 'Algorithm Design',                    faculty: 'Dr. Kamal',     time: 'TUE-THU 09:30 AM–10:50 AM', room: 'NAC-08B-01C', examDay: 'Dec 18, 2026 9:00 AM–11:00 AM', totalSeats: 35, booked: 10 },
  { id: 'CSE421-04', code: 'CSE421', section: '04', title: 'Algorithm Design',                    faculty: 'Dr. Nizam',     time: 'MON-WED 09:30 AM–10:50 AM', room: 'NAC-08B-02C', examDay: 'Dec 18, 2026 9:00 AM–11:00 AM', totalSeats: 35, booked: 22 },
  { id: 'CSE421-05', code: 'CSE421', section: '05', title: 'Algorithm Design',                    faculty: 'Prof. Rashid',  time: 'SUN-TUE 11:00 AM–12:20 PM', room: 'NAC-08B-03C', examDay: 'Dec 18, 2026 9:00 AM–11:00 AM', totalSeats: 35, booked: 35 },
  { id: 'CSE421-06', code: 'CSE421', section: '06', title: 'Algorithm Design',                    faculty: 'Prof. Rashid',  time: 'TUE-THU 11:00 AM–12:20 PM', room: 'NAC-09A-01C', examDay: 'Dec 18, 2026 9:00 AM–11:00 AM', totalSeats: 35, booked: 17 },
  { id: 'CSE421-07', code: 'CSE421', section: '07', title: 'Algorithm Design',                    faculty: 'Dr. Kamal',     time: 'MON-WED 12:30 PM–01:50 PM', room: 'NAC-09A-02C', examDay: 'Dec 18, 2026 9:00 AM–11:00 AM', totalSeats: 35, booked: 30 },
  { id: 'CSE421-08', code: 'CSE421', section: '08', title: 'Algorithm Design',                    faculty: 'Dr. Nizam',     time: 'SUN-TUE 02:00 PM–03:20 PM', room: 'NAC-09B-01C', examDay: 'Dec 18, 2026 9:00 AM–11:00 AM', totalSeats: 35, booked: 35 },
  { id: 'CSE421-09', code: 'CSE421', section: '09', title: 'Algorithm Design',                    faculty: 'Prof. Rashid',  time: 'TUE-THU 03:30 PM–04:50 PM', room: 'NAC-09B-02C', examDay: 'Dec 18, 2026 9:00 AM–11:00 AM', totalSeats: 35, booked: 8  },
  { id: 'CSE421-10', code: 'CSE421', section: '10', title: 'Algorithm Design',                    faculty: 'Dr. Kamal',     time: 'SUN-TUE 05:00 PM–06:20 PM', room: 'NAC-09B-03C', examDay: 'Dec 18, 2026 9:00 AM–11:00 AM', totalSeats: 35, booked: 20 },

  // ── CSE470 – Software Engineering (10 sections) ─────────────
  { id: 'CSE470-01', code: 'CSE470', section: '01', title: 'Software Engineering',                faculty: 'Dr. Akter',     time: 'SUN-TUE 11:00 AM–12:20 PM', room: 'NRT-07F-22C', examDay: 'Dec 20, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 36 },
  { id: 'CSE470-02', code: 'CSE470', section: '02', title: 'Software Engineering',                faculty: 'Dr. Akter',     time: 'TUE-THU 08:00 AM–09:20 AM', room: 'NRT-07F-23C', examDay: 'Dec 20, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 15 },
  { id: 'CSE470-03', code: 'CSE470', section: '03', title: 'Software Engineering',                faculty: 'Dr. Zaman',     time: 'MON-WED 08:00 AM–09:20 AM', room: 'NRT-08A-01C', examDay: 'Dec 20, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 40 },
  { id: 'CSE470-04', code: 'CSE470', section: '04', title: 'Software Engineering',                faculty: 'Dr. Zaman',     time: 'SUN-TUE 09:30 AM–10:50 AM', room: 'NRT-08A-02C', examDay: 'Dec 20, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 22 },
  { id: 'CSE470-05', code: 'CSE470', section: '05', title: 'Software Engineering',                faculty: 'Prof. Tanvir',  time: 'MON-WED 11:00 AM–12:20 PM', room: 'NRT-08A-03C', examDay: 'Dec 20, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 38 },
  { id: 'CSE470-06', code: 'CSE470', section: '06', title: 'Software Engineering',                faculty: 'Prof. Tanvir',  time: 'TUE-THU 12:30 PM–01:50 PM', room: 'NRT-08B-01C', examDay: 'Dec 20, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 18 },
  { id: 'CSE470-07', code: 'CSE470', section: '07', title: 'Software Engineering',                faculty: 'Dr. Akter',     time: 'SUN-TUE 12:30 PM–01:50 PM', room: 'NRT-08B-02C', examDay: 'Dec 20, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 5  },
  { id: 'CSE470-08', code: 'CSE470', section: '08', title: 'Software Engineering',                faculty: 'Dr. Zaman',     time: 'MON-WED 02:00 PM–03:20 PM', room: 'NRT-08B-03C', examDay: 'Dec 20, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 35 },
  { id: 'CSE470-09', code: 'CSE470', section: '09', title: 'Software Engineering',                faculty: 'Prof. Tanvir',  time: 'TUE-THU 02:00 PM–03:20 PM', room: 'NRT-09A-01C', examDay: 'Dec 20, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 40 },
  { id: 'CSE470-10', code: 'CSE470', section: '10', title: 'Software Engineering',                faculty: 'Dr. Akter',     time: 'SUN-TUE 03:30 PM–04:50 PM', room: 'NRT-09A-02C', examDay: 'Dec 20, 2026 9:00 AM–11:00 AM', totalSeats: 40, booked: 12 },

  // ── CSE481 – Distributed Systems (10 sections) ─────────────
  { id: 'CSE481-01', code: 'CSE481', section: '01', title: 'Distributed Systems',                 faculty: 'Prof. Siddiqui',time: 'MON-WED-THU 08:00 AM–09:20 AM', room: 'SDS-09A-05C', examDay: 'Dec 22, 2026 2:00 PM–4:00 PM', totalSeats: 30, booked: 29 },
  { id: 'CSE481-02', code: 'CSE481', section: '02', title: 'Distributed Systems',                 faculty: 'Prof. Siddiqui',time: 'SUN-TUE 08:00 AM–09:20 AM', room: 'SDS-09A-06C', examDay: 'Dec 22, 2026 2:00 PM–4:00 PM', totalSeats: 30, booked: 15 },
  { id: 'CSE481-03', code: 'CSE481', section: '03', title: 'Distributed Systems',                 faculty: 'Dr. Farhan',    time: 'TUE-THU 09:30 AM–10:50 AM', room: 'SDS-09B-01C', examDay: 'Dec 22, 2026 2:00 PM–4:00 PM', totalSeats: 30, booked: 30 },
  { id: 'CSE481-04', code: 'CSE481', section: '04', title: 'Distributed Systems',                 faculty: 'Dr. Farhan',    time: 'MON-WED 11:00 AM–12:20 PM', room: 'SDS-09B-02C', examDay: 'Dec 22, 2026 2:00 PM–4:00 PM', totalSeats: 30, booked: 22 },
  { id: 'CSE481-05', code: 'CSE481', section: '05', title: 'Distributed Systems',                 faculty: 'Ms. Khatun',    time: 'SUN-TUE 11:00 AM–12:20 PM', room: 'SDS-09C-01C', examDay: 'Dec 22, 2026 2:00 PM–4:00 PM', totalSeats: 30, booked: 8  },
  { id: 'CSE481-06', code: 'CSE481', section: '06', title: 'Distributed Systems',                 faculty: 'Ms. Khatun',    time: 'TUE-THU 11:00 AM–12:20 PM', room: 'SDS-09C-02C', examDay: 'Dec 22, 2026 2:00 PM–4:00 PM', totalSeats: 30, booked: 30 },
  { id: 'CSE481-07', code: 'CSE481', section: '07', title: 'Distributed Systems',                 faculty: 'Prof. Siddiqui',time: 'SUN-TUE 12:30 PM–01:50 PM', room: 'SDS-10A-01C', examDay: 'Dec 22, 2026 2:00 PM–4:00 PM', totalSeats: 30, booked: 25 },
  { id: 'CSE481-08', code: 'CSE481', section: '08', title: 'Distributed Systems',                 faculty: 'Dr. Farhan',    time: 'MON-WED 02:00 PM–03:20 PM', room: 'SDS-10A-02C', examDay: 'Dec 22, 2026 2:00 PM–4:00 PM', totalSeats: 30, booked: 18 },
  { id: 'CSE481-09', code: 'CSE481', section: '09', title: 'Distributed Systems',                 faculty: 'Ms. Khatun',    time: 'TUE-THU 03:30 PM–04:50 PM', room: 'SDS-10A-03C', examDay: 'Dec 22, 2026 2:00 PM–4:00 PM', totalSeats: 30, booked: 30 },
  { id: 'CSE481-10', code: 'CSE481', section: '10', title: 'Distributed Systems',                 faculty: 'Prof. Siddiqui',time: 'SUN-TUE 05:00 PM–06:20 PM', room: 'SDS-10B-01C', examDay: 'Dec 22, 2026 2:00 PM–4:00 PM', totalSeats: 30, booked: 12 },

  // ── MAT201 – Engineering Mathematics II (10 sections) ───────
  { id: 'MAT201-01', code: 'MAT201', section: '01', title: 'Engineering Mathematics II',          faculty: 'Dr. Begum',     time: 'MON-WED 12:30 PM–01:50 PM', room: 'OAB-05C-13L', examDay: 'Dec 13, 2026 2:00 PM–4:00 PM', totalSeats: 50, booked: 33 },
  { id: 'MAT201-02', code: 'MAT201', section: '02', title: 'Engineering Mathematics II',          faculty: 'Dr. Begum',     time: 'TUE-THU 08:00 AM–09:20 AM', room: 'OAB-05D-01L', examDay: 'Dec 13, 2026 2:00 PM–4:00 PM', totalSeats: 50, booked: 47 },
  { id: 'MAT201-03', code: 'MAT201', section: '03', title: 'Engineering Mathematics II',          faculty: 'Dr. Haq',       time: 'SUN-TUE 09:30 AM–10:50 AM', room: 'OAB-05D-02L', examDay: 'Dec 13, 2026 2:00 PM–4:00 PM', totalSeats: 50, booked: 50 },
  { id: 'MAT201-04', code: 'MAT201', section: '04', title: 'Engineering Mathematics II',          faculty: 'Dr. Haq',       time: 'MON-WED 09:30 AM–10:50 AM', room: 'OAB-05D-03L', examDay: 'Dec 13, 2026 2:00 PM–4:00 PM', totalSeats: 50, booked: 20 },
  { id: 'MAT201-05', code: 'MAT201', section: '05', title: 'Engineering Mathematics II',          faculty: 'Prof. Ali',     time: 'TUE-THU 11:00 AM–12:20 PM', room: 'OAB-06A-01L', examDay: 'Dec 13, 2026 2:00 PM–4:00 PM', totalSeats: 50, booked: 45 },
  { id: 'MAT201-06', code: 'MAT201', section: '06', title: 'Engineering Mathematics II',          faculty: 'Prof. Ali',     time: 'SUN-TUE 11:00 AM–12:20 PM', room: 'OAB-06A-02L', examDay: 'Dec 13, 2026 2:00 PM–4:00 PM', totalSeats: 50, booked: 12 },
  { id: 'MAT201-07', code: 'MAT201', section: '07', title: 'Engineering Mathematics II',          faculty: 'Dr. Begum',     time: 'MON-WED 02:00 PM–03:20 PM', room: 'OAB-06A-03L', examDay: 'Dec 13, 2026 2:00 PM–4:00 PM', totalSeats: 50, booked: 38 },
  { id: 'MAT201-08', code: 'MAT201', section: '08', title: 'Engineering Mathematics II',          faculty: 'Dr. Haq',       time: 'TUE-THU 02:00 PM–03:20 PM', room: 'OAB-06B-01L', examDay: 'Dec 13, 2026 2:00 PM–4:00 PM', totalSeats: 50, booked: 50 },
  { id: 'MAT201-09', code: 'MAT201', section: '09', title: 'Engineering Mathematics II',          faculty: 'Prof. Ali',     time: 'SUN-TUE 03:30 PM–04:50 PM', room: 'OAB-06B-02L', examDay: 'Dec 13, 2026 2:00 PM–4:00 PM', totalSeats: 50, booked: 28 },
  { id: 'MAT201-10', code: 'MAT201', section: '10', title: 'Engineering Mathematics II',          faculty: 'Dr. Begum',     time: 'MON-WED 05:00 PM–06:20 PM', room: 'OAB-06B-03L', examDay: 'Dec 13, 2026 2:00 PM–4:00 PM', totalSeats: 50, booked: 6  },

  // ── PHY101 – Physics for Engineers (10 sections) ───────────
  { id: 'PHY101-01', code: 'PHY101', section: '01', title: 'Physics for Engineers',               faculty: 'Dr. Kabir',     time: 'TUE-THU 11:00 AM–12:20 PM', room: 'SC-03B-01L', examDay: 'Dec 15, 2026 9:00 AM–11:00 AM', totalSeats: 60, booked: 54 },
  { id: 'PHY101-02', code: 'PHY101', section: '02', title: 'Physics for Engineers',               faculty: 'Dr. Kabir',     time: 'SUN-TUE 08:00 AM–09:20 AM', room: 'SC-03B-02L', examDay: 'Dec 15, 2026 9:00 AM–11:00 AM', totalSeats: 60, booked: 42 },
  { id: 'PHY101-03', code: 'PHY101', section: '03', title: 'Physics for Engineers',               faculty: 'Dr. Mitu',      time: 'MON-WED 09:30 AM–10:50 AM', room: 'SC-03C-01L', examDay: 'Dec 15, 2026 9:00 AM–11:00 AM', totalSeats: 60, booked: 60 },
  { id: 'PHY101-04', code: 'PHY101', section: '04', title: 'Physics for Engineers',               faculty: 'Dr. Mitu',      time: 'TUE-THU 09:30 AM–10:50 AM', room: 'SC-03C-02L', examDay: 'Dec 15, 2026 9:00 AM–11:00 AM', totalSeats: 60, booked: 18 },
  { id: 'PHY101-05', code: 'PHY101', section: '05', title: 'Physics for Engineers',               faculty: 'Prof. Jahan',   time: 'SUN-TUE 11:00 AM–12:20 PM', room: 'SC-04A-01L', examDay: 'Dec 15, 2026 9:00 AM–11:00 AM', totalSeats: 60, booked: 55 },
  { id: 'PHY101-06', code: 'PHY101', section: '06', title: 'Physics for Engineers',               faculty: 'Prof. Jahan',   time: 'MON-WED 11:00 AM–12:20 PM', room: 'SC-04A-02L', examDay: 'Dec 15, 2026 9:00 AM–11:00 AM', totalSeats: 60, booked: 30 },
  { id: 'PHY101-07', code: 'PHY101', section: '07', title: 'Physics for Engineers',               faculty: 'Dr. Kabir',     time: 'TUE-THU 12:30 PM–01:50 PM', room: 'SC-04A-03L', examDay: 'Dec 15, 2026 9:00 AM–11:00 AM', totalSeats: 60, booked: 60 },
  { id: 'PHY101-08', code: 'PHY101', section: '08', title: 'Physics for Engineers',               faculty: 'Dr. Mitu',      time: 'SUN-TUE 12:30 PM–01:50 PM', room: 'SC-04B-01L', examDay: 'Dec 15, 2026 9:00 AM–11:00 AM', totalSeats: 60, booked: 10 },
  { id: 'PHY101-09', code: 'PHY101', section: '09', title: 'Physics for Engineers',               faculty: 'Prof. Jahan',   time: 'MON-WED 02:00 PM–03:20 PM', room: 'SC-04B-02L', examDay: 'Dec 15, 2026 9:00 AM–11:00 AM', totalSeats: 60, booked: 48 },
  { id: 'PHY101-10', code: 'PHY101', section: '10', title: 'Physics for Engineers',               faculty: 'Dr. Kabir',     time: 'TUE-THU 05:00 PM–06:20 PM', room: 'SC-04B-03L', examDay: 'Dec 15, 2026 9:00 AM–11:00 AM', totalSeats: 60, booked: 35 },
]

/* ── Time-slot rows for the schedule grid ─────────────────── */
const TIME_SLOTS = [
  '08:00 AM–09:20 AM',
  '09:30 AM–10:50 AM',
  '11:00 AM–12:20 PM',
  '12:30 PM–01:50 PM',
  '02:00 PM–03:20 PM',
  '03:30 PM–04:50 PM',
  '05:00 PM–06:20 PM',
]

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/* ── Helpers ─────────────────────────────────────────────── */
function remainingSeats(c) { return c.totalSeats - c.booked }
function isSoldOut(c) { return remainingSeats(c) <= 0 }

/** Time string: "DAY(S) HH:MM AM/PM–HH:MM AM/PM"
 *  Last 3 space-tokens = time range e.g. "08:00 AM–09:20 AM" */
function courseToSlots(c) {
  const parts = c.time.split(' ')
  const timePart = parts.slice(-3).join(' ')
  const slot = TIME_SLOTS.find(s => s === timePart)
  if (!slot) return []
  return [slot]
}

/** Day abbreviations are in the first token only */
function courseToDays(c) {
  const parts = c.time.split(' ')
  const dayStr = parts.slice(0, parts.length - 3).join('-').toUpperCase()
  const map = {
    SUN: 'Sunday', MON: 'Monday', TUE: 'Tuesday',
    WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday',
  }
  const result = new Set()
  Object.entries(map).forEach(([abbr, full]) => {
    if (dayStr.includes(abbr)) result.add(full)
  })
  return [...result]
}

function detectConflicts(selected) {
  const cells = {}
  const conflicts = new Set()
  selected.forEach(c => {
    const slots = courseToSlots(c)
    const days = courseToDays(c)
    days.forEach(day => {
      slots.forEach(slot => {
        const key = `${day}|${slot}`
        if (cells[key]) { conflicts.add(c.id); conflicts.add(cells[key]) }
        else { cells[key] = c.id }
      })
    })
  })
  return conflicts
}

/* ── Component ───────────────────────────────────────────── */
export default function RoutinePage() {
  const [availSearch, setAvailSearch] = useState('')
  const [selSearch,   setSelSearch]   = useState('')
  const [selected,    setSelected]    = useState([])
  const [highlighted, setHighlighted] = useState(null)

  /* Show ALL sections; mark siblings of selected course-codes as isTaken */
  const available = useMemo(() => {
    const selectedCodes = new Set(selected.map(s => s.code))
    const selectedIds   = new Set(selected.map(s => s.id))
    return STATIC_COURSES
      .filter(c => !selectedIds.has(c.id))
      .map(c => ({ ...c, isTaken: selectedCodes.has(c.code) }))
      .filter(c => {
        const q = availSearch.toLowerCase()
        return !q || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.section.includes(q)
      })
  }, [selected, availSearch])

  const filteredSelected = useMemo(() =>
    selected.filter(c => {
      const q = selSearch.toLowerCase()
      return !q || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.section.includes(q)
    }),
    [selected, selSearch]
  )

  const conflicts = useMemo(() => detectConflicts(selected), [selected])

  const highlightedCourse = useMemo(() =>
    STATIC_COURSES.find(c => c.id === highlighted), [highlighted]
  )

  const isHighlightedSelected  = selected.some(c => c.id === highlighted)
  const isHighlightedAvailable = available.some(c => c.id === highlighted && !c.isTaken)

  const addCourse    = (c) => { setSelected(prev => [...prev, c]); setHighlighted(c.id) }
  const removeCourse = (c) => { setSelected(prev => prev.filter(s => s.id !== c.id)); setHighlighted(null) }
  const removeAll    = ()  => { setSelected([]); setHighlighted(null) }

  const totalCredits = selected.length * 3

  const scheduleGrid = useMemo(() => {
    const grid = {}
    selected.forEach(c => {
      courseToSlots(c).forEach(slot => {
        courseToDays(c).forEach(day => {
          const key = `${day}|${slot}`
          if (!grid[key]) grid[key] = []
          grid[key].push(c)
        })
      })
    })
    return grid
  }, [selected])

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="routine" />
      <main className="dashboard-main routine-main" aria-label="Create Routine">

        <div className="dashboard-header">
          <h1 className="dashboard-greeting">📅 Create Routine</h1>
          <p className="dashboard-date">
            Search and select courses to build your weekly schedule.
            Phase 1 — static data. Database integration in Phase 2.
          </p>
        </div>

        <div className="routine-picker-wrapper">

          {/* Left info panel */}
          <div className="routine-info-panel left-info">
            <h3 className="routine-info-title">Info for Available</h3>
            {(!highlightedCourse || isHighlightedSelected) ? (
              <p className="routine-info-hint">Click a course in <em>Available Courses</em> to see details.</p>
            ) : (
              <CourseInfoBlock
                course={highlightedCourse}
                conflicts={conflicts}
                isTaken={!!available.find(c => c.id === highlighted)?.isTaken}
              />
            )}
          </div>

          {/* Available courses list */}
          <div className="routine-list-col">
            <input id="routine-avail-search" className="form-input routine-search"
              placeholder="Search Course Code, eg – CSE110"
              value={availSearch} onChange={e => setAvailSearch(e.target.value)}
              aria-label="Search available courses" />
            <div className="routine-list-header">Available Courses</div>
            <div className="routine-list" role="listbox" aria-label="Available courses">
              {available.length === 0 && <div className="routine-list-empty">No courses found</div>}
              {available.map(c => (
                <button key={c.id} id={`avail-${c.id}`}
                  className={[
                    'routine-list-item',
                    c.isTaken ? 'taken' : '',
                    c.isTaken && highlighted === c.id  ? 'taken-highlighted' : '',
                    !c.isTaken && highlighted === c.id ? 'highlighted'       : '',
                    !c.isTaken && isSoldOut(c)         ? 'sold-out'          : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setHighlighted(c.id)}
                  onDoubleClick={c.isTaken ? undefined : () => addCourse(c)}
                  aria-disabled={c.isTaken}
                  aria-selected={highlighted === c.id}
                  title={c.isTaken ? 'Drop your current section to add a different one' : isSoldOut(c) ? 'No seats remaining' : 'Double-click or use › to add'}
                >
                  {c.code}: sec-{c.section}
                  {c.isTaken  && <span className="taken-badge">Taken</span>}
                  {!c.isTaken && isSoldOut(c) && <span className="sold-out-badge">Full</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Arrow controls */}
          <div className="routine-arrows">
            <button id="routine-add-btn" className="arrow-btn" title="Add highlighted course"
              onClick={() => { if (highlighted && isHighlightedAvailable) { const c = available.find(x => x.id === highlighted); if (c) addCourse(c) } }}>›</button>
            <button id="routine-remove-btn" className="arrow-btn" title="Remove highlighted course"
              onClick={() => { if (highlighted && isHighlightedSelected) { const c = selected.find(x => x.id === highlighted); if (c) removeCourse(c) } }}>‹</button>
            <button id="routine-remove-all-btn" className="arrow-btn arrow-btn-all" title="Remove all" onClick={removeAll}>«</button>
          </div>

          {/* Selected courses list */}
          <div className="routine-list-col">
            <input id="routine-sel-search" className="form-input routine-search"
              placeholder="Search Course Code, eg – CSE110"
              value={selSearch} onChange={e => setSelSearch(e.target.value)}
              aria-label="Search selected courses" />
            <div className="routine-list-header">Selected Courses</div>
            <div className="routine-list routine-list-selected" role="listbox" aria-label="Selected courses">
              {filteredSelected.length === 0 && <div className="routine-list-empty">No courses selected</div>}
              {filteredSelected.map(c => (
                <button key={c.id} id={`sel-${c.id}`}
                  className={`routine-list-item ${highlighted === c.id ? 'highlighted' : ''} ${conflicts.has(c.id) ? 'conflict' : ''}`}
                  onClick={() => setHighlighted(c.id)}
                  onDoubleClick={() => removeCourse(c)}
                  aria-selected={highlighted === c.id}
                  title={conflicts.has(c.id) ? 'Time conflict!' : 'Double-click or use ‹ to remove'}
                >
                  {c.code}: sec-{c.section}
                  {conflicts.has(c.id) && <span className="conflict-badge">⚠</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Right info panel */}
          <div className="routine-info-panel right-info">
            <h3 className="routine-info-title">Info for Selected</h3>
            {(!highlightedCourse || isHighlightedAvailable) ? (
              <p className="routine-info-hint">Click a course in <em>Selected Courses</em> to see details.</p>
            ) : (
              <CourseInfoBlock course={highlightedCourse} conflicts={conflicts} />
            )}
          </div>
        </div>

        {/* Total Credits */}
        <div className="routine-credits-bar">
          Total Credits: <strong>{totalCredits}</strong>
          {conflicts.size > 0 && (
            <span className="routine-conflict-warning">
              ⚠ {conflicts.size / 2} time conflict{conflicts.size / 2 !== 1 ? 's' : ''} detected
            </span>
          )}
        </div>

        {/* Weekly Schedule Grid */}
        <div className="section-card routine-schedule-card">
          <div className="section-header"><h2 className="section-title">Weekly Schedule</h2></div>
          <div className="routine-table-wrapper">
            <table className="routine-schedule-table">
              <thead>
                <tr>
                  <th>Time / Day</th>
                  {DAYS.map(d => <th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(slot => (
                  <tr key={slot}>
                    <td className="routine-time-cell">{slot}</td>
                    {DAYS.map(day => {
                      const courses = scheduleGrid[`${day}|${slot}`] || []
                      return (
                        <td key={day} className="routine-schedule-cell">
                          {courses.map(c => (
                            <div key={c.id}
                              className={`routine-schedule-entry ${conflicts.has(c.id) ? 'conflict-entry' : ''}`}
                              title={`${c.code}-${c.section}: ${c.title}`}
                              onClick={() => setHighlighted(c.id)}>
                              {c.code}-{String(c.section).padStart(2,'0')}-{c.room}
                            </div>
                          ))}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Download Button */}
        <div className="routine-download-row">
          <button id="routine-download-btn" className="btn btn-primary routine-download-btn"
            disabled={selected.length === 0}
            onClick={() => alert('Download feature will be available in Phase 2 with database integration.')}>
            ⬇ Download the Routine
          </button>
        </div>
      </main>
    </div>
  )
}

/* ── Sub-component: Course Info Block ─────────────────────── */
function CourseInfoBlock({ course, conflicts, isTaken = false }) {
  const remaining  = course.totalSeats - course.booked
  const isConflict = conflicts.has(course.id)
  return (
    <div className="course-info-block">
      {isTaken && (
        <div className="cib-taken-notice">
          ⚠ Another section already added.
          Drop it from <em>Selected Courses</em> to switch.
        </div>
      )}
      <p className="cib-row"><span className="cib-label">Course Code:</span>
        <span className={`cib-value cib-code ${isConflict ? 'cib-conflict' : ''}`}>{course.code}</span></p>
      <p className="cib-row"><span className="cib-label">Course Title:</span>
        <span className="cib-value cib-title">{course.title}</span></p>
      <p className="cib-row"><span className="cib-label">Faculty:</span>
        <span className="cib-value">{course.faculty}</span></p>
      <p className="cib-row"><span className="cib-label">Section:</span>
        <span className="cib-value">{course.section.toString().padStart(2, '0')}</span></p>
      <p className="cib-row"><span className="cib-label">Time:</span>
        <span className="cib-value cib-time">{course.time} · {course.room}</span></p>
      <p className="cib-row"><span className="cib-label">Exam Day:</span>
        <span className="cib-value">{course.examDay}</span></p>
      <p className="cib-row"><span className="cib-label">Total Seats:</span>
        <span className="cib-value">{course.totalSeats}</span></p>
      <p className="cib-row"><span className="cib-label">Seats Booked:</span>
        <span className="cib-value">{course.booked}</span></p>
      <p className="cib-row"><span className="cib-label">Remaining:</span>
        <span className={`cib-value ${remaining <= 0 ? 'cib-danger' : remaining <= 5 ? 'cib-warn' : 'cib-safe'}`}>{remaining}</span></p>
    </div>
  )
}
