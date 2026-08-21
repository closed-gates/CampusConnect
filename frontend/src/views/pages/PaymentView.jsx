/**
 * PaymentView.jsx – View layer for student course registration fee payments & receipt download.
 *
 * MVC Role: View
 * Strictly driven by usePaymentController(). No independent state or fetch logic.
 */

import React, { useEffect, useRef, useMemo } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import Sidebar from '../components/Sidebar'
import { usePaymentController } from '../../controllers/usePaymentController'
import {
  formatCurrency,
  ACCEPTING_BANKS,
  DHAKA_STUDENT_AREAS
} from '../../models/paymentModel'
import './PaymentView.css'

const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_sample_placeholder'
const stripePromise = loadStripe(stripePublishableKey)

export default function PaymentView() {
  const {
    receipt,
    loading,
    error,
    studentId,
    role,
    isAdmin,
    // Tab State
    activeViewTab,
    setActiveViewTab,
    // Payment History State
    paymentHistory,
    historyLoading,
    historyFilter,
    setHistoryFilter,
    handleDownloadHistoricalReceipt,
    // Pay now online
    payNowOpen,
    processing,
    paymentSuccess,
    paymentError,
    transactionId,
    receiptNumber,
    paidAt,
    handlePayNowToggle,
    handleProcessPayment,
    // Offline payment & map
    handleOfflineDownload,
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
  } = usePaymentController()

  const displayedHistory = useMemo(() => {
    if (!historyFilter) return paymentHistory
    const q = historyFilter.toLowerCase()
    return paymentHistory.filter(
      p =>
        p.studentId?.toLowerCase().includes(q) ||
        p.receiptNumber?.toLowerCase().includes(q) ||
        p.studentName?.toLowerCase().includes(q) ||
        p.term?.toLowerCase().includes(q)
    )
  }, [paymentHistory, historyFilter])

  return (
    <div className="payment-page-container">
      {/* Shared Navigation Sidebar */}
      <Sidebar activeItem="payments" />

      {/* Main Payment View Content */}
      <main className="payment-main-content">
        {/* Page Header */}
        <header className="payment-header">
          <div className="payment-title-group">
            <h1>
              <span>💳</span> Student Fee Payment & Receipt
            </h1>
            <p className="payment-subtitle">
              Official university course registration fees, payment clearance, database-backed history, and deposit slips.
            </p>
          </div>

          <div className="payment-header-badges">
            <span className="payment-badge term-badge">
              Term: {receipt?.term || 'Fall 2026'}
            </span>
            <span className="payment-badge">
              Student ID: <strong>{studentId}</strong>
            </span>
            <span className={`payment-badge ${paymentSuccess ? 'status-badge-paid' : 'status-badge-pending'}`}>
              Status: <strong>{paymentSuccess ? 'PAID (CLEARED) ✅' : 'PENDING PAYMENT'}</strong>
            </span>
            {isAdmin && (
              <span className="payment-badge admin-badge">
                👑 <strong>Admin Portal View</strong>
              </span>
            )}
          </div>
        </header>

        {/* ── Navigation Tab Bar ───────────────────────────────── */}
        <div className="payment-tab-bar">
          <button
            className={`payment-tab-btn ${activeViewTab === 'receipt' ? 'active' : ''}`}
            onClick={() => setActiveViewTab('receipt')}
          >
            <span>📋</span> Current Term Fee Clearance
          </button>
          <button
            className={`payment-tab-btn ${activeViewTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveViewTab('history')}
          >
            <span>📜</span> Payment History & Database Receipts ({paymentHistory.length})
          </button>
        </div>

        {/* ── TAB 1: Current Term Receipt & Payment ─────────────── */}
        {activeViewTab === 'receipt' && (
          <>
            {loading ? (
              <div className="payment-skeleton-loader">
                <div className="skeleton-bar" style={{ width: '60%' }}></div>
                <div className="skeleton-bar" style={{ width: '100%', height: '140px' }}></div>
                <div className="skeleton-bar" style={{ width: '80%' }}></div>
              </div>
            ) : error ? (
              <div className="payment-feedback-alert error">
                ⚠️ {error} — <button onClick={fetchReceipt} className="btn-cancel" style={{ marginLeft: '10px', padding: '4px 10px' }}>Retry</button>
              </div>
            ) : receipt?.noEnrollment ? (
              /* ── No Enrollment State ────────────────────────────── */
              <div className="no-enrollment-card">
                <div className="no-enrollment-icon">📭</div>
                <h3>No Payment Required Currently</h3>
                <p>
                  You have no registered courses for <strong>{receipt?.term || 'the current term'}</strong>.
                  Course registration fees are only generated once you enroll in courses for the semester.
                </p>
                <div className="no-enrollment-hint">
                  <span>💡</span>
                  <span>Visit the <strong>Course Registration</strong> page to register for courses. Your fee receipt will appear here once enrolled.</span>
                </div>
                <button className="btn-cancel" style={{ marginTop: '16px' }} onClick={fetchReceipt}>
                  🔄 Check Again
                </button>
              </div>
            ) : (
              <>
                {/* Success Clearance Banner if Paid */}
                {paymentSuccess && (
                  <div className="paid-clearance-banner">
                    <div className="paid-banner-icon">🎉</div>
                    <div className="paid-banner-text">
                      <h3>Payment Cleared & Saved in Database!</h3>
                      <p>
                        Your semester fee of <strong>৳{formatCurrency(receipt?.netPayable)}</strong> was recorded in the database.
                        Receipt Number: <code>{receiptNumber || 'REC-2026'}</code> • Txn: <code>{transactionId}</code> {paidAt ? `• Cleared on ${paidAt}` : ''}
                      </p>
                    </div>
                    <button
                      className="btn-download-paid-receipt"
                      onClick={handleOfflineDownload}
                      title="Download the official stamped PDF receipt"
                    >
                      <DownloadIcon />
                      Download Official Paid Receipt (PDF)
                    </button>
                  </div>
                )}

                {/* Official University Receipt Card */}
                <div className={`payment-receipt-card ${paymentSuccess ? 'receipt-is-paid' : ''}`} id="printable-receipt-card">
                  {/* Paid Watermark Stamp */}
                  {paymentSuccess && (
                    <div className="paid-watermark-stamp">
                      <span>PAID & CLEARED</span>
                      <small>BRACU FINANCE</small>
                    </div>
                  )}

                  {/* Receipt Header */}
                  <div className="receipt-card-header">
                    <div className="receipt-university-brand">
                      <div className="receipt-brand-logo">🏛️</div>
                      <div className="receipt-brand-text">
                        <h2>BRAC UNIVERSITY / CAMPUSCONNECT</h2>
                        <span>Course Registration & Payment Summary</span>
                      </div>
                    </div>

                    <div className="receipt-meta-pills">
                      <div>Student: <strong>{receipt?.studentName}</strong></div>
                      <div>ID: <strong>{receipt?.studentId}</strong></div>
                      <div>
                        Status:{' '}
                        {paymentSuccess ? (
                          <span className="status-tag-paid">PAID (CLEARED) ✅</span>
                        ) : (
                          <span className="status-tag-pending">PENDING PAYMENT</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Course Fee Table */}
                  <div className="receipt-table-wrapper">
                    <table className="receipt-table" id="courses-fee-table">
                      <thead>
                        <tr>
                          <th style={{ width: '85px' }}>Course<br/>ID</th>
                          <th>Course Title</th>
                          <th style={{ width: '80px' }}>Academic<br/>Credits</th>
                          <th style={{ width: '80px' }}>Financial<br/>Credits</th>
                          <th style={{ width: '150px' }}>Registration Date</th>
                          <th style={{ width: '65px' }}>RP/RT</th>
                          <th style={{ width: '110px' }}>Amount<br/>(BDT)</th>
                          <th style={{ width: '80px' }}>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(receipt?.items || []).map((item, idx) => (
                          <tr key={idx}>
                            <td className="col-center"><strong>{item.courseId}</strong></td>
                            <td>{item.courseTitle}</td>
                            <td className="col-center">{item.academicCredits}</td>
                            <td className="col-center">{item.financialCredits}</td>
                            <td className="col-center">{item.registrationDate}</td>
                            <td className="col-center">{item.rpRt || 'N/M'}</td>
                            <td className="col-right">{formatCurrency(item.amountBDT)}</td>
                            <td className="col-center">{item.remarks}</td>
                          </tr>
                        ))}
                        <tr className="total-row">
                          <td><strong>Total:</strong></td>
                          <td></td>
                          <td className="col-center"><strong>{receipt?.totalAcademicCredits}</strong></td>
                          <td className="col-center"><strong>{receipt?.totalFinancialCredits}</strong></td>
                          <td></td>
                          <td></td>
                          <td className="col-right"><strong>{formatCurrency(receipt?.totalCourseFee)}</strong></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Split Information Section: Particulars + Bank Info */}
                  <div className="receipt-split-grid">
                    <div className="particulars-box">
                      <table className="particulars-table">
                        <thead>
                          <tr>
                            <th>Particulars</th>
                            <th className="amount-col">Amount (BDT)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Course Fee</td>
                            <td className="amount-col">{formatCurrency(receipt?.totalCourseFee)}</td>
                          </tr>
                          <tr>
                            <td>Semester Fee</td>
                            <td className="amount-col">{formatCurrency(receipt?.semesterFee)}</td>
                          </tr>
                          <tr className="highlight-row">
                            <td><strong>Gross Payable:</strong></td>
                            <td className="amount-col"><strong>{formatCurrency(receipt?.grossPayable)}</strong></td>
                          </tr>
                          <tr>
                            <td>Less:</td>
                            <td className="amount-col">{formatCurrency(receipt?.discount || 0)}</td>
                          </tr>
                          <tr className="highlight-row">
                            <td><strong>Net payable:</strong></td>
                            <td className="amount-col" style={{ color: paymentSuccess ? '#059669' : '#111827' }}>
                              <strong>{formatCurrency(receipt?.netPayable)}</strong>
                              {paymentSuccess && <span style={{ fontSize: '11px', display: 'block', color: '#059669' }}>PAID</span>}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="in-words-footer">
                        {receipt?.amountInWords || `In Words: Taka ${formatCurrency(receipt?.netPayable)} Only.`}
                      </div>
                    </div>

                    <div className="bank-info-box">
                      <div className="bank-table-title">Bank Information</div>
                      <table className="bank-info-table">
                        <thead>
                          <tr>
                            <th>Bank Name</th>
                            <th>A/C Name</th>
                            <th>A/C No.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(receipt?.bankAccounts || ACCEPTING_BANKS).map((bank, idx) => (
                            <tr key={idx}>
                              <td className="bank-name-cell">{bank.bankName}</td>
                              <td>{bank.accountName}</td>
                              <td style={{ fontFamily: 'monospace' }}>{bank.accountNumber}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="bank-warning-notice">
                        Please deposit the net payable amount to any of the above mentioned banks.<br/>
                        Please avoid Cheque, PO, Agent Banking, CDM, BEFTN, RTGS, NPSB.
                      </div>
                    </div>
                  </div>

                  {/* Action Toolbar */}
                  <div className="receipt-action-toolbar">
                    <button
                      id="btn-offline-payment"
                      className="btn-offline-download"
                      onClick={handleOfflineDownload}
                      title="Download PDF receipt and view nearby partner bank branches on live map"
                    >
                      <DownloadIcon />
                      Download (Offline Payment)
                    </button>

                    {!paymentSuccess ? (
                      <button
                        id="btn-pay-now-stripe"
                        className={`btn-pay-now ${payNowOpen ? 'active-pay' : ''}`}
                        onClick={handlePayNowToggle}
                      >
                        <CreditCardIcon />
                        {payNowOpen ? 'Close Online Payment' : 'Pay Now'}
                      </button>
                    ) : (
                      <button
                        className="btn-pay-now active-pay"
                        style={{ background: '#059669', color: '#FFFFFF', cursor: 'default' }}
                      >
                        <span>✓</span> Payment Completed
                      </button>
                    )}

                    <button
                      id="btn-cancel-receipt"
                      className="btn-cancel"
                      onClick={() => window.location.reload()}
                    >
                      Refresh
                    </button>
                  </div>

                  {/* Stripe Inline Checkout Form */}
                  {payNowOpen && !paymentSuccess && (
                    <Elements stripe={stripePromise}>
                      <StripeCheckoutCard
                        amount={receipt?.netPayable || 101500}
                        onProcessPayment={handleProcessPayment}
                        processing={processing}
                        paymentSuccess={paymentSuccess}
                        paymentError={paymentError}
                        transactionId={transactionId}
                        onClose={handlePayNowToggle}
                      />
                    </Elements>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ── TAB 2: Payment History & Receipts (Database Records) ── */}
        {activeViewTab === 'history' && (
          <div className="payment-history-container">
            <div className="history-header-card">
              <div className="history-title-box">
                <h2>
                  <span>📜</span> Confirmed Payment Records
                </h2>
                <p>
                  {isAdmin
                    ? 'Administrator Access: Showing all student fee clearance records persisted in the database.'
                    : `Showing confirmed payment receipts for student ${studentId}. Access is strictly private to your account.`}
                </p>
              </div>

              {isAdmin && (
                <div className="history-search-bar">
                  <input
                    type="text"
                    className="history-search-input"
                    placeholder="Filter by Student ID, Name or Receipt No..."
                    value={historyFilter}
                    onChange={e => setHistoryFilter(e.target.value)}
                  />
                </div>
              )}
            </div>

            {historyLoading ? (
              <div className="payment-skeleton-loader" style={{ marginTop: '20px' }}>
                <div className="skeleton-bar" style={{ width: '40%' }}></div>
                <div className="skeleton-bar" style={{ width: '100%', height: '180px' }}></div>
              </div>
            ) : displayedHistory.length === 0 ? (
              <div className="history-empty-state">
                <div style={{ fontSize: '42px', marginBottom: '12px' }}>🧾</div>
                <h3>No Payment Records Found</h3>
                <p>There are no confirmed payment receipts recorded for this account yet.</p>
              </div>
            ) : (
              <div className="history-table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Receipt No.</th>
                      {isAdmin && <th>Student Details</th>}
                      <th>Academic Term</th>
                      <th>Payment Date</th>
                      <th>Payment Method</th>
                      <th style={{ textAlign: 'right' }}>Amount Paid</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'center' }}>Official Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedHistory.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td>
                          <strong className="receipt-code-pill">📄 {item.receiptNumber}</strong>
                          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px', fontFamily: 'monospace' }}>
                            Txn: {item.transactionId}
                          </div>
                        </td>

                        {isAdmin && (
                          <td>
                            <strong>{item.studentName}</strong>
                            <div style={{ fontSize: '12px', color: '#6B7280' }}>
                              ID: <code>{item.studentId}</code> • {item.department}
                            </div>
                          </td>
                        )}

                        <td>
                          <span className="history-term-tag">{item.term}</span>
                        </td>

                        <td>
                          {item.paidAt
                            ? new Date(item.paidAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'N/A'}
                        </td>

                        <td>
                          <span className={`method-badge ${item.paymentMethod === 'STRIPE_ONLINE' ? 'stripe' : 'bank'}`}>
                            {item.paymentMethod === 'STRIPE_ONLINE' ? '💳 Stripe Card' : '🏛️ Bank Deposit'}
                          </span>
                          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                            {item.paymentMethod === 'STRIPE_ONLINE'
                              ? 'Online Payment'
                              : (item.bankName || 'Bank Deposit')}
                          </div>
                        </td>

                        <td style={{ textAlign: 'right', fontWeight: '700', color: '#065F46', fontSize: '14px' }}>
                          ৳{formatCurrency(item.netPayable)}
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <span className="status-tag-paid">
                            {item.paymentStatus === 'PAID' ? 'CONFIRMED / PAID' : item.paymentStatus}
                          </span>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn-history-pdf"
                            onClick={() => handleDownloadHistoricalReceipt(item)}
                            title="Download official PDF copy of this receipt"
                          >
                            <DownloadIcon /> PDF Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Bank Live Map Modal (Offline Option) ───────────────────── */}
        {mapVisible && (
          <BankMapModal
            userLocation={userLocation}
            userLocationName={userLocationName}
            selectedStudentArea={selectedStudentArea}
            onSelectStudentArea={handleSelectStudentArea}
            nearbyBanks={nearbyBanks}
            mapLoading={mapLoading}
            mapError={mapError}
            selectedFilter={selectedBankFilter}
            onSelectFilter={setSelectedBankFilter}
            onClose={handleCloseMap}
          />
        )}
      </main>
    </div>
  )
}

/* ── Stripe Checkout Card Component ─────────────────────────── */
function StripeCheckoutCard({
  amount,
  onProcessPayment,
  processing,
  paymentSuccess,
  paymentError,
  transactionId,
  onClose
}) {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = e => {
    e.preventDefault()
    onProcessPayment(stripe, elements, CardElement)
  }

  return (
    <div className="stripe-checkout-container" id="stripe-checkout-section">
      <div className="stripe-checkout-header">
        <div className="stripe-title-wrapper">
          <span>🔒</span>
          <h3>Stripe Secure Online Checkout</h3>
        </div>
        <span className="stripe-secure-badge">256-Bit SSL Encrypted</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="stripe-element-wrapper">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '15px',
                  color: '#1F2937',
                  '::placeholder': { color: '#9CA3AF' },
                  fontFamily: 'Inter, sans-serif'
                },
                invalid: { color: '#EF4444' }
              }
            }}
          />
        </div>

        <div className="stripe-form-actions">
          <div className="stripe-test-hint">
            <span>Test Card: <code>4242 4242 4242 4242</code> (Any future date & CVC)</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={processing}
            >
              Close
            </button>
            <button
              type="submit"
              id="btn-stripe-submit"
              className="btn-submit-payment"
              disabled={processing}
            >
              {processing ? (
                <>
                  <span className="map-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                  Authorizing...
                </>
              ) : (
                `Pay ৳${formatCurrency(amount)} via Stripe`
              )}
            </button>
          </div>
        </div>

        {paymentError && (
          <div className="payment-feedback-alert error" style={{ marginTop: '14px' }}>
            <span>⚠️</span>
            <span>{paymentError}</span>
          </div>
        )}
      </form>
    </div>
  )
}

/* ── Interactive Leaflet Bank Map Modal ─────────────────────── */
function BankMapModal({
  userLocation,
  userLocationName,
  selectedStudentArea,
  onSelectStudentArea,
  nearbyBanks,
  mapLoading,
  mapError,
  selectedFilter,
  onSelectFilter,
  onClose
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  const filteredBanks = useMemo(() => {
    if (selectedFilter === 'all') return nearbyBanks
    if (selectedFilter === 'partner') return nearbyBanks.filter(b => b.isAccepting)
    return nearbyBanks.filter(
      b => b.acceptingInfo?.id === selectedFilter || b.name.toLowerCase().includes(selectedFilter.toLowerCase())
    )
  }, [nearbyBanks, selectedFilter])

  useEffect(() => {
    if (!mapRef.current) return

    const initialCenter = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [23.7465, 90.3760]

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: initialCenter,
        zoom: 14,
        zoomControl: true
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      mapInstanceRef.current = map
    }

    const map = mapInstanceRef.current

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-leaflet-marker user-location-marker',
        html: '📍',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      })

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<strong>📍 Student Location:</strong><br/>${userLocationName || 'Selected Area'}<br/><small style="color:#059669;">Showing accepting banks nearby</small>`)

      markersRef.current.push(userMarker)
    }

    filteredBanks.forEach(bank => {
      if (!bank.lat || !bank.lng) return

      const isPartner = bank.isAccepting
      const iconClass = isPartner
        ? 'custom-leaflet-marker accepting-marker'
        : 'custom-leaflet-marker standard-marker'

      const markerIcon = L.divIcon({
        className: iconClass,
        html: isPartner ? '🏛️' : '🏦',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })

      const popupHtml = `
        <div style="font-family: Inter, sans-serif; font-size: 12px; min-width: 190px;">
          <h4 style="margin: 0 0 4px 0; font-size: 13px; color: #111827;">${bank.name}</h4>
          <p style="margin: 0 0 6px 0; color: #6B7280;">${bank.address || 'Dhaka'}</p>
          <div style="font-size: 11px; font-weight: 600; color: #1A9882; margin-bottom: 4px;">
            Distance: ${bank.distance} km from your area
          </div>
          ${
            isPartner
              ? `<div style="background: #E6F5F2; color: #065F46; padding: 5px 8px; border-radius: 4px; font-weight: 600;">
                  ✅ Accepts University Fee Deposit
                  <div style="font-size: 10px; font-family: monospace; margin-top: 2px;">
                    A/C: ${bank.acceptingInfo?.accountNumber || ''}
                  </div>
                </div>`
              : `<span style="color: #6B7280; font-size: 11px;">General Bank Branch</span>`
          }
        </div>
      `

      const marker = L.marker([bank.lat, bank.lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(popupHtml)

      markersRef.current.push(marker)
    })

    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 14)
    }

    setTimeout(() => {
      map.invalidateSize()
    }, 250)
  }, [userLocation, userLocationName, filteredBanks])

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className="bank-map-modal-backdrop" onClick={onClose}>
      <div className="bank-map-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>
              <span>🗺️</span> Partner Bank Deposit Branches in Your Area
            </h2>
            <p>
              Showing accepting banks near <strong>{userLocationName}</strong>. Change your neighborhood below to locate the closest branch.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="modal-area-selector-bar">
          <div className="area-selector-label">
            <span>📍 Student Area:</span>
          </div>
          <div className="area-selector-controls">
            <select
              id="student-area-dropdown"
              className="student-area-select"
              value={selectedStudentArea}
              onChange={e => onSelectStudentArea(e.target.value)}
            >
              {DHAKA_STUDENT_AREAS.map(area => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
            <button
              className="btn-detect-gps"
              onClick={() => onSelectStudentArea('live')}
              title="Detect your real-time physical GPS location"
            >
              🎯 Auto-Detect GPS
            </button>
          </div>
        </div>

        <div className="map-modal-body">
          <div className="map-sidebar-panel">
            <div className="map-filter-bar">
              <label className="map-filter-label" htmlFor="bank-select-filter">Filter Partner Banks:</label>
              <select
                id="bank-select-filter"
                className="map-filter-select"
                value={selectedFilter}
                onChange={e => onSelectFilter(e.target.value)}
              >
                <option value="all">All Nearby Branches</option>
                <option value="partner">⭐ Accepting Partner Banks Only</option>
                {ACCEPTING_BANKS.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.bankName}
                  </option>
                ))}
              </select>
            </div>

            <div className="map-branch-list">
              {filteredBanks.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
                  No branches found matching the selected filter in this area.
                </div>
              ) : (
                filteredBanks.map((branch, idx) => (
                  <div
                    key={branch.id || idx}
                    className={`branch-card ${branch.isAccepting ? 'accepting-partner' : ''}`}
                    onClick={() => {
                      if (mapInstanceRef.current && branch.lat && branch.lng) {
                        mapInstanceRef.current.setView([branch.lat, branch.lng], 16)
                        const marker = markersRef.current.find(
                          m => m.getLatLng().lat === branch.lat && m.getLatLng().lng === branch.lng
                        )
                        if (marker) marker.openPopup()
                      }
                    }}
                  >
                    <div className="branch-card-title">
                      <span>{branch.name}</span>
                      <span className="branch-distance-tag">{branch.distance} km</span>
                    </div>
                    <div className="branch-address">{branch.address}</div>
                    {branch.isAccepting && (
                      <div>
                        <span className="branch-accept-badge">⭐ University Deposit Partner</span>
                        <div className="branch-account-no">
                          A/C: {branch.acceptingInfo?.accountNumber}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="map-canvas-container">
            {mapLoading && (
              <div className="map-loading-overlay">
                <div className="map-spinner"></div>
                <div>Locating nearest bank branches in {userLocationName}...</div>
              </div>
            )}
            <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function CreditCardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )
}
