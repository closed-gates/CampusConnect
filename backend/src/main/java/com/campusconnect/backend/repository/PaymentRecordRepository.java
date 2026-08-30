package com.campusconnect.backend.repository;

import com.campusconnect.backend.model.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * PaymentRecordRepository – Spring Data JPA repository for PaymentRecord entity.
 *
 * MVC Role: Repository
 */
@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {

    /** Finds all payment records for a specific student, ordered latest first */
    List<PaymentRecord> findByStudentIdOrderByPaidAtDesc(String studentId);

    /** Finds all payment records across all students (for Administrators), ordered latest first */
    List<PaymentRecord> findAllByOrderByPaidAtDesc();

    /** Lookup by unique transaction ID */
    Optional<PaymentRecord> findByTransactionId(String transactionId);

    /** Lookup by official receipt number */
    Optional<PaymentRecord> findByReceiptNumber(String receiptNumber);
}
