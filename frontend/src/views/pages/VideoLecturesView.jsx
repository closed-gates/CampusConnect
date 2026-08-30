import React, { useRef, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { useVideoLectureController } from '../../controllers/useVideoLectureController'
import { formatDuration } from '../../models/videoLectureModel'
import './VideoLectures.css'

/**
 * VideoLecturesView – Main Page View for Video Lecture Streaming & Progress Tracking.
 *
 * MVC Role: View
 * Driven strictly by useVideoLectureController hook.
 */
export default function VideoLecturesView() {
  const {
    userRole,
    lectures,
    enrolledCourses,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCourseFilter,
    setSelectedCourseFilter,
    activeVideo,
    handleSelectVideo,
    handleClosePlayer,
    handleProgressUpdate,
    showUploadModal,
    setShowUploadModal,
    uploadForm,
    handleUploadFormChange,
    handleUploadSubmit,
    isSubmitting,
    handleDeleteLecture,
    toastMessage,
  } = useVideoLectureController()

  // Calculate statistics
  const totalLectures = lectures.length
  const completedCount = lectures.filter(l => l.completed).length
  const inProgressCount = lectures.filter(l => (l.percentage > 0 && !l.completed)).length
  const totalMinutesWatched = Math.round(
    lectures.reduce((acc, l) => acc + ((l.lastPositionSeconds || 0) / 60), 0)
  )

  const isTeacher = userRole === 'faculty' || userRole === 'teacher' || userRole === 'admin'

  return (
    <div className="dashboard-page">
      <Sidebar activeItem="video-lectures" />

      <main className="dashboard-content video-lectures-container">
        {/* Toast Notification */}
        {toastMessage && <div className="vl-toast">{toastMessage}</div>}

        {/* Top Header */}
        <header className="vl-header">
          <div>
            <div className="vl-title-group">
              <h1 className="vl-title">Video Lectures</h1>
              <span className={`vl-role-badge ${isTeacher ? 'teacher' : 'student'}`}>
                {isTeacher ? '👨‍🏫 Faculty / Teacher Portal' : '🎓 Student Portal'}
              </span>
            </div>
            <p className="vl-subtitle">
              {isTeacher
                ? 'Upload and manage course video lectures for your enrolled students.'
                : 'Stream course lectures and track your watching progress in real time.'}
            </p>
          </div>

          <div className="vl-header-actions">
            {isTeacher && (
              <button
                className="btn btn-primary vl-upload-btn"
                onClick={() => setShowUploadModal(true)}
              >
                ➕ Upload New Lecture
              </button>
            )}
          </div>
        </header>

        {/* Student Enrollment Restriction Banner */}
        {!isTeacher && (
          <div className="vl-enrollment-banner">
            <div className="vl-banner-icon">🔐</div>
            <div className="vl-banner-text">
              <strong>Advising Enrollment Restricted:</strong> You are currently enrolled in{' '}
              <span className="vl-courses-chip">{enrolledCourses.join(', ') || 'CSE470, CSE110'}</span>.
              Only video lectures belonging to your registered courses are accessible below.
            </div>
          </div>
        )}

        {/* Overview Stat Cards */}
        <div className="vl-stats-grid">
          <div className="vl-stat-card">
            <div className="vl-stat-icon">📹</div>
            <div className="vl-stat-info">
              <span className="vl-stat-value">{totalLectures}</span>
              <span className="vl-stat-label">Available Lectures</span>
            </div>
          </div>
          <div className="vl-stat-card">
            <div className="vl-stat-icon">✅</div>
            <div className="vl-stat-info">
              <span className="vl-stat-value">{completedCount}</span>
              <span className="vl-stat-label">Completed</span>
            </div>
          </div>
          <div className="vl-stat-card">
            <div className="vl-stat-icon">⏳</div>
            <div className="vl-stat-info">
              <span className="vl-stat-value">{inProgressCount}</span>
              <span className="vl-stat-label">In Progress</span>
            </div>
          </div>
          <div className="vl-stat-card">
            <div className="vl-stat-icon">⏱️</div>
            <div className="vl-stat-info">
              <span className="vl-stat-value">{totalMinutesWatched} m</span>
              <span className="vl-stat-label">Time Watched</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="vl-controls-bar">
          <div className="vl-search-box">
            <span className="vl-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search lectures by title, course, or instructor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="vl-search-input"
            />
          </div>

          <div className="vl-filter-group">
            <label htmlFor="course-filter" className="vl-filter-label">Course Filter:</label>
            <select
              id="course-filter"
              value={selectedCourseFilter}
              onChange={e => setSelectedCourseFilter(e.target.value)}
              className="vl-filter-select"
            >
              <option value="all">All Available Courses</option>
              {isTeacher ? (
                <>
                  <option value="CSE470">CSE470 - Software Engineering</option>
                  <option value="CSE420">CSE420 - Compiler Design</option>
                  <option value="CSE110">CSE110 - Programming Fundamentals</option>
                  <option value="EEE201">EEE201 - Electrical Circuits</option>
                </>
              ) : (
                enrolledCourses.map(course => (
                  <option key={course} value={course}>
                    {course} (Enrolled)
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Video Lectures Grid */}
        {loading ? (
          <div className="vl-loading">
            <div className="vl-spinner"></div>
            <p>Loading video lectures...</p>
          </div>
        ) : lectures.length === 0 ? (
          <div className="vl-empty">
            <div className="vl-empty-icon">📺</div>
            <h3>No Video Lectures Found</h3>
            <p>No video content matches your course enrollment or search filter.</p>
          </div>
        ) : (
          <div className="vl-grid">
            {lectures.map(lecture => {
              const pct = lecture.percentage || 0
              const isCompleted = lecture.completed

              return (
                <div key={lecture.id} className="vl-card">
                  {/* Card Header & Badges */}
                  <div className="vl-card-preview" onClick={() => handleSelectVideo(lecture)}>
                    <div className="vl-preview-overlay">
                      <span className="vl-play-btn-circle">▶</span>
                    </div>
                    <span className="vl-course-tag">{lecture.courseCode}</span>
                    <span className="vl-duration-tag">{formatDuration(lecture.durationSeconds)}</span>
                  </div>

                  {/* Card Content */}
                  <div className="vl-card-body">
                    <h3 className="vl-card-title">{lecture.title}</h3>
                    <p className="vl-instructor">👨‍🏫 {lecture.teacherName}</p>
                    <p className="vl-card-desc">{lecture.description}</p>

                    {/* Progress Bar & Status */}
                    <div className="vl-progress-section">
                      <div className="vl-progress-header">
                        <span className="vl-progress-text">
                          {isCompleted ? 'Completed' : pct > 0 ? `${pct}% Watched` : 'Not Started'}
                        </span>
                        <span className={`vl-status-pill ${isCompleted ? 'completed' : pct > 0 ? 'in-progress' : 'new'}`}>
                          {isCompleted ? 'Completed' : pct > 0 ? 'In Progress' : 'Unwatched'}
                        </span>
                      </div>
                      <div className="vl-progress-bar-bg">
                        <div
                          className={`vl-progress-bar-fill ${isCompleted ? 'completed' : ''}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="vl-card-actions">
                      <button
                        className="btn btn-primary vl-watch-btn"
                        onClick={() => handleSelectVideo(lecture)}
                      >
                        {pct > 0 && !isCompleted
                          ? `▶ Resume (${formatDuration(lecture.lastPositionSeconds)})`
                          : '▶ Watch Lecture'}
                      </button>

                      {isTeacher && (
                        <button
                          className="btn btn-secondary vl-delete-btn"
                          onClick={() => handleDeleteLecture(lecture.id)}
                          title="Delete Lecture"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Video Player Modal */}
      {activeVideo && (
        <VideoPlayerModal
          video={activeVideo}
          onClose={handleClosePlayer}
          onProgressUpdate={handleProgressUpdate}
        />
      )}

      {/* Upload Lecture Modal */}
      {showUploadModal && (
        <div className="vl-modal-backdrop">
          <div className="vl-modal">
            <div className="vl-modal-header">
              <h2>Upload Video Lecture</h2>
              <button className="vl-modal-close" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUploadSubmit} className="vl-upload-form">
              <div className="vl-form-group">
                <label>Lecture Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Lecture 4: Entity-Relationship Modeling"
                  value={uploadForm.title}
                  onChange={handleUploadFormChange}
                />
              </div>

              <div className="vl-form-row">
                <div className="vl-form-group">
                  <label>Course Code *</label>
                  <select
                    name="courseCode"
                    value={uploadForm.courseCode}
                    onChange={handleUploadFormChange}
                  >
                    <option value="CSE470">CSE470 - Software Engineering</option>
                    <option value="CSE420">CSE420 - Compiler Design</option>
                    <option value="CSE110">CSE110 - Programming Fundamentals</option>
                    <option value="EEE201">EEE201 - Electrical Circuits</option>
                  </select>
                </div>

                <div className="vl-form-group">
                  <label>Duration (seconds)</label>
                  <input
                    type="number"
                    name="durationSeconds"
                    placeholder="600"
                    value={uploadForm.durationSeconds}
                    onChange={handleUploadFormChange}
                  />
                </div>
              </div>

              <div className="vl-form-group">
                <label>Video File / Direct Stream URL *</label>
                <input
                  type="url"
                  name="videoUrl"
                  required
                  placeholder="https://example.com/video.mp4"
                  value={uploadForm.videoUrl}
                  onChange={handleUploadFormChange}
                />
              </div>

              <div className="vl-form-group">
                <label>Instructor Name</label>
                <input
                  type="text"
                  name="teacherName"
                  placeholder="Dr. Sadia Kazi"
                  value={uploadForm.teacherName}
                  onChange={handleUploadFormChange}
                />
              </div>

              <div className="vl-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Brief summary of lecture topics..."
                  value={uploadForm.description}
                  onChange={handleUploadFormChange}
                ></textarea>
              </div>

              <div className="vl-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Uploading...' : 'Publish Lecture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * VideoPlayerModal – Embedded Video Player with real-time watch progress.
 */
function VideoPlayerModal({ video, onClose, onProgressUpdate }) {
  const videoRef = useRef(null)

  // Auto-resume video at last saved position when player opens
  useEffect(() => {
    if (videoRef.current && video.lastPositionSeconds > 0) {
      videoRef.current.currentTime = video.lastPositionSeconds
    }
  }, [video])

  // Track progress on time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime
      const dur = videoRef.current.duration || video.durationSeconds
      onProgressUpdate(video.id, cur, dur)
    }
  }

  return (
    <div className="vl-modal-backdrop" onClick={onClose}>
      <div className="vl-player-modal" onClick={e => e.stopPropagation()}>
        <div className="vl-player-header">
          <div>
            <span className="vl-course-tag">{video.courseCode}</span>
            <h2 className="vl-player-title">{video.title}</h2>
            <p className="vl-player-instructor">Instructor: {video.teacherName}</p>
          </div>
          <button className="vl-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="vl-video-wrapper">
          <video
            ref={videoRef}
            src={video.videoUrl}
            controls
            autoPlay
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleTimeUpdate}
            className="vl-video-element"
          >
            Your browser does not support HTML5 video streaming.
          </video>
        </div>

        <div className="vl-player-footer">
          <p className="vl-player-desc">{video.description}</p>
          <div className="vl-player-resume-note">
            ℹ️ Playback position auto-saves as you watch. You can pause or close at any time.
          </div>
        </div>
      </div>
    </div>
  )
}
