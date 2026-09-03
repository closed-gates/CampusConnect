package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.PaymentBypassRequest;
import com.campusconnect.backend.dto.PaymentConfirmRequest;
import com.campusconnect.backend.dto.PaymentIntentRequest;
import com.campusconnect.backend.dto.PaymentIntentResponse;
import com.campusconnect.backend.dto.PaymentReceiptDTO;
import com.campusconnect.backend.dto.PaymentUpdateRequest;
import com.campusconnect.backend.exception.ForbiddenException;
import com.campusconnect.backend.exception.ResourceNotFoundException;
import com.campusconnect.backend.model.PaymentRecord;
import com.campusconnect.backend.model.StudentProfile;
import com.campusconnect.backend.repository.PaymentRecordRepository;
import com.campusconnect.backend.repository.StudentProfileRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * PaymentService – Handles Stripe integration, payment persistence in database,
 * and role-based history retrieval (accessible only by the paying student & admins).
 *
 * MVC Role: Service
 */
@Slf4j
@Service
public class PaymentService {

    @Value("${stripe.secret.key:sk_test_replace_me}")
    private String stripeSecretKey;

    private final PaymentRecordRepository paymentRecordRepo;
    private final ObjectMapper objectMapper;
    private final PaymentReceiptService paymentReceiptService;
    private final StudentProfileRepository studentProfileRepo;

    public PaymentService(
            PaymentRecordRepository paymentRecordRepo,
            ObjectMapper objectMapper,
            PaymentReceiptService paymentReceiptService,
            StudentProfileRepository studentProfileRepo
    ) {
        this.paymentRecordRepo = paymentRecordRepo;
        this.objectMapper = objectMapper;
        this.paymentReceiptService = paymentReceiptService;
        this.studentProfileRepo = studentProfileRepo;
    }

    /**
     * Seeds initial historical payment receipts if table is empty.
     */
    @PostConstruct
    public void seedInitialPaymentHistory() {
        if (paymentRecordRepo.count() > 0) return;

        log.info("Seeding initial student payment history records...");

        // Summer 2026 Cleared Payment for STU001
        PaymentRecord p1 = PaymentRecord.builder()
                .receiptNumber("REC-2026-0419")
                .transactionId("pi_3Ng8sP2eZvKYlo2C1g9X8m4a")
                .studentId("STU001")
                .studentName("Eusha Kayenat")
                .department("Computer Science and Engineering")
                .term("Summer2026")
                .totalCourseFee(67500.0)
                .semesterFee(11500.0)
                .grossPayable(79000.0)
                .netPayable(79000.0)
                .paymentMethod("STRIPE_ONLINE")
                .paymentStatus("PAID")
                .bankName("Online Payment")
                .amountInWords("In Words: Taka Seventy Nine Thousand Only.")
                .itemsJson("[{\"courseId\":\"CSE111\",\"courseTitle\":\"PROGRAMMING LANGUAGE II\",\"academicCredits\":3,\"financialCredits\":3,\"amountBDT\":22500},{\"courseId\":\"CSE111L\",\"courseTitle\":\"PROGRAMMING LANGUAGE II LAB\",\"academicCredits\":0,\"financialCredits\":0,\"amountBDT\":0},{\"courseId\":\"MAT120\",\"courseTitle\":\"INTEGRAL CALCULUS \u0026 DIFFERENTIAL EQUATIONS\",\"academicCredits\":3,\"financialCredits\":3,\"amountBDT\":22500},{\"courseId\":\"PHY111\",\"courseTitle\":\"PRINCIPLES OF PHYSICS I\",\"academicCredits\":3,\"financialCredits\":3,\"amountBDT\":22500}]")
                .paidAt(LocalDateTime.now().minusMonths(3))
                .createdAt(LocalDateTime.now().minusMonths(3))
                .build();

        // Spring 2026 Cleared Offline Deposit for STU001
        PaymentRecord p2 = PaymentRecord.builder()
                .receiptNumber("REC-2026-0182")
                .transactionId("DEP_BRAC_992147120")
                .studentId("STU001")
                .studentName("Eusha Kayenat")
                .department("Computer Science and Engineering")
                .term("Spring2026")
                .totalCourseFee(90000.0)
                .semesterFee(11500.0)
                .grossPayable(101500.0)
                .netPayable(101500.0)
                .paymentMethod("OFFLINE_BANK_DEPOSIT")
                .paymentStatus("PAID")
                .bankName("BRAC Bank Merul Badda Branch")
                .amountInWords("In Words: Taka One Lakh One Thousand Five Hundred Only.")
                .itemsJson("[{\"courseId\":\"CSE110\",\"courseTitle\":\"PROGRAMMING LANGUAGE I\",\"academicCredits\":3,\"financialCredits\":3,\"amountBDT\":22500},{\"courseId\":\"MAT110\",\"courseTitle\":\"DIFFERENTIAL CALCULUS\",\"academicCredits\":3,\"financialCredits\":3,\"amountBDT\":22500},{\"courseId\":\"ENG101\",\"courseTitle\":\"ENGLISH I\",\"academicCredits\":3,\"financialCredits\":3,\"amountBDT\":22500},{\"courseId\":\"HUM101\",\"courseTitle\":\"WORLD CIVILIZATION\",\"academicCredits\":3,\"financialCredits\":3,\"amountBDT\":22500}]")
                .paidAt(LocalDateTime.now().minusMonths(7))
                .createdAt(LocalDateTime.now().minusMonths(7))
                .build();

        paymentRecordRepo.save(p1);
        paymentRecordRepo.save(p2);

        log.info("Seeded {} payment history records.", paymentRecordRepo.count());
    }

