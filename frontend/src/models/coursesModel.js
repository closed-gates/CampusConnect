/**
 * coursesModel.js – Model layer for the Courses Catalog page.
 *
 * MVC Role: Model
 *
 * Contains:
 *  - SCHOOLS       – All 11 real BRACU school/faculty groupings (for filter tabs)
 *  - FACULTIES     – Legacy alias of SCHOOLS (for backward compatibility)
 *  - DEPARTMENTS   – All 41 BRACU departments with school mapping (for sub-filters)
 *  - YEARS         – Filter options
 *  - SEMESTERS     – Filter options
 *
 * NOTE: COURSES data is loaded from the Neon database via
 *   GET /api/courses/catalog (see courseService.js + coursesController.js).
 *   The old static COURSES array has been removed.
 *
 * Data source: BRACU_Unique_Courses_564.csv (Official BRACU Summer 2026 Schedule)
 */

// ── Schools (BRACU Faculty/School groupings) ─────────────────────────────────
export const SCHOOLS = [
  {
    id: 'bsrm',
    label: 'BSRM School of Engineering',
    shortLabel: 'Engineering',
    icon: '⚙️',
    color: '#EFF6FF',
    accent: '#2563EB',
    value: 'BSRM School of Engineering',
  },
  {
    id: 'bbs',
    label: 'BRAC Business School',
    shortLabel: 'Business',
    icon: '📊',
    color: '#F0FDF4',
    accent: '#16A34A',
    value: 'BRAC Business School',
  },
  {
    id: 'arc',
    label: 'Department of Architecture',
    shortLabel: 'Architecture',
    icon: '🏛️',
    color: '#FFF7ED',
    accent: '#EA580C',
    value: 'Department of Architecture',
  },
  {
    id: 'mns',
    label: 'Department of Mathematics and Natural Sciences',
    shortLabel: 'Math & Science',
    icon: '🔬',
    color: '#F0F9FF',
    accent: '#0284C7',
    value: 'Department of Mathematics and Natural Sciences',
  },
  {
    id: 'ess',
    label: 'Department of Economics and Social Sciences',
    shortLabel: 'Social Sciences',
    icon: '🌐',
    color: '#FDF4FF',
    accent: '#9333EA',
    value: 'Department of Economics and Social Sciences',
  },
  {
    id: 'eng',
    label: 'Department of English and Humanities',
    shortLabel: 'English & Hum.',
    icon: '📝',
    color: '#FFFBEB',
    accent: '#B45309',
    value: 'Department of English and Humanities',
  },
  {
    id: 'phar',
    label: 'Department of Pharmacy',
    shortLabel: 'Pharmacy',
    icon: '💊',
    color: '#FFF1F2',
    accent: '#E11D48',
    value: 'Department of Pharmacy',
  },
  {
    id: 'sds',
    label: 'School of Data & Sciences',
    shortLabel: 'Data & Sciences',
    icon: '📈',
    color: '#F0FDF4',
    accent: '#059669',
    value: 'School of Data & Sciences',
  },
  {
    id: 'gened',
    label: 'General Education (GenEd) Program',
    shortLabel: 'GenEd',
    icon: '🎓',
    color: '#F8FAFC',
    accent: '#475569',
    value: 'General Education (GenEd) Program',
  },
  {
    id: 'bil',
    label: 'BRAC Institute of Languages (BIL)',
    shortLabel: 'Languages (BIL)',
    icon: '🌍',
    color: '#FFF8F0',
    accent: '#D97706',
    value: 'BRAC Institute of Languages (BIL)',
  },
  {
    id: 'shss',
    label: 'School of Humanities and Social Sciences',
    shortLabel: 'Humanities',
    icon: '📚',
    color: '#FDF4FF',
    accent: '#7C3AED',
    value: 'School of Humanities and Social Sciences',
  },
]

/**
 * FACULTIES – Legacy alias kept for backward compatibility.
 * Old code referenced FACULTIES with { id, label, icon, color, accent }.
 * New code should use SCHOOLS instead (adds shortLabel and value fields).
 */
export const FACULTIES = SCHOOLS

