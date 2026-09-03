import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationController } from '../../../controllers/notificationController.js';
import {
  NOTIFICATION_CONFIG,
  formatRelativeTime,
} from '../../../models/notificationModel.js';
import NotificationToast from './NotificationToast.jsx';
import './Notifications.css';

/**
 * NotificationBell – Top-right notification bell icon and dropdown menu for student users.
 *
 * MVC Role: View
 */
export default function NotificationBell({ user }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const {
    notifications,
    unreadCount,
    isDropdownOpen,
    activeToast,
    loading,
    markAllRead,
    handleNotificationClick,
    toggleDropdown,
    closeDropdown,
    closeToast,
  } = useNotificationController(user);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        closeDropdown();
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isDropdownOpen, closeDropdown]);

  return (
    <div className="notif-bell-container" ref={dropdownRef}>
      {/* ── Bell Icon Button ────────────────────────────────────────── */}
      <button
        className={`notif-bell-btn ${isDropdownOpen ? 'active' : ''}`}
        onClick={toggleDropdown}
        title="Notifications"
        aria-label="Student Notifications"
        aria-expanded={isDropdownOpen}
      >
        <span className="notif-bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ─────────────────────────────────────────── */}
      {isDropdownOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <div className="notif-header-title">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="notif-unread-tag">{unreadCount} new</span>
              )}
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                className="notif-mark-all-btn"
                onClick={markAllRead}
                title="Mark all as read"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <div className="notif-empty-icon">🔕</div>
                <p className="notif-empty-text">No notifications yet</p>
              </div>
            ) : (
              notifications.map((item) => {
                const config = NOTIFICATION_CONFIG[item.type] || {
                  icon: '📌',
                  label: 'Notification',
                  accentColor: '#3b82f6',
                  bgColor: 'rgba(59, 130, 246, 0.12)',
                };

                return (
                  <div
                    key={item.id}
                    className={`notif-item ${!item.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(item, navigate)}
                  >
                    <div
                      className="notif-icon-box"
                      style={{
                        background: config.bgColor,
                        color: config.accentColor,
                      }}
                    >
                      {config.icon}
                    </div>

                    <div className="notif-content">
                      <div className="notif-title-row">
                        <span className="notif-item-title">
                          {item.title || config.label}
                        </span>
                        <span className="notif-time">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="notif-item-desc">{item.payload}</p>
                    </div>

                    {!item.isRead && <span className="notif-unread-dot" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Real-Time Floating Toast Alert ─────────────────────────── */}
      <NotificationToast toast={activeToast} onClose={closeToast} />
    </div>
  );
}
