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
    handleEnroll, enrolledIds, enrollToast,
  } = useCoursesController()

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="courses" />

      <main className="dashboard-main" aria-label="Course catalog">

        {/* Header */}
        <div className="courses-page-header">
          <div>
            <h1 className="dashboard-greeting">Course Catalog 📚</h1>
            <p className="dashboard-date">Browse {totalCourses} courses across {FACULTIES.length} faculties</p>
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
            placeholder="Search by course name, code, instructor or keyword…"
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
          <div className="filter-group" role="group" aria-label="Filter by faculty">
            <button id="filter-faculty-all" className={'filter-pill' + (activeFaculty === 'all' ? ' active' : '')} onClick={() => setActiveFaculty('all')}>All Faculties</button>
            {FACULTIES.map(fac => (
              <button
                key={fac.id}
                id={'filter-faculty-' + fac.id}
                className={'filter-pill' + (activeFaculty === fac.id ? ' active' : '')}
                onClick={() => setActiveFaculty(fac.id)}
              >
                {fac.icon} {fac.label.split(' ')[0]}
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
            {filtered.map(c => <CourseCard key={c.id} course={c} faculty={facultyMap[c.faculty]} onEnroll={handleEnroll} enrolled={enrolledIds.has(c.id)} />)}
          </div>
        )}

        {/* Grouped by faculty */}
        {total > 0 && activeFaculty === 'all' && grouped && FACULTIES.filter(f => grouped[f.id]).map(faculty => (
          <div key={faculty.id} className="faculty-section">
            <FacultyHeader faculty={faculty} count={grouped[faculty.id].length} />
            <div className={viewMode === 'grid' ? 'course-grid' : 'course-list'}>
              {grouped[faculty.id].map(c => <CourseCard key={c.id} course={c} faculty={faculty} onEnroll={handleEnroll} enrolled={enrolledIds.has(c.id)} />)}
            </div>
          </div>
        ))}

        {/* Enrollment toast */}
        {enrollToast && (
          <div
            style={{
              position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
              background: '#0f172a', color: '#fff', padding: '12px 24px',
              borderRadius: 12, fontSize: 14, fontWeight: 600,
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)', zIndex: 9999,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {enrollToast}
          </div>
        )}

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

function CourseCard({ course, faculty, onEnroll, enrolled = false }) {
  const [bookmarked, setBookmarked] = useState(false)
  const avail   = getAvailability(course.enrolled, course.capacity)
  const fillPct = Math.round((course.enrolled / course.capacity) * 100)

  return (
    <div className="course-card" id={'course-card-' + course.id}>
      <div className="course-card-header" style={{ background: faculty.color }}>
        <span className="course-card-emoji" aria-hidden="true">{faculty.icon}</span>
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
        <p className="course-card-instructor">👤 {course.instructor}</p>
        <p className="course-card-desc">{course.desc}</p>

        <div className="course-card-tags">
          {course.tags.map(tag => <span key={tag} className="course-tag">{tag}</span>)}
        </div>

        <div className="course-card-stats">
          <span>📅 {course.semester}</span>
          <span>🎓 Year {course.year}</span>
          <span>📋 {course.credits} cr.</span>
        </div>

        <StarRating rating={course.rating} />

        <div className="course-card-footer">
          <div className="course-enrollment">
            <div className="enrollment-bar-track">
              <div className="enrollment-bar-fill" style={{ width: fillPct + '%', background: avail.color }} />
            </div>
            <span className="enrollment-text">{course.enrolled}/{course.capacity}</span>
          </div>
          <span className="course-avail-badge" style={{ color: avail.color, background: avail.bg }}>
            {avail.label}
          </span>
        </div>

        <button
          className="course-enroll-btn"
          id={'enroll-btn-' + course.id}
          disabled={avail.label === 'Full' || enrolled}
          style={{
            background: enrolled ? '#10B981' : faculty.accent,
            opacity: enrolled ? 0.85 : 1,
          }}
          onClick={() => !enrolled && onEnroll && onEnroll(course)}
        >
          {enrolled ? '✅ Enrolled' : avail.label === 'Full' ? 'Join Waitlist' : 'Enroll Now'}
        </button>
      </div>
    </div>
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
