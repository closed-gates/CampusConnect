/**
 * channelService.js - Course Channel Provisioning Service
 * Dynamic channel synchronization strictly bound to the active user's advising/registered courses.
 */

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
      ]
    },
    {
      id: 'announcements', name: 'announcements', icon: 'ANNOUNCE', category: 'TEXT CHANNELS',
      description: 'Official announcements from the instructor', readOnly: true,
      messages: [
        { id: 'a1', authorId: 'usr_faculty_001', authorName: instructorName, authorRole: 'FACULTY', content: `Course Kickoff: First class is scheduled as per university routine. Bring your materials!`, createdAt: ts(200) },
        { id: 'a2', authorId: 'usr_faculty_001', authorName: instructorName, authorRole: 'FACULTY', content: `Syllabus for ${courseCode} is posted in the Resources channel.`, createdAt: ts(150) },
      ]
    },
    {
      id: 'resources', name: 'resources', icon: 'RESOURCE', category: 'TEXT CHANNELS',
      description: 'Course materials, slides, and reference links',
      messages: [
        { id: 'r1', authorId: 'usr_faculty_001', authorName: instructorName, authorRole: 'FACULTY', content: `Week 1 Slides: Introduction to ${courseName}`, createdAt: ts(180), attachments: [{ name: 'Lecture01_Intro.pdf', type: 'pdf', size: '2.4 MB' }] },
      ]
    },
    {
      id: 'q-and-a', name: 'q-and-a', icon: 'QA', category: 'TEXT CHANNELS',
      description: 'Ask questions, get answers from peers and faculty',
      messages: [
        { id: 'q1', authorId: 'usr_sarah_003',   authorName: 'Sarah Miller',  authorRole: 'STUDENT', content: `Will the mid-term be open-book?`, createdAt: ts(75) },
        { id: 'q2', authorId: 'usr_faculty_001', authorName: instructorName,  authorRole: 'FACULTY', content: `Check the course syllabus for full exam guidelines.`, createdAt: ts(70) },
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
      ]
    },
    {
      id: 'announcements', name: 'announcements', icon: 'ANNOUNCE', category: 'ADVISING CHANNELS',
      description: 'Official advising dates, credit caps & deadlines', readOnly: true,
      messages: [
        { id: 'adv_a1', authorId: 'usr_advisor_001', authorName: 'Dr. Sarah Ahmed', authorRole: 'FACULTY', content: '📢 Summer 2026 Advising is now open. Confirm your advising once courses are selected.', createdAt: ts(300) },
      ]
    },
  ]
}

class ChannelService {
  constructor() {
    this._channels            = new Map()
    this._members             = new Map()
    this._subChMsgs           = new Map()
    this._subChs              = new Map()
    this._listeners           = new Set()
    this._userEnrolledChannels = new Map() // userId -> Set<channelId>

    // Clean up legacy static storage if present
    try {
      localStorage.removeItem('cc_enrolled_channels_v1')
    } catch (ignored) {}

    this._initAdvisorChannel()
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

  /**
   * Synchronizes the user's course channels with the exact active enrolled courses from backend.
   * Clears out any old or dropped courses.
   */
  syncUserChannels(userId, activeCourses = []) {
    if (!userId) return []
    const userKey = String(userId).trim()
    const set = new Set()

    activeCourses.forEach(course => {
      if (course && course.code) {
        const ch = this._provisionChannel(course, userKey)
        if (ch) {
          set.add(ch.id)
        }
      }
    })

    this._userEnrolledChannels.set(userKey, set)

    try {
      localStorage.setItem(`cc_user_enrolled_${userKey}`, JSON.stringify(activeCourses))
    } catch (ignored) {}

    return Array.from(set).map(id => this._channels.get(id)).filter(Boolean)
  }

  _provisionChannel(course, userId) {
    const code = (course.code || course.courseCode || '').toUpperCase().trim()
    if (!code) return null

    const channelId = this._deriveChannelId(code)

    if (!this._channels.has(channelId)) {
      const name = course.name || course.title || course.courseTitle || code
      const newChannel = {
        id: channelId,
        isChannel: true,
        name: `#${code.toLowerCase().replace(/\s+/g, '-')}`,
        displayName: name,
        courseCode: code,
        emoji: course.emoji || '📚',
        unreadCount: 0,
        lastMessage: { content: 'Welcome to the course channel!' },
      }
      this._channels.set(channelId, newChannel)

      const members = new Map()
      MOCK_MEMBERS_POOL.forEach(m => members.set(m.id, m))
      this._members.set(channelId, members)

      const instructor = course.faculty || 'Course Faculty'
      const subs = buildSubChannels(code, name, instructor)
      this._subChs.set(channelId, subs)
      subs.forEach(sub => {
        this._subChMsgs.set(`${channelId}:${sub.id}`, [...sub.messages])
      })
    }

    if (userId) {
      const userKey = String(userId).trim()
      const memberObj = MOCK_MEMBERS_POOL.find(m => m.id === userKey) || {
        id: userKey,
        username: userKey,
        displayName: userKey,
        role: 'STUDENT',
        status: 'ONLINE'
      }
      if (this._members.has(channelId)) {
        this._members.get(channelId).set(userKey, memberObj)
      }
    }

    return this._channels.get(channelId)
  }

  async onEnrollment({ userId, course }) {
    if (!userId || !course) return null
    const userKey = String(userId).trim()
    const channel = this._provisionChannel(course, userKey)
    if (!channel) return null

    if (!this._userEnrolledChannels.has(userKey)) {
      this._userEnrolledChannels.set(userKey, new Set())
    }
    this._userEnrolledChannels.get(userKey).add(channel.id)

    this._emit('CHANNEL_JOINED', { channel, userId: userKey })
    return channel
  }

  onDropCourse({ userId, courseCode }) {
    if (!userId || !courseCode) return
    const userKey = String(userId).trim()
    const channelId = this._deriveChannelId(courseCode)

    if (this._userEnrolledChannels.has(userKey)) {
      this._userEnrolledChannels.get(userKey).delete(channelId)
    }

    this._emit('CHANNEL_LEFT', { channelId, userId: userKey })
  }

  /**
   * Returns ONLY the course channels that this user currently has enrolled in advising.
   */
  getChannelsForUser(userId) {
    if (!userId) return []
    const userKey = String(userId).trim()

    if (!this._userEnrolledChannels.has(userKey)) {
      try {
        const raw = localStorage.getItem(`cc_user_enrolled_${userKey}`)
        if (raw) {
          const courses = JSON.parse(raw)
          return this.syncUserChannels(userKey, courses)
        }
      } catch (ignored) {}
      return []
    }

    const set = this._userEnrolledChannels.get(userKey) || new Set()
    return Array.from(set).map(id => this._channels.get(id)).filter(Boolean)
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
    return `ch_${String(courseCode).toLowerCase().replace(/[\s/]+/g, '_')}`
  }
}

export const channelService = new ChannelService()
