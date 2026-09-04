import { useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { useCoursesController, getAvailability } from '../../controllers/coursesController.js'
import { YEARS, SEMESTERS } from '../../models/coursesModel.js'

/**
 * CoursesView – View layer for the Courses Catalog page.
 *
 * MVC Role: View
 * Renders the course catalog with search, filters, and course cards.
 * All state and logic is provided by useCoursesController().
 */
export default function CoursesView() {
  const {
    searchQuery, setSearchQuery,
    activeFaculty, setActiveFaculty,
    activeYear, setActiveYear,
    activeSemester, setActiveSemester,
    viewMode, setViewMode,
    filtered, grouped, facultyMap, total,
    FACULTIES, totalCourses,
  } = useCoursesController()

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="courses" />

      <main className="dashboard-main" aria-label="Course catalog">

        {/* Header */}
        <div className="courses-page-header">
          <div>
            <h1 className="dashboard-greeting">Course Catalog 📚</h1>
            <p className="dashboard-date">Browse {totalCourses} courses across {FACULTIES.length} departments</p>
          </div>
          <div className="view-toggle" role="group" aria-label="View mode">
            <button id="view-grid-btn" className={'view-toggle-btn' + (viewMode === 'grid' ? ' active' : '')} onClick={() => setViewMode('grid')} title="Grid view">⊞</button>
            <button id="view-list-btn" className={'view-toggle-btn' + (viewMode === 'list' ? ' active' : '')} onClick={() => setViewMode('list')} title="List view">☰</button>
          </div>
        </div>

        {/* Search */}
        <div className="courses-search-bar">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            id="courses-search-input"
            type="search"
            className="courses-search-input"
            placeholder="Search by course name, code, department or keyword…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search courses"
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">✕</button>
          )}
        </div>

        {/* Filters */}
        <div className="courses-filter-row">
          <div className="filter-group" role="group" aria-label="Filter by department">
            <button id="filter-faculty-all" className={'filter-pill' + (activeFaculty === 'all' ? ' active' : '')} onClick={() => setActiveFaculty('all')}>All Departments</button>
            {FACULTIES.map(fac => (
              <button
                key={fac.id}
                id={'filter-faculty-' + fac.id}
                className={'filter-pill' + (activeFaculty === fac.id ? ' active' : '')}
                onClick={() => setActiveFaculty(fac.id)}
              >
                {fac.icon} {fac.shortLabel || fac.label.split(' ')[0]}
              </button>
            ))}
          </div>
          <div className="filter-selects">
            <select id="filter-year" className="filter-select" value={activeYear} onChange={e => setActiveYear(e.target.value)} aria-label="Filter by year">
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
            <select id="filter-semester" className="filter-select" value={activeSemester} onChange={e => setActiveSemester(e.target.value)} aria-label="Filter by semester">
              {SEMESTERS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Result count */}
        <p className="courses-result-count">{total === 0 ? 'No courses match your search.' : 'Showing ' + total + ' course' + (total !== 1 ? 's' : '')}</p>

        {/* Empty state */}
        {total === 0 && (
          <div className="courses-empty-state">
            <span className="empty-icon">📭</span>
            <h3>No results found</h3>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        )}

        {/* Single-faculty grid */}
        {total > 0 && activeFaculty !== 'all' && (
          <div className={viewMode === 'grid' ? 'course-grid' : 'course-list'}>
            {filtered.map(c => <CourseCard key={c.id} course={c} faculty={facultyMap[c.faculty]} />)}
          </div>
        )}

        {/* Grouped by faculty */}
        {total > 0 && activeFaculty === 'all' && grouped && FACULTIES.filter(f => grouped[f.id]).map(faculty => (
          <div key={faculty.id} className="faculty-section">
            <FacultyHeader faculty={faculty} count={grouped[faculty.id].length} />
            <div className={viewMode === 'grid' ? 'course-grid' : 'course-list'}>
              {grouped[faculty.id].map(c => <CourseCard key={c.id} course={c} faculty={faculty} />)}
            </div>
          </div>
        ))}

      </main>
    </div>
  )
}

/* ── Sub-components (View helpers) ─────────────────────────── */

function StarRating({ rating }) {
  const full  = Math.floor(rating)
  const empty = 5 - full
  return (
    <span className="course-card-rating" aria-label={'Rating: ' + rating + ' out of 5'}>
      {'★'.repeat(full)}{'☆'.repeat(empty)}
      <span className="rating-num">{rating}</span>
    </span>
  )
}

