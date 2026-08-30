/**
 * channelService.js - Course Channel Provisioning Service
 * Includes localStorage persistence across page reloads.
 */

const STORAGE_KEY = 'cc_enrolled_channels_v1'

const MOCK_MEMBERS_POOL = [
  { id: 'usr_eusha_001',   username: 'eusha.k',     displayName: 'Eusha Kayenat',      role: 'STUDENT', status: 'ONLINE'  },
  { id: 'usr_alex_002',    username: 'alex_dev',    displayName: 'Alex Rivers',         role: 'STUDENT', status: 'ONLINE'  },
  { id: 'usr_sarah_003',   username: 'sarah_m',     displayName: 'Sarah Miller',        role: 'STUDENT', status: 'IDLE'    },
  { id: 'usr_rafi_004',    username: 'rafi.hasan',  displayName: 'Rafi Hasan',          role: 'STUDENT', status: 'OFFLINE' },
  { id: 'usr_nadia_005',   username: 'nadia.c',     displayName: 'Nadia Chowdhury',     role: 'STUDENT', status: 'ONLINE'  },
  { id: 'usr_tanvir_006',  username: 'tanvir.a',    displayName: 'Tanvir Ahmed',        role: 'STUDENT', status: 'OFFLINE' },
  { id: 'usr_faculty_001', username: 'dr_mahbub',   displayName: 'Dr. Mahbubur Rahman', role: 'FACULTY', status: 'ONLINE'  },
]

function ts(minutesAgo) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString()
}

