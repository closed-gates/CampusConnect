/**
 * notificationController.js – Controller layer for in-app student notifications.
 *
 * MVC Role: Controller (custom React hook)
 *
 * Manages:
 *   - Initial fetch from GET /api/notifications
 *   - Real-time WebSocket delivery via STOMP (/topic/notifications.{userId})
 *   - Dynamic unread count tracking
 *   - Mark as read & Mark all as read
 *   - Floating toast alert queue for incoming notifications
 *   - Click-to-redirect handling
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Client as StompClient } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getCurrentUser } from '../models/messagingModel.js';
import { CHAT_WS_URL } from '../models/courseChatModel.js';
import apiClient from '../services/apiClient.js';
import {
  loadPreferences,
  PREFERENCE_CHANGE_EVENT,
} from '../models/accountSettingsModel.js';

const API_NOTIFICATIONS = '/api/notifications';

/**
 * useNotificationController
 *
 * @param {object} [user] - The logged-in student user
 * @returns {object} State & handlers for notifications
 */
export function useNotificationController(user = getCurrentUser()) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const stompRef = useRef(null);
  const toastTimerRef = useRef(null);
  const notificationsMutedRef = useRef(loadPreferences().notificationsMuted);
  const userId = user?.id || user?.userId;

  // ── Initial Fetch ───────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await apiClient.get(API_NOTIFICATIONS);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setNotifications(json.data);
          setUnreadCount(typeof json.unreadCount === 'number' ? json.unreadCount : 0);
        }
      }
    } catch (err) {
      console.warn('[notificationController] Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Keep the real-time toast behavior synchronized with Account Settings.
  useEffect(() => {
    const syncPreferences = (event) => {
      const muted = event?.detail?.notificationsMuted ?? loadPreferences().notificationsMuted;
      notificationsMutedRef.current = muted;
      if (muted) {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setActiveToast(null);
      }
    };
    window.addEventListener(PREFERENCE_CHANGE_EVENT, syncPreferences);
    window.addEventListener('storage', syncPreferences);
    return () => {
      window.removeEventListener(PREFERENCE_CHANGE_EVENT, syncPreferences);
      window.removeEventListener('storage', syncPreferences);
    };
  }, []);

  // ── Real-Time STOMP WebSocket Connection ────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    // Only students receive in-app student notifications
    const role = (user?.role || 'STUDENT').toUpperCase();
    if (role !== 'STUDENT') return;

    const client = new StompClient({
      webSocketFactory: () => new SockJS(CHAT_WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,
      debug: () => {}, // silent
    });

    const handleIncomingFrame = (bodyStr) => {
      try {
        const frameData = JSON.parse(bodyStr);
        // Expecting { event: 'new_notification', payload: NotificationDto } or direct NotificationDto
        const item = frameData?.payload || frameData;
        if (!item || !item.id) return;

        // Add to state if not duplicate
        setNotifications((prev) => {
          if (prev.some((n) => n.id === item.id)) return prev;
          return [item, ...prev];
        });

        // Increment unread count
        setUnreadCount((c) => c + 1);

        // Muting suppresses only the pop-up; the bell list and unread count remain active.
        if (!notificationsMutedRef.current) {
          setActiveToast(item);
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          toastTimerRef.current = setTimeout(() => {
            setActiveToast(null);
          }, 5000);
        }
      } catch (e) {
        console.warn('[notificationController] Parse error on incoming notification:', e);
      }
    };

    client.onConnect = () => {
      // Subscribe to user-specific notification topic
      client.subscribe(`/topic/notifications.${userId}`, (frame) => {
        handleIncomingFrame(frame.body);
      });
      // Fallback user topic
      client.subscribe(`/topic/user-${userId}`, (frame) => {
        handleIncomingFrame(frame.body);
      });
    };

    client.activate();
    stompRef.current = client;

    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (stompRef.current) {
        stompRef.current.deactivate();
        stompRef.current = null;
      }
    };
  }, [userId, user?.role]);

  // ── Actions & Handlers ──────────────────────────────────────────────────────

  const markAsRead = async (id) => {
    if (!id) return;
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      await apiClient.put(`${API_NOTIFICATIONS}/${id}/read`, {});
    } catch (err) {
      console.warn('[notificationController] Error marking as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await apiClient.put(`${API_NOTIFICATIONS}/read-all`, {});
    } catch (err) {
      console.warn('[notificationController] Error marking all as read:', err);
    }
  };

  const handleNotificationClick = (item, navigate) => {
    if (!item) return;
    if (!item.isRead) {
      markAsRead(item.id);
    }
    setIsDropdownOpen(false);
    if (item.link && typeof navigate === 'function') {
      navigate(item.link);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const closeToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setActiveToast(null);
  };

  return {
    notifications,
    unreadCount,
    isDropdownOpen,
    activeToast,
    loading,
    markAsRead,
    markAllRead,
    handleNotificationClick,
    toggleDropdown,
    closeDropdown,
    closeToast,
    refresh: fetchNotifications,
  };
}
