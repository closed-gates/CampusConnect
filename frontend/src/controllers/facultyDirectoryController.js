import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ALL_CATEGORIES, ALL_THESIS_STATUSES, THESIS_STATUS_OPTIONS,
  decorateDirectoryEntry, getCategoryOptions, groupDirectoryByCategory,
} from '../models/facultyDirectoryModel.js'
import { fetchFacultyDirectory } from '../services/facultyDirectoryService.js'

export function useFacultyDirectoryController() {
  const [people, setPeople] = useState([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL_CATEGORIES)
  const [thesisStatus, setThesisStatus] = useState(ALL_THESIS_STATUSES)
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadVersion, setReloadVersion] = useState(0)

  useEffect(() => {
    const abortController = new AbortController()
    fetchFacultyDirectory()
      .then(records => {
        if (!abortController.signal.aborted) setPeople(records.map(decorateDirectoryEntry))
      })
      .catch(() => {
        if (!abortController.signal.aborted) setError('The faculty directory could not be loaded. Please try again.')
      })
      .finally(() => {
        if (!abortController.signal.aborted) setLoading(false)
      })
    return () => abortController.abort()
  }, [reloadVersion])

  const filteredPeople = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return people.filter(person => {
      const searchable = [person.name, person.position, person.email, person.category,
        person.thesisStatus, person.thesisLevel].join(' ').toLowerCase()
      return (!needle || searchable.includes(needle))
        && (category === ALL_CATEGORIES || person.category === category)
        && (thesisStatus === ALL_THESIS_STATUSES || person.thesisStatus === thesisStatus)
    })
  }, [people, query, category, thesisStatus])

  const groups = useMemo(() => groupDirectoryByCategory(filteredPeople), [filteredPeople])
  const categories = useMemo(() => getCategoryOptions(people), [people])
  const clearFilters = useCallback(() => {
    setQuery('')
    setCategory(ALL_CATEGORIES)
    setThesisStatus(ALL_THESIS_STATUSES)
  }, [])
  const toggleDetails = useCallback(id => setExpandedId(current => current === id ? null : id), [])
  const retry = useCallback(() => {
    setLoading(true)
    setError('')
    setReloadVersion(version => version + 1)
  }, [])

  return {
    query, setQuery, category, setCategory, thesisStatus, setThesisStatus,
    expandedId, toggleDetails, groups, resultCount: filteredPeople.length,
    clearFilters, categories, thesisStatuses: THESIS_STATUS_OPTIONS, loading, error, retry,
  }
}