function CourseCard({ course, faculty }) {
  const [bookmarked,   setBookmarked]   = useState(false)
  const [showDetails,  setShowDetails]  = useState(false)

  return (
    <>
      <div
        className="course-card"
        id={'course-card-' + course.id}
        style={{
          '--course-header-color': faculty?.color || '#F1F5F9',
          '--course-accent': faculty?.accent || '#2563EB',
        }}
      >
        <div className="course-card-header">
          <span className="course-card-emoji" aria-hidden="true">{faculty?.icon || '📚'}</span>
          <div className="course-card-header-right">
            <span className="course-card-code">{course.code}</span>
            <button
              className={'course-bookmark-btn' + (bookmarked ? ' bookmarked' : '')}
              onClick={() => setBookmarked(b => !b)}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark course'}
              id={'bookmark-' + course.id}
            >
              {bookmarked ? '★' : '☆'}
            </button>
          </div>
        </div>

        <div className="course-card-body">
          <h3 className="course-card-name">{course.name}</h3>
          <p className="course-card-instructor">🏫 {course.department || faculty?.label || 'BRACU'}</p>
          {course.isGenEd && <span className="course-tag" style={{ background: '#EDE9FE', color: '#6D28D9' }}>GenEd</span>}

          <div className="course-card-stats">
            <span>📋 {course.credits} cr.</span>
            <span>📅 {course.totalSections || 0} sections</span>
          </div>

          {course.prereqs && course.prereqs !== 'None' && (
            <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '6px' }}>
              Pre: {course.prereqs}
            </p>
          )}

          {/* View Details button */}
          <button
            className="course-enroll-btn"
            id={'view-details-btn-' + course.id}
            style={{ marginTop: '12px' }}
            onClick={() => setShowDetails(true)}
          >
            📋 View Course Details
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div
          className="course-details-overlay"
          id={'course-details-overlay-' + course.id}
          onClick={e => { if (e.target === e.currentTarget) setShowDetails(false) }}
          role="dialog"
          aria-modal="true"
          aria-label={'Details for ' + course.name}
        >
          <div className="course-details-modal">
            {/* Modal header */}
            <div className="course-details-header" style={{ '--course-header-color': faculty?.color || '#F1F5F9' }}>
              <span className="course-details-emoji">{faculty?.icon || '📚'}</span>
              <div className="course-details-title-wrap">
                <span className="course-details-code">{course.code}</span>
                <h2 className="course-details-name">{course.name}</h2>
              </div>
              <button
                className="course-details-close"
                id={'close-details-btn-' + course.id}
                onClick={() => setShowDetails(false)}
                aria-label="Close details"
              >✕</button>
            </div>

            {/* Modal body */}
            <div className="course-details-body">
              <div className="course-details-grid">
                <div className="course-details-item">
                  <span className="course-details-label">Department</span>
                  <span className="course-details-value">🏫 {course.department || 'N/A'}</span>
                </div>
                <div className="course-details-item">
                  <span className="course-details-label">School</span>
                  <span className="course-details-value">{faculty?.icon} {course.school || faculty?.label || 'BRACU'}</span>
                </div>
                <div className="course-details-item">
                  <span className="course-details-label">Credits</span>
                  <span className="course-details-value">📋 {course.credits} credit{course.credits !== 1 ? 's' : ''}</span>
                </div>
                <div className="course-details-item">
                  <span className="course-details-label">Sections Offered</span>
                  <span className="course-details-value">📅 {course.totalSections || 0} section{(course.totalSections || 0) !== 1 ? 's' : ''}</span>
                </div>
                <div className="course-details-item">
                  <span className="course-details-label">GenEd</span>
                  <span className="course-details-value">{course.isGenEd ? '✅ Yes' : '❌ No'}</span>
                </div>
                {course.midExamSchedule && course.midExamSchedule !== 'TBA' && (
                  <div className="course-details-item">
                    <span className="course-details-label">Midterm Exam</span>
                    <span className="course-details-value">📝 {course.midExamSchedule}</span>
                  </div>
                )}
                {course.finalExamSchedule && course.finalExamSchedule !== 'TBA' && (
                  <div className="course-details-item">
                    <span className="course-details-label">Final Exam</span>
                    <span className="course-details-value">🎓 {course.finalExamSchedule}</span>
                  </div>
                )}
              </div>

              {course.prereqs && course.prereqs !== 'None' && course.prereqs !== '' && (
                <div className="course-details-desc">
                  <span className="course-details-label">Prerequisites</span>
                  <p style={{ fontFamily: 'monospace', fontSize: '13px' }}>{course.prereqs}</p>
                </div>
              )}

              {course.desc && (
                <div className="course-details-desc" style={{ marginTop: '12px' }}>
                  <span className="course-details-label">Description</span>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#374151' }}>{course.desc}</p>
                </div>
              )}

              <p className="course-details-note" style={{ marginTop: '16px' }}>
                💡 To register for a section of this course, go to <strong>Advising</strong> in the sidebar.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function FacultyHeader({ faculty, count }) {
  return (
    <div className="faculty-section-header" id={'faculty-' + faculty.id}>
      <div className="faculty-icon-wrap" style={{ background: faculty.color }}>
        <span>{faculty.icon}</span>
      </div>
      <div>
        <h2 className="faculty-name">{faculty.label}</h2>
        <p className="faculty-count">{count} course{count !== 1 ? 's' : ''}</p>
      </div>
    </div>
  )
}
