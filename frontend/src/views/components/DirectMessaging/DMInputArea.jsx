import React, { useState, useRef } from 'react';

const ACADEMIC_EMOJIS = {
  academic: ['🎓', '📚', '📝', '🔍', '💡', '📊', '💻', '🧪', '📐', '🧠', '📌', '🗓️', '🏆', '⭐'],
  greetings: ['👋', '🙌', '👍', '🤝', '😊', '🎉', '✨', '👏', '💬', '🔥', '💯'],
  schedule: ['📅', '⏰', '📌', '📍', '📢', '🔔', '⌛', '🎯'],
  expressions: ['🤔', '😅', '👀', '💯', '🚀', '⚡', '💪', '🎯']
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

    if (!text.trim() && stagedFiles.length === 0) return;

    onSendMessage({
      content: text,
      attachments: stagedFiles
    });

    setText('');
    setStagedFiles([]);
    setShowEmojiPicker(false);
    if (onTyping) onTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="univ-input-section">
      {stagedFiles.length > 0 && (
        <div className="univ-staged-files-bar">
          {stagedFiles.map((fileObj, idx) => (
            <div key={idx} className="univ-staged-chip">
              <span>📄</span>
              <span>{fileObj.name}</span>
              <span style={{ fontSize: 11, opacity: 0.7 }}>({fileObj.size})</span>
              <button
                type="button"
                onClick={() => removeStagedFile(idx)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0 2px', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {showEmojiPicker && (
        <div className="univ-emoji-picker-modal">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="univ-emoji-header">Quick Academic Emojis</span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 14 }}
            >
              ✕
            </button>
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {Object.entries(ACADEMIC_EMOJIS).map(([category, emojis]) => (
              <div key={category} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>
                  {category}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {emojis.map((emoji, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: 18,
                        padding: 4,
                        borderRadius: 6,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#E6F5F2')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form className="univ-input-form-box" onSubmit={handleSend}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          multiple
        />

        <button
          type="button"
          className="univ-action-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Attach Files"
        >
          📎
        </button>

        <button
          type="button"
          className="univ-action-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Insert Emoji"
        >
          😊
        </button>

        <input
          ref={textInputRef}
          type="text"
          className="univ-input-field"
          placeholder={
            recipientName
              ? `Message @${recipientName}…`
              : 'Type your message here…'
          }
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />

        <button
          type="submit"
          className="univ-send-submit-btn"
          disabled={!text.trim() && stagedFiles.length === 0}
          title="Send Message"
          style={{
            opacity: (!text.trim() && stagedFiles.length === 0) ? 0.45 : 1,
            cursor: (!text.trim() && stagedFiles.length === 0) ? 'not-allowed' : 'pointer'
          }}
        >
          ✈️
        </button>
      </form>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileExt(filename) {
  return filename.split('.').pop().toLowerCase();
}
