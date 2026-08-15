import Sidebar from '../components/Sidebar.jsx'

/**
 * AcademicCalendarView – View layer for the Academic Calendar page.
 *
 * MVC Role: View
 * Displays the BRACU Academic Calendar PDF in an embedded viewer.
 * No controller needed — this page is purely static/display-only.
 * The PDF is served from the public/ directory.
 */
export default function AcademicCalendarView() {
  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <Sidebar activeItem="academic-calendar" />

      {/* Main content */}
      <main className="dashboard-main" aria-label="Academic Calendar">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-greeting">📅 Academic Calendar</h1>
          <p className="dashboard-date">
            BRAC University — Official Academic Calendar
          </p>
        </div>

        {/* PDF Viewer Card */}
        <div className="calendar-viewer-card">
          {/* Toolbar */}
          <div className="calendar-toolbar">
            <div className="calendar-toolbar-info">
              <span className="calendar-toolbar-dot" />
              <span className="calendar-toolbar-label">
                BRACU Academic Calendar
              </span>
            </div>
            <a
              href="/BRACU_Academic_Calendar.pdf"
              download="BRACU_Academic_Calendar.pdf"
              className="calendar-download-btn"
              aria-label="Download Academic Calendar PDF"
            >
              <DownloadIcon />
              Download PDF
            </a>
          </div>

          {/* Embedded PDF */}
          <div className="calendar-embed-container">
            <object
              data="/BRACU_Academic_Calendar.pdf"
              type="application/pdf"
              className="calendar-pdf-object"
              aria-label="BRACU Academic Calendar PDF viewer"
            >
              {/* Fallback for browsers that can't render PDFs inline */}
              <div className="calendar-fallback">
                <div className="calendar-fallback-icon">📄</div>
                <p className="calendar-fallback-title">
                  Unable to display the PDF in your browser.
                </p>
                <a
                  href="/BRACU_Academic_Calendar.pdf"
                  download="BRACU_Academic_Calendar.pdf"
                  className="btn btn-primary"
                  style={{ width: 'auto', padding: '12px 28px' }}
                >
                  <DownloadIcon />
                  Download Calendar
                </a>
              </div>
            </object>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ── SVG Icon ──────────────────────────────────────────────── */
function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 16, height: 16 }}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
