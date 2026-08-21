package com.campusconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PaymentIntentRequest – Payload for initiating Stripe PaymentIntent.
 *
 * MVC Role: DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentIntentRequest {
    private Long amount;       // Amount in lowest currency unit (cents / poisha)
    private String currency;   // e.g. "usd" or "bdt"
    private String studentId;  // e.g. "STU001"
    private String description;// e.g. "Fall 2026 Course Registration Fee"
}
