package com.campusconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PaymentUpdateRequest – Payload for administrators to edit an existing payment record.
 *
 * MVC Role: DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentUpdateRequest {
    private String term;
    private Double netPayable;
    private String paymentStatus;
    private String paymentMethod;
    private String bankName;
    private String transactionId;
    private String amountInWords;
}
