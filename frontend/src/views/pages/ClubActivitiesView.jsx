import Sidebar from '../components/Sidebar.jsx'
import { useClubController } from '../../controllers/clubController.js'
import { getClubIcon, formatClubDate } from '../../models/clubModel.js'
import './ClubActivitiesPage.css'

/**
 * ClubActivitiesView – View layer for the Club Activities page.
 *
 * MVC Role: View
 * Renders club notices, recruitment listings, and the application modal.
 * All state and logic is provided by useClubController().
 */
export default function ClubActivitiesView() {
  const {
    isAdmin,
    activeTab, setActiveTab,
    notices, recruitments, toast,
    expandedNotice, setExpandedNotice,
    noticeForm, setNoticeForm,
    noticeSubmitting, handlePostNotice,
    recruitForm, setRecruitForm,
    recruitSubmitting, handlePostRecruitment,
    applyTarget,
    applyForm, setApplyForm,
    applySubmitting, openApplyModal, closeApplyModal, handleApply,
  } = useClubController()

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
              {notices.map(notice => (
                <div
                  key={notice.id}
                  className={`club-notice-card ${notice.pinned ? 'pinned' : ''}`}
                >
                  <div className="club-notice-header" onClick={() => setExpandedNotice(expandedNotice === notice.id ? null : notice.id)}>
                    <div className="club-notice-meta">
                      <span className="club-icon-bubble">{getClubIcon(notice.clubName)}</span>
                      <div>
                        <div className="club-notice-club">{notice.clubName}</div>
                        <div className="club-notice-date">📅 {formatClubDate(notice.postedAt)}</div>
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
                      <input id="recruit-club" className="form-input" placeholder="e.g. Coding Club"
                        value={recruitForm.clubName}
                        onChange={e => setRecruitForm(p => ({ ...p, clubName: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="recruit-role">Role / Position</label>
                      <input id="recruit-role" className="form-input" placeholder="e.g. Frontend Developer"
                        value={recruitForm.role}
                        onChange={e => setRecruitForm(p => ({ ...p, role: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="recruit-deadline">Application Deadline</label>
                      <input id="recruit-deadline" type="date" className="form-input"
                        value={recruitForm.deadline}
                        onChange={e => setRecruitForm(p => ({ ...p, deadline: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="recruit-slots">Open Slots</label>
                      <input id="recruit-slots" type="number" className="form-input" placeholder="5" min="1"
                        value={recruitForm.slots}
                        onChange={e => setRecruitForm(p => ({ ...p, slots: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="recruit-desc">Description</label>
                    <textarea id="recruit-desc" className="form-input club-textarea"
                      placeholder="Describe the role, requirements, and what the member will work on..."
                      value={recruitForm.description}
                      onChange={e => setRecruitForm(p => ({ ...p, description: e.target.value }))}
                      required rows={3} />
                  </div>
                  <button id="post-recruitment-btn" type="submit" className="btn btn-primary club-submit-btn"
                    disabled={recruitSubmitting}>
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
                    <span className="club-icon-bubble large">{getClubIcon(rec.clubName)}</span>
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
                      onClick={() => openApplyModal(rec)}
                    >
                      Apply Now →
                    </button>
                  )}
                  {isAdmin && <div className="club-admin-tag">✅ Published</div>}
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
            onClick={e => { if (e.target === e.currentTarget) closeApplyModal() }}
          >
            <div className="club-modal">
              <button id="close-modal-btn" className="club-modal-close" onClick={closeApplyModal} aria-label="Close modal">✕</button>

              <div className="club-modal-header">
                <span className="club-icon-bubble large">{getClubIcon(applyTarget.clubName)}</span>
                <div>
                  <div className="club-modal-club">{applyTarget.clubName}</div>
                  <h2 id="modal-title" className="club-modal-role">Apply — {applyTarget.role}</h2>
                </div>
              </div>

              <form onSubmit={handleApply} noValidate className="club-modal-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="apply-name">Full Name</label>
                  <input id="apply-name" className="form-input" placeholder="Your full name"
                    value={applyForm.studentName}
                    onChange={e => setApplyForm(p => ({ ...p, studentName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="apply-email">University Email</label>
                  <input id="apply-email" type="email" className="form-input" placeholder="you@university.edu"
                    value={applyForm.studentEmail}
                    onChange={e => setApplyForm(p => ({ ...p, studentEmail: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="apply-motivation">Why do you want to join?</label>
                  <textarea id="apply-motivation" className="form-input club-textarea"
                    placeholder="Tell the club why you'd be a great fit..." rows={4}
                    value={applyForm.motivation}
                    onChange={e => setApplyForm(p => ({ ...p, motivation: e.target.value }))} required />
                </div>
                <button id="submit-application-btn" type="submit" className="btn btn-primary" disabled={applySubmitting}>
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