function buildSubChannels(courseCode, courseName, instructorName) {
  return [
    {
      id: 'general', name: 'general', icon: '#', category: 'TEXT CHANNELS',
      description: `General discussion for ${courseCode}`,
      messages: [
        { id: 'm1', authorId: 'usr_faculty_001', authorName: instructorName, authorRole: 'FACULTY', content: `Welcome everyone to **${courseCode}**! This is your general discussion channel. Introduce yourselves!`, createdAt: ts(120) },
        { id: 'm2', authorId: 'usr_alex_002',    authorName: 'Alex Rivers',   authorRole: 'STUDENT', content: 'Hey! Really excited about this course. Anyone started on the pre-reading?', createdAt: ts(90) },
        { id: 'm3', authorId: 'usr_sarah_003',   authorName: 'Sarah Miller',  authorRole: 'STUDENT', content: 'Just went through the syllabus - looks intense but super interesting!', createdAt: ts(85) },
        { id: 'm4', authorId: 'usr_eusha_001',   authorName: 'Eusha Kayenat', authorRole: 'STUDENT', content: 'Just enrolled! Looking forward to this one!', createdAt: ts(5) },
      ]
    },
    {
      id: 'announcements', name: 'announcements', icon: 'ANNOUNCE', category: 'TEXT CHANNELS',
      description: 'Official announcements from the instructor', readOnly: true,
      messages: [
        { id: 'a1', authorId: 'usr_faculty_001', authorName: instructorName, authorRole: 'FACULTY', content: `Course Kickoff: First class is Monday at 9:00 AM in Room 301. Bring your laptop!`, createdAt: ts(200) },
        { id: 'a2', authorId: 'usr_faculty_001', authorName: instructorName, authorRole: 'FACULTY', content: `Syllabus for ${courseCode} is posted in the Resources channel. Read before first class.`, createdAt: ts(150) },
        { id: 'a3', authorId: 'usr_faculty_001', authorName: instructorName, authorRole: 'FACULTY', content: `Quiz 1 will be in Week 3. Topics: Chapters 1-3. Prepare accordingly!`, createdAt: ts(30) },
      ]
    },
    {
      id: 'resources', name: 'resources', icon: 'RESOURCE', category: 'TEXT CHANNELS',
      description: 'Course materials, slides, and reference links',
      messages: [
        { id: 'r1', authorId: 'usr_faculty_001', authorName: instructorName, authorRole: 'FACULTY', content: `Week 1 Slides: Introduction to ${courseName}`, createdAt: ts(180), attachments: [{ name: 'Lecture01_Intro.pdf', type: 'pdf', size: '2.4 MB' }] },
        { id: 'r2', authorId: 'usr_faculty_001', authorName: instructorName, authorRole: 'FACULTY', content: `Recommended Textbook: Available in the library (Floor 3, Section B).`, createdAt: ts(160) },
        { id: 'r3', authorId: 'usr_alex_002',    authorName: 'Alex Rivers',   authorRole: 'STUDENT', content: `Found a great free resource on Coursera that maps to our syllabus!`, createdAt: ts(60) },
        { id: 'r4', authorId: 'usr_faculty_001', authorName: instructorName, authorRole: 'FACULTY', content: `Week 2 Slides: Core Concepts`, createdAt: ts(20), attachments: [{ name: 'Lecture02_Core.pdf', type: 'pdf', size: '3.1 MB' }] },
      ]
    },
    {
      id: 'section-announcements', name: 'section-announcements', icon: 'SECTION', category: 'TEXT CHANNELS',
      description: 'Section-specific updates from TAs',
      messages: [
        { id: 's1', authorId: 'usr_nadia_005', authorName: 'TA: Nadia Chowdhury', authorRole: 'FACULTY', content: `Hi Section B! Office hours: Tue & Thu 3-5 PM, Room 204.`, createdAt: ts(100) },
        { id: 's2', authorId: 'usr_nadia_005', authorName: 'TA: Nadia Chowdhury', authorRole: 'FACULTY', content: `Lab 1 reminder: This Friday. Bring your laptop with IDE pre-installed.`, createdAt: ts(40) },
      ]
    },
    {
      id: 'q-and-a', name: 'q-and-a', icon: 'QA', category: 'TEXT CHANNELS',
      description: 'Ask questions, get answers from peers and faculty',
      messages: [
        { id: 'q1', authorId: 'usr_sarah_003',   authorName: 'Sarah Miller',  authorRole: 'STUDENT', content: `Will the mid-term be open-book? The syllabus was not clear.`, createdAt: ts(75) },
        { id: 'q2', authorId: 'usr_faculty_001', authorName: instructorName,  authorRole: 'FACULTY', content: `Yes! Mid-term is open-book but closed-internet. You may bring printed notes.`, createdAt: ts(70) },
        { id: 'q3', authorId: 'usr_rafi_004',    authorName: 'Rafi Hasan',    authorRole: 'STUDENT', content: `Is group submission allowed for Assignment 1?`, createdAt: ts(45) },
        { id: 'q4', authorId: 'usr_faculty_001', authorName: instructorName,  authorRole: 'FACULTY', content: `Individual submissions for Assignment 1. Groups allowed from Assignment 2 onward (max 3).`, createdAt: ts(40) },
      ]
    },
    {
      id: 'study-links', name: 'study-links', icon: 'LINK', category: 'STUDY RESOURCES',
      description: 'Useful links, tools and study groups',
      messages: [
        { id: 'l1', authorId: 'usr_nadia_005',  authorName: 'Nadia Chowdhury', authorRole: 'STUDENT', content: `Study group forming! Meeting Saturdays 6 PM at the library. DM me to join!`, createdAt: ts(50) },
        { id: 'l2', authorId: 'usr_tanvir_006', authorName: 'Tanvir Ahmed',    authorRole: 'STUDENT', content: `YouTube playlist covering our Week 1-3 topics - highly recommend it!`, createdAt: ts(25) },
      ]
    },
  ]
}

