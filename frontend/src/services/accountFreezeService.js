import apiClient from './apiClient.js'

async function readJson(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `Account freeze request failed (${res.status})`)
  return data
}

export const accountFreezeService = {
  async list() {
    return readJson(await apiClient.get('/api/admin/account-freezes'))
  },
  async setFrozen(userId, frozen) {
    return readJson(await apiClient.put(`/api/admin/account-freezes/${encodeURIComponent(userId)}`, { frozen }))
  },
}
