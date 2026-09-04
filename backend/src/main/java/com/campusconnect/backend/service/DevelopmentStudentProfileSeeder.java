package com.campusconnect.backend.service;

import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.model.StudentProfile;
import com.campusconnect.backend.repository.AppUserRepository;
import com.campusconnect.backend.repository.StudentProfileRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Ensures demo student accounts have matching academic profiles in local development. */
@Component
@Profile("dev")
public class DevelopmentStudentProfileSeeder implements ApplicationRunner {

    private final AppUserRepository userRepository;
    private final StudentProfileRepository profileRepository;

    public DevelopmentStudentProfileSeeder(AppUserRepository userRepository,
                                           StudentProfileRepository profileRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        userRepository.findByUserId("STU001")
                .filter(user -> !profileRepository.existsById(user.getUserId()))
                .ifPresent(this::createDemoProfile);
    }

    private void createDemoProfile(AppUser user) {
        profileRepository.save(StudentProfile.builder()
                .studentId(user.getUserId())
                .studentName(user.getFullName())
                .email(user.getEmail())
                .department("Computer Science & Engineering")
                .year(3)
                .cgpa(3.50)
                .completedCredits(72)
                .completedCourses("CSE110,CSE111,CSE220,CSE221,MAT110,ENG101")
                .onProbation(false)
                .build());
    }
}
