package com.campusconnect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * PaymentReceiptDTO – Complete invoice / receipt breakdown for student course registration fees.
 *
 * MVC Role: DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReceiptDTO {
    private String studentId;
    private String studentName;
    private String department;
    private String term;
    private List<PaymentReceiptItemDTO> items;
    private int totalAcademicCredits;
    private int totalFinancialCredits;
    private double totalCourseFee;
    private double semesterFee;
    private double grossPayable;
    private double discount;
    private double netPayable;
    private String amountInWords;
    private List<BankInfoDTO> bankAccounts;
    /** True when the student has no course registrations for the current term */
    private boolean noEnrollment;
}
