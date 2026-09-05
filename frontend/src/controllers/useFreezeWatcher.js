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
import { subscribeToFreezeEvents } from "../services/freezeWatcherService.js"

export function useFreezeWatcher() {
  const [freezeMessage, setFreezeMessage] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const user = getStoredUser()
    if (!user?.userId) return

    const unsubscribe = subscribeToFreezeEvents(user.userId, (payload) => {
      if (payload.frozen) {
        // Show the freeze dialog immediately
        setFreezeMessage(
          payload.message || "Your account has been frozen by an administrator."
        )
      }
      // If unfrozen while session was already valid – silently ignore
      // (the user will see normal access restored on next interaction)
    })

    return () => unsubscribe()
  }, [])

  const handleFreezeAcknowledge = useCallback(() => {
    setFreezeMessage(null)
    clearAuth()
    navigate("/", { replace: true })
  }, [navigate])

  return { freezeMessage, handleFreezeAcknowledge }
}
