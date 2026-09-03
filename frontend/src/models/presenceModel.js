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
 * Inactivity timeout in milliseconds (2 minutes).
 * Users with no interaction for 2 minutes are marked offline.
 */
export const INACTIVITY_TIMEOUT_MS = 120_000

/**
 * Heartbeat interval in milliseconds.
 * Heartbeat sent every 20 seconds while user is active.
 */
export const HEARTBEAT_INTERVAL_MS = 20_000

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
