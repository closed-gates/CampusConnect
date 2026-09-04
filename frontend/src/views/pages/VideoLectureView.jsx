/**
 * VideoLectureView.jsx – lecture catalog, player, and faculty publish UI.
 *
 * MVC Role: View
 * All state and handlers come from useVideoLectureController().
 */

import { memo } from 'react'
import Sidebar from '../components/Sidebar'
import { useVideoLectureController } from '../../controllers/videoLectureController'
import {
  formatClock,
  formatFileSize,
  progressLabel,
} from '../../models/videoLectureModel'
import './VideoLecturePage.css'

export default function VideoLectureView() {
  const ctrl = useVideoLectureController()

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="video-lectures" />
      <main className="dashboard-main">
        {ctrl.toast && (
          <div className={`vl-toast ${ctrl.toast.type}`}>{ctrl.toast.message}</div>
        )}
        {ctrl.selected
          ? <LecturePlayer ctrl={ctrl} />
          : <LectureList ctrl={ctrl} />}
        {ctrl.showCreateForm && <PublishModal ctrl={ctrl} />}
      </main>
    </div>
  )
}

function LectureList({ ctrl }) {
  return (
    <>
      <div className="vl-page-header">
        <div>
          <h1 className="vl-page-title">Video Lectures</h1>
          <p className="vl-page-subtitle">
            {ctrl.canManage
              ? 'Upload a file or embed a link. Students can watch and their progress is saved.'
              : 'Watch course lectures. Your progress is saved automatically.'}
          </p>
        </div>
        {ctrl.canManage && (
          <button
            type="button"
            className="vl-create-btn"
            id="vl-create-btn"
            onClick={() => ctrl.setShowCreateForm(true)}
          >
            Add lecture
          </button>
        )}
      </div>

      {ctrl.loading && <p className="vl-status">Loading lectures…</p>}
      {ctrl.error && <p className="vl-status vl-status-error">{ctrl.error}</p>}
      {!ctrl.loading && !ctrl.error && ctrl.lectures.length === 0 && (
        <div className="vl-empty section-card">
          <p>No video lectures have been published yet.</p>
          {ctrl.canManage && <p>Use Add lecture to upload a video or paste a YouTube / Vimeo link.</p>}
        </div>
      )}

      <div className="vl-grid">
        {ctrl.lectures.map(lecture => (
          <article key={lecture.id} className="vl-card section-card">
            <button type="button" className="vl-card-main" onClick={() => ctrl.openLecture(lecture)}>
              <span className="vl-badge">{lecture.sourceType === ctrl.sourceUpload ? 'File' : 'Embed'}</span>
              <h2>{lecture.title}</h2>
              <p className="vl-card-meta">
                {[lecture.courseCode, lecture.courseName].filter(Boolean).join(' · ') || 'General'}
              </p>
              <div className="vl-progress-track" aria-hidden="true">
                <div className="vl-progress-fill" style={{ width: `${lecture.percentWatched || 0}%` }} />
              </div>
              <p className="vl-card-progress">{progressLabel(lecture)}</p>
            </button>
            {ctrl.canManage && (
              <button
                type="button"
                className="vl-delete-btn"
                disabled={ctrl.deletingId === lecture.id}
                onClick={() => ctrl.handleDelete(lecture.id)}
              >
                {ctrl.deletingId === lecture.id ? 'Deleting…' : 'Delete'}
              </button>
            )}
          </article>
        ))}
      </div>
    </>
  )
}

function YouTubePlayerHost({ lectureId }) {
  return <div id="vl-yt-player" data-lecture-id={lectureId} />
}

const StableYouTubePlayerHost = memo(YouTubePlayerHost, (prev, next) => prev.lectureId === next.lectureId)

function FilePlayer({ streamUrl, videoRef, onTimeUpdate, onPause, onEnded, onLoadedMetadata }) {
  return (
    <video
      ref={videoRef}
      className="vl-video"
      src={streamUrl}
      controls
      playsInline
      preload="auto"
      onTimeUpdate={onTimeUpdate}
      onPause={onPause}
      onEnded={onEnded}
      onLoadedMetadata={onLoadedMetadata}
    >
      Your browser cannot play this video.
    </video>
  )
}

const StableFilePlayer = memo(FilePlayer, (prev, next) => prev.streamUrl === next.streamUrl)