    /**
     * Creates a Stripe PaymentIntent for the given amount and currency.
     */
    public PaymentIntentResponse createPaymentIntent(PaymentIntentRequest request) {
        long amount = (request.getAmount() != null && request.getAmount() > 0) ? request.getAmount() : 10150000L;
        String currency = (request.getCurrency() != null && !request.getCurrency().isBlank())
                ? request.getCurrency().toLowerCase()
                : "bdt";

        String description = (request.getDescription() != null)
                ? request.getDescription()
                : "CampusConnect Course Registration Fee (" + (request.getStudentId() != null ? request.getStudentId() : "STU") + ")";

        if (stripeSecretKey != null && stripeSecretKey.startsWith("sk_") && !stripeSecretKey.equals("sk_test_replace_me")) {
            try {
                Stripe.apiKey = stripeSecretKey;

                PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                        .setAmount(amount)
                        .setCurrency(currency.equalsIgnoreCase("bdt") ? "bdt" : currency)
                        .setDescription(description)
                        .setAutomaticPaymentMethods(
                                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                        .setEnabled(true)
                                        .build()
                        )
                        .build();

                PaymentIntent intent = PaymentIntent.create(params);

                return PaymentIntentResponse.builder()
                        .clientSecret(intent.getClientSecret())
                        .paymentIntentId(intent.getId())
                        .status(intent.getStatus())
                        .amount(intent.getAmount())
                        .currency(intent.getCurrency())
                        .build();

            } catch (StripeException e) {
                log.warn("Stripe API call failed (falling back to mock secret for demo): {}", e.getMessage());
            }
        }

        String mockId = "pi_mock_" + UUID.randomUUID().toString().substring(0, 8);
        String mockSecret = mockId + "_secret_" + UUID.randomUUID().toString().substring(0, 16);

        return PaymentIntentResponse.builder()
                .clientSecret(mockSecret)
                .paymentIntentId(mockId)
                .status("requires_payment_method")
                .amount(amount)
                .currency(currency)
                .build();
    }

    /**
     * Confirms and persists a payment receipt in the database.
     */
    @Transactional
    public PaymentRecord confirmAndSavePayment(PaymentConfirmRequest req) {
        String receiptNo = "REC-2026-" + String.format("%04d", (int)(Math.random() * 9000) + 1000);
        String txnId = (req.getTransactionId() != null && !req.getTransactionId().isBlank())
                ? req.getTransactionId()
                : "TXN_" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        String itemsJson = "[]";
        if (req.getItems() != null && !req.getItems().isEmpty()) {
            try {
                itemsJson = objectMapper.writeValueAsString(req.getItems());
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize receipt items to JSON: {}", e.getMessage());
            }
        }

        PaymentRecord record = PaymentRecord.builder()
                .receiptNumber(receiptNo)
                .transactionId(txnId)
                .studentId(req.getStudentId() != null ? req.getStudentId() : "STU001")
                .studentName(req.getStudentName() != null ? req.getStudentName() : "Student")
                .department(req.getDepartment() != null ? req.getDepartment() : "CSE")
                .term(req.getTerm() != null ? req.getTerm() : "Fall2026")
                .totalCourseFee(req.getTotalCourseFee() != null ? req.getTotalCourseFee() : 90000.0)
                .semesterFee(req.getSemesterFee() != null ? req.getSemesterFee() : 11500.0)
                .grossPayable(req.getGrossPayable() != null ? req.getGrossPayable() : 101500.0)
                .netPayable(req.getNetPayable() != null ? req.getNetPayable() : 101500.0)
                .paymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "STRIPE_ONLINE")
                .paymentStatus(req.getPaymentStatus() != null ? req.getPaymentStatus() : "PAID")
                .bankName(resolveBankName(req.getBankName(), req.getPaymentMethod()))
                .itemsJson(itemsJson)
                .amountInWords(req.getAmountInWords() != null ? req.getAmountInWords() : "In Words: Taka One Lakh One Thousand Five Hundred Only.")
                .paidAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();

