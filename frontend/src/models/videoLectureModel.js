/**
 * videoLectureModel.js – Model layer for the Video Lecture module.
 *
 * MVC Role: Model
 *
 * Contains:
 *   - DEFAULT_LECTURES: Initial fallback video lecture schemas
 *   - INITIAL_UPLOAD_FORM: Initial state shape for the upload modal
 *   - Helper functions: formatDuration, filterLecturesForStudent
 *
 * Rules: No JSX, no React hooks, no styling.
 */

/** Initial upload form schema for Faculty / Teachers */
export const INITIAL_UPLOAD_FORM = {
  title: '',
  courseCode: 'CSE470',
  description: '',
  videoUrl: '',
  teacherName: 'Dr. Sadia Kazi',
  durationSeconds: 600,
}

/** Pre-seeded fallback video lectures */
export const DEFAULT_LECTURES = [
  {
    id: 1,
    title: 'Lecture 1: Introduction to Software Architecture & MVC Pattern',
    courseCode: 'CSE470',
    description: 'Overview of modern web architectural patterns, strict MVC separation, and client-server decoupling.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    teacherName: 'Dr. Sadia Kazi',
    durationSeconds: 596,
    createdAt: '2026-08-28T10:00:00',
    lastPositionSeconds: 120,
    percentage: 20.1,
    completed: false,
  },
  {
    id: 2,
    title: 'Lecture 2: System Requirements & Agile Workflow',
    courseCode: 'CSE470',
    description: 'Deep dive into user stories, operational constraints, feature isolation, and documentation.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    teacherName: 'Dr. Sadia Kazi',
    durationSeconds: 653,
    createdAt: '2026-08-29T14:30:00',
    lastPositionSeconds: 0,
    percentage: 0,
    completed: false,
  },
  {
    id: 3,
    title: 'Lecture 1: Syntax Analysis & Lexical Parsing',
    courseCode: 'CSE420',
    description: 'Introduction to lexical analyzer generators, finite automata, and context-free grammars.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    teacherName: 'Prof. Mahbub Alam',
    durationSeconds: 480,
    createdAt: '2026-08-25T11:15:00',
    lastPositionSeconds: 480,
    percentage: 100,
    completed: true,
  },
  {
    id: 4,
    title: 'Lecture 1: Programming Fundamentals & Loops',
    courseCode: 'CSE110',
    description: 'Basic control structures, conditional branching, iteration, and algorithmic thinking in Java.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    teacherName: 'Lecturer Ahmed Hossain',
    durationSeconds: 720,
    createdAt: '2026-08-20T09:00:00',
    lastPositionSeconds: 360,
    percentage: 50.0,
    completed: false,
  },
]

/**
 * Formats duration in seconds into mm:ss or hh:mm:ss.
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  if (!totalSeconds || isNaN(totalSeconds)) return '00:00'
  const secs = Math.floor(totalSeconds)
  const hrs = Math.floor(secs / 3600)
  const mins = Math.floor((secs % 3600) / 60)
  const remainingSecs = secs % 60

  const pad = (num) => String(num).padStart(2, '0')

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(remainingSecs)}`
  }
  return `${mins}:${pad(remainingSecs)}`
}

/**
 * Filters video lectures for a student based on their enrolled courses.
 * @param {Array} lectures
 * @param {Array} enrolledCourseCodes e.g. ['CSE470', 'CSE110']
 * @returns {Array}
 */
export function filterLecturesForStudent(lectures, enrolledCourseCodes = ['CSE470', 'CSE110']) {
  if (!enrolledCourseCodes || enrolledCourseCodes.length === 0) return []
  const enrolledSet = new Set(enrolledCourseCodes.map(c => c.toUpperCase()))
  return lectures.filter(lec => enrolledSet.has(lec.courseCode.toUpperCase()))
}
