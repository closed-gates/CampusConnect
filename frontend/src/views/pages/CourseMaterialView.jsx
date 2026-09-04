/**
 * CourseMaterialView.jsx – course materials repository.
 *
 * MVC Role: View
 */

import Sidebar from '../components/Sidebar'
import { useCourseMaterialController } from '../../controllers/courseMaterialController'
import {
  KIND_LABELS,
  fileIcon,
  formatFileSize,
  formatUploadedAt,
} from '../../models/courseMaterialModel'
import './CourseMaterialPage.css'

export default function CourseMaterialView() {
  const ctrl = useCourseMaterialController()

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="course-materials" />
      <main className="dashboard-main">
        {ctrl.toast && (
          <div className={`cm-toast ${ctrl.toast.type}`}>{ctrl.toast.message}</div>
        )}
        <div className="cm-page-header">
          <div>
            <h1 className="cm-page-title">Course Materials</h1>
            <p className="cm-page-subtitle">
              {ctrl.canManage
                ? 'Upload lecture notes, slides, and documents. Students can view or download them here.'
                : 'View or download lecture notes, slides, and documents for your courses.'}
            </p>
          </div>
          {ctrl.canManage && (
            <button type="button" className="cm-create-btn" onClick={() => ctrl.setShowUploadForm(true)}>
              Upload material
            </button>
          )}
        </div>

        <div className="cm-filters">
          <label className="cm-label" htmlFor="cm-filter-course">Course</label>
          <select id="cm-filter-course" className="cm-input" value={ctrl.courseFilter} onChange={event => ctrl.setCourseFilter(event.target.value)}>
            <option value="ALL">All courses</option>
            {ctrl.courseOptions.map(option => (
              <option key={option.code} value={option.code}>{option.code} — {option.name}</option>
            ))}
          </select>
          <label className="cm-label" htmlFor="cm-filter-kind">Type</label>
          <select id="cm-filter-kind" className="cm-input" value={ctrl.kindFilter} onChange={event => ctrl.setKindFilter(event.target.value)}>
            <option value="ALL">All types</option>
            {ctrl.kindOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {ctrl.loading && <p className="cm-status">Loading materials…</p>}
        {ctrl.error && <p className="cm-status cm-status-error">{ctrl.error}</p>}
        {!ctrl.loading && !ctrl.error && ctrl.materials.length === 0 && (
          <div className="cm-empty section-card">
            <p>No course materials match these filters yet.</p>
            {ctrl.canManage && <p>Use Upload material to add notes, slides, or documents.</p>}
          </div>
        )}

        <div className="cm-list">
          {ctrl.materials.map(material => (
            <article key={material.id} className="cm-card section-card">
              <div className="cm-card-icon" aria-hidden="true">{fileIcon(material.originalFilename)}</div>
              <div className="cm-card-body">
                <span className="cm-badge">{KIND_LABELS[material.kind] || material.kind}</span>
                <h2>{material.title}</h2>
                <p className="cm-meta">
                  {[material.courseCode, material.courseName].filter(Boolean).join(' · ') || 'General'}
                  {material.originalFilename ? ` · ${material.originalFilename}` : ''}
                  {material.fileSize ? ` · ${formatFileSize(material.fileSize)}` : ''}
                </p>
                {material.description && <p className="cm-description">{material.description}</p>}
                <p className="cm-meta">{material.createdBy ? `Uploaded by ${material.createdBy}` : ''}{material.createdAt ? ` · ${formatUploadedAt(material.createdAt)}` : ''}</p>
              </div>
              <div className="cm-card-actions">
                <button
                  type="button"
                  className="cm-secondary-btn"
                  disabled={ctrl.viewingId === material.id}
                  onClick={() => ctrl.handleView(material)}
                >
                  {ctrl.viewingId === material.id ? 'Opening…' : 'View'}
                </button>
                <button
                  type="button"
                  className="cm-create-btn"
                  disabled={ctrl.downloadingId === material.id}
                  onClick={() => ctrl.handleDownload(material)}
                >
                  {ctrl.downloadingId === material.id ? 'Downloading…' : 'Download'}
                </button>
                {ctrl.canManage && (
                  <button
                    type="button"
                    className="cm-delete-btn"
                    disabled={ctrl.deletingId === material.id}
                    onClick={() => ctrl.handleDelete(material.id)}
                  >
                    {ctrl.deletingId === material.id ? 'Deleting…' : 'Delete'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        {ctrl.showUploadForm && <UploadModal ctrl={ctrl} />}
        {ctrl.preview && <PreviewModal ctrl={ctrl} />}
      </main>
    </div>
  )
}

function PreviewModal({ ctrl }) {
  const preview = ctrl.preview
  return (
    <div className="cm-modal-backdrop" role="dialog" aria-labelledby="cm-preview-title">
      <div className="cm-preview-modal section-card">
        <div className="cm-preview-header">
          <div>
            <h2 id="cm-preview-title">{preview.material.title}</h2>
            <p className="cm-meta">{preview.material.originalFilename}</p>
          </div>
          <div className="cm-preview-header-actions">
            <button type="button" className="cm-create-btn" onClick={() => ctrl.handleDownload(preview.material)}>
              Download
            </button>
            <button type="button" className="cm-secondary-btn" onClick={ctrl.closePreview}>Close</button>
          </div>
        </div>
        {preview.mode === 'pdf' && (
          <iframe className="cm-preview-frame" title={preview.material.title} src={preview.url} />
        )}
        {preview.mode === 'image' && (
          <img className="cm-preview-image" src={preview.url} alt={preview.material.title} />
        )}
        {preview.mode === 'text' && (
          <pre className="cm-preview-text">{preview.textContent}</pre>
        )}
        {preview.mode === 'document' && (
          <>
            <p className="cm-meta">Office files open in this viewer when the browser supports them. If the page stays blank, use Download.</p>
            <iframe className="cm-preview-frame" title={preview.material.title} src={preview.url} />
          </>
        )}
      </div>
    </div>
  )
}

function UploadModal({ ctrl }) {
  return (
    <div className="cm-modal-backdrop" role="dialog" aria-labelledby="cm-modal-title">
      <form className="cm-modal section-card" onSubmit={ctrl.handleCreate}>
        <h2 id="cm-modal-title">Upload material</h2>
        <label className="cm-label" htmlFor="cm-title">Title</label>
        <input id="cm-title" name="title" className="cm-input" value={ctrl.createForm.title} onChange={ctrl.handleFormChange} required />

        <label className="cm-label" htmlFor="cm-course">Course</label>
        <select id="cm-course" name="courseCode" className="cm-input" value={ctrl.createForm.courseCode} onChange={ctrl.handleFormChange}>
          <option value="">Select a course…</option>
          {ctrl.courseOptions.map(option => (
            <option key={option.code} value={option.code}>{option.code} — {option.name}</option>
          ))}
        </select>

        <label className="cm-label" htmlFor="cm-kind">Type</label>
        <select id="cm-kind" name="kind" className="cm-input" value={ctrl.createForm.kind} onChange={ctrl.handleFormChange}>
          {ctrl.kindOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <label className="cm-label" htmlFor="cm-description">Description</label>
        <textarea id="cm-description" name="description" className="cm-input cm-textarea" rows="3" value={ctrl.createForm.description} onChange={ctrl.handleFormChange} />

        <label className="cm-label" htmlFor="cm-file">File (PDF, slides, Word, up to 25 MB)</label>
        <input id="cm-file" type="file" onChange={ctrl.handleFileSelect} />
        {ctrl.createFile && <p className="cm-meta">{ctrl.createFile.name} · {formatFileSize(ctrl.createFile.size)}</p>}

        <div className="cm-modal-actions">
          <button type="button" className="cm-secondary-btn" onClick={() => ctrl.setShowUploadForm(false)}>Cancel</button>
          <button type="submit" className="cm-create-btn" disabled={ctrl.creating}>
            {ctrl.creating ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>
    </div>
  )
}
