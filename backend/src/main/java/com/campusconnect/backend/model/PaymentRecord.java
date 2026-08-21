package com.campusconnect.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * PaymentRecord – JPA Entity representing a confirmed payment & official receipt.
 *
 * MVC Role: Model
 * Persisted in the {@code payment_records} table in Neon PostgreSQL.
 * Access control: Visible only to the student who paid (matching studentId) and administrators.
 */
@Entity
@Table(
    name = "payment_records",
    indexes = {
        @Index(name = "idx_payment_student_id", columnList = "student_id"),
        @Index(name = "idx_payment_receipt_no", columnList = "receipt_number", unique = true)
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Official unique receipt number, e.g. "REC-2026-0842" */
    @Column(name = "receipt_number", nullable = false, unique = true, length = 60)
    private String receiptNumber;

    /** Stripe PaymentIntent ID or generated Transaction Reference */
    @Column(name = "transaction_id", nullable = false, length = 100)
    private String transactionId;

    /** Student identifier, e.g. "STU001" */
    @Column(name = "student_id", nullable = false, length = 50)
    private String studentId;

    @Column(name = "student_name", nullable = false, length = 150)
    private String studentName;

    @Column(length = 100)
    private String department;

    @Column(nullable = false, length = 30)
    private String term;

    @Column(name = "total_course_fee", nullable = false)
    private Double totalCourseFee;

    @Column(name = "semester_fee", nullable = false)
    private Double semesterFee;

    @Column(name = "gross_payable", nullable = false)
    private Double grossPayable;

    @Column(name = "net_payable", nullable = false)
    private Double netPayable;

    /** Payment method: "STRIPE_ONLINE", "OFFLINE_BANK_DEPOSIT", etc. */
    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod;

    /** Status: "PAID", "CONFIRMED", "CLEARED", "PENDING_VERIFICATION" */
    @Column(name = "payment_status", nullable = false, length = 40)
    private String paymentStatus;

    /** Name of the bank deposited into (if offline) */
    @Column(name = "bank_name", length = 100)
    private String bankName;

    /** Serialized JSON list of courses covered by this payment */
    @Column(name = "items_json", columnDefinition = "TEXT")
    private String itemsJson;

    @Column(name = "amount_in_words", length = 255)
    private String amountInWords;

    @Column(name = "paid_at", nullable = false)
    private LocalDateTime paidAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.paidAt == null) {
            this.paidAt = LocalDateTime.now();
        }
    }
}
