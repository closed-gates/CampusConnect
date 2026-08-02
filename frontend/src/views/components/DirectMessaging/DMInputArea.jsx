import React, { useState, useRef } from 'react';

const ACADEMIC_EMOJIS = {
  academic: ['🎓', '📚', '📖', '📝', '✍️', '🖊️', '🎒', '🏫', '📜', '💡', '🔬', '🧪', '📐', '📊'],
  greetings: ['👋', '🙏', '👍', '🙌', '🤝', '👏', '🫡', '✅', '💯', '⭐', '🤝'],
  schedule: ['⏰', '📅', '⌛', '⏳', '🔔', '📍', '❓', '‼️'],
  expressions: ['😊', '😄', '🏼', '🤔', '💭', '🧠', '🎯', '🚀', '✨']
};

export default function DMInputArea({
  onSendMessage,
  onTyping,
  recipientName
}) {
  const [text, setText] = useState('');
  const [stagedFiles, setStagedFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const typingTimerRef = useRef(null);

  const handleInputChange = (e) => {
    setText(e.target.value);

    if (onTyping) {
      onTyping(true);

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    const formattedFiles = files.map((file) => ({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || getFileExt(file.name)
    }));

    setStagedFiles((prev) => [...prev, ...formattedFiles]);
    e.target.value = null;
  };

  const removeStagedFile = (index) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
    if (textInputRef.current) textInputRef.current.focus();
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    const trimmedText = text.trim();

    if (!trimmedText && stagedFiles.length === 0) return;

    onSendMessage({
      content: trimmedText,
      attachments: stagedFiles
    });

    setText('');
    setStagedFiles([]);
    setShowEmojiPicker(false);

    if (onTyping) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      onTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="univ-input-section">
      {showEmojiPicker && (
        <div className="univ-emoji-picker-modal">
          <div className="univ-emoji-header">
            <span>🎓 University Academic Emojis</span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <div className="univ-emoji-category">Academic & Course:</div>
          <div className="univ-emoji-grid">
            {ACADEMIC_EMOJIS.academic.map((e, i) => (
              <button key={i} className="univ-emoji-btn" onClick={() => handleEmojiClick(e)}>
                {e}
              </button>
            ))}
          </div>

          <div className="univ-emoji-category">Greetings & Respect:</div>
          <div className="univ-emoji-grid">
            {ACADEMIC_EMOJIS.greetings.map((e, i) => (
              <button key={i} className="univ-emoji-btn" onClick={() => handleEmojiClick(e)}>
                {e}
              </button>
            ))}
          </div>

          <div className="univ-emoji-category">Deadlines & Schedule:</div>
          <div className="univ-emoji-grid">
            {ACADEMIC_EMOJIS.schedule.map((e, i) => (
              <button key={i} className="univ-emoji-btn" onClick={() => handleEmojiClick(e)}>
                {e}
              </button>
            ))}
          </div>

          <div className="univ-emoji-category">Expressions:</div>
          <div className="univ-emoji-grid">
            {ACADEMIC_EMOJIS.expressions.map((e, i) => (
              <button key={i} className="univ-emoji-btn" onClick={() => handleEmojiClick(e)}>
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {stagedFiles.length > 0 && (
        <div className="univ-staged-files-bar">
          {stagedFiles.map((fileObj, idx) => (
            <div key={idx} className="univ-staged-chip">
              <span>📎</span>
              <span style={{ fontWeight: 600 }}>{fileObj.name}</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>({fileObj.size})</span>
              <button
                onClick={() => removeStagedFile(idx)}
                style={{ background: 'none', border: 'none', color: '#f23f43', cursor: 'pointer', marginLeft: 4 }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        style={{ display: 'none' }}
      />

      <form className="univ-input-form-box" onSubmit={handleSend}>
        <button
          type="button"
          className="univ-action-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Attach files of ANY type (PDF, DOCX, ZIP, Code, Images, etc.)"
          aria-label="Attach File"
        >
          📎
        </button>

        <button
          type="button"
          className="univ-action-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Academic & University Emojis"
          aria-label="Insert Academic Emoji"
        >
          😊
        </button>

        <input
          ref={textInputRef}
          type="text"
          className="univ-input-field"
          placeholder={`Message @${recipientName || 'user'}... (Attach files or type message)`}
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />

        <button
          type="submit"
          className="univ-send-submit-btn"
          title="Send Direct Message"
          aria-label="Send Message"
        >
          ➤
        </button>
      </form>
    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileExt(filename) {
  if (!filename) return 'FILE';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toUpperCase() : 'FILE';
}
