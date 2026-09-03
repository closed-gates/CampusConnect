import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NOTIFICATION_CONFIG } from '../../../models/notificationModel.js';
import './Notifications.css';

/**
 * NotificationToast – Floating real-time alert for incoming notifications.
 *
 * MVC Role: View
 */
export default function NotificationToast({ toast, onClose }) {
  const navigate = useNavigate();

  if (!toast) return null;

  const config = NOTIFICATION_CONFIG[toast.type] || {
    icon: '🔔',
    label: 'Notification',
    accentColor: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
  };

  const handleClick = (e) => {
    // Don't trigger if user clicked the close 'X'
    if (e.target.closest('.notif-toast-close')) return;
    onClose();
    if (toast.link) {
      navigate(toast.link);
    }
  };

  return (
    <aside className="notif-toast-portal" aria-label="Notification alert">
      <div className="notif-toast" onClick={handleClick} role="status">
        <div
          className="notif-icon-box"
          style={{ background: config.bgColor, color: config.accentColor }}
        >
          {config.icon}
        </div>

        <div className="notif-content">
          <div className="notif-title-row">
            <span className="notif-item-title">{toast.title || config.label}</span>
          </div>
          <p className="notif-item-desc">{toast.payload}</p>
        </div>

        <button
          className="notif-toast-close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          title="Dismiss alert"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </aside>
  );
}