// ── Departments (all 41 BRACU departments) ────────────────────────────────────
export const DEPARTMENTS = [
  // BRAC Business School
  { id: 'accounting',    label: 'Accounting & Finance',            school: 'BRAC Business School',                                    prefix: 'ACT,FIN' },
  { id: 'management',   label: 'Management & HRM',                  school: 'BRAC Business School',                                    prefix: 'MGT,HRM' },
  { id: 'marketing',    label: 'Marketing & International Business', school: 'BRAC Business School',                                    prefix: 'MKT' },
  { id: 'operations',   label: 'Operations & MIS',                   school: 'BRAC Business School',                                    prefix: 'MSC,MIS' },
  { id: 'gba',          label: 'General Business Administration',    school: 'BRAC Business School',                                    prefix: 'BUS' },
  { id: 'economics',    label: 'Economics',                          school: 'BRAC Business School',                                    prefix: 'ECO' },

  // BSRM School of Engineering
  { id: 'cse',          label: 'Computer Science and Engineering',   school: 'BSRM School of Engineering',                              prefix: 'CSE' },
  { id: 'eee',          label: 'Electrical and Electronic Engineering', school: 'BSRM School of Engineering',                           prefix: 'EEE,ECE' },
  { id: 'civil',        label: 'Civil and Environmental Engineering', school: 'BSRM School of Engineering',                              prefix: 'CEE' },
  { id: 'mech',         label: 'Mechanical Engineering',              school: 'BSRM School of Engineering',                             prefix: 'MEC' },
  { id: 'materials',    label: 'Materials Science',                   school: 'BSRM School of Engineering',                             prefix: 'MSE' },

  // Department of Architecture
  { id: 'architecture', label: 'Architecture',                        school: 'Department of Architecture',                             prefix: 'ARC' },

  // Department of Mathematics and Natural Sciences
  { id: 'math',         label: 'Mathematics',                         school: 'Department of Mathematics and Natural Sciences',          prefix: 'MAT' },
  { id: 'physics',      label: 'Physics',                             school: 'Department of Mathematics and Natural Sciences',          prefix: 'PHY' },
  { id: 'stats',        label: 'Statistics',                          school: 'Department of Mathematics and Natural Sciences',          prefix: 'STA,STAT' },
  { id: 'bio',          label: 'Biology & Life Sciences',             school: 'Department of Mathematics and Natural Sciences',          prefix: 'BIO' },
  { id: 'biochem',      label: 'Biochemistry',                        school: 'Department of Mathematics and Natural Sciences',          prefix: 'BCH' },
  { id: 'biotech',      label: 'Biotechnology',                       school: 'Department of Mathematics and Natural Sciences',          prefix: 'BTE' },
  { id: 'microbio',     label: 'Microbiology',                        school: 'Department of Mathematics and Natural Sciences',          prefix: 'MIC' },
  { id: 'chemistry',    label: 'Chemistry',                           school: 'Department of Mathematics and Natural Sciences',          prefix: 'CHE' },
  { id: 'envscience',   label: 'Environmental Science',               school: 'Department of Mathematics and Natural Sciences',          prefix: 'ENV' },
  { id: 'ape',          label: 'Applied Physics & Electronics',       school: 'Department of Mathematics and Natural Sciences',          prefix: 'APE' },

  // Department of Economics and Social Sciences
  { id: 'anthro',       label: 'Anthropology',                        school: 'Department of Economics and Social Sciences',             prefix: 'ANT' },
  { id: 'econ',         label: 'Economics (Social)',                   school: 'Department of Economics and Social Sciences',             prefix: 'ECO' },
  { id: 'devstudies',   label: 'Development Studies',                 school: 'Department of Economics and Social Sciences',             prefix: 'DVS' },
  { id: 'disaster',     label: 'Disaster Management & Governance',    school: 'Department of Economics and Social Sciences',             prefix: 'DIS' },
  { id: 'polsci',       label: 'Political Science',                   school: 'Department of Economics and Social Sciences',             prefix: 'POL' },
  { id: 'psychology',   label: 'Psychology',                          school: 'Department of Economics and Social Sciences',             prefix: 'PSY' },
  { id: 'sociology',    label: 'Sociology',                           school: 'Department of Economics and Social Sciences',             prefix: 'SOC' },
  { id: 'geography',    label: 'Geography',                           school: 'Department of Economics and Social Sciences',             prefix: 'GEO' },

  // Department of English and Humanities
  { id: 'english',      label: 'English Language & Literature',       school: 'Department of English and Humanities',                    prefix: 'ENG' },
  { id: 'humanities',   label: 'Humanities & Philosophy',             school: 'Department of English and Humanities',                    prefix: 'HUM' },
  { id: 'history',      label: 'History',                             school: 'Department of English and Humanities',                    prefix: 'HIS' },
  { id: 'philosophy',   label: 'Philosophy',                          school: 'Department of English and Humanities',                    prefix: 'PHI' },

  // Department of Pharmacy
  { id: 'pharmacy',     label: 'Pharmacy',                            school: 'Department of Pharmacy',                                  prefix: 'PHR,PHA' },

  // General Education / GenEd
  { id: 'cst',          label: 'Community Seeking Transformation',   school: 'General Education (GenEd) Program',                       prefix: 'CST' },
  { id: 'bangladesh',   label: 'Emergence of Bangladesh (History)',  school: 'General Education (GenEd) Program',                       prefix: 'HIS' },

  // BRAC Institute of Languages
  { id: 'bilfrench',    label: 'French Language',                     school: 'BRAC Institute of Languages (BIL)',                       prefix: 'FRE' },
  { id: 'bilspanish',   label: 'Spanish Language',                    school: 'BRAC Institute of Languages (BIL)',                       prefix: 'SPN' },
  { id: 'biljapanese',  label: 'Japanese Language',                   school: 'BRAC Institute of Languages (BIL)',                       prefix: 'JPN' },
  { id: 'bilchinese',   label: 'Chinese Language',                    school: 'BRAC Institute of Languages (BIL)',                       prefix: 'CHN' },
]

export const YEARS     = ['All Years', 'Year 1', 'Year 2', 'Year 3', 'Year 4']
export const SEMESTERS = ['All Semesters', 'Fall', 'Spring', 'Summer']
