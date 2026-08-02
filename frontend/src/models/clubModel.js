/**
 * clubModel.js – Model layer for the Club Activities page.
 *
 * MVC Role: Model
 * Contains seed data for notices, recruitments, and club icon mappings.
 *
 * TODO (Phase 2): Replace seed data with API calls:
 *   GET /api/clubs/notices      → SEED_NOTICES
 *   GET /api/clubs/recruitment  → SEED_RECRUITMENTS
 */

export const SEED_NOTICES = [
  {
    id: 1,
    clubName: 'Robotics Club',
    title: 'Annual Robo-Wars Competition 2026',
    body: 'We are excited to announce the Annual Robo-Wars Competition! All students are welcome to participate. Teams of 2–4 members. Register before August 10th at the club office.',
    postedBy: 'Admin',
    postedAt: '2026-07-20T10:00:00',
    pinned: true,
  },
  {
    id: 2,
    clubName: 'Photography Club',
    title: 'Campus Photo Walk – This Saturday',
    body: 'Join us for a guided photo walk around the campus grounds this Saturday at 7:00 AM. Bring your cameras or smartphones. All skill levels welcome!',
    postedBy: 'Admin',
    postedAt: '2026-07-21T14:30:00',
    pinned: false,
  },
  {
    id: 3,
    clubName: 'Debate Society',
    title: 'Inter-University Debate — Call for Participants',
    body: "The Debate Society is representing our university at the National Inter-University Debate Championship. Tryouts will be held on July 28th in Auditorium A. Prepare a 3-minute speech on the topic: 'AI in Education'.",
    postedBy: 'Admin',
    postedAt: '2026-07-22T09:15:00',
    pinned: true,
  },
]

export const SEED_RECRUITMENTS = [
  {
    id: 1,
    clubName: 'Robotics Club',
    role: 'Mechanical Engineer',
    description: 'Looking for students with hands-on experience in mechanical design, CAD tools, or 3D printing. Work on real competition robots!',
    deadline: '2026-08-05',
    slots: 5,
  },
  {
    id: 2,
    clubName: 'Photography Club',
    role: 'Event Photographer',
    description: 'We need passionate photographers to cover university events. Basic DSLR knowledge required. Equipment provided for official events.',
    deadline: '2026-08-01',
    slots: 3,
  },
  {
    id: 3,
    clubName: 'Coding Club',
    role: 'Full Stack Developer',
    description: 'Building a university app? Join us! We need React & Spring Boot developers. Contribute to real projects used by students.',
    deadline: '2026-08-10',
    slots: 8,
  },
]

export const CLUB_ICONS = {
  'Robotics Club':    '🤖',
  'Photography Club': '📷',
  'Debate Society':   '🎤',
  'Coding Club':      '💻',
  'default':          '🏛️',
}

/** Returns the emoji icon for a given club name */
export function getClubIcon(name) {
  return CLUB_ICONS[name] || CLUB_ICONS['default']
}

/** Formats an ISO date string to a readable date */
export function formatClubDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
