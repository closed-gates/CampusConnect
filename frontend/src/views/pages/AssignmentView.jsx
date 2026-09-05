/**
 * AssignmentView.jsx – View layer for the Assignment Submission feature.
 *
 * MVC Role: View
 * Renders the assignment list, detail, file upload, and grading UI.
 * All state and logic comes from useAssignmentController().
 *
 * Layout: Google Classroom-style
 *   - Left: Assignment detail (title, description, attachment)
 *   - Right: "Your Work" panel (student) or "Submissions" (teacher)
 */

import Sidebar from '../components/Sidebar'
import { useAssignmentController } from '../../controllers/assignmentController'
import {
  STATUS_CONFIG,
  getDeadlineStatus,
  formatDeadline,
  formatFileSize,
  getFileIcon,
  getCourseConfig,
  deriveStatus,
  formatDate,
} from '../../models/assignmentModel'
import * as assignmentService from '../../services/assignmentService'
import './AssignmentPage.css'

export default function AssignmentView() {
  const ctrl = useAssignmentController()

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="assignments" />
      <main className="dashboard-main">
        {/* ── Toast notification ─────────────────────────── */}
        {ctrl.toast && (
          <div className={`asgn-toast ${ctrl.toast.type}`}>
            {ctrl.toast.message}
          </div>
        )}

        {ctrl.selectedAssignment
          ? <AssignmentDetail ctrl={ctrl} />
          : <AssignmentList   ctrl={ctrl} />
        }

        {/* ── Teacher: Create Assignment Modal ───────────── */}
        {ctrl.showCreateForm && <CreateAssignmentModal ctrl={ctrl} />}
        {ctrl.deleteTarget && <DeleteAssignmentModal ctrl={ctrl} />}
        {ctrl.preview && <SubmissionPreviewModal ctrl={ctrl} />}
      </main>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Assignment List
   ══════════════════════════════════════════════════════════════ */
function AssignmentList({ ctrl }) {
  return (
    <>
      <div className="asgn-page-header">
        <div>
          <h1 className="asgn-page-title">Assignments</h1>
          <p className="asgn-page-subtitle">
            {ctrl.canManageAssignments
              ? 'Manage and create assignments for your courses'
              : 'View and submit your course assignments'}
          </p>
        </div>
        {ctrl.canManageAssignments && (
          <button
            className="asgn-create-btn"
            onClick={() => ctrl.setShowCreateForm(true)}
            id="asgn-create-btn"
          >
            <PlusIcon />
            Create Assignment
          </button>
        )}
      </div>

      <div className="asgn-search-row">
        <input className="asgn-search" type="search" aria-label="Search assignments"
          placeholder="Search by assignment, course, or faculty…" value={ctrl.searchQuery}
          onChange={e => ctrl.setSearchQuery(e.target.value)} />
        {ctrl.searchQuery && <button className="asgn-create-cancel-btn" onClick={() => ctrl.setSearchQuery('')}>Clear search</button>}
      </div>

      {ctrl.overdueCount > 0 && (
        <button
          className="asgn-overdue-toggle"
          onClick={() => ctrl.setShowOverdue(!ctrl.showOverdue)}
          id="asgn-overdue-toggle"
        >
          {ctrl.showOverdue
            ? 'Hide past-deadline assignments'
            : `Show past-deadline assignments (${ctrl.overdueCount})`}
        </button>
      )}

      {/* Loading skeletons */}
      {ctrl.loading && (
        <div className="asgn-list">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="asgn-skeleton asgn-skeleton-card" />
          ))}
        </div>
      )}

      {/* Error */}
      {ctrl.error && !ctrl.loading && (
        <div className="asgn-empty">
          <div className="asgn-empty-icon">⚠️</div>
          <div className="asgn-empty-text">{ctrl.error}</div>
        </div>
      )}

      {/* Empty state */}
      {!ctrl.loading && !ctrl.error && ctrl.assignments.length === 0 && (
        <div className="asgn-empty">
          <div className="asgn-empty-icon">📋</div>
          <div className="asgn-empty-text">{ctrl.searchQuery ? 'No assignments match your search' : 'No assignments yet'}</div>
          <div className="asgn-empty-hint">
            {ctrl.canManageAssignments
              ? 'Create your first assignment using the button above.'
              : 'Your teachers haven\'t posted any assignments yet.'}
          </div>
        </div>
      )}

      {/* Assignment cards */}
      {!ctrl.loading && !ctrl.error && ctrl.assignments.length > 0 && (
        <div className="asgn-list">
          {ctrl.assignments.map(a => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onClick={() => ctrl.selectAssignment(a)}
            />
          ))}
        </div>
      )}
    </>
  )
}

