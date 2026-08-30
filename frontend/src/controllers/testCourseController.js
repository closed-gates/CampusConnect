/**
 * testCourseController.js – Controller hook for browsing Test Courses and Sections.
 *
 * MVC Role: Controller
 * Custom React hook managing state, search filters, and API fetching.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { testCourseService } from '../services/testCourseService.js'

export function useTestCoursesController() {
  const [courses, setCourses]     = useState([])
  const [faculty, setFaculty]     = useState([])
  const [sections, setSections]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('All Departments')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [coursesData, facultyData, sectionsData] = await Promise.all([
        testCourseService.getCourses(),
        testCourseService.getFaculty(),
        testCourseService.getSections()
      ])
      setCourses(coursesData || [])
      setFaculty(facultyData || [])
      setSections(sectionsData || [])
    } catch (err) {
      setError(err.message || 'Failed to load test courses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredCourses = useMemo(() => {
    let result = [...courses]
    if (selectedDept && selectedDept !== 'All Departments') {
      result = result.filter(c => c.department?.toLowerCase() === selectedDept.toLowerCase())
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.code?.toLowerCase().includes(q) ||
        c.name?.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q)
      )
    }
    return result
  }, [courses, selectedDept, searchQuery])

  return {
    courses: filteredCourses,
    totalCourses: courses.length,
    faculty,
    sections,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedDept,
    setSelectedDept,
    refetch: fetchData
  }
}