        return paymentRecordRepo.save(record);
    }

    /**
     * Retrieves payment history enforcing strict role-based isolation:
     * - Admin role: Can see all payments across all students.
     * - Student role: Can ONLY see their own payment receipts.
     */
    public List<PaymentRecord> getPaymentHistory(String studentId, String role) {
        boolean isAdmin = role != null && role.equalsIgnoreCase("ADMIN");
        if (isAdmin) {
            if (studentId != null && !studentId.isBlank() && !studentId.equalsIgnoreCase("ALL")) {
                return paymentRecordRepo.findByStudentIdOrderByPaidAtDesc(studentId);
            }
            return paymentRecordRepo.findAllByOrderByPaidAtDesc();
        } else {
            return paymentRecordRepo.findByStudentIdOrderByPaidAtDesc(studentId);
        }
    }

    /**
     * Retrieves a single receipt by ID with strict ownership verification.
     */
    public PaymentRecord getReceiptRecord(Long id, String studentId, String role) {
        PaymentRecord record = paymentRecordRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment receipt not found for ID: " + id));

        boolean isAdmin = role != null && role.equalsIgnoreCase("ADMIN");
        if (!isAdmin && !record.getStudentId().equalsIgnoreCase(studentId)) {
            throw new ForbiddenException("Access denied: You are not authorized to view another student's payment receipt.");
        }

        return record;
    }

    /**
     * Returns all distinct student IDs from StudentProfile for the admin selector.
     */
    public List<String> getAllStudentIds() {
        return studentProfileRepo.findAll().stream()
                .map(StudentProfile::getStudentId)
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .sorted()
                .toList();
    }

    /**
     * Bypasses current term payment for a student and saves a PAID/ADMIN_BYPASS receipt.
     */
    @Transactional
    public PaymentRecord bypassPayment(PaymentBypassRequest req) {
        String studentId = req.getStudentId();
        PaymentReceiptDTO receipt = paymentReceiptService.getReceipt(studentId);

        String term = (req.getTerm() != null && !req.getTerm().isBlank())
                ? req.getTerm()
                : (receipt.getTerm() != null ? receipt.getTerm() : "Fall2026");

        String receiptNo = "REC-BYPASS-" + String.format("%04d", (int)(Math.random() * 9000) + 1000);
        String txnId = "BYPASS_" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();

        String itemsJson = "[]";
        if (receipt.getItems() != null && !receipt.getItems().isEmpty()) {
            try {
                itemsJson = objectMapper.writeValueAsString(receipt.getItems());
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize items to JSON: {}", e.getMessage());
            }
        }

        String reason = (req.getReason() != null && !req.getReason().isBlank())
                ? req.getReason()
                : "Administrative Fee Waiver / Bypass";

        PaymentRecord record = PaymentRecord.builder()
                .receiptNumber(receiptNo)
                .transactionId(txnId)
                .studentId(studentId)
                .studentName(receipt.getStudentName() != null ? receipt.getStudentName() : "Student (" + studentId + ")")
                .department(receipt.getDepartment() != null ? receipt.getDepartment() : "General")
                .term(term)
                .totalCourseFee(receipt.getTotalCourseFee())
                .semesterFee(receipt.getSemesterFee())
                .grossPayable(receipt.getGrossPayable())
                .netPayable(receipt.getNetPayable())
                .paymentMethod("ADMIN_BYPASS")
                .paymentStatus("PAID")
                .bankName("Administrative Waiver (" + reason + ")")
                .itemsJson(itemsJson)
                .amountInWords("Waived by University Administration: " + reason)
                .paidAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();

        return paymentRecordRepo.save(record);
    }

    /**
     * Updates an existing payment record in database.
     */
    @Transactional
    public PaymentRecord updatePaymentRecord(Long id, PaymentUpdateRequest req) {
        PaymentRecord record = paymentRecordRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with id: " + id));

        if (req.getTerm() != null && !req.getTerm().isBlank()) {
            record.setTerm(req.getTerm());
        }
        if (req.getNetPayable() != null) {
            record.setNetPayable(req.getNetPayable());
            record.setGrossPayable(req.getNetPayable());
        }
        if (req.getPaymentStatus() != null && !req.getPaymentStatus().isBlank()) {
            record.setPaymentStatus(req.getPaymentStatus());
        }
        if (req.getPaymentMethod() != null && !req.getPaymentMethod().isBlank()) {
            record.setPaymentMethod(req.getPaymentMethod());
        }
        if (req.getBankName() != null) {
            record.setBankName(req.getBankName());
        }
        if (req.getTransactionId() != null && !req.getTransactionId().isBlank()) {
            record.setTransactionId(req.getTransactionId());
        }
        if (req.getAmountInWords() != null && !req.getAmountInWords().isBlank()) {
            record.setAmountInWords(req.getAmountInWords());
        }

        return paymentRecordRepo.save(record);
    }

    /**
     * Deletes an existing payment record by ID from database.
     */
    @Transactional
    public void deletePaymentRecord(Long id) {
        if (!paymentRecordRepo.existsById(id)) {
            throw new ResourceNotFoundException("Payment record not found with id: " + id);
        }
        paymentRecordRepo.deleteById(id);
    }

    /**
     * Resolves the bank name to store in the database.
     * - For STRIPE_ONLINE payments: always stores "Online Payment" (never null).
     * - For bank deposits: stores the provided bank name or "Bank Deposit" as fallback.
     */
    private String resolveBankName(String bankName, String paymentMethod) {
        if ("STRIPE_ONLINE".equalsIgnoreCase(paymentMethod)) {
            return "Online Payment";
        }
        return (bankName != null && !bankName.isBlank()) ? bankName : "Bank Deposit";
    }
}
