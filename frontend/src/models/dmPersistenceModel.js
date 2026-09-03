/**
 * dmPersistenceModel.js - Model layer: DM persistence via localStorage.
 *
 * MVC Role: Model
 *
 * Storage strategy:
 *   - Conversations  -> keyed per USER  (cc_dm_conversations_{userId})
 *   - Messages       -> keyed per ROOM  (cc_dm_room_{roomId})  [shared between both parties]
 *   - Active conv    -> keyed per USER  (cc_dm_activeConvId_{userId})
 *
 * v2: Adds room-ID validation + migration so old corrupted IDs are repaired on load.
 */

const VERSION_KEY = 'cc_dm_version'
const DM_VERSION  = '2'

const CONV_KEY   = (userId) => `cc_dm_conversations_${userId}`
const MSG_KEY    = (roomId) => `cc_dm_room_${roomId}`
const ACTIVE_KEY = (userId) => `cc_dm_activeConvId_${userId}`

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Compute the correct deterministic room ID for any two user IDs. */
function computeExpectedRoomId(userA, userB) {
  if (!userA || !userB) return null
  const minId = userA < userB ? userA : userB
  const maxId = userA > userB ? userA : userB
  return `dm_${minId}_${maxId}`
}

/** Read raw messages for a room (any key, for migration). */
function readRoomRaw(roomId) {
  try {
    const raw = localStorage.getItem(MSG_KEY(roomId))
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

/** Write raw messages for a room. */
function writeRoomRaw(roomId, messages) {
  try {
    localStorage.setItem(MSG_KEY(roomId), JSON.stringify(messages))
  } catch { /* ignore quota */ }
}

// ---------------------------------------------------------------------------
// One-time data migration
// ---------------------------------------------------------------------------

/**
 * migrateUserData(userId)
 *
 * Runs once per userId per browser session.  Reads the stored conversation
 * list, computes the *correct* room ID for each entry, migrates messages from
 * any old/wrong room key to the correct one, deduplicates, and re-saves.
 *
 * Marks itself done via a version flag so it only runs once.
 */
function migrateUserData(userId) {
  const versionFlag = `${VERSION_KEY}_${userId}`
  if (localStorage.getItem(versionFlag) === DM_VERSION) return  // already done

  try {
    const raw = localStorage.getItem(CONV_KEY(userId))
    const list = raw ? JSON.parse(raw) : []
    if (!Array.isArray(list) || list.length === 0) {
      localStorage.setItem(versionFlag, DM_VERSION)
      return
    }

    const seenCorrectIds = new Set()
    const migrated = []

    for (const conv of list) {
      if (!conv || !conv.recipient?.id) continue
      if (conv.recipient.id === userId) continue  // self-conv, skip

      const correctId = computeExpectedRoomId(userId, conv.recipient.id)
      if (!correctId || seenCorrectIds.has(correctId)) continue  // duplicate, skip
      seenCorrectIds.add(correctId)

      // If the stored ID differs, migrate messages from the old room key
      if (conv.id && conv.id !== correctId) {
        const oldMsgs = readRoomRaw(conv.id)
        if (oldMsgs.length > 0) {
          const existingMsgs = readRoomRaw(correctId)
          // Merge: add old messages that aren't already in the correct room
          const existingIds = new Set(existingMsgs.map(m => m.id))
          const newMsgs = [...existingMsgs, ...oldMsgs.filter(m => m.id && !existingIds.has(m.id))]
          newMsgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          writeRoomRaw(correctId, newMsgs)
          // Remove old (incorrect) key to prevent future confusion
          try { localStorage.removeItem(MSG_KEY(conv.id)) } catch { }
        }
      }

      migrated.push({ ...conv, id: correctId })
    }

    // Persist the corrected conversation list
    localStorage.setItem(CONV_KEY(userId), JSON.stringify(migrated))
    localStorage.setItem(versionFlag, DM_VERSION)
  } catch (e) {
    console.warn('[dmPersistence] Migration error:', e)
    try { localStorage.setItem(VERSION_KEY + '_' + userId, DM_VERSION) } catch { }
  }
}

// ---------------------------------------------------------------------------
// Public API – Conversations
// ---------------------------------------------------------------------------

export function loadConversations(userId) {
  migrateUserData(userId)
  try {
    const raw = localStorage.getItem(CONV_KEY(userId))
    const list = raw ? JSON.parse(raw) : []
    if (!Array.isArray(list)) return []

    const seen = new Set()
    return list.filter(c => {
      if (!c || !c.recipient?.id || c.recipient.id === userId) return false
      const correctId = computeExpectedRoomId(userId, c.recipient.id)
      if (!correctId || seen.has(correctId)) return false
      seen.add(correctId)
      return true
    }).map(c => ({
      ...c,
      id: computeExpectedRoomId(userId, c.recipient.id)
    }))
  } catch {
    return []
  }
}

export function saveConversations(userId, conversations) {
  try {
    if (!userId || userId === 'guest') return
    const sanitized = (conversations || []).filter(c =>
      c && c.recipient?.id && c.recipient.id !== userId
    )
    localStorage.setItem(CONV_KEY(userId), JSON.stringify(sanitized))
  } catch (e) {
    console.warn('[dmPersistence] Could not save conversations:', e)
  }
}

// ---------------------------------------------------------------------------
// Public API – Messages (per-room, shared between participants)
// ---------------------------------------------------------------------------

export function loadMessagesMap(userId) {
  try {
    const conversations = loadConversations(userId)
    const map = {}
    for (const conv of conversations) {
      if (!conv.id) continue
      map[conv.id] = readRoomRaw(conv.id)
    }
    return map
  } catch {
    return {}
  }
}

export function saveMessagesMap(_userId, messagesMap) {
  try {
    if (!messagesMap) return
    for (const [roomId, messages] of Object.entries(messagesMap)) {
      if (roomId && Array.isArray(messages)) {
        writeRoomRaw(roomId, messages)
      }
    }
  } catch (e) {
    console.warn('[dmPersistence] Could not save messages:', e)
  }
}

export function loadRoomMessages(roomId) {
  if (!roomId) return []
  const msgs = readRoomRaw(roomId)
  // Ensure that messages in room dm_{userA}_{userB} strictly belong to userA or userB
  if (roomId.startsWith('dm_')) {
    const parts = roomId.split('_')
    if (parts.length >= 3) {
      const userA = parts[1]
      const userB = parts[2]
      return msgs.filter(m => m && (m.senderId === userA || m.senderId === userB))
    }
  }
  return msgs
}

// ---------------------------------------------------------------------------
// Public API – Bidirectional DM recorder
// ---------------------------------------------------------------------------

/**
 * recordDirectMessage(senderUser, recipientUser, message)
 *
 * Ensures BOTH participants have the conversation in their sidebar list
 * and appends the message to the shared per-room storage.
 */
export function recordDirectMessage(senderUser, recipientUser, message) {
  if (!senderUser?.id || !recipientUser?.id || !message?.conversationId) return
  if (senderUser.id === recipientUser.id) return  // cannot DM yourself

  const roomId = message.conversationId

  // 1. Append to shared room
  try {
    const msgs = readRoomRaw(roomId)
    if (!msgs.some(m => m.id === message.id)) {
      msgs.push(message)
      writeRoomRaw(roomId, msgs)
    }
  } catch (e) {
    console.warn('[dmPersistence] Error updating room messages:', e)
  }

  // 2. Update sender's conversation list (recipient = the other user)
  try {
    const senderList = loadConversations(senderUser.id)
    const updated = upsertConversation(senderList, {
      id: roomId,
      isGroup: false,
      recipient: { ...recipientUser },
      lastMessage: message,
      unreadCount: 0
    })
    saveConversations(senderUser.id, updated)
  } catch (e) {
    console.warn('[dmPersistence] Error updating sender conversations:', e)
  }

  // 3. Update recipient's conversation list (recipient = the sender!)
  try {
    const recipientList = loadConversations(recipientUser.id)
    const existing = recipientList.find(c => c.id === roomId)
    const updated = upsertConversation(recipientList, {
      id: roomId,
      isGroup: false,
      recipient: { ...senderUser },
      lastMessage: message,
      unreadCount: (existing?.unreadCount || 0) + 1
    })
    saveConversations(recipientUser.id, updated)
  } catch (e) {
    console.warn('[dmPersistence] Error updating recipient conversations:', e)
  }
}

function upsertConversation(list, newConv) {
  const filtered = (list || []).filter(c => c.id !== newConv.id)
  return [newConv, ...filtered]
}

// ---------------------------------------------------------------------------
// Public API – Active conversation
// ---------------------------------------------------------------------------

export function loadActiveConvId(userId) {
  try {
    const stored = localStorage.getItem(ACTIVE_KEY(userId))
    if (!stored) return null
    // Validate: the stored active ID must exist in the conversations list
    const convs = loadConversations(userId)
    if (convs.some(c => c.id === stored)) return stored
    return convs[0]?.id || null
  } catch {
    return null
  }
}

export function saveActiveConvId(userId, convId) {
  try {
    if (convId) {
      localStorage.setItem(ACTIVE_KEY(userId), convId)
    } else {
      localStorage.removeItem(ACTIVE_KEY(userId))
    }
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Public API – File -> base64 data URL
// ---------------------------------------------------------------------------

export function fileToDataURL(file) {
  return new Promise((resolve) => {
    if (!file) { resolve(''); return }
    const reader = new FileReader()
    reader.onload  = (e) => resolve(e.target.result)
    reader.onerror = ()  => resolve('')
    reader.readAsDataURL(file)
  })
}
