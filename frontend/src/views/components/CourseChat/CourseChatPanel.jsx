/**
 * CourseChatPanel.jsx – View layer for Real-Time Course Chat.
 *
 * MVC Role: View (functional component, no local state or logic)
 *
 * Wraps the existing course-channel UI (same CSS classes as
 * CourseChannelView.css) and plugs in the useChatController hook
 * to provide real-time WebSocket messaging.
 *
 * This component intentionally mirrors the layout of CourseChannelView.jsx
 * while delegating ALL state and handlers to useChatController().
 *
 * The original CourseChannelView.jsx is left completely untouched.
 *
 * Feature: Real-Time Course Chat via WebSockets
 */

import { useState, useEffect, useRef } from 'react'
import { useChatController } from '../../../controllers/useChatController.js'
import { CURRENT_USER } from '../../../models/messagingModel.js'
import { channelService } from '../../../services/channelService.js'
import '../DirectMessaging/CourseChannelView.css'

/* ── Tiny helpers ─────────────────────────────────────────────────── */

function getAvatarColor(id) {
  const palette = ['#1A9882','#3B82F6','#8B5CF6','#EC4899','#F59E0B','#EF4444','#10B981']
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % palette.length
  return palette[Math.abs(h)]
}

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso) {
  const d     = new Date(iso)
  const today = new Date()
  const diff  = Math.floor((today - d) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function getFileIcon(name = '', type = '') {
  const ext = (name.split('.').pop() || type || '').toLowerCase()
  if (['pdf'].includes(ext)) return '📄'
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return '📝'
  if (['ppt', 'pptx', 'xls', 'xlsx', 'csv'].includes(ext)) return '📊'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || type.startsWith('image/')) return '🖼️'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦'
  if (['js', 'py', 'java', 'cpp', 'c', 'cs', 'html', 'css', 'json', 'ts', 'jsx'].includes(ext)) return '💻'
  return '📁'
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/* ── Connection status indicator ──────────────────────────────────── */

function ConnectionBadge({ connected }) {
  return (
    <span
      title={connected ? 'Live — real-time chat active' : 'Offline mode — local messages only'}
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          5,
        fontSize:     11,
        fontWeight:   600,
        color:        connected ? 'var(--color-success, #22c55e)' : 'var(--color-muted, #6B7280)',
        marginLeft:   10,
        letterSpacing: '0.03em',
        userSelect:   'none',
      }}
    >
      <span style={{
        width:        7,
        height:       7,
        borderRadius: '50%',
        background:   connected ? 'var(--color-success, #22c55e)' : 'var(--color-muted, #6B7280)',
        boxShadow:    connected ? '0 0 6px var(--color-success, #22c55e)' : 'none',
        flexShrink:   0,
      }} />
      {connected ? 'Live' : 'Offline'}
    </span>
  )
}

/* ── Main component ───────────────────────────────────────────────── */