/* ── Assignment Card ───────────────────────────────────────── */
function AssignmentCard({ assignment, onClick }) {
  const config   = getCourseConfig(assignment.courseCode)
  const deadline = getDeadlineStatus(assignment.deadline)

  return (
    <div
      className="asgn-card"
      onClick={onClick}
      id={`asgn-card-${assignment.id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div
        className="asgn-card-icon"
        style={{ background: config.bg }}
      >
        {config.icon}
      </div>

      <div className="asgn-card-body">
        <div
          className="asgn-card-course"
          style={{ color: config.accent }}
        >
          {assignment.courseCode} · {assignment.courseName}
        </div>
        <div className="asgn-card-title">{assignment.title}</div>
        <div className="asgn-card-meta">
          <span>👤 {assignment.createdBy}</span>
          <span>📅 Posted {formatDate(assignment.createdAt)}</span>
        </div>
      </div>

      <div className="asgn-card-right">
        <div className={`asgn-deadline-badge ${
          deadline.overdue ? 'overdue' : deadline.urgent ? 'urgent' : 'normal'
        }`}>
          ⏰ {deadline.label}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Assignment Detail (Google Classroom Layout)
   ══════════════════════════════════════════════════════════════ */
function AssignmentDetail({ ctrl }) {
  const a        = ctrl.selectedAssignment
  const config   = getCourseConfig(a.courseCode)
  const deadline = getDeadlineStatus(a.deadline)
  const status   = deriveStatus(ctrl.submission, a.deadline)
  const statusCfg = STATUS_CONFIG[status]

  if (ctrl.detailLoading) {
    return <div className="asgn-skeleton asgn-skeleton-detail" />
  }

  return (
    <>
      <button
        className="asgn-back-btn"
        onClick={ctrl.backToList}
        id="asgn-back-btn"
      >
        <BackIcon />
        All Assignments
      </button>

      <div className="asgn-detail-wrapper">
        {/* ── Left: Assignment Info ───────────────────────── */}
        <div className="asgn-detail-main">
          <div className="asgn-detail-header">
            <div
              className="asgn-detail-icon"
              style={{ background: config.bg }}
            >
              {config.icon}
            </div>
            <div>
              <h1 className="asgn-detail-title">{a.title}</h1>
              <div className="asgn-detail-teacher">
                {a.createdBy} · {formatDate(a.createdAt)}
                {a.createdAt !== a.deadline && (
                  <span style={{ marginLeft: 6, opacity: 0.7 }}>
                    (Edited {formatDate(a.createdAt)})
                  </span>
                )}
              </div>
              <div className="asgn-detail-meta-row">
                <span className={`asgn-deadline-badge ${
                  deadline.overdue ? 'overdue' : deadline.urgent ? 'urgent' : 'normal'
                }`}>
                  Due {formatDeadline(a.deadline)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {a.description && (
            <div className="asgn-detail-description">
              {a.description}
            </div>
          )}

          {/* Attachment */}
          {a.hasAttachment && a.attachmentName && (
            <button
              type="button"
              onClick={() => ctrl.handleDownload(assignmentService.getAttachmentUrl(a.id), a.attachmentName)}
              className="asgn-attachment"
            >
              <span className="asgn-attachment-icon">
                {getFileIcon(a.attachmentType)}
              </span>
              <div className="asgn-attachment-info">
                <div className="asgn-attachment-name">{a.attachmentName}</div>
                <div className="asgn-attachment-type">
                  {a.attachmentType ? a.attachmentType.split('/').pop().toUpperCase() : 'FILE'}
                </div>
              </div>
              <span className="asgn-attachment-download">Download ↓</span>
            </button>
          )}

          {/* Teacher: Submissions table */}
          {ctrl.canViewSubmissions && (
            <SubmissionsTable ctrl={ctrl} />
          )}
        </div>

        {/* ── Right: "Your Work" Panel (Student) ─────────── */}
        {ctrl.canManageAssignments && (
          <div className="asgn-manage-actions">
            <button className="asgn-turnin-btn secondary" onClick={() => ctrl.openEditAssignment(a)}>Edit assignment</button>
            <button className="asgn-turnin-btn asgn-danger-btn" onClick={() => ctrl.setDeleteTarget(a)}>Delete assignment</button>
          </div>
        )}

        {ctrl.canSubmit && (
          <div className="asgn-work-panel">
            <div className="asgn-work-header">
              <span className="asgn-work-title">Your work</span>
              <span
                className="asgn-work-status"
                style={{ color: statusCfg.color }}
              >
                {statusCfg.label}
              </span>
            </div>
            <div className="asgn-work-body">
              <StudentWorkPanel ctrl={ctrl} deadline={deadline} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

/* ── Student "Your Work" Panel Content ─────────────────────── */
function StudentWorkPanel({ ctrl, deadline }) {
  const isTurnedIn = ctrl.submission && ctrl.submission.status === 'TURNED_IN'
  const isOverdue  = deadline.overdue

  // Turned in state
  if (isTurnedIn && ctrl.submission) {
    return (
      <>
        {ctrl.submission.fileName && (
          <div className="asgn-submitted-file">
            <span className="asgn-file-icon">
              {getFileIcon(ctrl.submission.fileType)}
            </span>
            <div className="asgn-file-info">
              <div className="asgn-file-name">{ctrl.submission.fileName}</div>
              <div className="asgn-file-size">{ctrl.submission.fileType?.split('/').pop().toUpperCase()}</div>
              <button className="asgn-download-link" onClick={() => ctrl.handlePreview(ctrl.submission)}>View submitted file</button>
            </div>
          </div>
        )}

        <button
          className="asgn-turnin-btn secondary"
          onClick={ctrl.handleUnsubmit}
          disabled={ctrl.unsubmitting || isOverdue}
          id="asgn-unsubmit-btn"
        >
          {ctrl.unsubmitting ? 'Unsubmitting...' : 'Unsubmit'}
        </button>

        {isOverdue && (
          <div className="asgn-deadline-warning">
            Your teacher is not accepting work at this time
          </div>
        )}
      </>
    )
  }

  // Default: Upload + Turn In state
  return (
    <>
      {/* File drop zone */}
      <div
        className={`asgn-dropzone ${ctrl.dragActive ? 'drag-active' : ''} ${isOverdue ? 'disabled' : ''}`}
        onDrop={ctrl.handleDrop}
        onDragOver={ctrl.handleDragOver}
        onDragLeave={ctrl.handleDragLeave}
      >
        <span className="asgn-dropzone-icon">📁</span>
        <div className="asgn-dropzone-text">
          Drag your file here or <strong>browse</strong>
        </div>
        <div className="asgn-dropzone-hint">
          PDF, DOCX, ZIP, PY, Java, images — up to 10 MB
        </div>
        {!isOverdue && (
          <input
            type="file"
            onChange={(e) => ctrl.handleFileSelect(e.target.files[0])}
            id="asgn-file-input"
          />
        )}
      </div>

      {/* Uploaded file preview */}
      {ctrl.uploadedFile && (
        <div className="asgn-file-preview">
          <span className="asgn-file-icon">
            {getFileIcon(ctrl.uploadedFile.type)}
          </span>
          <div className="asgn-file-info">
            <div className="asgn-file-name">{ctrl.uploadedFile.name}</div>
            <div className="asgn-file-size">{formatFileSize(ctrl.uploadedFile.size)}</div>
          </div>
          <button
            className="asgn-file-remove"
            onClick={ctrl.removeFile}
            title="Remove file"
            id="asgn-remove-file-btn"
          >
            ✕
          </button>
        </div>
      )}

      {/* Turn In button */}
      <button
        className="asgn-turnin-btn primary"
        onClick={ctrl.handleTurnIn}
        disabled={!ctrl.uploadedFile || ctrl.turningIn || isOverdue}
        id="asgn-turnin-btn"
      >
        {ctrl.turningIn ? 'Turning in...' : 'Turn in'}
      </button>

      {isOverdue && (
        <div className="asgn-deadline-warning">
          Your teacher is not accepting work at this time
        </div>
      )}
    </>
  )
}

/* ══════════════════════════════════════════════════════════════
   Teacher: Submissions Table
   ══════════════════════════════════════════════════════════════ */
function SubmissionsTable({ ctrl }) {
  if (ctrl.submissionsLoading) {
    return (
      <div className="asgn-submissions-section">
        <div className="asgn-skeleton" style={{ height: 200 }} />
      </div>
    )
  }

  return (
    <div className="asgn-submissions-section">
      <h3 className="asgn-submissions-title">
        Student Submissions ({ctrl.allSubmissions.length})
      </h3>
      <input className="asgn-search" type="search" aria-label="Search submissions"
        placeholder="Search student name, ID, or file…" value={ctrl.submissionSearch}
        onChange={e => ctrl.setSubmissionSearch(e.target.value)} />

      {ctrl.filteredSubmissions.length === 0 ? (
        <div className="asgn-empty" style={{ padding: '30px 20px' }}>
          <div className="asgn-empty-icon">📭</div>
          <div className="asgn-empty-text">{ctrl.submissionSearch ? 'No matching submissions' : 'No submissions yet'}</div>
        </div>
      ) : (
        <table className="asgn-submissions-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>File</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {ctrl.filteredSubmissions.map(sub => {
              const statusCfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.ASSIGNED

              return (
                <tr key={sub.id}>
                  <td>
                    <strong>{sub.studentName || sub.studentId}</strong>
                    <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>
                      {sub.studentId}
                    </div>
                  </td>
                  <td>
                    <span
                      className="asgn-status-badge"
                      style={{ background: statusCfg.bg, color: statusCfg.color }}
                    >
                      {statusCfg.label}
                    </span>
                  </td>
                  <td>
                    {sub.hasFile && sub.fileName ? (
                      <button
                        type="button"
                        onClick={() => ctrl.handlePreview(sub)}
                        className="asgn-download-link"
                      >
                        {getFileIcon(sub.fileType)} View {sub.fileName}
                      </button>
                    ) : (
                      <span style={{ color: 'var(--color-text-light)', fontSize: 12 }}>
                        No file
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>
                    {sub.submittedAt ? formatDeadline(sub.submittedAt) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Create Assignment Modal (Teacher)
   ══════════════════════════════════════════════════════════════ */
function CreateAssignmentModal({ ctrl }) {
  return (
    <div
      className="asgn-create-overlay"
      onClick={(e) => e.target === e.currentTarget && ctrl.closeAssignmentForm()}
    >
      <div className="asgn-create-modal">
        <div className="asgn-create-modal-header">
          <h2>{ctrl.editingAssignmentId ? 'Edit Assignment' : 'Create Assignment'}</h2>
          <button
            className="asgn-create-close"
            onClick={() => ctrl.closeAssignmentForm()}
            id="asgn-create-close"
          >
            ✕
          </button>
        </div>

        <div className="asgn-create-form">
          {/* Course */}
          <div className="asgn-form-group">
            <label htmlFor="asgn-course-search">Search courses</label>
            <input id="asgn-course-search" type="search" placeholder="Search course code or name…"
              value={ctrl.courseSearch} onChange={e => ctrl.setCourseSearch(e.target.value)} />
            <label htmlFor="asgn-create-course">Course</label>
            <select
              value={ctrl.createForm.courseCode}
              onChange={(e) => ctrl.handleCourseSelect(e.target.value)}
              id="asgn-create-course"
            >
              <option value="">Select a course...</option>
              {ctrl.filteredCourseOptions.map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} – {c.name}
                </option>
              ))}
            </select>
            {ctrl.filteredCourseOptions.length === 0 && <p role="status">No matching courses. Try another code or name.</p>}
          </div>

          {/* Title */}
          <div className="asgn-form-group">
            <label>Title</label>
            <input
              type="text"
              value={ctrl.createForm.title}
              onChange={(e) => ctrl.updateCreateForm('title', e.target.value)}
              placeholder="e.g. Lab 5 – Process Scheduling"
              id="asgn-create-title"
            />
          </div>

          {/* Description */}
          <div className="asgn-form-group">
            <label>Instructions</label>
            <textarea
              value={ctrl.createForm.description}
              onChange={(e) => ctrl.updateCreateForm('description', e.target.value)}
              placeholder="Describe the assignment requirements..."
              id="asgn-create-description"
            />
          </div>

          {/* Deadline */}
          <div className="asgn-form-group">
            <label>Deadline</label>
            <input
              type="datetime-local"
              value={ctrl.createForm.deadline}
              onChange={(e) => ctrl.updateCreateForm('deadline', e.target.value)}
              id="asgn-create-deadline"
            />
          </div>

          {/* Teacher Name */}
          <div className="asgn-form-group">
            <label>Your Name</label>
            <input
              type="text"
              value={ctrl.createForm.createdBy}
              onChange={(e) => ctrl.updateCreateForm('createdBy', e.target.value)}
              placeholder="e.g. Dr. Md. Rashedul Islam"
              id="asgn-create-teacher"
            />
          </div>

          {/* File Attachment */}
          <div className="asgn-form-group">
            <label>Attach Question File (optional)</label>
            {ctrl.createFile ? (
              <div className="asgn-file-preview">
                <span className="asgn-file-icon">
                  {getFileIcon(ctrl.createFile.type)}
                </span>
                <div className="asgn-file-info">
                  <div className="asgn-file-name">{ctrl.createFile.name}</div>
                  <div className="asgn-file-size">{formatFileSize(ctrl.createFile.size)}</div>
                </div>
                <button
                  className="asgn-file-remove"
                  onClick={() => ctrl.handleCreateFileSelect(null)}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="asgn-dropzone" style={{ minHeight: 80, padding: '16px 14px' }}>
                <span className="asgn-dropzone-text">
                  <strong>Browse</strong> to attach a file
                </span>
                <input
                  type="file"
                  onChange={(e) => ctrl.handleCreateFileSelect(e.target.files[0])}
                  id="asgn-create-file"
                />
              </div>
            )}
          </div>
        </div>

        <div className="asgn-create-actions">
          <button
            className="asgn-create-cancel-btn"
            onClick={() => ctrl.closeAssignmentForm()}
          >
            Cancel
          </button>
          <button
            className="asgn-create-submit-btn"
            onClick={ctrl.handleCreateAssignment}
            disabled={ctrl.creating}
            id="asgn-create-submit"
          >
            {ctrl.creating ? 'Saving...' : ctrl.editingAssignmentId ? 'Save Changes' : 'Create Assignment'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SVG Icons (scoped to this view)
   ══════════════════════════════════════════════════════════════ */
function DeleteAssignmentModal({ ctrl }) {
  return (
    <div className="asgn-create-overlay">
      <section className="asgn-create-modal" role="dialog" aria-modal="true" aria-labelledby="asgn-delete-title">
        <div className="asgn-create-modal-header"><h2 id="asgn-delete-title">Delete assignment?</h2></div>
        <div className="asgn-create-form">
          <p>Delete <strong>{ctrl.deleteTarget.title}</strong> and all its student submissions? This cannot be undone.</p>
        </div>
        <div className="asgn-create-actions">
          <button autoFocus className="asgn-create-cancel-btn" disabled={ctrl.deleting} onClick={() => ctrl.setDeleteTarget(null)}>Cancel</button>
          <button className="asgn-create-submit-btn asgn-danger-btn" disabled={ctrl.deleting} onClick={ctrl.confirmDeleteAssignment}>
            {ctrl.deleting ? 'Deleting…' : 'Delete assignment'}
          </button>
        </div>
      </section>
    </div>
  )
}

function SubmissionPreviewModal({ ctrl }) {
  const preview = ctrl.preview
  return (
    <div className="asgn-create-overlay" onClick={e => e.target === e.currentTarget && ctrl.closePreview()}>
      <section className="asgn-create-modal asgn-preview-modal" role="dialog" aria-modal="true" aria-labelledby="asgn-preview-title"
        onKeyDown={e => e.key === 'Escape' && ctrl.closePreview()}>
        <div className="asgn-create-modal-header">
          <h2 id="asgn-preview-title">{preview.name}</h2>
          <button autoFocus className="asgn-create-close" aria-label="Close preview" onClick={ctrl.closePreview}>✕</button>
        </div>
        <div className="asgn-preview-content">
          {preview.loading && <p role="status">Loading preview…</p>}
          {preview.error && <p role="alert">{preview.error}</p>}
          {preview.kind === 'pdf' && <iframe title={preview.name} src={preview.url} />}
          {preview.kind === 'image' && <img alt={preview.name} src={preview.url} />}
          {preview.kind === 'text' && <pre>{preview.text}</pre>}
          {preview.kind === 'unsupported' && <p>A preview is not available for this file format. PDF, images, text, source code, DOCX, and ZIP file listings can be viewed here.</p>}
        </div>
      </section>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
