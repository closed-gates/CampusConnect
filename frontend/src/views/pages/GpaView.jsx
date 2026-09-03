import React from 'react'
import './GpaView.css'
import Sidebar from '../components/Sidebar.jsx'
import { useGpaController } from '../../controllers/gpaController.js'

/**
 * GpaView – View layer for Grade Tracking & GPA Calculation.
 *
 * MVC Role: View
 *
 * Strictly renders UI driven by useGpaController(). Contains zero independent
 * state, zero API calls, and zero business logic — all sourced from the controller.
 *
 * Three tabs:
 *   1. Transcript      — read-only semester-by-semester grade history
 *   2. Predict Future CGPA — predictive calculator (simulation, no DB writes)
 *   3. Simulate Retake — grade improvement simulator (simulation, no DB writes)
 *
 * Access: STUDENT role only (sidebar item only visible to students;
 *         backend enforces @PreAuthorize("hasRole('STUDENT')") on all endpoints).
 */
export default function GpaView() {
  const {
    activeTab, handleTabChange,
    transcript, transcriptLoading, transcriptError, hasTranscript, standing,
    predictRows, predictResult, currentCoursesLoading,
    handlePredictRowChange, handleAddPredictRow, handleRemovePredictRow, handlePredict,
    retakeForm, retakeResult, retakableCourses,
    handleRetakeFieldChange, handleSimulateRetake,
    toast, toastType,
    GRADE_OPTIONS,
  } = useGpaController()

  const cgpa = transcript?.currentCgpa ?? 0
  const completedCredits = transcript?.completedCredits ?? 0

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="gpa-calculator" />

      <main className="dashboard-main" aria-label="Grade Tracking and GPA Calculator">

        {/* ── Toast ─────────────────────────────────────────────── */}
        {toast && (
          <div
            role="alert"
            style={{
              position: 'fixed', top: 24, right: 24, zIndex: 9999,
              padding: '12px 20px', borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              background: toastType === 'error' ? '#EF4444' : '#10B981',
              color: '#fff', fontWeight: 600, fontSize: '0.875rem',
            }}
          >
            {toast}
          </div>
        )}

        <div className="gpa-page">

          {/* ── Page Header ───────────────────────────────────────── */}
          <div className="gpa-header">
            <div>
              <h1 className="gpa-header-title">Grade Tracking &amp; GPA Calculator 📊</h1>
              <p className="gpa-header-sub">
                View your transcript, simulate future grades, and explore retake scenarios.
                All calculators are simulations — no changes are made to your official records.
              </p>
            </div>
          </div>

          {/* ── Summary Cards ──────────────────────────────────────── */}
          {!transcriptLoading && (
            <div className="gpa-summary-row">
              <div className="gpa-summary-card">
                <span className="gpa-summary-card__label">Current CGPA</span>
                <span className="gpa-summary-card__value">{cgpa.toFixed(2)}</span>
                <span className="gpa-summary-card__sub">out of 4.00</span>
              </div>

              <div className="gpa-summary-card">
                <span className="gpa-summary-card__label">Completed Credits</span>
                <span className="gpa-summary-card__value">{completedCredits}</span>
                <span className="gpa-summary-card__sub">credit hours</span>
              </div>

              <div className="gpa-summary-card">
                <span className="gpa-summary-card__label">Semesters Completed</span>
                <span className="gpa-summary-card__value">
                  {transcript?.totalSemesters ?? 0}
                </span>
                <span className="gpa-summary-card__sub">terms on record</span>
              </div>


            </div>
          )}

          {/* ── Tab Bar ────────────────────────────────────────────── */}
          <div className="gpa-tabs" role="tablist" aria-label="GPA feature tabs">
            {[
              { id: 'transcript', label: '📋 Transcript' },
              { id: 'predict',    label: '🔮 Predict CGPA' },
              { id: 'retake',     label: '🔁 Simulate Retake' },
            ].map(tab => (
              <button
                key={tab.id}
                id={`gpa-tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`gpa-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ════════════════════════════════════════════════════════
              TAB 1 — TRANSCRIPT
          ════════════════════════════════════════════════════════ */}
          {activeTab === 'transcript' && (
            <div role="tabpanel" aria-labelledby="gpa-tab-transcript">
              {transcriptLoading ? (
                <div className="gpa-loading">
                  <div className="spinner" style={{ margin: '0 auto 16px' }} />
                  <p>Loading your transcript…</p>
                </div>
              ) : transcriptError ? (
                <div className="gpa-card">
                  <div className="gpa-empty">
                    <div className="gpa-empty__icon">⚠️</div>
                    <div className="gpa-empty__title">Could not load transcript</div>
                    <div className="gpa-empty__sub">{transcriptError}</div>
                  </div>
                </div>
              ) : !hasTranscript ? (
                <div className="gpa-card">
                  <div className="gpa-empty">
                    <div className="gpa-empty__icon">🎓</div>
                    <div className="gpa-empty__title">No Completed Courses Yet</div>
                    <div className="gpa-empty__sub">
                      Your transcript will appear here once you complete your first semester.
                      You can still use the Predict CGPA tab to simulate your first semester!
                    </div>
                  </div>
                </div>
              ) : (
                <div className="gpa-card">
                  <div className="gpa-card__body">
                    <table className="gpa-table transcript-table" aria-label="Grade transcript">
                      <thead>
                        <tr>
                          <th style={{ width: 110 }}>Course No</th>
                          <th>Course Title</th>
                          <th style={{ width: 100, textAlign: 'center' }}>Credits Earned</th>
                          <th style={{ width: 80, textAlign: 'center' }}>Grade</th>
                          <th style={{ width: 100, textAlign: 'right' }}>Grade Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transcript.semesters.map((sem, semIdx) => {
                          // Cumulative totals up to and including this semester
                          // (backend provides runningCgpa and per-sem values)
                          const semCredits = sem.courses
                            .filter(c => c.countsForGpa)
                            .reduce((s, c) => s + c.credits, 0)
                          const cumCreditsEarned = transcript.semesters
                            .slice(0, semIdx + 1)
                            .flatMap(s => s.courses)
                            .filter(c => c.countsForGpa)
                            .reduce((s, c) => s + c.credits, 0)

                          return (
                            <React.Fragment key={semIdx}>
                              {/* Semester header row */}
                              <tr className="sem-header">
                                <td colSpan={5}>
                                  SEMESTER: {sem.term?.toUpperCase()}
                                  {sem.term?.toLowerCase().includes('bypassed') && ' — CREDIT TRANSFERS / WAIVERS'}
                                </td>
                              </tr>

                              {/* Course rows */}
                              {sem.courses.map((course, ci) => (
                                <tr key={`c-${semIdx}-${ci}`}>
                                  <td>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                      {course.courseCode}
                                    </span>
                                    {course.isBypassed && (
                                      <span style={{ marginLeft: 6, fontSize: '0.7rem',
                                                     color: '#6B7280', fontStyle: 'italic' }}>
                                        bypass
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ fontSize: '0.85rem' }}>{course.courseTitle?.toUpperCase()}</td>
                                  <td style={{ textAlign: 'center' }}>
                                    {course.countsForGpa ? course.credits.toFixed(2) : (
                                      <span style={{ color: 'var(--color-text-light)' }}>—</span>
                                    )}
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <GradeChip grade={course.grade} />
                                    {!course.countsForGpa && (
                                      <span className="non-gpa-tag" title="Excluded from GPA">(excl.)</span>
                                    )}
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    {course.countsForGpa
                                      ? course.gradePoint?.toFixed(2)
                                      : <span style={{ color: 'var(--color-text-light)' }}>—</span>}
                                  </td>
                                </tr>
                              ))}

                              {/* SEMESTER summary row */}
                              <tr className="transcript-sem-row">
                                <td className="ts-label">SEMESTER</td>
                                <td className="ts-stat">Credits Attempted</td>
                                <td className="ts-val">{semCredits.toFixed(2)}</td>
                                <td className="ts-stat">GPA</td>
                                <td className="ts-gpa" style={{ textAlign: 'right' }}>{sem.semGpa.toFixed(2)}</td>
                              </tr>

                              {/* CUMULATIVE summary row */}
                              <tr className="transcript-cum-row">
                                <td className="ts-label">CUMULATIVE</td>
                                <td className="ts-stat">Credits Earned</td>
                                <td className="ts-val">{cumCreditsEarned.toFixed(2)}</td>
                                <td className="ts-stat">CGPA</td>
                                <td className="ts-cgpa" style={{ textAlign: 'right' }}>{sem.runningCgpa.toFixed(2)}</td>
                              </tr>
                            </React.Fragment>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              TAB 2 — PREDICT FUTURE CGPA
          ════════════════════════════════════════════════════════ */}
          {activeTab === 'predict' && (
            <div role="tabpanel" aria-labelledby="gpa-tab-predict">

              {/* Simulation disclaimer */}
              <div className="simulation-disclaimer" style={{ marginBottom: 16 }}>
                ⚠️ This is a simulation. Predicted grades will <strong>not</strong> affect
                your official transcript or academic record.
              </div>

              <div className="gpa-card">
                <div className="gpa-card__header">
                  <span className="gpa-card__title">
                    🔮 Select Predicted Grades for Your Registered Courses
                  </span>
                  {currentCoursesLoading && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)',
                                   display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="spinner" style={{ width: 14, height: 14 }} />
                      Loading current courses…
                    </span>
                  )}
                </div>

                <div className="gpa-card__body">
                  {predictRows.length === 0 ? (
                    <div className="gpa-empty" style={{ padding: '32px 24px' }}>
                      <div className="gpa-empty__icon">📅</div>
                      <div className="gpa-empty__title">No Registered Courses</div>
                      <div className="gpa-empty__sub">You have no advised courses for the current semester.</div>
                    </div>
                  ) : (
                    <table className="predict-table" aria-label="Predict grade table">
                      <thead>
                        <tr>
                          <th style={{ width: 120 }}>Course Code</th>
                          <th>Course Name</th>
                          <th style={{ width: 80, textAlign: 'center' }}>Credits</th>
                          <th style={{ width: 180 }}>Predicted Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictRows.map((row, i) => (
                          <tr key={i}>
                            <td>
                              <span style={{ fontWeight: 700, fontSize: '0.88rem',
                                             color: 'var(--color-text)' }}>
                                {row.courseCode || '—'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>
                              {row.courseName || '—'}
                            </td>
                            <td style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                              {row.credits}
                            </td>
                            <td>
                              <select
                                id={`predict-grade-${i}`}
                                className="predict-select"
                                value={row.predictedGrade}
                                onChange={e => handlePredictRowChange(i, 'predictedGrade', e.target.value)}
                                aria-label={`Predicted grade for ${row.courseCode}`}
                              >
                                <option value="">— Select grade —</option>
                                {GRADE_OPTIONS.map(g => (
                                  <option key={g.grade} value={g.grade}>{g.label}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)',
                              display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    id="gpa-predict-btn"
                    className="gpa-btn gpa-btn--primary"
                    onClick={handlePredict}
                    disabled={predictRows.length === 0}
                  >
                    ▶ Calculate Predicted CGPA
                  </button>
                </div>
              </div>

              {/* Prediction results */}
              {predictResult && (
                <div className="gpa-card" style={{ marginTop: 16 }}>
                  <div className="gpa-card__header">
                    <span className="gpa-card__title">✨ Predicted Results</span>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px',
                      background: '#FFFBEB', color: '#92400E', borderRadius: 999,
                      border: '1px solid #FCD34D'
                    }}>
                      ⚠️ ESTIMATED — NOT OFFICIAL
                    </span>
                  </div>

                  <div className="gpa-result-grid">
                    <div className="gpa-result-card" style={{ background: 'var(--color-bg)' }}>
                      <span className="gpa-result-card__label">Existing CGPA</span>
                      <span className="gpa-result-card__value" style={{ color: 'var(--color-text-sub)', fontSize: '1.8rem' }}>
                        {predictResult.existingCgpa?.toFixed(2) ?? '—'}
                      </span>
                      <span className="gpa-result-card__sub">before new semester</span>
                    </div>

                    <div className="gpa-result-card" style={{ background: 'var(--color-teal-light)', border: '1px solid #99D6CF' }}>
                      <span className="gpa-result-card__label">Predicted Semester GPA</span>
                      <span className="gpa-result-card__value" style={{ color: 'var(--color-teal-dark)' }}>
                        {predictResult.predictedSemGpa?.toFixed(2) ?? '—'}
                      </span>
                      <span className="gpa-result-card__sub">
                        {predictResult.totalPredictedCourses ?? predictResult.totalPredictedCredits} courses this semester
                      </span>
                    </div>

                    <div className="gpa-result-card" style={{ background: 'linear-gradient(135deg,#f0faf8,#e6f5f2)', border: '1.5px solid var(--color-teal)' }}>
                      <span className="gpa-result-card__label">Predicted Overall CGPA</span>
                      <span className="gpa-result-card__value" style={{ color: 'var(--color-teal)' }}>
                        {predictResult.predictedCgpa?.toFixed(2) ?? '—'}
                      </span>
                      <span className="gpa-result-card__sub">including all completed semesters</span>
                    </div>
                  </div>

                  {/* Per-course breakdown */}
                  {predictResult.breakdown?.length > 0 && (
                    <div className="breakdown-section">
                      <div className="breakdown-section__title">Course Breakdown</div>
                      <table className="gpa-table" aria-label="Prediction breakdown">
                        <thead>
                          <tr>
                            <th>Code</th>
                            <th>Course</th>
                            <th style={{ textAlign: 'center' }}>Credits</th>
                            <th style={{ textAlign: 'center' }}>Predicted Grade</th>
                            <th style={{ textAlign: 'right' }}>Grade Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {predictResult.breakdown.map((b, i) => (
                            <tr key={i}>
                              <td><code style={{ fontWeight: 700 }}>{b.courseCode || '—'}</code></td>
                              <td>{b.courseName || '—'}</td>
                              <td style={{ textAlign: 'center' }}>{b.credits}</td>
                              <td style={{ textAlign: 'center' }}>
                                <GradeChip grade={b.predictedGrade} />
                                {!b.countsForGpa && (
                                  <span className="non-gpa-tag">(excl.)</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {b.gradePoint != null ? b.gradePoint.toFixed(2) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              TAB 3 — SIMULATE RETAKE
          ════════════════════════════════════════════════════════ */}
          {activeTab === 'retake' && (
            <div role="tabpanel" aria-labelledby="gpa-tab-retake">

              {/* Simulation disclaimer */}
              <div className="simulation-disclaimer" style={{ marginBottom: 16 }}>
                ⚠️ This is a simulation using grade replacement policy. Results will not affect your official academic records.
              </div>

              {!hasTranscript ? (
                <div className="gpa-card">
                  <div className="gpa-empty">
                    <div className="gpa-empty__icon">📚</div>
                    <div className="gpa-empty__title">No Completed Courses to Retake</div>
                    <div className="gpa-empty__sub">
                      Complete at least one semester to use the retake simulator.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="gpa-card">
                  <div className="gpa-card__header">
                    <span className="gpa-card__title">🔁 Select Course &amp; Hypothetical Grade</span>
                    <span style={{
                      fontSize: '0.72rem', color: 'var(--color-text-sub)',
                      fontWeight: 500
                    }}>
                      Policy: Grade Replacement
                    </span>
                  </div>

                  {/* Retake form */}
                  <div className="retake-form-row">
                    <div className="form-field">
                      <label htmlFor="retake-course-select">Completed Course</label>
                      <select
                        id="retake-course-select"
                        className="predict-select"
                        value={retakeForm.courseCode}
                        onChange={e => handleRetakeFieldChange('courseCode', e.target.value)}
                        aria-label="Select a completed course to retake"
                      >
                        <option value="">— Choose a course —</option>
                        {retakableCourses.map(c => (
                          <option key={c.courseCode} value={c.courseCode}>
                            {c.courseCode} — {c.courseTitle} (Current: {c.grade})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="retake-new-grade-select">Hypothetical New Grade</label>
                      <select
                        id="retake-new-grade-select"
                        className="predict-select"
                        value={retakeForm.newGrade}
                        onChange={e => handleRetakeFieldChange('newGrade', e.target.value)}
                        aria-label="Select hypothetical new grade"
                      >
                        <option value="">— Select new grade —</option>
                        {GRADE_OPTIONS.map(g => (
                          <option key={g.grade} value={g.grade}>{g.label}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      id="gpa-simulate-retake-btn"
                      className="gpa-btn gpa-btn--primary"
                      onClick={handleSimulateRetake}
                      disabled={!retakeForm.courseCode || !retakeForm.newGrade}
                    >
                      ▶ Simulate
                    </button>
                  </div>

                  {/* Retake results */}
                  {retakeResult && (
                    <>
                      {/* Before / After comparison */}
                      <div style={{ borderTop: '1px solid var(--color-border)' }}>
                        <div style={{ padding: '16px 24px 0', display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700,
                                          color: 'var(--color-text-sub)', textTransform: 'uppercase',
                                          letterSpacing: '0.06em', marginBottom: 4 }}>
                              Course
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              {retakeResult.courseCode} — {retakeResult.courseTitle}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', marginTop: 2 }}>
                              {retakeResult.credits} credit{retakeResult.credits !== 1 ? 's' : ''} •
                              Current grade: <strong>{retakeResult.oldGrade}</strong>
                              ({retakeResult.oldGradePoint?.toFixed(2)}) →
                              Simulated: <strong>{retakeResult.newGrade}</strong>
                              ({retakeResult.newGradePoint?.toFixed(2)})
                            </div>
                          </div>

                          {/* Change delta */}
                          <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700,
                                          color: 'var(--color-text-sub)', textTransform: 'uppercase',
                                          letterSpacing: '0.06em', marginBottom: 6 }}>
                              CGPA Change
                            </div>
                            <span className={`cgpa-delta ${
                              retakeResult.cgpaChange > 0 ? 'cgpa-delta--positive'
                                : retakeResult.cgpaChange < 0 ? 'cgpa-delta--negative'
                                : 'cgpa-delta--neutral'
                            }`}>
                              {retakeResult.cgpaChange > 0 ? '▲' : retakeResult.cgpaChange < 0 ? '▼' : '●'}
                              &nbsp;{Math.abs(retakeResult.cgpaChange).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="retake-comparison">
                          {/* Before */}
                          <div className="retake-box" style={{ background: 'var(--color-bg)' }}>
                            <div className="retake-box__label" style={{ color: 'var(--color-text-sub)' }}>
                              Current CGPA
                            </div>
                            <div className="retake-box__value" style={{ color: 'var(--color-text)' }}>
                              {retakeResult.beforeCgpa.toFixed(2)}
                            </div>
                            <div className="retake-box__sub">before retake</div>
                          </div>

                          <div className="retake-comparison__arrow">→</div>

                          {/* After */}
                          <div className="retake-box" style={{
                            background: retakeResult.improved
                              ? 'linear-gradient(135deg,#f0faf8,#d1fae5)'
                              : retakeResult.cgpaChange < 0
                                ? '#FEF2F2'
                                : 'var(--color-bg)',
                            border: retakeResult.improved
                              ? '1.5px solid var(--color-teal)'
                              : '1px solid var(--color-border)',
                          }}>
                            <div className="retake-box__label" style={{
                              color: retakeResult.improved ? 'var(--color-teal-dark)' : 'var(--color-text-sub)'
                            }}>
                              Simulated CGPA
                            </div>
                            <div className="retake-box__value" style={{
                              color: retakeResult.improved ? 'var(--color-teal)' : 'var(--color-text)'
                            }}>
                              {retakeResult.afterCgpa.toFixed(2)}
                            </div>
                            <div className="retake-box__sub">
                              {retakeResult.improved
                                ? '✅ Improvement'
                                : retakeResult.cgpaChange < 0
                                  ? '📉 Would decrease'
                                  : '↔ No change'}
                            </div>
                          </div>
                        </div>

                        {/* Simulation + policy note */}
                        <div style={{ padding: '0 24px 20px',
                                      display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px',
                            background: '#FFFBEB', color: '#92400E', borderRadius: 999,
                            border: '1px solid #FCD34D'
                          }}>
                            ⚠️ SIMULATED — NOT OFFICIAL
                          </span>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px',
                            background: '#EFF6FF', color: '#1E40AF', borderRadius: 999,
                            border: '1px solid #BFDBFE'
                          }}>
                            Policy: Grade Replacement
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

/* ── Helper Components ───────────────────────────────────────────────────── */

/**
 * GradeChip – Renders a colored badge for a letter grade.
 * Color-codes by performance tier.
 */
function GradeChip({ grade }) {
  if (!grade) return <span className="grade-chip grade-chip--waived">—</span>

  const g = grade.toUpperCase()
  let cls = 'grade-chip--waived'

  if (['A+', 'A', 'A-'].includes(g))       cls = 'grade-chip--high'
  else if (['B+', 'B', 'B-'].includes(g))  cls = 'grade-chip--mid'
  else if (['C+', 'C', 'D'].includes(g))   cls = 'grade-chip--low'
  else if (g === 'F')                       cls = 'grade-chip--fail'

  return <span className={`grade-chip ${cls}`}>{grade}</span>
}
