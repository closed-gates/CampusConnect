/**
 * FrozenAccountDialog.jsx – Full-screen overlay shown when admin freezes the active user''s account.
 *
 * MVC Role: View (shared component)
 * Triggered by: useFreezeWatcher (real-time WebSocket push from admin action)
 */

import { useEffect, useState } from "react"
import "./FrozenAccountDialog.css"

const COUNTDOWN_SECONDS = 10

export default function FrozenAccountDialog({ message, onClose }) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS)

  // Auto-dismiss countdown
  useEffect(() => {
    if (!message) return
    setSecondsLeft(COUNTDOWN_SECONDS)
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [message, onClose])

  if (!message) return null

  const progress = (secondsLeft / COUNTDOWN_SECONDS) * 100

  return (
    <div className="frozen-dialog-backdrop" role="presentation">
      <div
        className="frozen-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="frozen-dialog-title"
        aria-describedby="frozen-dialog-body"
      >
        {/* Animated ice icon */}
        <div className="frozen-dialog-icon" aria-hidden="true">🧊</div>

        <h2 id="frozen-dialog-title" className="frozen-dialog-title">Account Frozen</h2>

        <p id="frozen-dialog-body" className="frozen-dialog-body">{message}</p>

        <p className="frozen-dialog-contact">
          If you believe this is an error, please contact your administrator.
        </p>

        {/* Countdown progress bar */}
        <div className="frozen-dialog-progress-wrap" aria-label={`Signing out in ${secondsLeft} seconds`}>
          <div className="frozen-dialog-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="frozen-dialog-countdown">
          Signing out in <strong>{secondsLeft}</strong>s
        </p>

        <button
          type="button"
          className="frozen-dialog-btn"
          onClick={onClose}
          autoFocus
        >
          Sign out now
        </button>
      </div>
    </div>
  )
}
