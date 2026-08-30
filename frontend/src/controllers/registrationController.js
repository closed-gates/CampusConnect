/**
 * registrationController.js – Controller layer for Course Registration.
 *
 * MVC Role: Controller
 *
 * Exports:
 *   useRegistrationController() — single hook consumed by the registration
 *   section inside AdvisingView (StudentPanel only)
 *
 * Seat update strategy:
 *   - Optimistic UI update on register/drop for instant feedback
 *   - After backend commit, re-fetch the full sections list (authoritative DB)
 *   - WebSocket broadcasts from /topic/seats/{sectionId} also update counts
 *     for ALL connected tabs in real time
 *
 * Sort: single "Section Order" dropdown — A→Z (asc) or Z→A (desc) by section number
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Client } from '@stomp/stompjs'
import {
  CURRENT_TERM,
  getStatusConfig,
} from '../models/registrationModel.js'
import { channelService } from '../services/channelService.js'

const API_BASE   = '/api/registration'
const STUDENT_ID = 'STU001'   // Phase 1: hardcoded; Phase 3: read from JWT

/** Sort sections by the selected order */
function sortSections(sections, order) {
  return [...sections].sort((a, b) => {
    if (order === 'num-asc' || order === 'num-desc') {
      // Numerical sort: compare by course code first, then section number as int
      const codeComp = (a.code ?? '').localeCompare(b.code ?? '')
      if (codeComp !== 0) return order === 'num-desc' ? -codeComp : codeComp
      const numA = parseInt(a.section ?? '0', 10)
      const numB = parseInt(b.section ?? '0', 10)
      return order === 'num-desc' ? numB - numA : numA - numB
    }
    // Alphabetical sort (asc / desc)
    const cmp = (a.code ?? '').localeCompare(b.code ?? '') ||
                (a.section ?? '').localeCompare(b.section ?? '')
    return order === 'desc' ? -cmp : cmp
  })
}

