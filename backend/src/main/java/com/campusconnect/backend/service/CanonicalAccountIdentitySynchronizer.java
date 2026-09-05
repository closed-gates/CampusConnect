package com.campusconnect.backend.service;

import com.campusconnect.backend.model.ChatMessage;
import com.campusconnect.backend.model.PaymentRecord;
import com.campusconnect.backend.repository.AppUserRepository;
import com.campusconnect.backend.repository.ChatMessageRepository;
import com.campusconnect.backend.repository.PaymentRecordRepository;
import com.campusconnect.backend.repository.StudentProfileRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Repairs identity fields left behind by older demo seed data. */
@Component
public class CanonicalAccountIdentitySynchronizer implements ApplicationRunner {

    private static final String STUDENT_ID = "STU001";
    private static final String STUDENT_NAME = "Alex Johnson";

    private final AppUserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final PaymentRecordRepository paymentRepository;
    private final ChatMessageRepository chatRepository;

    public CanonicalAccountIdentitySynchronizer(AppUserRepository userRepository,
                                                StudentProfileRepository profileRepository,
                                                PaymentRecordRepository paymentRepository,
                                                ChatMessageRepository chatRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.paymentRepository = paymentRepository;
        this.chatRepository = chatRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        userRepository.findByUserId(STUDENT_ID).ifPresent(user -> {
            if (!STUDENT_NAME.equals(user.getFullName())) {
                user.setFullName(STUDENT_NAME);
                userRepository.save(user);
            }
        });

        profileRepository.findById(STUDENT_ID).ifPresent(profile -> {
            if (!STUDENT_NAME.equals(profile.getStudentName())) {
                profile.setStudentName(STUDENT_NAME);
                profileRepository.save(profile);
            }
        });

        List<PaymentRecord> payments = paymentRepository.findByStudentIdOrderByPaidAtDesc(STUDENT_ID);
        payments.forEach(payment -> payment.setStudentName(STUDENT_NAME));
        paymentRepository.saveAll(payments);

        List<ChatMessage> messages = chatRepository.findAll().stream()
                .filter(message -> STUDENT_ID.equalsIgnoreCase(message.getAuthorId()))
                .peek(message -> message.setAuthorName(STUDENT_NAME))
                .toList();
        chatRepository.saveAll(messages);
    }
}
