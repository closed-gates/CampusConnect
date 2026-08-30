import Sidebar from '../components/Sidebar.jsx'
import { useViewRoutineController } from '../../controllers/viewRoutineController.js'

/**
 * ViewRoutineView – View layer for the Student "View Routine" official document.
 *
 * MVC Role: View
 * Strictly renders the official university routine and exam schedule layout.
 */
export default function ViewRoutineView() {
  const {
    studentProfile,
    courses,
    matrix,
    examSchedule,
    days,
    timeSlots,
    loading,
    error,
    handlePrint,
  } = useViewRoutineController()

  const studentName = studentProfile?.studentName || 'Student'
  const studentId = studentProfile?.studentId || ''
  const program = studentProfile?.department?.includes('Engineering') || studentProfile?.department?.includes('Science') ? 'CS' : (studentProfile?.department || 'UG')

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="view-routine" />

      <main className="dashboard-main" aria-label="Official Class and Exam Routine">
        {/* Top Actions Bar (Hidden on Print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 className="dashboard-greeting" style={{ fontSize: 22, margin: 0 }}>
              Official Class Routine 📄
            </h1>
            <p className="dashboard-date" style={{ margin: '4px 0 0' }}>
              View and download your official Fall 2026 class & exam schedule
            </p>
          </div>
          <button
            id="print-routine-btn"
            className="btn btn--primary"
            onClick={handlePrint}
            style={{
              padding: '10px 18px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            🖨️ Print / Save as PDF
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-sub)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p>Generating your official schedule...</p>
          </div>
        ) : error ? (
          <div className="section-card" style={{ textAlign: 'center', padding: '40px', color: '#DC2626' }}>
            <p>{error}</p>
          </div>
        ) : (
          /* Official Document Sheet */
          <div
            id="routine-document-sheet"
            style={{
              background: '#FFFFFF',
              color: '#000000',
              padding: '36px 44px',
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              border: '1px solid #E2E8F0',
              fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
              maxWidth: 960,
              margin: '0 auto',
            }}
          >
            {/* Document Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000000', paddingBottom: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  border: '2px solid #002B49',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#002B49',
                  background: '#F0F4F8'
                }}>
                  🎓
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: '#002B49', margin: 0, letterSpacing: '0.5px' }}>
                    BRAC UNIVERSITY
                  </h2>
                  <span style={{ fontSize: 11, fontStyle: 'italic', color: '#666666', letterSpacing: '0.5px' }}>
                    Inspiring Excellence
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: 13, lineHeight: '1.6' }}>
                <div><strong>Program:</strong> <span style={{ textTransform: 'uppercase', marginLeft: 8 }}>{program}</span></div>
                <div><strong>Session:</strong> <span style={{ marginLeft: 8 }}>FALL 2026</span></div>
              </div>
            </div>

            {/* ── Section 1: Class Schedule ── */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#000000', marginBottom: 12 }}>
                Class Schedule For {studentName} ({studentId}):
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #000000',
                    fontSize: 11,
                    textAlign: 'center'
                  }}
                >
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #000000' }}>
                      <th style={{ border: '1px solid #000000', padding: '8px 4px', width: '13%', fontWeight: 800 }}>TIME/DAY</th>
                      {days.map(d => (
                        <th key={d} style={{ border: '1px solid #000000', padding: '8px 4px', width: '12.4%', fontWeight: 800 }}>
                          {d}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(slot => (
                      <tr key={slot} style={{ height: 50 }}>
                        <td style={{ border: '1px solid #000000', padding: '6px 4px', fontWeight: 600, background: '#FAFAFA' }}>
                          {slot}
                        </td>
                        {days.map(day => {
                          const entries = matrix[day]?.[slot] || []
                          return (
                            <td key={day} style={{ border: '1px solid #000000', padding: '4px 2px', verticalAlign: 'middle' }}>
                              {entries.map((item, idx) => (
                                <div key={idx} style={{ lineHeight: '1.3', fontSize: 10 }}>
                                  <div style={{ fontWeight: 800 }}>
                                    {item.code}-{item.section}
                                  </div>
                                  <div style={{ color: '#333333' }}>
                                    {item.faculty}-{item.room}
                                  </div>
                                </div>
                              ))}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ fontSize: 11, marginTop: 8, fontStyle: 'italic', color: '#333333' }}>
                N.B: Cell contain: Course code,Section,Faculty,Room
              </div>
            </div>

            {/* ── Section 2: Exam Schedule ── */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#000000', marginBottom: 12 }}>
                Exam Schedule For {studentName} ({studentId}):
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #000000',
                    fontSize: 11,
                    textAlign: 'center'
                  }}
                >
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #000000' }}>
                      <th style={{ border: '1px solid #000000', padding: '8px 12px', fontWeight: 800, width: '35%' }}>DAY</th>
                      <th style={{ border: '1px solid #000000', padding: '8px 12px', fontWeight: 800, width: '25%' }}>TIME</th>
                      <th style={{ border: '1px solid #000000', padding: '8px 12px', fontWeight: 800, width: '15%' }}>EXAM</th>
                      <th style={{ border: '1px solid #000000', padding: '8px 12px', fontWeight: 800, width: '25%' }}>COURSE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examSchedule.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '16px', fontStyle: 'italic', color: '#666666' }}>
                          No active courses registered for the Fall 2026 term.
                        </td>
                      </tr>
                    ) : (
                      examSchedule.map(ex => (
                        <tr key={ex.id}>
                          <td style={{ border: '1px solid #000000', padding: '6px 12px', fontWeight: 600 }}>{ex.day}</td>
                          <td style={{ border: '1px solid #000000', padding: '6px 12px' }}>{ex.time}</td>
                          <td style={{ border: '1px solid #000000', padding: '6px 12px', fontWeight: 700 }}>{ex.exam}</td>
                          <td style={{ border: '1px solid #000000', padding: '6px 12px', fontWeight: 800 }}>{ex.course}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print,
          .sidebar,
          aside {
            display: none !important;
          }
          .dashboard-main {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          #routine-document-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}
