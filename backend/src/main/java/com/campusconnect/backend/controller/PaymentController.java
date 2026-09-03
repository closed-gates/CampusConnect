package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.PaymentBypassRequest;
import com.campusconnect.backend.dto.PaymentConfirmRequest;
import com.campusconnect.backend.dto.PaymentIntentRequest;
import com.campusconnect.backend.dto.PaymentIntentResponse;
import com.campusconnect.backend.dto.PaymentUpdateRequest;
import com.campusconnect.backend.model.PaymentRecord;
import com.campusconnect.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * PaymentController – REST endpoints for Stripe payments, database receipt confirmations,
 * role-isolated payment history, and administrative fee bypass / edits.
 *
 * MVC Role: Controller
 */
@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * GET /api/payments/students
     * Returns list of available student IDs for admin selector.
     */
    @GetMapping("/students")
    public ResponseEntity<List<String>> getStudentIds() {
        return ResponseEntity.ok(paymentService.getAllStudentIds());
    }

    /**
     * POST /api/payments/create-intent
     * Creates a Stripe PaymentIntent and returns clientSecret.
     */
    @PostMapping("/create-intent")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(@RequestBody PaymentIntentRequest request) {
        PaymentIntentResponse response = paymentService.createPaymentIntent(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/payments/confirm
     * Confirms and persists a payment receipt in the database.
     */
    @PostMapping("/confirm")
    public ResponseEntity<PaymentRecord> confirmPayment(@RequestBody PaymentConfirmRequest request) {
        PaymentRecord record = paymentService.confirmAndSavePayment(request);
        return ResponseEntity.ok(record);
    }

    /**
     * POST /api/payments/bypass
     * Admin endpoint to bypass current term payment for a student.
     */
    @PostMapping("/bypass")
    public ResponseEntity<PaymentRecord> bypassPayment(@RequestBody PaymentBypassRequest request) {
        PaymentRecord record = paymentService.bypassPayment(request);
        return ResponseEntity.ok(record);
    }

    /**
     * PUT /api/payments/{id}
     * Admin endpoint to edit an existing payment record.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PaymentRecord> updatePaymentRecord(
            @PathVariable Long id,
            @RequestBody PaymentUpdateRequest request
    ) {
        PaymentRecord record = paymentService.updatePaymentRecord(id, request);
        return ResponseEntity.ok(record);
    }

    /**
     * DELETE /api/payments/{id}
     * Admin endpoint to delete an existing payment record.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePaymentRecord(@PathVariable Long id) {
        paymentService.deletePaymentRecord(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Payment record deleted successfully"));
    }

    /**
     * GET /api/payments/history
     * Returns payment history.
     * Enforces visibility: Students see only their own receipts; Admins see all receipts.
     */
    @GetMapping("/history")
    public ResponseEntity<List<PaymentRecord>> getPaymentHistory(
            @RequestParam(required = false, defaultValue = "STU001") String studentId,
            @RequestParam(required = false, defaultValue = "student") String role
    ) {
        List<PaymentRecord> history = paymentService.getPaymentHistory(studentId, role);
        return ResponseEntity.ok(history);
    }

    /**
     * GET /api/payments/receipt-record/{id}
     * Returns a specific receipt by ID with authorization verification.
     */
    @GetMapping("/receipt-record/{id}")
    public ResponseEntity<PaymentRecord> getReceiptRecord(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "STU001") String studentId,
            @RequestParam(required = false, defaultValue = "student") String role
    ) {
        PaymentRecord record = paymentService.getReceiptRecord(id, studentId, role);
        return ResponseEntity.ok(record);
    }
}
