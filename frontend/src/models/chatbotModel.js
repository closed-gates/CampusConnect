/**
 * chatbotModel.js – Model layer for the AI chatbot assistant.
 *
 * MVC Role: Model
 *
 * Contains:
 *   - Message shape definitions
 *   - Topic constants
 *   - The verbatim fallback message (kept in sync with backend)
 *   - Max history turns to send per request
 */

// ── Verbatim fallback message (must match backend constant) ──────────────────
export const FALLBACK_MESSAGE =
  'I do not have the information you need. Please contact the admin or desired department for further assistance.'

// ── Max conversation history turns to send to the backend ────────────────────
export const MAX_HISTORY_TURNS = 6

// ── Message roles ─────────────────────────────────────────────────────────────
export const ROLE = {
  USER:      'user',
  ASSISTANT: 'assistant',
  SYSTEM:    'system',
}

// ── Topic labels (for debug/display) ─────────────────────────────────────────
export const TOPIC_LABELS = {
  COURSE_MATERIALS:       'Course Materials',
  PAYMENT_METHODS:        'Payment Methods',
  ADVISING_SCHEDULE:      'Advising Schedule',
  CREDIT_LIMITS:          'Credit Limits',
  ADVISED_COURSES:        'Advised Courses',
  ASSIGNMENTS:            'Assignments',
  ASSIGNMENT_DUE_DATES:   'Due Dates',
  ADVISOR_EMAIL:          'Advisor/Faculty Email',
  ADMIN_QUERIES:          'Admin Queries',
  PASSWORD_CHANGE:        'Password Change',
  ATTENDANCE:             'Attendance',
  COURSE_SEAT_AVAILABILITY: 'Seat Availability',
  OUT_OF_SCOPE:           'Out of Scope',
}

/**
 * Create a new message object.
 *
 * @param {'user'|'assistant'} role
 * @param {string} content
 * @returns {{ id: string, role: string, content: string, timestamp: Date }}
 */
export function createMessage(role, content) {
  return {
    id:        crypto.randomUUID(),
    role,
    content,
    timestamp: new Date(),
  }
}

/** Initial welcome message shown when the chat opens */
export const WELCOME_MESSAGE = createMessage(
  ROLE.ASSISTANT,
  '👋 Hi! I\'m the CampusConnect AI Assistant. I can help you with:\n\n' +
  '• Course materials & assignments\n' +
  '• Payment & fees\n' +
  '• Advising schedule & advisor contacts\n' +
  '• Credit limits & registration\n' +
  '• Attendance & eligibility\n' +
  '• Course seat availability\n' +
  '• Password reset & admin queries\n\n' +
  'How can I help you today?'
)

/** Suggested quick-action prompts shown in the empty chat state */
export const QUICK_PROMPTS = [
  'What\'s my current attendance?',
  'What are my upcoming assignment deadlines?',
  'What courses were approved in my advising?',
  'What\'s my credit limit this semester?',
  'What\'s my advisor\'s email?',
  'How do I reset my password?',
]
