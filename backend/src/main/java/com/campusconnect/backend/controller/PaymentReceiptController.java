package com.campusconnect.backend.controller;

import com.campusconnect.backend.dto.PaymentReceiptDTO;
import com.campusconnect.backend.service.PaymentReceiptService;
import org.springframework.http.ResponseEntity;
import com.campusconnect.backend.security.CurrentUser;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * PaymentReceiptController – REST endpoints for university course registration fee receipts.
 *
 * MVC Role: Controller
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentReceiptController {

    private final PaymentReceiptService receiptService;

    public PaymentReceiptController(PaymentReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    /**
     * GET /api/payments/receipt/{studentId}
     * Returns the dynamic course fee receipt and bank details for the given student.
     */
    @GetMapping("/receipt/{studentId}")
    public ResponseEntity<PaymentReceiptDTO> getReceipt(
            @PathVariable String studentId,
            @RequestParam(defaultValue = "Fall2026") String term,
            Authentication auth) {
        CurrentUser.requireSelfOrStaff(auth, studentId);
        PaymentReceiptDTO receipt = receiptService.getReceipt(studentId, term);
        return ResponseEntity.ok(receipt);
    }
}
