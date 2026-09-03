/**
 * usePaymentController.js – Controller hook for the Payments feature.
 *
 * MVC Role: Controller
 * Manages state, API calls, database persistence of confirmed payments,
 * role-isolated payment history, PDF generation, and Leaflet bank queries.
 * (No JSX, no CSS).
 */

import { useState, useEffect, useCallback } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  ACCEPTING_BANKS,
  DHAKA_STUDENT_AREAS,
  DEFAULT_CAMPUS_LOCATION,
  matchAcceptingBank,
  formatCurrency,
  calculateDistance,
  VERIFIED_DHAKA_PARTNER_BRANCHES,
  geocodeBankWithNominatim
} from '../models/paymentModel.js'
import { getStoredUser } from '../models/authModel.js'
import apiClient from '../services/apiClient.js'

const API_BASE = '/api/payments'

export function usePaymentController() {
  const storedUser = getStoredUser()
  const role       = storedUser?.role?.toLowerCase() || localStorage.getItem('userRole') || 'student'
  const isAdmin    = role.toLowerCase() === 'admin'

  // Admin student selector: list of available student IDs; starts empty so nothing is shown until selected
  const [studentIds, setStudentIds]                 = useState([])
  const [studentIdsLoading, setStudentIdsLoading]   = useState(false)
  const [selectedStudentId, setSelectedStudentId]   = useState('')

  // Effective student ID: for admin it's selectedStudentId (can be empty); for students it's their own userId
  const effectiveStudentId = isAdmin ? selectedStudentId : (storedUser?.userId || 'STU001')
  const studentId = effectiveStudentId

  // Top Tabs: 'receipt' (Current Term Clearance) | 'history' (Payment Records in DB)
  const [activeViewTab, setActiveViewTab] = useState('receipt')

  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Payment History from Database
  const [paymentHistory, setPaymentHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyFilter, setHistoryFilter] = useState('') // For admin student filtering

  // Online Payment State (Stripe)
  const [payNowOpen, setPayNowOpen] = useState(false)
  const [cardComplete, setCardComplete] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const [transactionId, setTransactionId] = useState(null)
  const [receiptNumber, setReceiptNumber] = useState(null)
  const [paidAt, setPaidAt] = useState(null)

  // Admin Action States: Bypass, Edit, Delete
  const [bypassModalOpen, setBypassModalOpen]   = useState(false)
  const [bypassReason, setBypassReason]         = useState('Administrative Scholarship / Waiver')
  const [bypassSubmitting, setBypassSubmitting] = useState(false)

  const [editingRecord, setEditingRecord]       = useState(null)
  const [editSubmitting, setEditSubmitting]     = useState(false)

  const [deletingRecord, setDeletingRecord]     = useState(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  // Offline Payment & Map State
  const [mapVisible, setMapVisible] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [userLocationName, setUserLocationName] = useState('My Live Location')
  const [selectedStudentArea, setSelectedStudentArea] = useState('live')
  const [nearbyBanks, setNearbyBanks] = useState([])
  const [mapLoading, setMapLoading] = useState(false)
  const [mapError, setMapError] = useState(null)
  const [selectedBankFilter, setSelectedBankFilter] = useState('all')

  // Load student IDs for Admin selector on mount
  useEffect(() => {
    if (!isAdmin) return
    let active = true
    setStudentIdsLoading(true)
    apiClient.get(`${API_BASE}/students`)
      .then(async res => {
        if (res.ok && active) {
          const ids = await res.json()
          setStudentIds(Array.isArray(ids) ? ids : [])
        }
      })
      .catch(err => console.warn('Failed to load student IDs:', err))
      .finally(() => {
        if (active) setStudentIdsLoading(false)
      })
    return () => { active = false }
  }, [isAdmin])

  /**
   * Fetch student's course fee receipt from backend.
   */
  const fetchReceipt = useCallback(async () => {
    // If admin and no student selected yet, do not fetch
    if (isAdmin && !selectedStudentId) {
      setReceipt(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get(`${API_BASE}/receipt/${encodeURIComponent(effectiveStudentId)}`)
      if (!res.ok) {
        throw new Error(`Could not load fee receipt (${res.status})`)
      }
      const data = await res.json()
      setReceipt(data)
    } catch (err) {
      console.warn('Failed to load receipt from backend:', err)
      setError(err.message || 'Unable to load fee receipt.')
    } finally {
      setLoading(false)
    }
  }, [isAdmin, selectedStudentId, effectiveStudentId])

  /**
   * Fetch payment records from database (role-isolated: student vs admin).
   */
  const fetchPaymentHistory = useCallback(async () => {
    // If admin and no student selected yet, do not fetch
    if (isAdmin && !selectedStudentId) {
      setPaymentHistory([])
      setHistoryLoading(false)
      return
    }

    setHistoryLoading(true)
    try {
      const res = await apiClient.get(
        `${API_BASE}/history?studentId=${encodeURIComponent(effectiveStudentId)}&role=${encodeURIComponent(role)}`
      )
      if (res.ok) {
        const data = await res.json()
        const historyList = Array.isArray(data) ? data : []
        setPaymentHistory(historyList)

        // Check if any payment in history is for the current term and already paid/bypassed
        const currentPaid = historyList.find(
          p => (p.studentId === effectiveStudentId) &&
               (p.term === 'Fall2026' || p.term === 'Fall 2026') &&
               (p.paymentStatus === 'PAID' || p.paymentStatus === 'CONFIRMED' || p.paymentMethod === 'ADMIN_BYPASS')
        )
        if (currentPaid) {
          setPaymentSuccess(true)
          setReceiptNumber(currentPaid.receiptNumber)
          setTransactionId(currentPaid.transactionId)
          setPaidAt(currentPaid.paidAt ? new Date(currentPaid.paidAt).toLocaleString('en-GB') : null)
        } else {
          setPaymentSuccess(false)
        }
      }
    } catch (err) {
      console.warn('Failed to fetch payment history from DB:', err)
    } finally {
      setHistoryLoading(false)
    }
  }, [isAdmin, selectedStudentId, effectiveStudentId, role])

  useEffect(() => {
    fetchReceipt()
    fetchPaymentHistory()
  }, [fetchReceipt, fetchPaymentHistory])

  /**
   * Admin: Bypass current term payment for the selected student.
   */
  const handleBypassPayment = useCallback(async (customReason) => {
    if (!isAdmin || !effectiveStudentId) return
    setBypassSubmitting(true)
    try {
      const reasonToUse = customReason || bypassReason || 'Administrative Fee Waiver'
      const res = await apiClient.post(`${API_BASE}/bypass`, {
        studentId: effectiveStudentId,
        term: receipt?.term || 'Fall2026',
        reason: reasonToUse,
        bypassedBy: storedUser?.fullName || 'Administrator'
      })
      if (!res.ok) throw new Error(`Bypass failed (${res.status})`)
      const savedRecord = await res.json()
      setReceiptNumber(savedRecord.receiptNumber)
      setTransactionId(savedRecord.transactionId)
      setPaidAt(new Date().toLocaleString('en-GB'))
      setPaymentSuccess(true)
      setBypassModalOpen(false)
      fetchPaymentHistory()
      fetchReceipt()
    } catch (err) {
      console.error('Bypass payment failed:', err)
      alert(err.message || 'Failed to bypass payment.')
    } finally {
      setBypassSubmitting(false)
    }
  }, [isAdmin, effectiveStudentId, receipt, bypassReason, storedUser, fetchPaymentHistory, fetchReceipt])

  /**
   * Admin: Delete an existing payment record by ID from database.
   */
  const handleDeletePayment = useCallback(async (id) => {
    if (!isAdmin || !id) return
    setDeleteSubmitting(true)
    try {
      const res = await apiClient.delete(`${API_BASE}/${id}`)
      if (!res.ok) throw new Error(`Failed to delete record (${res.status})`)
      setPaymentHistory(prev => prev.filter(p => p.id !== id))
      setDeletingRecord(null)
      fetchReceipt()
    } catch (err) {
      console.error('Failed to delete payment record:', err)
      alert(err.message || 'Failed to delete payment record.')
    } finally {
      setDeleteSubmitting(false)
    }
  }, [isAdmin, fetchReceipt])

  /**
   * Admin: Edit an existing payment record in database.
   */
  const handleSaveEditPayment = useCallback(async (id, updatedFields) => {
    if (!isAdmin || !id) return
    setEditSubmitting(true)
    try {
      const res = await apiClient.put(`${API_BASE}/${id}`, updatedFields)
      if (!res.ok) throw new Error(`Failed to update record (${res.status})`)
      const updated = await res.json()
      setPaymentHistory(prev => prev.map(p => p.id === id ? updated : p))
      setEditingRecord(null)
      fetchReceipt()
    } catch (err) {
      console.error('Failed to update payment record:', err)
      alert(err.message || 'Failed to update payment record.')
    } finally {
      setEditSubmitting(false)
    }
  }, [isAdmin, fetchReceipt])

  /**
   * Fetch nearby banks using real OpenStreetMap Overpass data & Nominatim geocoder
   * (Zero fake offsets; all locations correspond to real physical branches in Dhaka)
   */
  const fetchNearbyBanks = useCallback(async (lat, lng, areaLabel = 'Student Neighborhood') => {
    setMapLoading(true)
    setMapError(null)
    try {
      const radius = 4500
      const query = `
        [out:json][timeout:15];
        (
          node["amenity"="bank"](around:${radius},${lat},${lng});
          way["amenity"="bank"](around:${radius},${lat},${lng});
        );
        out center;
      `
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      const res = await fetch(url)
      let parsedBanks = []

      if (res.ok) {
        const data = await res.json()
        const elements = data.elements || []
        parsedBanks = elements.map(el => {
          const itemLat = el.lat || (el.center && el.center.lat)
          const itemLng = el.lon || (el.center && el.center.lon)
          const name = el.tags?.name || el.tags?.['name:en'] || el.tags?.brand || 'Bank Branch'
          const matched = matchAcceptingBank(name)
          const distance = calculateDistance(lat, lng, itemLat, itemLng)

          return {
            id: String(el.id),
            name,
            lat: itemLat,
            lng: itemLng,
            distance: parseFloat(distance),
            isAccepting: !!matched,
            acceptingInfo: matched,
            address: el.tags?.['addr:street'] || el.tags?.['addr:full'] || `${name}, Dhaka`
          }
        })
      }

      // Add real partner bank branches closest to this area from verified dataset
      const matchedPartnerBranches = VERIFIED_DHAKA_PARTNER_BRANCHES.map(b => {
        const acceptingInfo = ACCEPTING_BANKS.find(ab => ab.id === b.bankId)
        const distance = parseFloat(calculateDistance(lat, lng, b.lat, b.lng))
        return {
          id: `verified_${b.bankId}_${b.area}`,
          name: b.name,
          lat: b.lat,
          lng: b.lng,
          distance,
          isAccepting: true,
          acceptingInfo,
          address: b.address
        }
      }).filter(b => b.distance <= 6.5) // Within 6.5 km radius

      // Combine Overpass real OSM nodes + verified real partner branches, deduplicating
      const combined = [...matchedPartnerBranches]
      const existingNames = new Set(matchedPartnerBranches.map(b => b.name.toLowerCase()))

      parsedBanks.forEach(bank => {
        const key = bank.name.toLowerCase()
        if (!existingNames.has(key)) {
          existingNames.add(key)
          combined.push(bank)
        }
      })

      // Sort by accepting partner first, then by shortest distance
      combined.sort((a, b) => {
        if (a.isAccepting && !b.isAccepting) return -1
        if (!a.isAccepting && b.isAccepting) return 1
        return a.distance - b.distance
      })

      setNearbyBanks(combined)
    } catch (err) {
      console.warn('Overpass error, loading real verified partner branches:', err)
      const fallbackReal = VERIFIED_DHAKA_PARTNER_BRANCHES.map(b => {
        const acceptingInfo = ACCEPTING_BANKS.find(ab => ab.id === b.bankId)
        const distance = parseFloat(calculateDistance(lat, lng, b.lat, b.lng))
        return {
          id: `fb_${b.bankId}_${b.area}`,
          name: b.name,
          lat: b.lat,
          lng: b.lng,
          distance,
          isAccepting: true,
          acceptingInfo,
          address: b.address
        }
      }).sort((a, b) => a.distance - b.distance)

      setNearbyBanks(fallbackReal)
    } finally {
      setMapLoading(false)
    }
  }, [])

  /**
   * Handle changing the student's residential area or triggering live GPS.
   */
  const handleSelectStudentArea = useCallback((areaId) => {
    setSelectedStudentArea(areaId)

    if (areaId === 'live') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
            setUserLocation(loc)
            setUserLocationName('My Current Live Location (GPS)')
            fetchNearbyBanks(loc.lat, loc.lng, 'My Area')
          },
          err => {
            console.warn('Geolocation denied, selecting Dhanmondi as student area:', err)
            const area = DHAKA_STUDENT_AREAS.find(a => a.id === 'dhanmondi')
            const loc = { lat: area.lat, lng: area.lng }
            setUserLocation(loc)
            setUserLocationName(area.name)
            fetchNearbyBanks(loc.lat, loc.lng, 'Dhanmondi')
          },
          { enableHighAccuracy: true, timeout: 6000 }
        )
      } else {
        const area = DHAKA_STUDENT_AREAS.find(a => a.id === 'dhanmondi')
        const loc = { lat: area.lat, lng: area.lng }
        setUserLocation(loc)
        setUserLocationName(area.name)
        fetchNearbyBanks(loc.lat, loc.lng, 'Dhanmondi')
      }
    } else {
      const area = DHAKA_STUDENT_AREAS.find(a => a.id === areaId)
      if (area && area.lat && area.lng) {
        const loc = { lat: area.lat, lng: area.lng }
        setUserLocation(loc)
        setUserLocationName(area.name)
        const label = area.name.replace(/[📍🏡]/g, '').split('/')[0].trim()
        fetchNearbyBanks(loc.lat, loc.lng, label)
      }
    }
  }, [fetchNearbyBanks])

  const handleOpenBankMap = useCallback(() => {
    setMapVisible(true)
    handleSelectStudentArea('live')
  }, [handleSelectStudentArea])

  const handleCloseMap = () => {
    setMapVisible(false)
  }

  const renderAutoTable = (doc, options) => {
    if (typeof autoTable === 'function') {
      autoTable(doc, options)
    } else if (typeof doc.autoTable === 'function') {
      doc.autoTable(options)
    }
  }

  /**
   * Generate official PDF course fee receipt and trigger download.
   */
  const handleOfflineDownload = useCallback(() => {
    handleOpenBankMap()

    try {
      const data = receipt || {
        studentId: studentId,
        studentName: 'Student',
        department: 'CSE',
        term: 'Fall 2026',
        items: [],
        totalAcademicCredits: 12,
        totalFinancialCredits: 12,
        totalCourseFee: 90000,
        semesterFee: 11500,
        grossPayable: 101500,
        discount: 0,
        netPayable: 101500,
        amountInWords: 'In Words: Taka One Lakh One Thousand Five Hundred Only.',
        bankAccounts: ACCEPTING_BANKS
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      })

      const primaryColor = [26, 152, 130]
      const darkColor = [17, 24, 39]

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(...primaryColor)
      doc.text('BRAC UNIVERSITY / CAMPUSCONNECT', 40, 48)

      doc.setFontSize(11)
      doc.setTextColor(...darkColor)
      doc.text('STUDENT COURSE REGISTRATION & FEE RECEIPT', 40, 66)

      const currentStatus = paymentSuccess ? 'PAID / CLEARED' : 'PENDING PAYMENT'
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      if (paymentSuccess) {
        doc.setTextColor(5, 150, 105)
      } else {
        doc.setTextColor(217, 119, 6)
      }
      doc.text(`STATUS: ${currentStatus}`, 380, 48)

      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(70, 70, 70)
      doc.text(`Student ID: ${data.studentId || studentId}`, 40, 88)
      doc.text(`Student Name: ${data.studentName || 'Student'}`, 40, 102)
      doc.text(`Department: ${data.department || 'CSE'}`, 40, 116)

      doc.text(`Term: ${data.term || 'Fall 2026'}`, 380, 88)
      doc.text(`Issue Date: ${new Date().toLocaleDateString('en-GB')}`, 380, 102)
      if (paymentSuccess && (transactionId || receiptNumber)) {
        doc.text(`Receipt No: ${receiptNumber || 'REC-2026'}`, 380, 116)
      }

      const tableColumns = [
        { header: 'Course ID', dataKey: 'courseId' },
        { header: 'Course Title', dataKey: 'courseTitle' },
        { header: 'Acad. Cr', dataKey: 'academicCredits' },
        { header: 'Fin. Cr', dataKey: 'financialCredits' },
        { header: 'Registration Date', dataKey: 'registrationDate' },
        { header: 'RP/RT', dataKey: 'rpRt' },
        { header: 'Amount (BDT)', dataKey: 'amountBDT' }
      ]

      const tableRows = (data.items || []).map(item => ({
        courseId: item.courseId,
        courseTitle: item.courseTitle,
        academicCredits: item.academicCredits,
        financialCredits: item.financialCredits,
        registrationDate: item.registrationDate,
        rpRt: item.rpRt || 'N/M',
        amountBDT: formatCurrency(item.amountBDT)
      }))

      tableRows.push({
        courseId: 'Total:',
        courseTitle: '',
        academicCredits: data.totalAcademicCredits,
        financialCredits: data.totalFinancialCredits,
        registrationDate: '',
        rpRt: '',
        amountBDT: formatCurrency(data.totalCourseFee)
      })

      renderAutoTable(doc, {
        startY: 130,
        columns: tableColumns,
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [26, 152, 130], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: 30 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 170 },
          2: { cellWidth: 45, halign: 'center' },
          3: { cellWidth: 45, halign: 'center' },
          4: { cellWidth: 100 },
          5: { cellWidth: 35, halign: 'center' },
          6: { cellWidth: 65, halign: 'right' }
        }
      })

      let finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 320) + 15

      const particularsBody = [
        ['Course Fee', formatCurrency(data.totalCourseFee)],
        ['Semester Fee', formatCurrency(data.semesterFee)],
        ['Gross Payable:', formatCurrency(data.grossPayable)],
        ['Less:', formatCurrency(data.discount || 0)],
        ['Net payable:', formatCurrency(data.netPayable)]
      ]

      renderAutoTable(doc, {
        startY: finalY,
        margin: { left: 40, right: 320 },
        head: [['Particulars', 'Amount (BDT)']],
        body: particularsBody,
        theme: 'grid',
        headStyles: { fillColor: [70, 80, 95], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
      })

      const bankBody = (data.bankAccounts || ACCEPTING_BANKS).map(b => [
        b.bankName,
        b.accountName,
        b.accountNumber
      ])

      renderAutoTable(doc, {
        startY: finalY,
        margin: { left: 290, right: 40 },
        head: [['Bank Name', 'A/C Name', 'A/C No.']],
        body: bankBody,
        theme: 'grid',
        headStyles: { fillColor: [70, 80, 95], fontSize: 7 },
        bodyStyles: { fontSize: 7 }
      })

      const afterTablesY = Math.max((doc.lastAutoTable ? doc.lastAutoTable.finalY : 480), finalY + 110) + 15

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(30, 30, 30)
      doc.text(data.amountInWords || `In Words: Taka ${formatCurrency(data.netPayable)} Only.`, 40, afterTablesY)

      doc.setFont('helvetica', 'italic')
      doc.setFontSize(7.5)
      doc.setTextColor(180, 40, 40)
      doc.text(
        'Please deposit the net payable amount to any of the above mentioned banks.',
        40,
        afterTablesY + 18
      )
      doc.text(
        'Please avoid Cheque, PO, Agent Banking, CDM, BEFTN, RTGS, NPSB.',
        40,
        afterTablesY + 28
      )

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(120, 120, 120)
      doc.text(
        'CampusConnect Unified University Portal – Official Payment Slip',
        40,
        doc.internal.pageSize.getHeight() - 25
      )

      doc.save(`Course_Fee_Receipt_${data.studentId || studentId}.pdf`)
    } catch (pdfErr) {
      console.error('PDF generation error:', pdfErr)
    }
  }, [receipt, studentId, paymentSuccess, transactionId, receiptNumber, handleOpenBankMap])

  /**
   * Generate PDF for a historical receipt record from database.
   */
  const handleDownloadHistoricalReceipt = useCallback((record) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      })

      const primaryColor = [26, 152, 130]
      const darkColor = [17, 24, 39]

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(...primaryColor)
      doc.text('BRAC UNIVERSITY / CAMPUSCONNECT', 40, 48)

      doc.setFontSize(11)
      doc.setTextColor(...darkColor)
      doc.text('OFFICIAL COURSE FEE PAYMENT RECEIPT (RECORD)', 40, 66)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(5, 150, 105)
      doc.text(`STATUS: ${record.paymentStatus || 'PAID'}`, 380, 48)

      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(70, 70, 70)
      doc.text(`Student ID: ${record.studentId}`, 40, 88)
      doc.text(`Student Name: ${record.studentName}`, 40, 102)
      doc.text(`Department: ${record.department || 'CSE'}`, 40, 116)

      doc.text(`Receipt No: ${record.receiptNumber}`, 380, 88)
      doc.text(`Term: ${record.term}`, 380, 102)
      doc.text(`Txn Ref: ${record.transactionId}`, 380, 116)

      // Parse stored items JSON
      let items = []
      try {
        items = JSON.parse(record.itemsJson || '[]')
      } catch (e) {
        items = []
      }

      const tableColumns = [
        { header: 'Course ID', dataKey: 'courseId' },
        { header: 'Course Title', dataKey: 'courseTitle' },
        { header: 'Acad. Cr', dataKey: 'academicCredits' },
        { header: 'Fin. Cr', dataKey: 'financialCredits' },
        { header: 'Amount (BDT)', dataKey: 'amountBDT' }
      ]

      const tableRows = items.map(item => ({
        courseId: item.courseId,
        courseTitle: item.courseTitle,
        academicCredits: item.academicCredits || 3,
        financialCredits: item.financialCredits || 3,
        amountBDT: formatCurrency(item.amountBDT)
      }))

      tableRows.push({
        courseId: 'Total Course Fee:',
        courseTitle: '',
        academicCredits: '',
        financialCredits: '',
        amountBDT: formatCurrency(record.totalCourseFee)
      })

      renderAutoTable(doc, {
        startY: 130,
        columns: tableColumns,
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [26, 152, 130], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8 }
      })

      let finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 250) + 15

      const particularsBody = [
        ['Course Fee', formatCurrency(record.totalCourseFee)],
        ['Semester Fee', formatCurrency(record.semesterFee)],
        ['Gross Payable:', formatCurrency(record.grossPayable)],
        ['Net Paid:', formatCurrency(record.netPayable)],
        ['Payment Method:', record.paymentMethod]
      ]

      renderAutoTable(doc, {
        startY: finalY,
        head: [['Particulars', 'Confirmed Details']],
        body: particularsBody,
        theme: 'grid',
        headStyles: { fillColor: [70, 80, 95], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
      })

      const afterTablesY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 380) + 20

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(30, 30, 30)
      doc.text(record.amountInWords || `In Words: Taka ${formatCurrency(record.netPayable)} Only.`, 40, afterTablesY)

      doc.save(`Official_Receipt_${record.receiptNumber}_${record.studentId}.pdf`)
    } catch (e) {
      console.error('Error exporting historical receipt PDF:', e)
    }
  }, [])

  const handlePayNowToggle = () => {
    setPayNowOpen(prev => !prev)
    setPaymentError(null)
  }

  /**
   * Finalize online Stripe payment & persist receipt to Database.
   */
  const handleProcessPayment = async (stripe, elements, CardElement) => {
    if (processing) return
    setProcessing(true)
    setPaymentError(null)

    try {
      const netAmount = receipt?.netPayable || 101500
      let txn = 'TXN_' + Math.random().toString(36).substring(2, 10).toUpperCase()

      // 1. Create Stripe PaymentIntent
      const res = await apiClient.post(`${API_BASE}/create-intent`, {
          amount: Math.round(netAmount * 100),
          currency: 'bdt',
          studentId: studentId,
          description: `Fall 2026 Registration Fee - ${receipt?.studentName || studentId}`
      })

      let clientSecret = null
      if (res.ok) {
        const data = await res.json()
        clientSecret = data.clientSecret
      }

      if (stripe && elements && CardElement && clientSecret && !clientSecret.startsWith('pi_mock_')) {
        const cardElem = elements.getElement(CardElement)
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElem,
            billing_details: {
              name: receipt?.studentName || 'Student',
              email: `${studentId.toLowerCase()}@g.bracu.ac.bd`
            }
          }
        })

        if (result.error) {
          throw new Error(result.error.message || 'Payment authorization failed')
        }

        txn = result.paymentIntent.id
      } else {
        await new Promise(r => setTimeout(r, 1200))
      }

      // 2. Persist confirmed receipt into Database table payment_records
      const confirmRes = await apiClient.post(`${API_BASE}/confirm`, {
          studentId: receipt?.studentId || studentId,
          studentName: receipt?.studentName || 'Student',
          department: receipt?.department || 'CSE',
          term: receipt?.term || 'Fall2026',
          totalCourseFee: receipt?.totalCourseFee || 90000,
          semesterFee: receipt?.semesterFee || 11500,
          grossPayable: receipt?.grossPayable || 101500,
          netPayable: netAmount,
          paymentMethod: 'STRIPE_ONLINE',
          paymentStatus: 'PAID',
          transactionId: txn,
          bankName: 'Online Payment',
          amountInWords: receipt?.amountInWords,
          items: receipt?.items || []
      })

      if (confirmRes.ok) {
        const savedRecord = await confirmRes.json()
        setReceiptNumber(savedRecord.receiptNumber)
      }

      setTransactionId(txn)
      setPaidAt(new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }))
      setPaymentSuccess(true)
      setPayNowOpen(false)

      // Re-fetch payment history from DB so the new transaction shows up immediately
      fetchPaymentHistory()
    } catch (err) {
      console.error('Payment processing failed:', err)
      setPaymentError(err.message || 'Payment processing failed. Please check your card number.')
    } finally {
      setProcessing(false)
    }
  }

  return {
    receipt,
    loading,
    error,
    studentId,
    role,
    isAdmin,
    // Admin Student Selector State
    studentIds,
    studentIdsLoading,
    selectedStudentId,
    setSelectedStudentId,
    // Admin Bypass Payment State & Handlers
    bypassModalOpen,
    setBypassModalOpen,
    bypassReason,
    setBypassReason,
    bypassSubmitting,
    handleBypassPayment,
    // Admin Edit & Delete State & Handlers
    editingRecord,
    setEditingRecord,
    editSubmitting,
    handleSaveEditPayment,
    deletingRecord,
    setDeletingRecord,
    deleteSubmitting,
    handleDeletePayment,
    // Tab state
    activeViewTab,
    setActiveViewTab,
    // Payment History state
    paymentHistory,
    historyLoading,
    historyFilter,
    setHistoryFilter,
    fetchPaymentHistory,
    handleDownloadHistoricalReceipt,
    // Pay Now state
    payNowOpen,
    cardComplete,
    setCardComplete,
    processing,
    paymentSuccess,
    paymentError,
    transactionId,
    receiptNumber,
    paidAt,
    handlePayNowToggle,
    handleProcessPayment,
    // Offline Download & Map
    handleOfflineDownload,
    handleOpenBankMap,
    handleCloseMap,
    mapVisible,
    userLocation,
    userLocationName,
    selectedStudentArea,
    handleSelectStudentArea,
    nearbyBanks,
    mapLoading,
    mapError,
    selectedBankFilter,
    setSelectedBankFilter,
    fetchReceipt
  }
}
