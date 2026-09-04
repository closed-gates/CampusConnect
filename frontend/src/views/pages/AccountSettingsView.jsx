import './AccountSettingsView.css'
import { useAccountSettingsController } from '../../controllers/accountSettingsController.js'
import {
  getInitials, getRoleConfig, getStandingConfig,
  formatJoinDate, formatCgpa, YEAR_LABELS,
} from '../../models/accountSettingsModel.js'
import Sidebar from '../components/Sidebar.jsx'
import AccountFreezePanel from './AccountFreezeView.jsx'
import AdminProfileManagementView from './AdminProfileManagementView.jsx'

/**
 * AccountSettingsView - View layer for Account Preferences & Settings.
 *
 * MVC Role: View
 *
 * Tabs:
 *   Profile    - Displays all user info; inline edit for name/email
 *   Security   - Change password with strength meter
 *   Preferences - Theme and notification pop-up controls
 *
 * All state and handlers come from useAccountSettingsController().
 * This component contains zero independent state or business logic.
 */
export default function AccountSettingsView() {
  const ctrl = useAccountSettingsController()

  return (
    <div className="settings-page">
      <Sidebar activeItem="settings" />
      <main className="settings-main">
        <div className="settings-header">
          <h1>Account Settings</h1>
          <p>Manage your profile, security, and preferences</p>
        </div>

        {/* Profile Hero Card */}
        <ProfileHero profile={ctrl.profile} preferences={ctrl.preferences} loading={ctrl.loading} />

        {/* Tab Bar */}
        <div className="settings-tabs" role="tablist">
          {[
            { key: 'profile',     icon: '👤', label: 'Profile' },
            { key: 'security',    icon: '🔒', label: 'Security' },
            { key: 'preferences', icon: '⚙️', label: 'Preferences' },
            ...(ctrl.profile.role === 'ADMIN' ? [{ key: 'account-access', icon: '🧊', label: 'Account Access' }] : []),
            ...(ctrl.profile.role === 'ADMIN' ? [{ key: 'profile-management', icon: '🛡️', label: 'Manage Profiles' }] : []),
          ].map(tab => (
            <button
              key={tab.key}
              id={`settings-tab-${tab.key}`}
              role="tab"
              aria-selected={ctrl.activeTab === tab.key}
              className={`settings-tab ${ctrl.activeTab === tab.key ? 'active' : ''}`}
              onClick={() => ctrl.setActiveTab(tab.key)}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        {ctrl.activeTab === 'profile' && (
          <ProfileTab ctrl={ctrl} />
        )}
        {ctrl.activeTab === 'security' && (
          <SecurityTab ctrl={ctrl} />
        )}
        {ctrl.activeTab === 'preferences' && (
          <PreferencesTab ctrl={ctrl} />
        )}
        {ctrl.activeTab === 'account-access' && ctrl.profile.role === 'ADMIN' && (
          <AccountFreezePanel />
        )}
        {ctrl.activeTab === 'profile-management' && ctrl.profile.role === 'ADMIN' && (
          <AdminProfileManagementView />
        )}
      </main>
    </div>
  )
}

/* ── Profile Hero ──────────────────────────────────────────────── */
function ProfileHero({ profile, preferences, loading }) {
  if (loading) {
    return (
      <div className="profile-hero">
        <div className="profile-avatar-ring" style={{ background: '#e5e7eb' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skeleton-line" style={{ width: '40%', height: 22 }} />
          <div className="skeleton-line" style={{ width: '25%' }} />
          <div className="skeleton-line" style={{ width: '30%', height: 20 }} />
        </div>
      </div>
    )
  }

  const roleConf  = getRoleConfig(profile.role)
  const initials  = getInitials(profile.fullName)
  const standing  = profile.cgpa != null ? getStandingConfig(profile.cgpa) : null

  return (
    <div className="profile-hero">
      <div className="profile-avatar-ring">
        {preferences.avatar
          ? <img className="profile-avatar-image" src={preferences.avatar} alt="Profile" />
          : <span className="profile-avatar-initials">{initials}</span>}
      </div>
      <div className="profile-hero-info">
        <div className="profile-hero-name">{profile.fullName || 'Unknown User'}</div>
        <div className="profile-hero-id">{profile.userId}</div>
        <div className="profile-badges">
          <span
            className="badge badge-role"
            style={{ background: roleConf.bg, color: roleConf.color }}
          >
            {roleConf.icon} {roleConf.label}
          </span>
          {profile.isAdvisor && (
            <span className="badge badge-advisor">⭐ Advisor</span>
          )}
          {profile.onProbation && (
            <span className="badge badge-probation">⚠️ Probation</span>
          )}
          {standing && (
            <span
              className="badge-standing"
              style={{ background: standing.bg, color: standing.color }}
            >
              {standing.label}
            </span>
          )}
        </div>
        <div className="profile-joined">
          Member since {formatJoinDate(profile.createdAt)}
        </div>
      </div>
    </div>
  )
}

/* ── Profile Tab ──────────────────────────────────────────────── */
function ProfileTab({ ctrl }) {
  const { profile, editForm, editMode, loading, saving,
          profileError, profileSuccess,
          handleEditChange, handleEnterEditMode,
          handleCancelEdit, handleSaveProfile } = ctrl

  if (loading) return <LoadingSkeleton />

  return (
    <>
      {/* Account Information */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-title">Account Information</span>
          {!editMode && profile.role === 'ADMIN' && (
            <button
              id="btn-edit-profile"
              className="btn-outline-edit"
              onClick={handleEnterEditMode}
            >
              ✏️ Edit
            </button>
          )}
        </div>
        <div className="settings-card-body">
          {profileError   && <div className="alert alert-error"   style={{marginBottom:12}}>⚠️ {profileError}</div>}
          {profileSuccess && <div className="alert alert-success" style={{marginBottom:12}}>✅ {profileSuccess}</div>}

          {editMode ? (
            <div className="edit-form">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-fullname">Full Name</label>
                <input
                  id="edit-fullname"
                  className="form-input"
                  value={editForm.fullName}
                  onChange={e => handleEditChange('fullName', e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-email">Email Address</label>
                <input
                  id="edit-email"
                  type="email"
                  className="form-input"
                  value={editForm.email}
                  onChange={e => handleEditChange('email', e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="form-actions">
                <button
                  id="btn-save-profile"
                  className="btn-primary"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? '⏳ Saving…' : '💾 Save Changes'}
                </button>
                <button className="btn-secondary" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">User ID</span>
                <span className="info-value" style={{ fontFamily: 'monospace' }}>
                  {profile.userId}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Full Name</span>
                <span className="info-value">{profile.fullName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email Address</span>
                <span className="info-value">{profile.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Role</span>
                <span className="info-value">{getRoleConfig(profile.role).label}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Member Since</span>
                <span className="info-value">{formatJoinDate(profile.createdAt)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Advisor Status</span>
                <span className="info-value">{profile.isAdvisor ? '⭐ Designated Advisor' : 'Not an Advisor'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Academic Profile */}
      {profile.role === 'STUDENT' && profile.department && (
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-title">🎓 Academic Profile</span>
          </div>
          <div className="settings-card-body">
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">Department</span>
                <span className="info-value">{profile.department}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Year</span>
                <span className="info-value">{YEAR_LABELS[profile.year] || `Year ${profile.year}`}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Completed Credits</span>
                <span className="info-value">{profile.completedCredits} credits</span>
              </div>
              <div className="info-row">
                <span className="info-label">Standing</span>
                <span className="info-value">
                  {(() => {
                    const s = getStandingConfig(profile.cgpa)
                    return (
                      <span style={{ color: s.color, fontWeight: 600 }}>
                        {profile.onProbation ? '⚠️ Probationary' : s.label}
                      </span>
                    )
                  })()}
                </span>
              </div>
              <div className="info-row full-width">
                <span className="info-label">CGPA</span>
                <div className="cgpa-bar-wrap">
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span className="info-value">{formatCgpa(profile.cgpa)} / 4.00</span>
                  </div>
                  <div className="cgpa-track">
                    <div
                      className="cgpa-fill"
                      style={{
                        width: `${Math.min((profile.cgpa / 4.0) * 100, 100)}%`,
                        background: getStandingConfig(profile.cgpa).color,
                      }}
                    />
                  </div>
                  <div className="cgpa-labels"><span>0.00</span><span>4.00</span></div>
                </div>
              </div>
            </div>

            {/* Enrolment stats */}
            <div className="student-stats-row">
              <div className="stat-chip">
                <span className="stat-chip-value">{profile.courseLimit ?? '—'}</span>
                <span className="stat-chip-label">Course Limit</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-value">{profile.creditLimit ?? '—'}</span>
                <span className="stat-chip-label">Credit Limit</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-value">{profile.completedCredits ?? '—'}</span>
                <span className="stat-chip-label">Credits Earned</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ── Security Tab ─────────────────────────────────────────────── */
function SecurityTab({ ctrl }) {
  const { passwordForm, saving, passwordError, passwordSuccess,
          passwordStrength, handlePasswordChange, handleChangePassword } = ctrl

  const segments = [0,1,2,3]
  const score    = passwordStrength?.score ?? -1

  return (
    <div className="settings-card">
      <div className="settings-card-header">
        <span className="settings-card-title">🔒 Change Password</span>
      </div>
      <div className="settings-card-body">
        {passwordError   && <div className="alert alert-error"   style={{marginBottom:12}}>⚠️ {passwordError}</div>}
        {passwordSuccess && <div className="alert alert-success" style={{marginBottom:12}}>✅ {passwordSuccess}</div>}

        <div className="edit-form">
          <div className="form-group">
            <label className="form-label" htmlFor="cur-password">Current Password</label>
            <input
              id="cur-password"
              type="password"
              className="form-input"
              value={passwordForm.currentPassword}
              onChange={e => handlePasswordChange('currentPassword', e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              className="form-input"
              value={passwordForm.newPassword}
              onChange={e => handlePasswordChange('newPassword', e.target.value)}
              placeholder="At least 8 characters"
            />
            {passwordStrength && (
              <div className="password-strength">
                <div className="strength-segments">
                  {segments.map(i => (
                    <div
                      key={i}
                      className="strength-seg"
                      style={{ background: i <= score ? passwordStrength.color : undefined }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              className="form-input"
              value={passwordForm.confirmPassword}
              onChange={e => handlePasswordChange('confirmPassword', e.target.value)}
              placeholder="Re-enter new password"
            />
          </div>
          <div className="form-actions">
            <button
              id="btn-change-password"
              className="btn-primary"
              onClick={handleChangePassword}
              disabled={saving}
            >
              {saving ? '⏳ Saving…' : '🔑 Update Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Preferences Tab ──────────────────────────────────────────── */
function PreferencesTab({ ctrl }) {
  const { preferences, profile, handlePreferenceChange, handleNestedPreferenceChange,
    handleAvatarChange, handleExportData, handleResetPreferences,
    handleSignOut, handleReminderHoursChange,
    handleInAppNotificationChange,
    preferenceError } = ctrl

  return (
    <div className="settings-card">
      <div className="settings-card-header">
        <span className="settings-card-title">⚙️ Preferences</span>
      </div>
      <div className="settings-card-body" style={{ padding: '0 1.5rem' }}>
        <div className="pref-list">
          {preferenceError && <div className="alert alert-error">{preferenceError}</div>}
          {profile.role === 'ADMIN' && <>
            <PreferenceHeading title="Profile photo" />
            <div className="pref-row">
              <div className="pref-info"><span className="pref-label">🖼️ Profile Picture</span><span className="pref-desc">PNG or JPG, up to 2 MB</span></div>
              <label className="btn-secondary pref-file-btn">Choose photo<input type="file" accept="image/*" onChange={e => handleAvatarChange(e.target.files?.[0])} /></label>
            </div>
          </>}
          <PreferenceHeading title="Appearance" />
          {/* Theme */}
          <div className="pref-row">
            <div className="pref-info">
              <span className="pref-label">🌗 Theme</span>
              <span className="pref-desc">Choose the application color scheme</span>
            </div>
            <select className="pref-select" value={preferences.theme} onChange={e => handlePreferenceChange('theme', e.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select>
          </div>
          <div className="pref-row"><div className="pref-info"><span className="pref-label">🎨 Accent Color</span><span className="pref-desc">Personalize buttons and highlights</span></div><select className="pref-select" value={preferences.accent} onChange={e => handlePreferenceChange('accent', e.target.value)}><option value="teal">Teal</option><option value="blue">Blue</option><option value="purple">Purple</option></select></div>

          <PreferenceHeading title="Notifications" />
          {/* Notification pop-ups */}
          <div className="pref-row">
            <div className="pref-info">
              <span className="pref-label">🔕 Mute Notifications</span>
              <span className="pref-desc">Hide incoming notification pop-ups while keeping them in the notification list</span>
            </div>
            <label className="toggle-switch" aria-label="Mute notification pop-ups">
              <input
                id="pref-notifications-muted"
                type="checkbox"
                checked={preferences.notificationsMuted}
                onChange={e => handlePreferenceChange('notificationsMuted', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          {Object.entries(preferences.inAppNotifications).map(([key, enabled]) => <ToggleRow key={key} label={`In-app: ${key[0].toUpperCase()}${key.slice(1)}`} description={`${enabled ? 'Receive' : 'Mute'} ${key} notifications in CampusConnect`} checked={enabled} onChange={value => handleInAppNotificationChange(key, value)} />)}

          <PreferenceHeading title="Accessibility" />
          <div className="pref-row"><div className="pref-info"><span className="pref-label">🔠 Font Size</span><span className="pref-desc">Adjust text across the portal</span></div><select className="pref-select" value={preferences.accessibility.fontSize} onChange={e => handleNestedPreferenceChange('accessibility', 'fontSize', e.target.value)}><option value="normal">Normal</option><option value="large">Large</option><option value="x-large">Extra large</option></select></div>
          <ToggleRow label="High Contrast" description="Increase borders and text contrast" checked={preferences.accessibility.highContrast} onChange={v => handleNestedPreferenceChange('accessibility', 'highContrast', v)} />

          <PreferenceHeading title="Academic defaults" />
          <SelectRow label="Preferred Semester" value={preferences.academic.semester} onChange={v => handleNestedPreferenceChange('academic', 'semester', v)} options={['Fall 2026','Spring 2027','Summer 2027']} />
          <SelectRow label="Default Course View" value={preferences.academic.courseView} onChange={v => handleNestedPreferenceChange('academic', 'courseView', v)} options={['grid','list']} />
          <ToggleRow label="Upcoming Exams Widget" description="Show upcoming exams on the dashboard" checked={preferences.academic.dashboardExams} onChange={v => handleNestedPreferenceChange('academic', 'dashboardExams', v)} />

          <PreferenceHeading title="Calendar" />
          <SelectRow label="Week Starts On" value={preferences.calendar.weekStartsOn} onChange={v => handleNestedPreferenceChange('calendar', 'weekStartsOn', v)} options={['saturday','sunday','monday']} />
          <SelectRow label="Default Reminder" value={String(preferences.calendar.reminderHours)} onChange={handleReminderHoursChange} options={['1','6','12','24','48']} suffix=" hours before" />

          <PreferenceHeading title="Security and data" />
          <div className="pref-row"><div className="pref-info"><span className="pref-label">💻 Active Session</span><span className="pref-desc">Current browser · {profile.userId}</span></div><button className="btn-secondary" onClick={handleSignOut}>Sign out</button></div>
          <div className="pref-row"><div className="pref-info"><span className="pref-label">📥 Download Account Data</span><span className="pref-desc">Download your account and academic profile as a PDF</span></div><button className="btn-secondary" onClick={handleExportData}>Download PDF</button></div>
          <div className="pref-row"><div className="pref-info"><span className="pref-label">♻️ Reset Preferences</span><span className="pref-desc">Restore all display and portal defaults</span></div><button className="btn-secondary" onClick={handleResetPreferences}>Reset</button></div>
          <div className="pref-row"><div className="pref-info"><span className="pref-label">🕘 Account Activity</span><span className="pref-desc">Member since {formatJoinDate(profile.createdAt)} · Profile loaded this session</span></div></div>
        </div>
      </div>
    </div>
  )
}

function PreferenceHeading({ title }) { return <h3 className="pref-section-heading">{title}</h3> }
function ToggleRow({ label, description, checked, onChange }) { return <div className="pref-row"><div className="pref-info"><span className="pref-label">{label}</span><span className="pref-desc">{description}</span></div><label className="toggle-switch"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} /><span className="toggle-slider" /></label></div> }
function SelectRow({ label, value, onChange, options, suffix = '' }) { return <div className="pref-row"><div className="pref-info"><span className="pref-label">{label}</span></div><select className="pref-select" value={value} onChange={e => onChange(e.target.value)}>{options.map(option => <option key={option} value={option}>{option}{suffix}</option>)}</select></div> }

/* ── Loading skeleton ──────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="settings-card">
      <div className="settings-card-body" style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton-line" style={{ width: `${60 + i * 10}%` }} />
        ))}
      </div>
    </div>
  )
}