function buildAdvisorSubChannels() {
  return [
    {
      id: 'general-advising', name: 'general-advising', icon: '#', category: 'ADVISING CHANNELS',
      description: 'General academic advising & semester guidance',
      messages: [
        { id: 'adv_m1', authorId: 'usr_advisor_001', authorName: 'Dr. Sarah Ahmed', authorRole: 'FACULTY', content: 'Welcome to Academic Advising! Please check your credit limits and priority windows before registering.', createdAt: ts(240) },
        { id: 'adv_m2', authorId: 'usr_eusha_001',   authorName: 'Eusha Kayenat', authorRole: 'STUDENT', content: 'Hello Dr. Sarah, I have planned 4 courses (12 credits) for Summer 2026.', createdAt: ts(60) },
        { id: 'adv_m3', authorId: 'usr_advisor_001', authorName: 'Dr. Sarah Ahmed', authorRole: 'FACULTY', content: 'Looks great! Make sure there are no schedule conflicts with your lab sections.', createdAt: ts(15) },
      ]
    },
    {
      id: 'announcements', name: 'announcements', icon: 'ANNOUNCE', category: 'ADVISING CHANNELS',
      description: 'Official advising dates, credit caps & deadlines', readOnly: true,
      messages: [
        { id: 'adv_a1', authorId: 'usr_advisor_001', authorName: 'Dr. Sarah Ahmed', authorRole: 'FACULTY', content: '📢 Summer 2026 Advising Phase 1 is now open for students with >= 60 credits.', createdAt: ts(300) },
        { id: 'adv_a2', authorId: 'usr_advisor_001', authorName: 'Dr. Sarah Ahmed', authorRole: 'FACULTY', content: '⚠️ Probationary students must maintain a maximum of 3 courses (9 credits).', createdAt: ts(180) },
      ]
    },
    {
      id: 'degree-audit', name: 'degree-audit', icon: 'AUDIT', category: 'ACADEMIC PLANNING',
      description: 'Degree requirement verification and major/minor queries',
      messages: [
        { id: 'adv_d1', authorId: 'usr_advisor_001', authorName: 'Dr. Sarah Ahmed', authorRole: 'FACULTY', content: 'Need a graduation degree audit check? Post your completed credits count here.', createdAt: ts(120) },
      ]
    },
    {
      id: 'course-waivers', name: 'course-waivers', icon: 'WAIVER', category: 'ACADEMIC PLANNING',
      description: 'Prerequisite waiver & credit overload requests',
      messages: [
        { id: 'adv_w1', authorId: 'usr_advisor_001', authorName: 'Dr. Sarah Ahmed', authorRole: 'FACULTY', content: 'For credit overloads (CGPA >= 3.5), please ensure your prerequisite courses are completed.', createdAt: ts(90) },
      ]
    },
    {
      id: 'office-hours', name: 'office-hours', icon: 'HOURS', category: 'ACADEMIC PLANNING',
      description: 'Advisor physical & online consultation timings',
      messages: [
        { id: 'adv_o1', authorId: 'usr_advisor_001', authorName: 'Dr. Sarah Ahmed', authorRole: 'FACULTY', content: 'Office Hours: Sunday & Tuesday 10:00 AM – 12:00 PM (Room UB09-04A or via Google Meet).', createdAt: ts(150) },
      ]
    }
  ]
}

const DEFAULT_ENROLLED_COURSES = [
  { code: 'CSE110', name: 'Programming Language I', emoji: '💻' },
  { code: 'CSE220', name: 'Data Structures', emoji: '🌲' },
  { code: 'MAT110', name: 'Differential Calculus & Coordinate Geometry', emoji: '📐' },
]

class ChannelService {
  constructor() {
    this._channels  = new Map()
    this._members   = new Map()
    this._subChMsgs = new Map()
    this._subChs    = new Map()
    this._listeners = new Set()
    this._initAdvisorChannel()
    this._rehydrateFromStorage()
  }

  _initAdvisorChannel() {
    const channelId = 'ch_advisor_001'
    if (!this._channels.has(channelId)) {
      const advChannel = {
        id: channelId,
        isChannel: true,
        isAdvisorChannel: true,
        name: '🎓 Advisor Channel',
        displayName: 'Academic Advising — message your advisor here',
        courseCode: 'ADVISING',
        emoji: '🎓',
        unreadCount: 0,
        lastMessage: { content: 'Welcome to Academic Advising!' },
      }
      this._channels.set(channelId, advChannel)

      const members = new Map()
      MOCK_MEMBERS_POOL.forEach(m => members.set(m.id, m))
      members.set('usr_advisor_001', {
        id: 'usr_advisor_001',
        username: 'dr_sarah',
        displayName: 'Dr. Sarah Ahmed',
        role: 'FACULTY',
        status: 'ONLINE'
      })
      this._members.set(channelId, members)

      const subs = buildAdvisorSubChannels()
      this._subChs.set(channelId, subs)
      subs.forEach(sub => {
        this._subChMsgs.set(`${channelId}:${sub.id}`, [...sub.messages])
      })
    }
  }

