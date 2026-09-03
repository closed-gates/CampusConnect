package com.campusconnect.backend.service;

import com.campusconnect.backend.dto.BankInfoDTO;
import com.campusconnect.backend.dto.PaymentReceiptDTO;
import com.campusconnect.backend.dto.PaymentReceiptItemDTO;
import com.campusconnect.backend.model.CourseSection;
import com.campusconnect.backend.model.SectionRegistration;
import com.campusconnect.backend.model.StudentProfile;
import com.campusconnect.backend.repository.SectionRegistrationRepository;
import com.campusconnect.backend.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * PaymentReceiptService – Generates detailed invoice / receipt breakdown
 * based on student's registered courses from the database.
 *
 * MVC Role: Service
 */
@Service
public class PaymentReceiptService {

    private static final double RATE_PER_CREDIT = 7500.0;
    private static final double SEMESTER_FEE = 11500.0;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a");

    private final SectionRegistrationRepository regRepo;
    private final StudentProfileRepository studentRepo;

    public PaymentReceiptService(SectionRegistrationRepository regRepo, StudentProfileRepository studentRepo) {
        this.regRepo = regRepo;
        this.studentRepo = studentRepo;
    }

    /**
     * Computes the complete fee receipt breakdown for the specified student.
     */
    public PaymentReceiptDTO getReceipt(String studentId) {
        return getReceipt(studentId, "Fall2026");
    }

    public PaymentReceiptDTO getReceipt(String studentId, String requestedTerm) {
        String term = normalizeTerm(requestedTerm);
        StudentProfile student = studentRepo.findById(studentId).orElse(null);
        String studentName = (student != null) ? student.getStudentName() : "Student (" + studentId + ")";
        String department = (student != null) ? student.getDepartment() : "Computer Science and Engineering";

        List<SectionRegistration> registrations = regRepo.findByStudentIdAndTerm(studentId, term);
        List<PaymentReceiptItemDTO> items = new ArrayList<>();

        if (registrations != null && !registrations.isEmpty()) {
            for (SectionRegistration reg : registrations) {
                CourseSection sec = reg.getSection();
                if (sec == null) continue;

                int academicCredits = (sec.getCredits() != null) ? (int) Math.round(sec.getCredits()) : 3;
                int financialCredits = academicCredits;
                double amount = financialCredits * RATE_PER_CREDIT;
                String regDate = (reg.getRegisteredAt() != null)
                        ? reg.getRegisteredAt().format(DATE_FORMATTER)
                        : LocalDateTime.now().format(DATE_FORMATTER);

                items.add(PaymentReceiptItemDTO.builder()
                        .courseId(sec.getCode())
                        .courseTitle(sec.getTitle() != null ? sec.getTitle().toUpperCase() : sec.getCode())
                        .academicCredits(academicCredits)
                        .financialCredits(financialCredits)
                        .registrationDate(regDate)
                        .rpRt("N/M")
                        .amountBDT(amount)
                        .remarks("")
                        .build());
            }
        }

        // If student has no registrations for the current term, return empty receipt with zero amounts

        boolean noEnrollment = items.isEmpty();

        int totalAcademicCredits = items.stream().mapToInt(PaymentReceiptItemDTO::getAcademicCredits).sum();
        int totalFinancialCredits = items.stream().mapToInt(PaymentReceiptItemDTO::getFinancialCredits).sum();
        double totalCourseFee = items.stream().mapToDouble(PaymentReceiptItemDTO::getAmountBDT).sum();
        double grossPayable = noEnrollment ? 0.0 : totalCourseFee + SEMESTER_FEE;
        double discount = 0.0;
        double netPayable = grossPayable - discount;

        return PaymentReceiptDTO.builder()
                .studentId(studentId)
                .studentName(studentName)
                .department(department)
                .term(term)
                .items(items)
                .noEnrollment(noEnrollment)
                .totalAcademicCredits(totalAcademicCredits)
                .totalFinancialCredits(totalFinancialCredits)
                .totalCourseFee(totalCourseFee)
                .semesterFee(noEnrollment ? 0.0 : SEMESTER_FEE)
                .grossPayable(grossPayable)
                .discount(discount)
                .netPayable(netPayable)
                .amountInWords(noEnrollment ? "No courses registered for " + term : convertAmountToWords((long) netPayable))
                .bankAccounts(noEnrollment ? new ArrayList<>() : getAcceptingBankAccounts())
                .build();
    }

    private String normalizeTerm(String term) {
        if (term == null || term.isBlank()) return "Fall2026";
        String normalized = term.replaceAll("\\s+", "");
        return normalized.matches("(?i)(Spring|Summer|Fall)\\d{4}") ? normalized : "Fall2026";
    }



    /**
     * University partner bank accounts for offline payment deposits.
     */
    public List<BankInfoDTO> getAcceptingBankAccounts() {
        List<BankInfoDTO> banks = new ArrayList<>();
        banks.add(new BankInfoDTO("BRAC Bank", "BRAC University Collection Account", "1501200132106002"));
        banks.add(new BankInfoDTO("DHAKA BANK PLC", "BRAC University", "2251500000640"));
        banks.add(new BankInfoDTO("Dutch-Bangla Bank PLC.", "BRAC University", "1931200004169"));
        banks.add(new BankInfoDTO("ONE BANK PLC", "BRAC University", "0023000000464"));
        banks.add(new BankInfoDTO("PRIME BANK PLC", "BRAC University", "2110311003330"));
        banks.add(new BankInfoDTO("Pubali Bank PLC.", "BRAC UNIVERSITY", "3677102002388"));
        banks.add(new BankInfoDTO("Southeast Bank PLC", "BRAC University", "70211310000092"));
        return banks;
    }

    // ── Number to Words converter (Bangladeshi Taka format) ─────────
    private static final String[] UNITS = {
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    };

    private static final String[] TENS = {
            "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    };

    public static String convertAmountToWords(long n) {
        if (n == 0) return "Taka Zero Only.";

        StringBuilder words = new StringBuilder();
        if (n >= 10000000) {
            words.append(convertSection((int) (n / 10000000))).append(" Crore ");
            n %= 10000000;
        }
        if (n >= 100000) {
            words.append(convertSection((int) (n / 100000))).append(" Lakh ");
            n %= 100000;
        }
        if (n >= 1000) {
            words.append(convertSection((int) (n / 1000))).append(" Thousand ");
            n %= 1000;
        }
        if (n >= 100) {
            words.append(convertSection((int) (n / 100))).append(" Hundred ");
            n %= 100;
        }
        if (n > 0) {
            words.append(convertSection((int) n)).append(" ");
        }

        String result = words.toString().replaceAll("\\s+", " ").trim();
        return "In Words: Taka " + result + " Only.";
    }

    private static String convertSection(int n) {
        if (n < 20) {
            return UNITS[n];
        } else if (n < 100) {
            return TENS[n / 10] + ((n % 10 != 0) ? " " + UNITS[n % 10] : "");
        } else {
            return UNITS[n / 100] + " Hundred" + ((n % 100 != 0) ? " " + convertSection(n % 100) : "");
        }
    }
}
