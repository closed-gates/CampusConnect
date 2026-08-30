import Sidebar from '../components/Sidebar.jsx'
import { useBypassCourseController } from '../../controllers/bypassCourseController.js'
import { getAcademicStanding } from '../../models/bypassCourseModel.js'

/**
 * BypassCourseView – View layer for the Admin "Bypass Course" & CGPA Management portal.
 *
 * MVC Role: View
 * Strictly renders the UI based on state and actions from useBypassCourseController().
 */
export default function BypassCourseView() {
  const {
    students,
    selectedStudentId,
    studentHistory,
    catalogCourses,
    form,
    loading,
    historyLoading,
    submitting,
    toast,
    toastType,
    GRADE_OPTIONS,
    handleSelectStudent,
    handleFieldChange,
    handleBypassSubmit,
    handleDeleteBypass,
  } = useBypassCourseController()

  const standing = getAcademicStanding(studentHistory?.cgpa || 0)
  const totalCreditsRequired = 130
  const progressPercent = Math.min(100, Math.round(((studentHistory?.completedCredits || 0) / totalCreditsRequired) * 100))

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="bypass-course" />

      <main className="dashboard-main" aria-label="Course Bypass & CGPA Management">
        {/* Toast Alert */}
        {toast && (
          <div
            className={`adv-toast ${toastType === 'error' ? 'adv-toast--error' : 'adv-toast--success'}`}
            role="alert"
            style={{
              position: 'fixed',
              top: 24,
              right: 24,
              zIndex: 9999,
              padding: '12px 20px',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              background: toastType === 'error' ? '#EF4444' : '#10B981',
              color: '#FFFFFF',
              fontWeight: 600
            }}
          >
            {toast}
          </div>
        )}

        {/* Page Header */}
        <div className="dashboard-header" style={{ marginBottom: 24 }}>
          <div>
            <h1 className="dashboard-greeting">Course Bypass & Credit Management ⏭️</h1>
            <p className="dashboard-date">
              Directly grant course credits, waivers, and maintain accurate database CGPA & credit tracking
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-sub)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p>Loading students and course database...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: 24, alignItems: 'start' }}>

            {/* ── Left Column: Student Selector & Bypass Action Card ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* 1. Student Academic Overview Card */}
              <div className="section-card" style={{ padding: 20 }}>
                <h2 className="section-title" style={{ fontSize: 16, marginBottom: 14 }}>
                  👤 Select Student
                </h2>

                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="bypass-student-select" style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-text-sub)' }}>
                    Student Account (Database)
                  </label>
                  <select
                    id="bypass-student-select"
                    className="adv-course-search-input"
                    style={{ width: '100%', padding: '10px 12px' }}
                    value={selectedStudentId}
                    onChange={e => handleSelectStudent(e.target.value)}
                  >
                    {students.map(s => (
                      <option key={s.studentId} value={s.studentId}>
                        {s.studentName} ({s.studentId}) — CGPA: {s.cgpa} · {s.completedCredits} cr.
                      </option>
                    ))}
                  </select>
                </div>

                {studentHistory && (
                  <div style={{ background: 'var(--color-surface-subtle, #F8FAFC)', borderRadius: 10, padding: 16, border: '1px solid var(--color-border, #E2E8F0)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>
                        {studentHistory.studentName}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 20,
                          background: standing.bg,
                          color: standing.color
                        }}
                      >
                        {standing.label}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                      <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: 11, color: '#64748B', display: 'block' }}>Current CGPA</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: standing.color }}>
                          {studentHistory.cgpa.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: 11, color: '#64748B', display: 'block' }}>Completed Credits</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                          {studentHistory.completedCredits} <span style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8' }}>/ {totalCreditsRequired}</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress to Degree */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginBottom: 4 }}>
                        <span>Degree Completion</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div style={{ height: 6, background: '#E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', background: '#2563EB', borderRadius: 10 }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Bypass Course Form */}
              <div className="section-card" style={{ padding: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <h2 className="section-title" style={{ fontSize: 16, marginBottom: 4 }}>
                    ⚡ Grant Course Bypass
                  </h2>
                  <p style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                    Add course credits directly to the selected student profile without section enrollment.
                  </p>
                </div>

                <form onSubmit={handleBypassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Course Code with Autocomplete suggestion */}
                  <div>
                    <label htmlFor="bypass-code" style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      Course Code *
                    </label>
                    <input
                      id="bypass-code"
                      list="catalog-course-codes"
                      className="adv-course-search-input"
                      placeholder="e.g. CSE110 or MAT110"
                      value={form.courseCode}
                      onChange={e => handleFieldChange('courseCode', e.target.value)}
                      required
                    />
                    <datalist id="catalog-course-codes">
                      {catalogCourses.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.code} — {c.name || c.title}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  {/* Course Title */}
                  <div>
                    <label htmlFor="bypass-title" style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      Course Title
                    </label>
                    <input
                      id="bypass-title"
                      className="adv-course-search-input"
                      placeholder="e.g. PROGRAMMING LANGUAGE I"
                      value={form.courseTitle}
                      onChange={e => handleFieldChange('courseTitle', e.target.value)}
                    />
                  </div>

                  {/* Credits & Grade in 2 Columns */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 12 }}>
                    <div>
                      <label htmlFor="bypass-credits" style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                        Credits *
                      </label>
                      <select
                        id="bypass-credits"
                        className="adv-course-search-input"
                        value={form.credits}
                        onChange={e => handleFieldChange('credits', parseInt(e.target.value, 10))}
                      >
                        <option value={1}>1 Credit (Lab/Seminar)</option>
                        <option value={2}>2 Credits</option>
                        <option value={3}>3 Credits (Standard)</option>
                        <option value={4}>4 Credits</option>
                        <option value={6}>6 Credits (Thesis/Project)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="bypass-grade" style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                        Grade / GPA *
                      </label>
                      <select
                        id="bypass-grade"
                        className="adv-course-search-input"
                        value={form.grade}
                        onChange={e => handleFieldChange('grade', e.target.value)}
                      >
                        {GRADE_OPTIONS.map(g => (
                          <option key={g.grade} value={g.grade}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="submit-bypass-btn"
                    className="btn btn--primary"
                    disabled={submitting}
                    style={{
                      marginTop: 12,
                      padding: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    {submitting ? 'Saving to Database...' : '⏭️ Grant Bypass & Update CGPA'}
                  </button>
                </form>
              </div>
            </div>

            {/* ── Right Column: Academic Transcript & Bypassed Courses Table ── */}
            <div className="section-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 className="section-title" style={{ fontSize: 18 }}>
                    📜 Completed & Bypassed Courses
                  </h2>
                  <p style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                    Full database log of completed, transferred, and bypassed courses for {studentHistory?.studentName || 'selected student'}
                  </p>
                </div>
                {studentHistory && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="course-tag" style={{ background: '#EFF6FF', color: '#2563EB', fontSize: 12 }}>
                      📚 {studentHistory.courses?.length || 0} Total Courses
                    </span>
                    <span className="course-tag" style={{ background: '#FEF3C7', color: '#B45309', fontSize: 12 }}>
                      ⏭️ {studentHistory.totalBypassedCredits || 0} Bypassed Credits
                    </span>
                  </div>
                )}
              </div>

              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-sub)' }}>
                  <p>Loading course records...</p>
                </div>
              ) : !studentHistory || !studentHistory.courses || studentHistory.courses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 16px', background: '#F8FAFC', borderRadius: 12, border: '1px dashed #CBD5E1' }}>
                  <span style={{ fontSize: 36, display: 'block', marginBottom: 10 }}>📖</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#334155', marginBottom: 4 }}>No Completed / Bypassed Courses Yet</h3>
                  <p style={{ fontSize: 13, color: '#64748B', maxWidth: 380, margin: '0 auto' }}>
                    Use the form on the left to bypass a course or grant transfer credits for this student. The CGPA and completed credits will update immediately.
                  </p>
                </div>
              ) : (
                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E2E8F0', fontSize: 12, color: '#64748B' }}>
                        <th style={{ padding: '10px 12px' }}>Course</th>
                        <th style={{ padding: '10px 12px' }}>Credits</th>
                        <th style={{ padding: '10px 12px' }}>Grade</th>
                        <th style={{ padding: '10px 12px' }}>Type</th>
                        <th style={{ padding: '10px 12px' }}>Granted By</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentHistory.courses.map(course => (
                        <tr key={course.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
                          <td style={{ padding: '12px' }}>
                            <strong style={{ color: '#0F172A', display: 'block' }}>{course.courseCode}</strong>
                            <span style={{ fontSize: 11, color: '#64748B' }}>{course.courseTitle}</span>
                          </td>
                          <td style={{ padding: '12px', fontWeight: 600 }}>
                            {course.credits} cr.
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                borderRadius: 6,
                                fontWeight: 700,
                                fontSize: 12,
                                background: course.grade === 'WAIVED' ? '#F1F5F9' : '#ECFDF5',
                                color: course.grade === 'WAIVED' ? '#475569' : '#059669'
                              }}
                            >
                              {course.grade} {course.gradePoint !== null ? `(${course.gradePoint.toFixed(1)})` : ''}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              className="course-tag"
                              style={{
                                background: course.isBypassed ? '#FEF3C7' : '#F1F5F9',
                                color: course.isBypassed ? '#B45309' : '#334155',
                                fontSize: 11
                              }}
                            >
                              {course.isBypassed ? '⏭️ Bypassed' : 'Completed'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontSize: 11, color: '#64748B' }}>
                            {course.bypassedBy || 'System'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <button
                              id={`delete-bypass-btn-${course.id}`}
                              className="btn btn--outline"
                              style={{ padding: '4px 10px', fontSize: 11, color: '#DC2626', borderColor: '#FCA5A5' }}
                              onClick={() => handleDeleteBypass(course.id)}
                              title="Revert bypass and recalculate CGPA"
                            >
                              ✕ Revert
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
