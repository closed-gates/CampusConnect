package com.campusconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * PaymentConfirmRequest – Payload for confirming and persisting a payment receipt into database.
 *
 * MVC Role: DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfirmRequest {
    private String studentId;
    private String studentName;
    private String department;
    private String term;
    private Double totalCourseFee;
    private Double semesterFee;
    private Double grossPayable;
    private Double netPayable;
    private String paymentMethod;     // "STRIPE_ONLINE", "OFFLINE_BANK_DEPOSIT"
    private String paymentStatus;     // "PAID", "CONFIRMED"
    private String transactionId;
    private String bankName;
    private String amountInWords;
    private List<PaymentReceiptItemDTO> items;
}
