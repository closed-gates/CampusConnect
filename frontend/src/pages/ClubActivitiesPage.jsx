import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './ClubActivitiesPage.css'

/* ── Static seed data (mirrors backend) ─────────────────────── */
const SEED_NOTICES = [
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

const SEED_RECRUITMENTS = [
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

const CLUB_ICONS = {
  'Robotics Club': '🤖',
  'Photography Club': '📷',
  'Debate Society': '🎤',
  'Coding Club': '💻',
  'default': '🏛️',
}

function clubIcon(name) {
  return CLUB_ICONS[name] || CLUB_ICONS['default']
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

/* ── Component ────────────────────────────────────────────────── */
export default function ClubActivitiesPage() {
  const navigate = useNavigate()
  const role = localStorage.getItem('userRole') || 'student'
  const isAdmin = role === 'admin'

  const [activeTab, setActiveTab] = useState('notices')

  // Shared state
  const [notices, setNotices]           = useState(SEED_NOTICES)
  const [recruitments, setRecruitments] = useState(SEED_RECRUITMENTS)
  const [toast, setToast]               = useState(null)

  // Expanded notices
  const [expandedNotice, setExpandedNotice] = useState(null)

  // Admin – post notice form
  const [noticeForm, setNoticeForm] = useState({ clubName: '', title: '', body: '' })
  const [noticeSubmitting, setNoticeSubmitting] = useState(false)

  // Admin – post recruitment form
  const [recruitForm, setRecruitForm] = useState({ clubName: '', role: '', description: '', deadline: '', slots: '' })
  const [recruitSubmitting, setRecruitSubmitting] = useState(false)

  // Student – application modal
  const [applyTarget, setApplyTarget]   = useState(null) // recruitment object
  const [applyForm, setApplyForm]       = useState({ studentName: '', studentEmail: '', motivation: '' })
  const [applySubmitting, setApplySubmitting] = useState(false)

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  /* ── Handlers ── */

  function showToast(message, type = 'success') {
    setToast({ message, type })
  }

  // Admin: post notice
  async function handlePostNotice(e) {
    e.preventDefault()
    if (!noticeForm.clubName || !noticeForm.title || !noticeForm.body) return
    setNoticeSubmitting(true)
    await new Promise(r => setTimeout(r, 600)) // simulate network
    const newNotice = {
      id: Date.now(),
      ...noticeForm,
      postedBy: 'Admin',
      postedAt: new Date().toISOString(),
      pinned: false,
    }
    setNotices(prev => [newNotice, ...prev])
    setNoticeForm({ clubName: '', title: '', body: '' })
    setNoticeSubmitting(false)
    showToast('✅ Notice posted successfully!')
  }

  // Admin: post recruitment
  async function handlePostRecruitment(e) {
    e.preventDefault()
    if (!recruitForm.clubName || !recruitForm.role || !recruitForm.description || !recruitForm.deadline) return
    setRecruitSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    const newRec = {
      id: Date.now(),
      ...recruitForm,
      slots: parseInt(recruitForm.slots) || 5,
    }
    setRecruitments(prev => [newRec, ...prev])
    setRecruitForm({ clubName: '', role: '', description: '', deadline: '', slots: '' })
    setRecruitSubmitting(false)
    showToast('✅ Recruitment posting published!')
  }

  // Student: submit application
  async function handleApply(e) {
    e.preventDefault()
    if (!applyForm.studentName || !applyForm.studentEmail || !applyForm.motivation) return
    setApplySubmitting(true)
    await new Promise(r => setTimeout(r, 700))
    setApplySubmitting(false)
    setApplyTarget(null)
    setApplyForm({ studentName: '', studentEmail: '', motivation: '' })
    showToast('🎉 Application submitted! The club will contact you soon.')
  }

  /* ── Render ── */

  const sortedNotices = [...notices].sort((a, b) => Number(b.pinned) - Number(a.pinned))

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="clubs" />

      <main className="dashboard-main" aria-label="Club Activities">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-greeting">
            {isAdmin ? '🛡️ Club Activities — Admin' : '🏛️ Club Activities'}
          </h1>
          <p className="dashboard-date">
            {isAdmin
              ? 'Post notices and manage club recruitment listings.'
              : 'Browse club notices and apply for open positions.'}
          </p>
        </div>

        {/* Role badge */}
        <div className="club-role-badge-row">
          <span className={`club-role-badge ${isAdmin ? 'admin' : 'student'}`}>
            {isAdmin ? '🛡️ Admin' : '🎓 Student'}
          </span>
        </div>

        {/* Tab Nav */}
        <div className="club-tabs" role="tablist">
          <button
            id="tab-notices"
            role="tab"
            aria-selected={activeTab === 'notices'}
            className={`club-tab ${activeTab === 'notices' ? 'active' : ''}`}
            onClick={() => setActiveTab('notices')}
          >
            📢 Notices
            <span className="club-tab-count">{notices.length}</span>
          </button>
          <button
            id="tab-recruitment"
            role="tab"
            aria-selected={activeTab === 'recruitment'}
            className={`club-tab ${activeTab === 'recruitment' ? 'active' : ''}`}
            onClick={() => setActiveTab('recruitment')}
          >
            📋 Recruitment
            <span className="club-tab-count">{recruitments.length}</span>
          </button>
        </div>

        {/* ── Notices Tab ───────────────────────────────── */}
        {activeTab === 'notices' && (
          <div className="club-tab-content">
            {/* Admin: post notice form */}
            {isAdmin && (
              <div className="section-card club-post-form">
                <div className="section-header">
                  <h2 className="section-title">📝 Post a New Notice</h2>
                </div>
                <form onSubmit={handlePostNotice} noValidate>
                  <div className="club-form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="notice-clubname">Club Name</label>
                      <input
                        id="notice-clubname"
                        className="form-input"
                        placeholder="e.g. Robotics Club"
                        value={noticeForm.clubName}
                        onChange={e => setNoticeForm(p => ({ ...p, clubName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 2 }}>
                      <label className="form-label" htmlFor="notice-title">Notice Title</label>
                      <input
                        id="notice-title"
                        className="form-input"
                        placeholder="Enter a clear, concise title"
                        value={noticeForm.title}
                        onChange={e => setNoticeForm(p => ({ ...p, title: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="notice-body">Notice Content</label>
                    <textarea
                      id="notice-body"
                      className="form-input club-textarea"
                      placeholder="Write the full notice here..."
                      value={noticeForm.body}
                      onChange={e => setNoticeForm(p => ({ ...p, body: e.target.value }))}
                      required
                      rows={4}
                    />
                  </div>
                  <button
                    id="post-notice-btn"
                    type="submit"
                    className="btn btn-primary club-submit-btn"
                    disabled={noticeSubmitting}
                  >
                    {noticeSubmitting ? 'Posting…' : '📢 Post Notice'}
                  </button>
                </form>
              </div>
            )}

            {/* Notice list */}
            <div className="club-list">
              {sortedNotices.map(notice => (
                <div
                  key={notice.id}
                  className={`club-notice-card ${notice.pinned ? 'pinned' : ''}`}
                >
                  <div className="club-notice-header" onClick={() => setExpandedNotice(expandedNotice === notice.id ? null : notice.id)}>
                    <div className="club-notice-meta">
                      <span className="club-icon-bubble">{clubIcon(notice.clubName)}</span>
                      <div>
                        <div className="club-notice-club">{notice.clubName}</div>
                        <div className="club-notice-date">📅 {formatDate(notice.postedAt)}</div>
                      </div>
                    </div>
                    <div className="club-notice-title-row">
                      {notice.pinned && <span className="club-pinned-badge">📌 Pinned</span>}
                      <h3 className="club-notice-title">{notice.title}</h3>
                    </div>
                    <span className="club-expand-icon">{expandedNotice === notice.id ? '▲' : '▼'}</span>
                  </div>
                  {expandedNotice === notice.id && (
                    <div className="club-notice-body">
                      <p>{notice.body}</p>
                      <div className="club-notice-footer">
                        <span>Posted by <strong>{notice.postedBy}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recruitment Tab ────────────────────────────── */}
        {activeTab === 'recruitment' && (
          <div className="club-tab-content">
            {/* Admin: post recruitment form */}
            {isAdmin && (
              <div className="section-card club-post-form">
                <div className="section-header">
                  <h2 className="section-title">📋 Post a Recruitment Listing</h2>
                </div>
                <form onSubmit={handlePostRecruitment} noValidate>
                  <div className="club-form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="recruit-club">Club Name</label>
                      <input
                        id="recruit-club"
                        className="form-input"
                        placeholder="e.g. Coding Club"
                        value={recruitForm.clubName}
                        onChange={e => setRecruitForm(p => ({ ...p, clubName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="recruit-role">Role / Position</label>
                      <input
                        id="recruit-role"
                        className="form-input"
                        placeholder="e.g. Frontend Developer"
                        value={recruitForm.role}
                        onChange={e => setRecruitForm(p => ({ ...p, role: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="recruit-deadline">Application Deadline</label>
                      <input
                        id="recruit-deadline"
                        type="date"
                        className="form-input"
                        value={recruitForm.deadline}
                        onChange={e => setRecruitForm(p => ({ ...p, deadline: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="recruit-slots">Open Slots</label>
                      <input
                        id="recruit-slots"
                        type="number"
                        className="form-input"
                        placeholder="5"
                        min="1"
                        value={recruitForm.slots}
                        onChange={e => setRecruitForm(p => ({ ...p, slots: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="recruit-desc">Description</label>
                    <textarea
                      id="recruit-desc"
                      className="form-input club-textarea"
                      placeholder="Describe the role, requirements, and what the member will work on..."
                      value={recruitForm.description}
                      onChange={e => setRecruitForm(p => ({ ...p, description: e.target.value }))}
                      required
                      rows={3}
                    />
                  </div>
                  <button
                    id="post-recruitment-btn"
                    type="submit"
                    className="btn btn-primary club-submit-btn"
                    disabled={recruitSubmitting}
                  >
                    {recruitSubmitting ? 'Publishing…' : '📋 Publish Recruitment'}
                  </button>
                </form>
              </div>
            )}

            {/* Recruitment cards */}
            <div className="club-recruit-grid">
              {recruitments.map(rec => (
                <div key={rec.id} className="club-recruit-card">
                  <div className="club-recruit-top">
                    <span className="club-icon-bubble large">{clubIcon(rec.clubName)}</span>
                    <div>
                      <div className="club-recruit-club">{rec.clubName}</div>
                      <h3 className="club-recruit-role">{rec.role}</h3>
                    </div>
                  </div>
                  <p className="club-recruit-desc">{rec.description}</p>
                  <div className="club-recruit-meta">
                    <span className="club-meta-chip deadline">🗓️ Deadline: {rec.deadline}</span>
                    <span className="club-meta-chip slots">👥 {rec.slots} slots open</span>
                  </div>
                  {!isAdmin && (
                    <button
                      id={`apply-btn-${rec.id}`}
                      className="btn btn-primary club-apply-btn"
                      onClick={() => { setApplyTarget(rec); setApplyForm({ studentName: '', studentEmail: '', motivation: '' }) }}
                    >
                      Apply Now →
                    </button>
                  )}
                  {isAdmin && (
                    <div className="club-admin-tag">✅ Published</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Application Modal ──────────────────────────── */}
        {applyTarget && (
          <div
            className="club-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={e => { if (e.target === e.currentTarget) setApplyTarget(null) }}
          >
            <div className="club-modal">
              <button
                id="close-modal-btn"
                className="club-modal-close"
                onClick={() => setApplyTarget(null)}
                aria-label="Close modal"
              >✕</button>

              <div className="club-modal-header">
                <span className="club-icon-bubble large">{clubIcon(applyTarget.clubName)}</span>
                <div>
                  <div className="club-modal-club">{applyTarget.clubName}</div>
                  <h2 id="modal-title" className="club-modal-role">Apply — {applyTarget.role}</h2>
                </div>
              </div>

              <form onSubmit={handleApply} noValidate className="club-modal-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="apply-name">Full Name</label>
                  <input
                    id="apply-name"
                    className="form-input"
                    placeholder="Your full name"
                    value={applyForm.studentName}
                    onChange={e => setApplyForm(p => ({ ...p, studentName: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="apply-email">University Email</label>
                  <input
                    id="apply-email"
                    type="email"
                    className="form-input"
                    placeholder="you@university.edu"
                    value={applyForm.studentEmail}
                    onChange={e => setApplyForm(p => ({ ...p, studentEmail: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="apply-motivation">Why do you want to join?</label>
                  <textarea
                    id="apply-motivation"
                    className="form-input club-textarea"
                    placeholder="Tell the club why you'd be a great fit..."
                    rows={4}
                    value={applyForm.motivation}
                    onChange={e => setApplyForm(p => ({ ...p, motivation: e.target.value }))}
                    required
                  />
                </div>
                <button
                  id="submit-application-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={applySubmitting}
                >
                  {applySubmitting ? 'Submitting…' : '🚀 Submit Application'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Toast ─────────────────────────────────────── */}
        {toast && (
          <div className={`club-toast ${toast.type}`} role="alert" aria-live="polite">
            {toast.message}
          </div>
        )}
      </main>
    </div>
  )
}
