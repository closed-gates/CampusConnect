import Sidebar from '../components/Sidebar.jsx'
import { useAdminAdvisorController } from '../../controllers/adminAdvisorController.js'

/**
 * AssignAdvisorView – Admin page to designate faculty members as Advisors.
 *
 * MVC Role: View
 * Exclusively accessible to Admin role.
 */
export default function AssignAdvisorView() {
  const {
    facultyList,
    totalFaculty,
    advisorCount,
    search,
    setSearch,
    loading,
    togglingId,
    toast,
    toastType,
    handleToggleAdvisor,
    refreshFaculty,
  } = useAdminAdvisorController()

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="assign-advisor" />
      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-greeting">Assign Faculty Advisors 🛡️</h1>
            <p className="dashboard-date">
              Designate which faculty members have advising privileges to manage student courses and routines.
            </p>
          </div>
          <button
            className="btn btn--outline"
            style={{ padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={refreshFaculty}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Top metrics summary */}
        <div className="admin-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 28, background: 'rgba(26, 152, 130, 0.1)', padding: 12, borderRadius: 10 }}>👨‍🏫</div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>Total Faculty</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)' }}>{totalFaculty}</div>
            </div>
          </div>

          <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 28, background: 'rgba(16, 185, 129, 0.1)', padding: 12, borderRadius: 10 }}>✅</div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>Active Advisors</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#10B981' }}>{advisorCount}</div>
            </div>
          </div>

          <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 28, background: 'rgba(245, 158, 11, 0.1)', padding: 12, borderRadius: 10 }}>⏳</div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>Non-Advisors</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-sub)' }}>{Math.max(0, totalFaculty - advisorCount)}</div>
            </div>
          </div>
        </div>

        {/* Faculty List Card */}
        <div className="section-card">
          <div className="section-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 className="section-title">Faculty Member Directory</h2>
              <p style={{ fontSize: 12, color: 'var(--color-text-sub)', marginTop: 2 }}>
                Toggle switch to grant or revoke advising permissions.
              </p>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: 260 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
              <input
                id="assign-advisor-search"
                className="adv-course-search-input"
                style={{ paddingLeft: 34 }}
                placeholder="Search faculty by name, ID, department…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '20px 0' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-line" style={{ height: 48, marginBottom: 12, borderRadius: 8 }} />
              ))}
            </div>
          ) : (
            <div className="advisor-table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="admin-faculty-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border, #E2E8F0)', color: 'var(--color-text-sub)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 14px' }}>Faculty Member</th>
                    <th style={{ padding: '12px 14px' }}>User / Faculty ID</th>
                    <th style={{ padding: '12px 14px' }}>Department</th>
                    <th style={{ padding: '12px 14px' }}>Designation</th>
                    <th style={{ padding: '12px 14px' }}>Advisor Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyList.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--color-text-sub)' }}>
                        No faculty found matching your search.
                      </td>
                    </tr>
                  ) : (
                    facultyList.map(faculty => {
                      const isAssigned = Boolean(faculty.isAdvisor)
                      const isToggling = togglingId === faculty.userId
                      return (
                        <tr
                          key={faculty.userId}
                          style={{
                            borderBottom: '1px solid var(--color-border, #EDF2F7)',
                            transition: 'background 0.15s ease',
                          }}
                          className="admin-faculty-row"
                        >
                          {/* Name + email */}
                          <td style={{ padding: '14px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{faculty.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>{faculty.email}</div>
                          </td>

                          {/* ID */}
                          <td style={{ padding: '14px' }}>
                            <span style={{
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              background: 'var(--color-bg-secondary, #F1F5F9)',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: 12
                            }}>
                              {faculty.userId}
                            </span>
                          </td>

                          {/* Department */}
                          <td style={{ padding: '14px', fontSize: 13, color: 'var(--color-text-primary)' }}>
                            {faculty.department}
                          </td>

                          {/* Designation */}
                          <td style={{ padding: '14px', fontSize: 13, color: 'var(--color-text-sub)' }}>
                            {faculty.designation}
                          </td>

                          {/* Status Pill */}
                          <td style={{ padding: '14px' }}>
                            {isAssigned ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '4px 10px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 600,
                                background: 'rgba(16, 185, 129, 0.12)',
                                color: '#059669'
                              }}>
                                <span>●</span> Active Advisor
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '4px 10px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 500,
                                background: 'rgba(148, 163, 184, 0.12)',
                                color: '#64748B'
                              }}>
                                Regular Faculty
                              </span>
                            )}
                          </td>

                          {/* Action Button / Toggle */}
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            <button
                              id={`toggle-advisor-${faculty.userId}`}
                              className={`btn ${isAssigned ? 'btn--outline' : 'btn--primary'}`}
                              style={{
                                padding: '6px 14px',
                                fontSize: 12,
                                fontWeight: 600,
                                borderRadius: 6,
                                borderColor: isAssigned ? '#EF4444' : undefined,
                                color: isAssigned ? '#DC2626' : undefined
                              }}
                              disabled={isToggling}
                              onClick={() => handleToggleAdvisor(faculty.userId, isAssigned)}
                            >
                              {isToggling ? 'Updating…' : isAssigned ? 'Revoke Advisor Role' : 'Assign Advisor Role'}
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Toast alert */}
        {toast && (
          <div
            className={`advising-toast${toastType === 'error' ? ' advising-toast--error' : ''}`}
            role="alert"
            aria-live="assertive"
          >
            {toastType === 'error' ? '❌ ' : '✅ '}{toast}
          </div>
        )}
      </main>
    </div>
  )
}
