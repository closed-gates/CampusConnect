import { useState, useEffect, useRef } from "react";
import { channelService } from "../../../services/channelService.js";
import { CURRENT_USER } from "../../../models/messagingModel.js";
import "./CourseChannelView.css";

function getAvatarColor(id) {
  const palette = ["#1A9882","#3B82F6","#8B5CF6","#EC4899","#F59E0B","#EF4444","#10B981"];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % palette.length;
  return palette[Math.abs(h)];
}

function initials(name) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.floor((today - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function CourseChannelView({ channel }) {
  const subChannels = channelService.getSubChannels(channel.id);
  const members     = channelService.getMembers(channel.id);

  const [activeSubId, setActiveSubId] = useState(subChannels[0]?.id || "general");
  const [messages, setMessages]       = useState([]);
  const [inputVal, setInputVal]       = useState("");
  const messagesEndRef                = useRef(null);

  const activeSub = subChannels.find(s => s.id === activeSubId) || subChannels[0];

  useEffect(() => {
    const msgs = channelService.getSubChannelMessages(channel.id, activeSubId);
    setMessages([...msgs]);
  }, [channel.id, activeSubId]);

  useEffect(() => {
    const unsub = channelService.subscribe(({ event, payload }) => {
      if (event === "SUB_CHANNEL_MESSAGE" && payload.channelId === channel.id && payload.subId === activeSubId) {
        setMessages(prev => [...prev, payload.message]);
      }
    });
    return () => unsub();
  }, [channel.id, activeSubId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const content = inputVal.trim();
    if (!content || activeSub?.readOnly) return;
    channelService.sendSubChannelMessage(channel.id, activeSubId, {
      id: `msg_${Date.now()}`,
      authorId: CURRENT_USER.id,
      authorName: CURRENT_USER.displayName,
      authorRole: CURRENT_USER.role,
      content,
      createdAt: new Date().toISOString(),
    });
    setInputVal("");
  }

  const grouped = messages.reduce((acc, msg) => {
    const date = formatDate(msg.createdAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  const categories = [...new Set(subChannels.map(s => s.category))];

  return (
    <div className="cc-channel-root">
      {/* Sub-channel sidebar */}
      <aside className="cc-sub-sidebar">
        <div className="cc-course-header">
          <div className="cc-course-header-top">
            <div className="cc-course-emoji">
              📚
            </div>
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
                  className={`cc-sub-item${activeSubId === sub.id ? " active" : ""}`}
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
        </div>

        <div className="cc-messages">
          <div className="cc-welcome-banner">
            <div className="cc-welcome-icon">#</div>
            <div className="cc-welcome-title">Welcome to #{activeSub?.name}</div>
            <div className="cc-welcome-desc">{activeSub?.description}</div>
          </div>

          {Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              <div className="cc-date-divider">{date}</div>
              {msgs.map(msg => (
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
                        {msg.authorRole === "FACULTY" ? "Instructor" : "Student"}
                      </span>
                      <span className="cc-msg-time">{formatTime(msg.createdAt)}</span>
                    </div>
                    <div className="cc-msg-content">{msg.content}</div>
                    {msg.attachments?.map(att => (
                      <div key={att.name} className="cc-msg-attachment">
                        <span className="cc-attach-icon">📄</span>
                        <div>
                          <div className="cc-attach-name">{att.name}</div>
                          <div className="cc-attach-size">{att.size}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="cc-input-area">
          {activeSub?.readOnly ? (
            <div className="cc-read-only-notice">
              📌 This channel is for instructor announcements only.
            </div>
          ) : (
            <div className="cc-input-box">
              <input
                className="cc-input-field"
                placeholder={`Message #${activeSub?.name}…`}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              />
              {activeSubId === "resources" && (
                <label style={{ cursor: "pointer", color: "#8b949e", fontSize: 18, lineHeight: 1, display: "flex", alignItems: "center" }} title="Upload file">
                  📎
                  <input
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    onChange={e => {
                      const files = Array.from(e.target.files);
                      if (!files.length) return;
                      files.forEach(file => {
                        channelService.sendSubChannelMessage(channel.id, activeSubId, {
                          id: `msg_${Date.now()}_${file.name}`,
                          authorId: CURRENT_USER.id,
                          authorName: CURRENT_USER.displayName,
                          authorRole: CURRENT_USER.role,
                          content: `Uploaded: ${file.name}`,
                          createdAt: new Date().toISOString(),
                          attachments: [{ name: file.name, type: file.name.split(".").pop(), size: (file.size / 1024).toFixed(1) + " KB" }],
                        });
                      });
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
              <button className="cc-input-btn" onClick={handleSend} disabled={!inputVal.trim()}>
                ↑
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
