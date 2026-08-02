import Sidebar from '../components/Sidebar.jsx'
import { useClubController } from '../../controllers/clubController.js'
import {
  getClubIcon,
  formatClubDate,
  RECRUITMENT_FORM_STEPS,
  TEAM_OPTIONS,
  SKILL_OPTIONS,
  TIME_COMMITMENT_OPTIONS,
  PARTICIPATION_OPTIONS,
  DEPARTMENT_OPTIONS,
  YEAR_SEMESTER_OPTIONS,
} from '../../models/clubModel.js'
import './ClubActivitiesPage.css'

/**
 * ClubActivitiesView – View layer for the Club Activities page.
 *
 * MVC Role: View
 * Renders club notices, recruitment listings, and the multi-step application form.
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
    applyStep,
    applyForm,
    applyErrors,
    applySubmitting,
    totalSteps,
    openApplyModal, closeApplyModal,
    nextStep, prevStep,
    handleApply,
    updateApplyField,
    toggleApplyArrayField,
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

        {/* ══════════════════════════════════════════════════════════
            Multi-Step Application Form Overlay
           ══════════════════════════════════════════════════════════ */}
        {applyTarget && (
          <div
            className="recruit-form-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recruit-form-title"
          >
            <div className="recruit-form-container">
              {/* Close button */}
              <button
                id="close-recruit-form-btn"
                className="recruit-form-close"
                onClick={closeApplyModal}
                aria-label="Close application form"
              >✕</button>

              {/* Header */}
              <div className="recruit-form-header">
                <div className="recruit-form-logo">
                  {getClubIcon(applyTarget.clubName)}
                </div>
                <h2 id="recruit-form-title" className="recruit-form-club-name">
                  {applyTarget.clubName}
                </h2>
                <div className="recruit-form-subtitle">
                  Member Recruitment — 2026
                </div>
                {applyStep === 0 && (
                  <p className="recruit-form-description">
                    We're looking for enthusiastic students who want to learn, contribute, and be part of our community. Fill out the form below to apply.
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              {applyStep < totalSteps - 1 && (
                <div className="recruit-progress">
                  <div className="recruit-progress-bar">
                    <div
                      className="recruit-progress-fill"
                      style={{ width: `${((applyStep) / (totalSteps - 2)) * 100}%` }}
                    />
                  </div>
                  <div className="recruit-progress-steps">
                    {RECRUITMENT_FORM_STEPS.slice(0, -1).map((step, i) => (
                      <div
                        key={step.id}
                        className={`recruit-progress-step ${i <= applyStep ? 'active' : ''} ${i < applyStep ? 'completed' : ''}`}
                      >
                        <span className="recruit-step-dot">
                          {i < applyStep ? '✓' : step.icon}
                        </span>
                        <span className="recruit-step-label">{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step Content */}
              <div className="recruit-form-body" key={applyStep}>

                {/* ── Step 0: Welcome ── */}
                {applyStep === 0 && (
                  <div className="recruit-step-content recruit-step-welcome">
                    <div className="recruit-welcome-card">
                      <div className="recruit-welcome-icon">🚀</div>
                      <h3>Ready to join {applyTarget.clubName}?</h3>
                      <p>Applying for: <strong>{applyTarget.role}</strong></p>
                      <p className="recruit-welcome-desc">
                        This form takes about 3–5 minutes. We'll ask about your background,
                        interests, and what you can bring to the team.
                      </p>
                      <div className="recruit-welcome-chips">
                        <span>👤 Personal Info</span>
                        <span>💡 Interests</span>
                        <span>🛠️ Skills</span>
                        <span>⏰ Availability</span>
                        <span>✨ Final Question</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 1: Personal Info ── */}
                {applyStep === 1 && (
                  <div className="recruit-step-content">
                    <h3 className="recruit-step-title">👤 Basic Information</h3>
                    <p className="recruit-step-desc">Tell us about yourself. Fields marked with * are required.</p>

                    <div className="recruit-form-grid">
                      <div className="form-group">
                        <label className="form-label" htmlFor="rf-fullname">Full Name *</label>
                        <input id="rf-fullname" className={`form-input ${applyErrors.fullName ? 'error' : ''}`}
                          placeholder="Your full name"
                          value={applyForm.fullName}
                          onChange={e => updateApplyField('fullName', e.target.value)} />
                        {applyErrors.fullName && <span className="recruit-field-error">{applyErrors.fullName}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="rf-studentid">Student ID *</label>
                        <input id="rf-studentid" className={`form-input ${applyErrors.studentId ? 'error' : ''}`}
                          placeholder="e.g. 21201234"
                          value={applyForm.studentId}
                          onChange={e => updateApplyField('studentId', e.target.value)} />
                        {applyErrors.studentId && <span className="recruit-field-error">{applyErrors.studentId}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="rf-email">University Email *</label>
                        <input id="rf-email" type="email"
                          className={`form-input ${applyErrors.universityEmail ? 'error' : ''}`}
                          placeholder="you@university.edu"
                          value={applyForm.universityEmail}
                          onChange={e => updateApplyField('universityEmail', e.target.value)} />
                        {applyErrors.universityEmail && <span className="recruit-field-error">{applyErrors.universityEmail}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="rf-phone">Phone Number</label>
                        <input id="rf-phone" className="form-input"
                          placeholder="01XXXXXXXXX (optional)"
                          value={applyForm.phone}
                          onChange={e => updateApplyField('phone', e.target.value)} />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="rf-department">Department *</label>
                        <select id="rf-department"
                          className={`form-input ${applyErrors.department ? 'error' : ''}`}
                          value={applyForm.department}
                          onChange={e => updateApplyField('department', e.target.value)}>
                          <option value="">Select department</option>
                          {DEPARTMENT_OPTIONS.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        {applyErrors.department && <span className="recruit-field-error">{applyErrors.department}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="rf-year">Year / Semester *</label>
                        <select id="rf-year"
                          className={`form-input ${applyErrors.yearSemester ? 'error' : ''}`}
                          value={applyForm.yearSemester}
                          onChange={e => updateApplyField('yearSemester', e.target.value)}>
                          <option value="">Select year/semester</option>
                          {YEAR_SEMESTER_OPTIONS.map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                        {applyErrors.yearSemester && <span className="recruit-field-error">{applyErrors.yearSemester}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Interests ── */}
                {applyStep === 2 && (
                  <div className="recruit-step-content">
                    <h3 className="recruit-step-title">💡 Club Interests</h3>
                    <p className="recruit-step-desc">Which team(s) are you interested in?</p>

                    <div className="form-group">
                      <label className="form-label">Department / Team you're interested in *</label>
                      <div className={`recruit-checkbox-grid ${applyErrors.interestedTeams ? 'error-border' : ''}`}>
                        {TEAM_OPTIONS.map(team => (
                          <label key={team} className={`recruit-checkbox-item ${applyForm.interestedTeams.includes(team) ? 'checked' : ''}`}>
                            <input type="checkbox"
                              checked={applyForm.interestedTeams.includes(team)}
                              onChange={() => toggleApplyArrayField('interestedTeams', team)} />
                            <span className="recruit-checkbox-mark">
                              {applyForm.interestedTeams.includes(team) ? '✓' : ''}
                            </span>
                            {team}
                          </label>
                        ))}
                      </div>
                      {applyErrors.interestedTeams && <span className="recruit-field-error">{applyErrors.interestedTeams}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="rf-motivation">Why do you want to join our club? *</label>
                      <textarea id="rf-motivation"
                        className={`form-input club-textarea ${applyErrors.motivation ? 'error' : ''}`}
                        placeholder="Tell us what excites you about this club and what you hope to contribute..."
                        rows={4}
                        value={applyForm.motivation}
                        onChange={e => updateApplyField('motivation', e.target.value)} />
                      {applyErrors.motivation && <span className="recruit-field-error">{applyErrors.motivation}</span>}
                    </div>
                  </div>
                )}

                {/* ── Step 3: Skills ── */}
                {applyStep === 3 && (
                  <div className="recruit-step-content">
                    <h3 className="recruit-step-title">🛠️ Skills & Experience</h3>
                    <p className="recruit-step-desc">Let us know what you bring to the table.</p>

                    <div className="form-group">
                      <label className="form-label">What skills do you have?</label>
                      <div className="recruit-checkbox-grid">
                        {SKILL_OPTIONS.map(skill => (
                          <label key={skill} className={`recruit-checkbox-item ${applyForm.skills.includes(skill) ? 'checked' : ''}`}>
                            <input type="checkbox"
                              checked={applyForm.skills.includes(skill)}
                              onChange={() => toggleApplyArrayField('skills', skill)} />
                            <span className="recruit-checkbox-mark">
                              {applyForm.skills.includes(skill) ? '✓' : ''}
                            </span>
                            {skill}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Do you have any previous club/organization experience?</label>
                      <div className="recruit-radio-group">
                        <label className={`recruit-radio-item ${applyForm.hasPreviousExperience === true ? 'checked' : ''}`}>
                          <input type="radio" name="experience"
                            checked={applyForm.hasPreviousExperience === true}
                            onChange={() => updateApplyField('hasPreviousExperience', true)} />
                          <span className="recruit-radio-mark" />
                          Yes
                        </label>
                        <label className={`recruit-radio-item ${applyForm.hasPreviousExperience === false ? 'checked' : ''}`}>
                          <input type="radio" name="experience"
                            checked={applyForm.hasPreviousExperience === false}
                            onChange={() => updateApplyField('hasPreviousExperience', false)} />
                          <span className="recruit-radio-mark" />
                          No
                        </label>
                      </div>
                    </div>

                    {applyForm.hasPreviousExperience && (
                      <div className="form-group recruit-fade-in">
                        <label className="form-label" htmlFor="rf-exp-desc">Briefly describe your experience</label>
                        <textarea id="rf-exp-desc"
                          className="form-input club-textarea"
                          placeholder="What clubs/organizations were you part of? What did you do?"
                          rows={3}
                          value={applyForm.experienceDescription}
                          onChange={e => updateApplyField('experienceDescription', e.target.value)} />
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label" htmlFor="rf-portfolio">Portfolio / LinkedIn / GitHub link</label>
                      <input id="rf-portfolio" className="form-input"
                        placeholder="https:// (optional)"
                        value={applyForm.portfolioLink}
                        onChange={e => updateApplyField('portfolioLink', e.target.value)} />
                    </div>
                  </div>
                )}

                {/* ── Step 4: Availability ── */}
                {applyStep === 4 && (
                  <div className="recruit-step-content">
                    <h3 className="recruit-step-title">⏰ Availability & Commitment</h3>
                    <p className="recruit-step-desc">Help us understand your availability.</p>

                    <div className="form-group">
                      <label className="form-label">How much time can you contribute per week?</label>
                      <div className="recruit-radio-group vertical">
                        {TIME_COMMITMENT_OPTIONS.map(option => (
                          <label key={option} className={`recruit-radio-item ${applyForm.timeCommitment === option ? 'checked' : ''}`}>
                            <input type="radio" name="time-commitment"
                              checked={applyForm.timeCommitment === option}
                              onChange={() => updateApplyField('timeCommitment', option)} />
                            <span className="recruit-radio-mark" />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Are you willing to participate in club events and activities? *</label>
                      <div className={`recruit-radio-group vertical ${applyErrors.willingToParticipate ? 'error-border' : ''}`}>
                        {PARTICIPATION_OPTIONS.map(option => (
                          <label key={option} className={`recruit-radio-item ${applyForm.willingToParticipate === option ? 'checked' : ''}`}>
                            <input type="radio" name="participation"
                              checked={applyForm.willingToParticipate === option}
                              onChange={() => updateApplyField('willingToParticipate', option)} />
                            <span className="recruit-radio-mark" />
                            {option}
                          </label>
                        ))}
                      </div>
                      {applyErrors.willingToParticipate && <span className="recruit-field-error">{applyErrors.willingToParticipate}</span>}
                    </div>
                  </div>
                )}

                {/* ── Step 5: Final Question ── */}
                {applyStep === 5 && (
                  <div className="recruit-step-content">
                    <h3 className="recruit-step-title">✨ One Last Thing...</h3>
                    <p className="recruit-step-desc">This is your chance to stand out!</p>

                    <div className="form-group">
                      <label className="form-label" htmlFor="rf-bring">
                        What is one thing you would like to bring to our club?
                      </label>
                      <textarea id="rf-bring"
                        className="form-input club-textarea"
                        placeholder="Share your ideas, initiatives, or unique contributions you envision..."
                        rows={5}
                        value={applyForm.bringToClub}
                        onChange={e => updateApplyField('bringToClub', e.target.value)} />
                    </div>
                  </div>
                )}

                {/* ── Step 6: Confirmation ── */}
                {applyStep === totalSteps - 1 && (
                  <div className="recruit-step-content recruit-step-confirmation">
                    <div className="recruit-confirmation-card">
                      <div className="recruit-confirmation-icon">🎉</div>
                      <h3>Thanks for applying!</h3>
                      <p>
                        We'll review your application and contact shortlisted candidates
                        regarding the next step.
                      </p>
                      <div className="recruit-confirmation-details">
                        <span>📧 Confirmation sent to <strong>{applyForm.universityEmail || 'your email'}</strong></span>
                      </div>
                      <button
                        id="close-confirmation-btn"
                        className="btn btn-primary recruit-done-btn"
                        onClick={closeApplyModal}
                      >
                        Done ✓
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              {applyStep < totalSteps - 1 && (
                <div className="recruit-form-nav">
                  {applyStep > 0 && (
                    <button
                      id="recruit-prev-btn"
                      className="btn recruit-nav-btn recruit-nav-back"
                      onClick={prevStep}
                    >
                      ← Back
                    </button>
                  )}
                  <div className="recruit-nav-spacer" />
                  {applyStep < 5 ? (
                    <button
                      id="recruit-next-btn"
                      className="btn btn-primary recruit-nav-btn"
                      onClick={nextStep}
                    >
                      {applyStep === 0 ? "Let's Go! →" : 'Continue →'}
                    </button>
                  ) : (
                    <button
                      id="recruit-submit-btn"
                      className="btn btn-primary recruit-nav-btn recruit-nav-submit"
                      onClick={handleApply}
                      disabled={applySubmitting}
                    >
                      {applySubmitting ? 'Submitting…' : '🚀 Submit Application'}
                    </button>
                  )}
                </div>
              )}
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
