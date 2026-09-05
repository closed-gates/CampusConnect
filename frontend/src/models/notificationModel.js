/**
 * notificationModel.js – Model layer for in-app student notifications.
 *
 * MVC Role: Model
 *
 * Defines notification schemas, type constants, visual metadata,
 * and pure utility formatters. No JSX, state hooks, or styles.
 */

export const NOTIFICATION_TYPES = {
  GRADE_PUBLISHED:      'GRADE_PUBLISHED',
  DEADLINE_APPROACHING: 'DEADLINE_APPROACHING',
  ANNOUNCEMENT_POSTED:  'ANNOUNCEMENT_POSTED',
  ADVISING_CONFIRMED:   'ADVISING_CONFIRMED',
  ASSIGNMENT_UPLOADED:  'ASSIGNMENT_UPLOADED',
  VIDEO_UPLOADED:       'VIDEO_UPLOADED',
  COURSE_MATERIAL_UPLOADED: 'COURSE_MATERIAL_UPLOADED',
  ADVISING_PORTAL:      'ADVISING_PORTAL',
  DM_MESSAGE:           'DM_MESSAGE',
  ATTENDANCE_LOW:       'ATTENDANCE_LOW',
};

/**
 * Visual metadata and branding for each notification type
 * adhering to the CampusConnect university design system tokens.
 */
export const NOTIFICATION_CONFIG = {
  [NOTIFICATION_TYPES.GRADE_PUBLISHED]: {
    label: 'Grade Published',
    icon: '🎓',
    accentColor: '#10b981', // Emerald
    bgColor: 'rgba(16, 185, 129, 0.12)',
    badgeClass: 'grade-badge',
    defaultLink: '/assignments',
  },
  [NOTIFICATION_TYPES.DEADLINE_APPROACHING]: {
    label: 'Upcoming Deadline',
    icon: '⏳',
    accentColor: '#f59e0b', // Amber / Orange
    bgColor: 'rgba(245, 158, 11, 0.12)',
    badgeClass: 'deadline-badge',
    defaultLink: '/assignments',
  },
  [NOTIFICATION_TYPES.ANNOUNCEMENT_POSTED]: {
    label: 'Course Announcement',
    icon: '📢',
    accentColor: '#3b82f6', // University Blue
    bgColor: 'rgba(59, 130, 246, 0.12)',
    badgeClass: 'announcement-badge',
    defaultLink: '/courses',
  },
  [NOTIFICATION_TYPES.ADVISING_CONFIRMED]: {
    label: 'Advising Confirmed',
    icon: '📋',
    accentColor: '#06b6d4', // Cyan
    bgColor: 'rgba(6, 182, 212, 0.12)',
    badgeClass: 'advising-badge',
    defaultLink: '/advising',
  },
  [NOTIFICATION_TYPES.ASSIGNMENT_UPLOADED]: {
    label: 'New Assignment',
    icon: '📝',
    accentColor: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    badgeClass: 'assignment-badge',
    defaultLink: '/assignments',
  },
  [NOTIFICATION_TYPES.VIDEO_UPLOADED]: {
    label: 'New Video Lecture',
    icon: '🎬',
    accentColor: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    badgeClass: 'video-badge',
    defaultLink: '/video-lectures',
  },
  [NOTIFICATION_TYPES.COURSE_MATERIAL_UPLOADED]: {
    label: 'Course Material',
    icon: '📎',
    accentColor: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.12)',
    badgeClass: 'material-badge',
    defaultLink: '/course-materials',
  },
  [NOTIFICATION_TYPES.ADVISING_PORTAL]: {
    label: 'Advising Portal',
    icon: '🚪',
    accentColor: '#0d9488',
    bgColor: 'rgba(13, 148, 136, 0.12)',
    badgeClass: 'advising-badge',
    defaultLink: '/advising',
  },
  [NOTIFICATION_TYPES.DM_MESSAGE]: {
    label: 'Direct Message',
    icon: '💬',
    accentColor: '#2563eb',
    bgColor: 'rgba(37, 99, 235, 0.12)',
    badgeClass: 'dm-badge',
    defaultLink: '/messaging',
  },
  [NOTIFICATION_TYPES.ATTENDANCE_LOW]: {
    label: 'Low Attendance',
    icon: '📉',
    accentColor: '#dc2626',
    bgColor: 'rgba(220, 38, 38, 0.12)',
    badgeClass: 'attendance-badge',
    defaultLink: '/attendance',
  },
};

/**
 * Formats an ISO/Instant timestamp into a human-friendly relative string.
 * e.g., "Just now", "5m ago", "2h ago", "Yesterday", "Oct 12"
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;

  if (diffMs < 0 || diffMs < 45_000) {
    return 'Just now';
  }

  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
