/**
 * courseChatModel.js – Model layer for the Real-Time Course Chat feature.
 *
 * MVC Role: Model
 *
 * Defines all static constants, URL builders, and initial state shapes
 * used by the useChatController hook and CourseChatPanel view.
 * No JSX, no hooks, no side effects — pure data definitions.
 *
 * Feature: Real-Time Course Chat via WebSockets
 */

/* ── WebSocket / STOMP configuration ─────────────────────────────── */

/** SockJS endpoint exposed by the Spring Boot backend on Render. */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
export const CHAT_WS_URL = `${API_BASE}/ws`

/** Application prefix for client → server messages. */
export const CHAT_APP_PREFIX = '/app'

/** STOMP destination for sending a new message. */
export const CHAT_SEND_DEST = '/app/chat.sendMessage'

/** STOMP destination for requesting history. */
export const CHAT_HISTORY_DEST = '/app/chat.history'

/** Topic prefix for incoming broadcast messages. */
export const CHAT_TOPIC_PREFIX = '/topic/course'

/* ── Destination builders ─────────────────────────────────────────── */

/**
 * Builds the STOMP topic a client subscribes to for real-time messages
 * in a given course sub-channel.
 *
 * @param {string} courseId     e.g. "cse470"
 * @param {string} subChannelId e.g. "general"
 * @returns {string} e.g. "/topic/course.cse470.general"
 */
export function buildTopicDestination(courseId, subChannelId) {
  return `${CHAT_TOPIC_PREFIX}.${courseId}.${subChannelId}`
}

/**
 * Builds the history topic the client subscribes to ONCE per sub-channel
 * to receive the initial load of persisted messages.
 *
 * @param {string} courseId
 * @param {string} subChannelId
 * @returns {string} e.g. "/topic/course.cse470.general.history"
 */
export function buildHistoryTopicDestination(courseId, subChannelId) {
  return `${CHAT_TOPIC_PREFIX}.${courseId}.${subChannelId}.history`
}

/**
 * Derives a courseId string from a channel object's courseCode.
 * Lowercases and replaces spaces/slashes with underscores.
 *
 * @param {string} courseCode e.g. "CSE 470" or "CSE/470"
 * @returns {string}          e.g. "cse_470"
 */
export function deriveCourseId(courseCode) {
  return courseCode.toLowerCase().replace(/[\s/]+/g, '_')
}

/* ── Initial / empty state shapes ────────────────────────────────── */

/**
 * Empty state returned by useChatController before connection.
 */
export const INITIAL_CHAT_STATE = {
  messages:  [],
  connected: false,
  error:     null,
}

/**
 * Shape of a single chat message as used by the frontend.
 *
 * @typedef {Object} ChatMessage
 * @property {number|string} id          - Server-assigned id or local temp id
 * @property {string}        courseId
 * @property {string}        subChannelId
 * @property {string}        authorId
 * @property {string}        authorName
 * @property {string}        authorRole  - "STUDENT" | "FACULTY"
 * @property {string}        content
 * @property {string}        createdAt   - ISO-8601 string
 */
