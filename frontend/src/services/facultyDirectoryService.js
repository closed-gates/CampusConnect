import apiClient from './apiClient.js'

/** Loads the Faculty and Staff Directory from the CampusConnect database API. */
export async function fetchFacultyDirectory() {
  const response = await apiClient.get('/api/faculty-directory')
  if (!response.ok) throw new Error(`Directory request failed with status ${response.status}`)
  return response.json()
}
