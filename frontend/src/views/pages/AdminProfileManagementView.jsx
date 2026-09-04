import './AdminProfileManagementView.css'
import { useAdminProfileManagementController } from '../../controllers/adminProfileManagementController.js'
import { ADMIN_PROFILE_ROLES } from '../../models/adminProfileManagementModel.js'
import { getInitials } from '../../models/accountSettingsModel.js'

export default function AdminProfileManagementView() {
  const ctrl = useAdminProfileManagementController()
  const student = ctrl.form.role === 'STUDENT'
  return (
    <div className="settings-card admin-profile-manager">
      <div className="settings-card-header"><span className="settings-card-title">🛡️ Manage User Profiles</span></div>
      <div className="settings-card-body">
        <p className="admin-profile-help">Search by exact user ID, then edit account details or upload a profile picture.</p>
        <form className="admin-profile-search" onSubmit={ctrl.search}>
          <div className="form-group"><label className="form-label" htmlFor="admin-profile-id">User ID</label><input id="admin-profile-id" className="form-input" value={ctrl.query} onChange={e => ctrl.setQuery(e.target.value)} placeholder="e.g. STU001" /></div>
          <button className="btn-primary" disabled={ctrl.loading}>{ctrl.loading ? 'Searching…' : 'Search'}</button>
        </form>
        {ctrl.error && <div className="alert alert-error">⚠️ {ctrl.error}</div>}
        {ctrl.success && <div className="alert alert-success">✅ {ctrl.success}</div>}
        {ctrl.profile && <>
          <div className="admin-profile-summary">
            <div className="profile-avatar-ring">{ctrl.avatar ? <img className="profile-avatar-image" src={ctrl.avatar} alt="Selected user" /> : <span className="profile-avatar-initials">{getInitials(ctrl.form.fullName)}</span>}</div>
            <div><strong>{ctrl.profile.userId}</strong><span>{ctrl.form.role} · Member since {ctrl.profile.createdAt || 'N/A'}</span></div>
            <label className="btn-secondary pref-file-btn">Upload photo<input type="file" accept="image/*" onChange={e => ctrl.uploadAvatar(e.target.files?.[0])} /></label>
          </div>
          <div className="admin-profile-grid">
            <Field label="Full name" value={ctrl.form.fullName} onChange={v => ctrl.change('fullName', v)} />
            <Field label="Email" type="email" value={ctrl.form.email} onChange={v => ctrl.change('email', v)} />
            <div className="form-group"><label className="form-label">Role</label><select className="form-input" value={ctrl.form.role} onChange={e => ctrl.change('role', e.target.value)}>{ADMIN_PROFILE_ROLES.map(role => <option key={role}>{role}</option>)}</select></div>
            {ctrl.form.role === 'FACULTY' && <label className="admin-profile-check"><input type="checkbox" checked={ctrl.form.isAdvisor} onChange={e => ctrl.change('isAdvisor', e.target.checked)} /> Faculty advisor</label>}
            {student && <><Field label="Department" value={ctrl.form.department} onChange={v => ctrl.change('department', v)} /><Field label="Year" type="number" min="1" max="4" value={ctrl.form.year} onChange={v => ctrl.change('year', v)} /><Field label="CGPA" type="number" min="0" max="4" step="0.01" value={ctrl.form.cgpa} onChange={v => ctrl.change('cgpa', v)} /><Field label="Completed credits" type="number" min="0" value={ctrl.form.completedCredits} onChange={v => ctrl.change('completedCredits', v)} /></>}
          </div>
          <div className="form-actions"><button className="btn-primary" onClick={ctrl.save} disabled={ctrl.saving}>{ctrl.saving ? 'Saving…' : 'Save user details'}</button></div>
        </>}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', ...props }) {
  return <div className="form-group"><label className="form-label">{label}</label><input className="form-input" type={type} value={value} onChange={e => onChange(e.target.value)} {...props} /></div>
}
