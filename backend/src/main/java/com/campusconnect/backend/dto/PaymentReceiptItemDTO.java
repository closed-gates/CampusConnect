package com.campusconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PaymentReceiptItemDTO – Represents a single course item on the university fee receipt.
 *
 * MVC Role: DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReceiptItemDTO {
    private String courseId;          // e.g. "BIO101", "CSE220", "CSE220L"
    private String courseTitle;       // e.g. "INTRODUCTION TO BIOLOGY"
    private int academicCredits;      // e.g. 3 or 0 (for labs)
    private int financialCredits;     // e.g. 3 or 0
    private String registrationDate;  // e.g. "02/12/2025 12:20 PM"
    private String rpRt;              // "N/M" (New/Modern)
    private double amountBDT;         // e.g. 22500.0 (7500 per credit)
    private String remarks;           // e.g. ""
}
