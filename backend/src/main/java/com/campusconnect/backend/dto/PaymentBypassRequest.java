package com.campusconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PaymentBypassRequest – Payload for administrators to bypass a student's current term payment.
 *
 * MVC Role: DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentBypassRequest {
    private String studentId;
    private String term;
    private String reason;
    private String bypassedBy;
}
