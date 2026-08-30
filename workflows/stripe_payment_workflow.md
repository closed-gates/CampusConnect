# Stripe Payment & Course Fee Clearance – Workflow

**Feature:** Student Course Registration Fee Payment, Receipt Generator & Offline Partner Bank Locator  
**Status:** Implemented  
**Term:** Fall 2026  

---

## Overview

Students can review their complete course registration fee invoice computed dynamically from their enrolled database sections (`SectionRegistration` & `CourseSection` models), make secure online payments using Stripe (with environment-secured keys), or download an official PDF bank deposit slip and discover nearby university partner branches on an interactive Leaflet map.

---

## Sequential Communication Path

```
                                  [ PaymentView.jsx ]
                                           │
                                           │ drives UI & user actions
                                           ▼
                            [ usePaymentController.js ]
                                           │
                     ┌─────────────────────┴─────────────────────┐
                     │                                           │
            (On Mount / Refresh)                        (User Actions)
                     │                                           │
                     ▼                                           ├──► [ Download (Offline Payment) ]
       GET /api/payments/receipt/{studentId}                     │         │
                     │                                           │         ├──► Generates styled PDF (jsPDF + autotable)
                     ▼                                           │         │    and triggers browser download
         [ PaymentReceiptController ]                            │         │
                     │                                           │         └──► Activates Geolocation & queries Overpass API
                     ▼                                           │              for nearby partner bank branches
         [ PaymentReceiptService ]                               │              and opens [ BankMapModal ] (Leaflet)
                     │                                           │
         ┌───────────┴───────────┐                               └──► [ Pay Now (Online Stripe) ]
         │                       │                                         │
         ▼                       ▼                                         ▼
[ SectionRegistrationRepo ] [ StudentProfileRepo ]                POST /api/payments/create-intent
         │                       │                                         │
         ▼                       ▼                                         ▼
   (Neon PostgreSQL)       (Neon PostgreSQL)                         [ PaymentController ]
                                                                           │
                                                                           ▼
                                                                  [ PaymentService ]
                                                                           │
                                                                           ▼
                                                                Stripe Java SDK (PaymentIntent.create)
                                                                           │
                                                                           ▼
                                                              Returns { clientSecret }
                                                                           │
                                                                           ▼
                                                              stripe.confirmCardPayment(clientSecret)
```

---

## User Flow Tracing

### 1. Invoice Initialization
1. `PaymentView.jsx` mounts and invokes `usePaymentController()`.
2. `usePaymentController` calls `GET /api/payments/receipt/{studentId}`.
3. `PaymentReceiptController` delegates to `PaymentReceiptService.getReceipt(studentId)`.
4. `PaymentReceiptService` queries `SectionRegistrationRepository` for the student's registered courses in `Fall2026`.
5. For each course, academic credits, financial credits, registration timestamps, and fee totals are computed at 7,500 BDT per credit plus semester fee (11,500 BDT).
6. Number-to-words converter calculates the Bangladeshi Taka text (e.g., `"In Words: Taka One Lakh One Thousand Five Hundred Only."`).
7. University partner bank accounts (BRAC Bank, Dhaka Bank, DBBL, ONE Bank, Prime Bank, Pubali Bank, Southeast Bank) are attached.
8. The JSON payload is returned to the frontend and rendered in the official invoice layout.

### 2. Offline Payment Flow & Bank Discovery
1. User clicks **"Download (Offline Payment)"**.
2. `usePaymentController.handleOfflineDownload()` constructs a high-resolution PDF course fee slip using `jsPDF` and `jspdf-autotable`.
3. The PDF is saved as `Course_Fee_Receipt_{studentId}.pdf`.
4. `usePaymentController.handleOpenBankMap()` retrieves the student's live coordinates (`navigator.geolocation`) or defaults to the campus location.
5. The controller queries the OpenStreetMap Overpass API for bank amenities within a 4 km radius.
6. Bank branches are analyzed and matched against partner accepting banks.
7. `BankMapModal` opens, displaying custom Leaflet pins:
   - 📍 Blue pulsing marker for the student's current position.
   - 🏛️ Green/Teal pins for authorized partner deposit branches.
   - 🏦 Grey pins for general branches.
   - Interactive popups with branch distance, deposit eligibility, and account numbers.

### 3. Online Payment Flow via Stripe
1. User clicks **"Pay Now"**; the inline Stripe checkout container expands.
2. User enters card credentials into Stripe's secured `CardElement`.
3. User clicks **"Pay ৳{netPayable} via Stripe"**.
4. Controller submits `POST /api/payments/create-intent` with the net amount in cents/poisha.
5. `PaymentController` calls `PaymentService.createPaymentIntent(request)`.
6. `PaymentService` initializes Stripe with `STRIPE_SECRET_KEY` (read strictly from `.env`) and creates a `PaymentIntent`.
7. The `clientSecret` is returned to the frontend.
8. `stripe.confirmCardPayment(clientSecret)` finalizes authorization.
9. Success banner displays the transaction ID and clearance confirmation.

---

## Files Implementing this Workflow

### Security & Config
- `backend/.env` & `backend/.env.example` — Secure backend secret key storage
- `frontend/.env` & `frontend/.env.example` — Vite Stripe publishable key storage
- `backend/src/main/resources/application-prod.properties` — Removed hardcoded fallback secrets

### Backend (Spring Boot 3.3.2)
- `backend/pom.xml` — Added `stripe-java` SDK dependency
- `backend/src/main/java/com/campusconnect/backend/dto/PaymentReceiptItemDTO.java`
- `backend/src/main/java/com/campusconnect/backend/dto/PaymentReceiptDTO.java`
- `backend/src/main/java/com/campusconnect/backend/dto/BankInfoDTO.java`
- `backend/src/main/java/com/campusconnect/backend/dto/PaymentIntentRequest.java`
- `backend/src/main/java/com/campusconnect/backend/dto/PaymentIntentResponse.java`
- `backend/src/main/java/com/campusconnect/backend/service/PaymentReceiptService.java`
- `backend/src/main/java/com/campusconnect/backend/service/PaymentService.java`
- `backend/src/main/java/com/campusconnect/backend/controller/PaymentReceiptController.java`
- `backend/src/main/java/com/campusconnect/backend/controller/PaymentController.java`

### Frontend (React + Vite)
- `frontend/src/models/paymentModel.js` — Partner bank data, initial state, distance & currency helpers
- `frontend/src/controllers/usePaymentController.js` — React controller hook (fetch, Stripe, PDF, Overpass)
- `frontend/src/views/pages/PaymentView.jsx` — Official receipt UI, Stripe element form, Leaflet map modal
- `frontend/src/views/pages/PaymentView.css` — Scoped styling adhering to `index.css` design system

### Shared Integration (Minimal)
- `frontend/src/views/components/Sidebar.jsx` & `frontend/src/components/Sidebar.jsx` — Added Payments nav item & icon
- `frontend/src/App.jsx` — Registered `/payments` route