  subscribe(callback) {
    this._listeners.add(callback)
    return () => this._listeners.delete(callback)
  }

  _emit(event, payload) {
    this._listeners.forEach(fn => fn({ event, payload }))
  }

  _rehydrateFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const courses = raw ? JSON.parse(raw) : DEFAULT_ENROLLED_COURSES
      courses.forEach(course => {
        this._provisionChannel(course, 'usr_eusha_001', false)
      })
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ENROLLED_COURSES))
      }
    } catch (e) {
      console.warn('Could not restore enrolled channels from localStorage', e)
    }
  }

  _saveToStorage(course) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const courses = raw ? JSON.parse(raw) : []
      if (!courses.some(c => c.code === course.code)) {
        courses.push(course)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
      }
    } catch (e) {
      console.warn('Could not save enrolled channel to localStorage', e)
    }
  }

  _provisionChannel(course, userId, isNewEnrollment = true) {
    const channelId = this._deriveChannelId(course.code)

    if (!this._channels.has(channelId)) {
      const newChannel = {
        id: channelId, isChannel: true,
        name: `#${course.code.toLowerCase().replace(/\s+/g, '-')}`,
        displayName: course.name,
        courseCode: course.code,
        emoji: course.emoji || '📚',
        unreadCount: 0,
        lastMessage: { content: 'Welcome to the course channel!' },
      }
      this._channels.set(channelId, newChannel)

      const members = new Map()
      MOCK_MEMBERS_POOL.forEach(m => members.set(m.id, m))
      this._members.set(channelId, members)

      const instructor = MOCK_MEMBERS_POOL.find(m => m.role === 'FACULTY')?.displayName || 'Instructor'
      const subs = buildSubChannels(course.code, course.name, instructor)
      this._subChs.set(channelId, subs)
      subs.forEach(sub => {
        this._subChMsgs.set(`${channelId}:${sub.id}`, [...sub.messages])
      })
    }

    const enrollingUser = MOCK_MEMBERS_POOL.find(m => m.id === userId)
    if (enrollingUser) this._members.get(channelId).set(userId, enrollingUser)

    if (isNewEnrollment) {
      this._saveToStorage(course)
    }

    return this._channels.get(channelId)
  }

  async onEnrollment({ userId, course }) {
    const channel = this._provisionChannel(course, userId, true)
    this._emit('CHANNEL_JOINED', { channel, userId })
    return channel
  }

  getChannelsForUser(userId) {
    const result = []
    for (const [channelId, members] of this._members.entries()) {
      if (channelId !== 'ch_advisor_001' && members.has(userId)) {
        result.push(this._channels.get(channelId))
      }
    }
    return result
  }

  getSubChannels(channelId) { return this._subChs.get(channelId) || [] }

  getMembers(channelId) {
    const map = this._members.get(channelId)
    return map ? [...map.values()] : []
  }

  getSubChannelMessages(channelId, subId) {
    return this._subChMsgs.get(`${channelId}:${subId}`) || []
  }

  sendSubChannelMessage(channelId, subId, message) {
    const key = `${channelId}:${subId}`
    const msgs = this._subChMsgs.get(key) || []
    msgs.push(message)
    this._subChMsgs.set(key, msgs)
    this._emit('SUB_CHANNEL_MESSAGE', { channelId, subId, message })
    return message
  }

  _deriveChannelId(courseCode) {
    return `ch_${courseCode.toLowerCase().replace(/[\s/]+/g, '_')}`
  }
}

export const channelService = new ChannelService()