export function useRegistrationController() {

  const [sections,        setSections]        = useState([])
  const [myRegistrations, setMyRegistrations] = useState([])
  const [windowStatus,    setWindowStatus]    = useState(null)
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState(null)
  const [toast,           setToast]           = useState(null)
  const [toastType,       setToastType]       = useState('success')
  const [filterCode,      setFilterCode]      = useState('')
  const [sectionOrder,    setSectionOrder]    = useState('asc')   // 'asc' | 'desc'
  const [wsConnected,     setWsConnected]     = useState(false)

  const stompClientRef   = useRef(null)
  const subscriptionsRef = useRef({})
  const reconnectDelay   = useRef(1000)

  /* ── REST: fetch all sections + my registrations + window ─── */
  const fetchAll = useCallback(async () => {
    try {
      const [secRes, myRes, winRes] = await Promise.all([
        fetch(`${API_BASE}/sections?studentId=${STUDENT_ID}`),
        fetch(`${API_BASE}/my?studentId=${STUDENT_ID}`),
        fetch(`${API_BASE}/window/${STUDENT_ID}`),
      ])
      if (!secRes.ok) throw new Error(`API ${secRes.status}`)
      const [secData, myData, winData] = await Promise.all([
        secRes.json(),
        myRes.json().catch(() => []),
        winRes.json().catch(() => null),
      ])
      // Always replace with authoritative DB data
      setSections(secData)
      setMyRegistrations(myData)
      setWindowStatus(winData)
    } catch (e) {
      setError('Could not load sections. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  /* ── Fetch only the seat counts (fast refresh after change) ── */
  const refreshSeats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/sections?studentId=${STUDENT_ID}`)
      if (!res.ok) return
      const data = await res.json()
      setSections(data)
      const myRes = await fetch(`${API_BASE}/my?studentId=${STUDENT_ID}`)
      if (myRes.ok) setMyRegistrations(await myRes.json())
    } catch { /* silent */ }
  }, [])

  /* ── WebSocket: connect ──────────────────────────────────── */
  const connectWs = useCallback(() => {
    if (stompClientRef.current?.connected) return

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const brokerURL  = `${wsProtocol}//${window.location.host}/ws/websocket`

    const client = new Client({
      brokerURL,
      reconnectDelay: 0,

      onConnect: () => {
        setWsConnected(true)
        reconnectDelay.current = 1000
      },

      onDisconnect: () => {
        setWsConnected(false)
        setTimeout(() => {
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 16000)
          connectWs()
        }, reconnectDelay.current)
      },

      onStompError: () => setWsConnected(false),
    })

    client.activate()
    stompClientRef.current = client
  }, [])

  /* ── Subscribe to /topic/seats/{sectionId} for each section ─ */
  const subscribeToAll = useCallback((sectionList) => {
    const client = stompClientRef.current
    if (!client?.connected) return

    const ids = new Set(sectionList.map(s => s.id))

    ids.forEach(id => {
      if (subscriptionsRef.current[id]) return
      subscriptionsRef.current[id] = client.subscribe(
        `/topic/seats/${id}`,
        (msg) => {
          try {
            const p = JSON.parse(msg.body)
            // Update seat counts for this section from the authoritative DB broadcast
            setSections(prev => prev.map(s =>
              s.id === p.sectionId
                ? { ...s, seatsRemaining: p.seatsRemaining, booked: p.booked, totalSeats: p.totalSeats }
                : s
            ))
          } catch { /* ignore */ }
        }
      )
    })

    // Unsubscribe from sections no longer visible
    Object.keys(subscriptionsRef.current).forEach(id => {
      if (!ids.has(id)) {
        subscriptionsRef.current[id].unsubscribe()
        delete subscriptionsRef.current[id]
      }
    })
  }, [])

  /* ── Re-subscribe whenever sections list changes ─────────── */
  useEffect(() => {
    if (wsConnected && sections.length > 0) {
      subscribeToAll(sections)
    }
  }, [wsConnected, sections.length, subscribeToAll])

  /* ── Mount ────────────────────────────────────────────────── */
  useEffect(() => {
    setLoading(true)
    fetchAll()
    connectWs()
    return () => {
      stompClientRef.current?.deactivate()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Toast helper ────────────────────────────────────────── */
  const showToast = useCallback((msg, type = 'success') => {
    setToast(msg)
    setToastType(type)
    setTimeout(() => setToast(null), 4500)
  }, [])

  /* ── Register ────────────────────────────────────────────── */
  const handleRegister = useCallback(async (sectionId) => {
    // 1. Optimistic: immediately show -1 seat
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, seatsRemaining: Math.max(0, (s.seatsRemaining ?? 0) - 1), registeredByStudent: true }
        : s
    ))

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ studentId: STUDENT_ID, sectionId }),
      })
      const data = await res.json()

      if (data.success) {
        const sec = sections.find(s => s.id === sectionId)
        if (sec) {
          channelService.onEnrollment({
            userId: 'usr_eusha_001',
            course: {
              code: sec.courseCode || sec.code || `SEC-${sectionId}`,
              name: sec.courseTitle || sec.name || sec.title || `Section ${sectionId}`
            }
          })
        }
        showToast(`✅ ${data.message}`, 'success')
      } else {
        // Roll back optimistic update
        setSections(prev => prev.map(s =>
          s.id === sectionId
            ? { ...s, seatsRemaining: (s.seatsRemaining ?? 0) + 1, registeredByStudent: false }
            : s
        ))
        showToast((res.status === 409 ? '🚫 ' : '⚠️ ') + data.message,
                  res.status === 409 ? 'error' : 'warning')
      }
    } catch {
      setSections(prev => prev.map(s =>
        s.id === sectionId
          ? { ...s, seatsRemaining: (s.seatsRemaining ?? 0) + 1, registeredByStudent: false }
          : s
      ))
      showToast('⚠️ Network error. Could not register.', 'error')
    }

    // 2. Always re-fetch authoritative state from DB after the action
    await refreshSeats()
  }, [showToast, refreshSeats])

  /* ── Drop ─────────────────────────────────────────────────── */
  const handleDrop = useCallback(async (sectionId) => {
    // 1. Optimistic: immediately show +1 seat
    setSections(prev => prev.map(s =>
      s.id === sectionId
        ? { ...s, seatsRemaining: (s.seatsRemaining ?? 0) + 1, registeredByStudent: false }
        : s
    ))
    setMyRegistrations(prev => prev.filter(r => r.id !== sectionId))

    try {
      const res = await fetch(`${API_BASE}/drop/${STUDENT_ID}/${sectionId}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        showToast(`✅ ${data.message}`, 'success')
      } else {
        showToast('⚠️ ' + data.message, 'error')
      }
    } catch {
      showToast('⚠️ Network error. Could not drop.', 'error')
    }

    // 2. Always re-fetch authoritative state from DB after the action
    await refreshSeats()
  }, [showToast, refreshSeats])

  /* ── Derived: filtered + sorted sections ─────────────────── */
  const displayedSections = useMemo(() => {
    let result = [...sections]
    if (filterCode.trim()) {
      const q = filterCode.toLowerCase()
      result = result.filter(s =>
        s.code?.toLowerCase().includes(q)    ||
        s.title?.toLowerCase().includes(q)   ||
        s.faculty?.toLowerCase().includes(q) ||
        s.section?.toLowerCase().includes(q)
      )
    }
    return sortSections(result, sectionOrder)
  }, [sections, filterCode, sectionOrder])

  const registeredCredits = myRegistrations.length * 3

  return {
    sections: displayedSections,
    allSections: sections,
    myRegistrations,
    windowStatus,
    loading, error,
    wsConnected,
    filterCode, setFilterCode,
    sectionOrder, setSectionOrder,
    toast, toastType,
    registeredCredits,
    handleRegister,
    handleDrop,
    fetchAll,
    STUDENT_ID,
    CURRENT_TERM,
  }
}
