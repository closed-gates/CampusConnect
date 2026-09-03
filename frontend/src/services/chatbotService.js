/**
 * chatbotService.js – Service layer for the AI chatbot assistant.
 *
 * MVC Role: Service
 *
 * Handles all HTTP communication with the backend AI chat endpoint.
 * The Anthropic API key is NEVER present here — it stays server-side.
 */

import { getStoredToken } from '../models/authModel.js'

const BASE_URL = '/api/ai'

/**
 * Send a message to the AI chatbot backend.
 *
 * @param {string} message - The user's current message
 * @param {Array<{role: string, content: string}>} history - Recent conversation turns
 * @returns {Promise<{ reply: string, topic: string, fallback: boolean }>}
 */
export async function sendChatMessage(message, history = []) {
  const token = getStoredToken()
  const response = await fetch(`${BASE_URL}/chat`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message, history }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Chat API error ${response.status}: ${text}`)
  }

  return response.json()
}
