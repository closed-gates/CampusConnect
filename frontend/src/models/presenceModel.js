/**
 * presenceModel.js – Model layer for the Presence Indicator system.
 *
 * MVC Role: Model
 *
 * Pure constants and helpers — no JSX, no hooks, no side effects.
 *
 * Feature: Online/Offline Presence Indicators
 */

/* ── STOMP destinations ───────────────────────────────────────────── */

/** Notify backend that this user is now online. */
export const PRESENCE_CONNECT_DEST    = '/app/presence.connect'

/** Silent heartbeat — keeps the TTL alive every 25 seconds. */
export const PRESENCE_HEARTBEAT_DEST  = '/app/presence.heartbeat'

/** Notify backend that this user is going offline (explicit). */
export const PRESENCE_DISCONNECT_DEST = '/app/presence.disconnect'

/** Topic the client subscribes to for all presence delta events. */
export const PRESENCE_TOPIC           = '/topic/presence'

/* ── Timing ───────────────────────────────────────────────────────── */

/**
 * Heartbeat interval in milliseconds.
 * Must be shorter than the backend TTL (60s). 25s gives comfortable margin.
 */
export const HEARTBEAT_INTERVAL_MS = 25_000

/* ── Status constants ─────────────────────────────────────────────── */

export const STATUS_ONLINE  = 'ONLINE'
export const STATUS_OFFLINE = 'OFFLINE'

/* ── Color helpers (matches existing getPresenceColor in dmUtils.js) ── */

/** Returns the CSS color for a given online state. */
export function presenceColor(isOnline) {
  return isOnline ? '#10b981' : '#94a3b8'
}

/** Returns the human-readable label for a given online state. */
export function presenceLabel(isOnline) {
  return isOnline ? 'Online' : 'Offline'
}