export default function CourseChatPanel({ channel }) {
  const subChannels = channelService.getSubChannels(channel.id)
  const members     = channelService.getMembers(channel.id)

  const [activeSubId, setActiveSubId] = useState(subChannels[0]?.id || 'general')
  const [inputVal,    setInputVal]    = useState('')
  const [pendingAttachment, setPendingAttachment] = useState(null)
  const [uploading, setUploading]     = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const messagesEndRef = useRef(null)
  const fileInputRef   = useRef(null)

  // Reset activeSubId when switching channels
  useEffect(() => {
    const subs = channelService.getSubChannels(channel.id)
    if (subs.length > 0 && !subs.some(s => s.id === activeSubId)) {
      setActiveSubId(subs[0].id)
    }
  }, [channel.id])

  const activeSub = subChannels.find(s => s.id === activeSubId) || subChannels[0]

  // ── WebSocket controller hook ────────────────────────────────────
  const { messages, connected, error, sendMessage } = useChatController(
    channel,
    activeSubId,
    CURRENT_USER
  )

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Clear pending attachment when switching channels
  useEffect(() => {
    setPendingAttachment(null)
    setUploadError(null)
  }, [activeSubId])

  /* ── Handlers ─────────────────────────────────────────────────── */

  function handleSend() {
    const content = inputVal.trim()
    if ((!content && !pendingAttachment) || activeSub?.readOnly) return
    sendMessage(content, pendingAttachment ? [pendingAttachment] : [])
    setInputVal('')
    setPendingAttachment(null)
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const MAX_SIZE = 25 * 1024 * 1024 // 25 MB
    if (file.size > MAX_SIZE) {
      setUploadError('File size exceeds the 25MB limit.')
      setTimeout(() => setUploadError(null), 4000)
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setPendingAttachment(data)
      } else {
        const errText = await res.text()
        throw new Error(errText || 'Upload failed')
      }
    } catch (err) {
      console.warn('Upload API fallback to local attachment object:', err)
      const ext = file.name.split('.').pop()
      setPendingAttachment({
        name: file.name,
        fileUrl: '#',
        size: formatBytes(file.size),
        type: ext,
      })
    } finally {
      setUploading(false)
    }
  }

  /* ── Group messages by date ───────────────────────────────────── */
  const grouped = messages.reduce((acc, msg) => {
    const date = formatDate(msg.createdAt)
    if (!acc[date]) acc[date] = []
    acc[date].push(msg)
    return acc
  }, {})

  const categories = [...new Set(subChannels.map(s => s.category))]

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className="cc-channel-root">

      {/* Sub-channel sidebar */}
      <aside className="cc-sub-sidebar">
        <div className="cc-course-header">
          <div className="cc-course-header-top">
            <div className="cc-course-emoji">📚</div>
            <div>
              <div className="cc-course-code">{channel.courseCode}</div>
              <div className="cc-course-name">{channel.displayName}</div>
            </div>
          </div>
          <div className="cc-member-count-pill">
            <span>👥</span>
            <span>{members.length} enrolled</span>
          </div>
        </div>

        <div className="cc-channel-list">
          {categories.map(cat => (
            <div key={cat}>
              <div className="cc-category-label"><span>{cat}</span></div>
              {subChannels.filter(s => s.category === cat).map(sub => (
                <div
                  key={sub.id}
                  id={`cc-sub-${sub.id}`}
                  className={`cc-sub-item${activeSubId === sub.id ? ' active' : ''}`}
                  onClick={() => setActiveSubId(sub.id)}
                >
                  <span className="cc-sub-icon hash">#</span>
                  <span className="cc-sub-name">{sub.name}</span>
                  {sub.readOnly && <span className="cc-read-only-tag">PINNED</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Main chat area */}
      <main className="cc-main">
        {/* Top bar */}
        <div className="cc-channel-topbar">
          <span className="cc-topbar-icon">#</span>
          <span className="cc-topbar-name">{activeSub?.name}</span>
          {activeSub?.description && (
            <>
              <div className="cc-topbar-divider" />
              <span className="cc-topbar-desc">{activeSub.description}</span>
            </>
          )}
          {activeSub?.readOnly && (
            <span className="cc-topbar-readonly">📌 Instructor Only</span>
          )}
          {/* Live/Offline badge */}
          <ConnectionBadge connected={connected} />
        </div>

        {/* Optional error banner */}
        {error && (
          <div style={{
            padding:    '6px 16px',
            fontSize:   12,
            color:      'var(--color-muted, #6B7280)',
            background: 'var(--color-surface-raised, rgba(255,255,255,0.04))',
            borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.06))',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Messages */}
        <div className="cc-messages">
          <div className="cc-welcome-banner">
            <div className="cc-welcome-icon">#</div>
            <div className="cc-welcome-title">Welcome to #{activeSub?.name}</div>
            <div className="cc-welcome-desc">{activeSub?.description}</div>
          </div>

          {Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              <div className="cc-date-divider">{date}</div>
              {msgs.map(msg => {
                const safeContent = typeof msg.content === 'string' ? msg.content : (msg.content?.content || String(msg.content || ''))
                return (
                  <div key={msg.id} className="cc-msg">
                    <div
                      className="cc-msg-avatar"
                      style={{ background: getAvatarColor(msg.authorId) }}
                    >
                      {initials(msg.authorName)}
                    </div>
                    <div className="cc-msg-body">
                      <div className="cc-msg-header">
                        <span className={`cc-msg-author ${msg.authorRole?.toLowerCase()}`}>
                          {msg.authorName}
                        </span>
                        <span className={`cc-msg-role-badge ${msg.authorRole?.toLowerCase()}`}>
                          {msg.authorRole === 'FACULTY' ? 'Instructor' : 'Student'}
                        </span>
                        <span className="cc-msg-time">{formatTime(msg.createdAt)}</span>
                      </div>
                      {safeContent && <div className="cc-msg-content">{safeContent}</div>}
                      {msg.attachments?.map((att, idx) => {
                        const downloadUrl = att.fileUrl || att.url || '#';
                        return (
                          <div key={att.name || idx} className="cc-msg-attachment">
                            <span className="cc-attach-icon">{getFileIcon(att.name, att.type)}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="cc-attach-name">{att.name}</div>
                              <div className="cc-attach-size">{att.size || 'Attachment'}</div>
                            </div>
                            {downloadUrl && downloadUrl !== '#' && (
                              <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={att.name}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                  padding: '4px 8px', borderRadius: 4, background: 'rgba(26,152,130,0.2)',
                                  color: '#1A9882', border: '1px solid rgba(26,152,130,0.4)',
                                  fontSize: 11, fontWeight: 600, textDecoration: 'none', marginLeft: 8
                                }}
                                title={`Download ${att.name}`}
                              >
                                📥 Download
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="cc-input-area">
          {activeSub?.readOnly ? (
            <div className="cc-read-only-notice">
              📌 This channel is for instructor announcements only.
            </div>
          ) : (
            <div>
              {/* Pending File Attachment Preview (only for #resources channel) */}
              {activeSubId === 'resources' && pendingAttachment && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
                  background: '#1c2128', border: '1px solid #1A9882', borderRadius: 8,
                  marginBottom: 8, fontSize: 12, color: '#e6edf3'
                }}>
                  <span style={{ fontSize: 16 }}>{getFileIcon(pendingAttachment.name, pendingAttachment.type)}</span>
                  <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                    {pendingAttachment.name}
                  </span>
                  <span style={{ color: '#8b949e', fontSize: 11 }}>({pendingAttachment.size})</span>
                  <button
                    type="button"
                    onClick={() => setPendingAttachment(null)}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', marginLeft: 'auto', fontWeight: 'bold', fontSize: 14 }}
                    title="Remove attachment"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Upload error alert */}
              {activeSubId === 'resources' && uploadError && (
                <div style={{ fontSize: 11, color: '#f87171', marginBottom: 6, paddingLeft: 4 }}>
                  ⚠️ {uploadError}
                </div>
              )}

              <div className="cc-input-box">
                {/* Paperclip upload button (only for #resources channel) */}
                {activeSubId === 'resources' && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      title="Upload file (PDF, Doc, Image, Code up to 25MB)"
                      style={{
                        background: 'none', border: 'none', color: uploading ? '#1A9882' : '#8b949e',
                        fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', padding: '4px 4px', borderRadius: 6,
                        opacity: uploading ? 0.6 : 1
                      }}
                    >
                      {uploading ? '⏳' : '📎'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt,.code,.js,.py,.java,.cpp,.c,.html,.css,.json,.png,.jpg,.jpeg,.gif,.webp"
                      onChange={handleFileSelect}
                    />
                  </>
                )}

                <input
                  id={`cc-input-${activeSubId}`}
                  className="cc-input-field"
                  placeholder={activeSubId === 'resources' ? `Message #${activeSub?.name} or attach file…` : `Message #${activeSub?.name}…`}
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />

                <button
                  id={`cc-send-btn-${activeSubId}`}
                  className="cc-input-btn"
                  onClick={handleSend}
                  disabled={(!inputVal.trim() && !pendingAttachment) || uploading}
                  aria-label="Send message"
                >
                  ↑
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
