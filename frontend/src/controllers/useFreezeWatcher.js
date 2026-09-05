/**
 * useFreezeWatcher.js – React hook that watches for real-time account freeze events.
 *
 * MVC Role: Controller (side-effect hook)
 *
 * Connects to the STOMP WebSocket topic /topic/account-frozen.{userId}.
 * When the backend pushes a freeze event:
 *   - Shows FrozenAccountDialog with the admin message
 *   - On dialog dismiss, clears auth and redirects to login
 *
 * Usage: mount inside ProtectedRoute so it only runs for logged-in users.
 */

import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getStoredUser, clearAuth } from "../models/authModel.js"
import { getCurrentFreezeState, subscribeToFreezeEvents } from "../services/freezeWatcherService.js"

const FREEZE_CHECK_INTERVAL_MS = 5000
const DEFAULT_FREEZE_MESSAGE = "Your account has been frozen by an administrator. You will be signed out."

export function useFreezeWatcher() {
  const [freezeMessage, setFreezeMessage] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const user = getStoredUser()
    if (!user?.userId) return

    let mounted = true
    const showFrozenState = (payload) => {
      if (payload.frozen) {
        setFreezeMessage(payload.message || DEFAULT_FREEZE_MESSAGE)
      }
    }
    const verifyCurrentState = async () => {
      try {
        const payload = await getCurrentFreezeState()
        if (mounted) showFrozenState(payload)
      } catch {
        // A transient check failure must not interrupt an otherwise valid session.
      }
    }
    const unsubscribe = subscribeToFreezeEvents(user.userId, showFrozenState, verifyCurrentState)
    verifyCurrentState()
    const interval = window.setInterval(verifyCurrentState, FREEZE_CHECK_INTERVAL_MS)

    return () => {
      mounted = false
      window.clearInterval(interval)
      unsubscribe()
    }
  }, [])

  const handleFreezeAcknowledge = useCallback(() => {
    setFreezeMessage(null)
    clearAuth()
    navigate("/", { replace: true })
  }, [navigate])

  return { freezeMessage, handleFreezeAcknowledge }
}