function EmbedFrame({ title, src }) {
  return (
    <iframe
      title={title}
      src={src}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

const StableEmbedFrame = memo(EmbedFrame, (prev, next) => prev.src === next.src && prev.title === next.title)

function LecturePlayer({ ctrl }) {
  const lecture = ctrl.selected
  return (
    <div className="vl-player-page">
      <button type="button" className="vl-back-btn" onClick={ctrl.closeLecture}>← All lectures</button>
      <h1 className="vl-page-title">{lecture.title}</h1>
      <p className="vl-page-subtitle">
        {[lecture.courseCode, lecture.courseName].filter(Boolean).join(' · ')}
        {lecture.createdBy ? ` · Posted by ${lecture.createdBy}` : ''}
      </p>

      <div className="vl-stage section-card">
        {lecture.sourceType === ctrl.sourceUpload && (
          <>
            {ctrl.streamLoading && <p className="vl-status">Loading video…</p>}
            {ctrl.streamUrl && (
              <StableFilePlayer
                streamUrl={ctrl.streamUrl}
                videoRef={ctrl.videoRef}
                onTimeUpdate={ctrl.handleTimeUpdate}
                onPause={ctrl.handlePauseOrEnded}
                onEnded={ctrl.handlePauseOrEnded}
                onLoadedMetadata={ctrl.handleLoadedMetadata}
              />
            )}
          </>
        )}

        {lecture.sourceType === ctrl.sourceEmbed && ctrl.isYouTubeEmbed && (
          <div className="vl-embed-frame">
            <StableYouTubePlayerHost lectureId={lecture.id} />
          </div>
        )}

        {lecture.sourceType === ctrl.sourceEmbed && !ctrl.isYouTubeEmbed && (
          <div className="vl-embed-frame">
            <StableEmbedFrame title={lecture.title} src={lecture.embedUrl} />
          </div>
        )}
      </div>

      <div className="vl-detail section-card">
        {lecture.description && <p className="vl-description">{lecture.description}</p>}
        <div className="vl-progress-track" aria-hidden="true">
          <div className="vl-progress-fill" style={{ width: `${lecture.percentWatched || 0}%` }} />
        </div>
        <p className="vl-card-progress">
          {progressLabel(lecture)}
          {lecture.durationSeconds
            ? ` · ${formatClock(lecture.positionSeconds)} / ${formatClock(lecture.durationSeconds)}`
            : ''}
        </p>
        {lecture.sourceType === ctrl.sourceEmbed && !ctrl.isYouTubeEmbed && (
          <button type="button" className="vl-create-btn" onClick={ctrl.handleMarkComplete}>
            Mark as watched
          </button>
        )}
      </div>
    </div>
  )
}

function PublishModal({ ctrl }) {
  return (
    <div className="vl-modal-backdrop" role="dialog" aria-labelledby="vl-modal-title">
      <form className="vl-modal section-card" onSubmit={ctrl.handleCreate}>
        <h2 id="vl-modal-title">Publish lecture</h2>
        <label className="vl-label" htmlFor="vl-title">Title</label>
        <input id="vl-title" name="title" className="vl-input" value={ctrl.createForm.title} onChange={ctrl.handleFormChange} required />

        <label className="vl-label" htmlFor="vl-course">Course</label>
        <select id="vl-course" name="courseCode" className="vl-input" value={ctrl.createForm.courseCode} onChange={ctrl.handleFormChange}>
          {ctrl.courseOptions.map(option => (
            <option key={option.code} value={option.code}>{option.code} — {option.name}</option>
          ))}
        </select>

        <label className="vl-label" htmlFor="vl-description">Description</label>
        <textarea id="vl-description" name="description" className="vl-input vl-textarea" rows="3" value={ctrl.createForm.description} onChange={ctrl.handleFormChange} />

        <fieldset className="vl-source">
          <legend>Source</legend>
          <label>
            <input type="radio" name="sourceType" value={ctrl.sourceEmbed} checked={ctrl.createForm.sourceType === ctrl.sourceEmbed} onChange={ctrl.handleFormChange} />
            Embed URL
          </label>
          <label>
            <input type="radio" name="sourceType" value={ctrl.sourceUpload} checked={ctrl.createForm.sourceType === ctrl.sourceUpload} onChange={ctrl.handleFormChange} />
            Upload file
          </label>
        </fieldset>

        {ctrl.createForm.sourceType === ctrl.sourceEmbed && (
          <>
            <label className="vl-label" htmlFor="vl-embed">YouTube, Vimeo, or HTTPS embed URL</label>
            <input id="vl-embed" name="embedUrl" className="vl-input" value={ctrl.createForm.embedUrl} onChange={ctrl.handleFormChange} placeholder="https://www.youtube.com/watch?v=…" />
          </>
        )}

        {ctrl.createForm.sourceType === ctrl.sourceUpload && (
          <>
            <label className="vl-label" htmlFor="vl-file">Video file (MP4, WebM, up to 200 MB)</label>
            <input id="vl-file" type="file" accept="video/*" onChange={ctrl.handleFileSelect} />
            {ctrl.createFile && <p className="vl-card-meta">{ctrl.createFile.name} · {formatFileSize(ctrl.createFile.size)}</p>}
          </>
        )}

        <div className="vl-modal-actions">
          <button type="button" className="vl-secondary-btn" onClick={() => ctrl.setShowCreateForm(false)}>Cancel</button>
          <button type="submit" className="vl-create-btn" disabled={ctrl.creating}>
            {ctrl.creating ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  )
}
