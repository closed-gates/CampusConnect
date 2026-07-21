package com.campusconnect.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * BackendApplicationTests
 *
 * Verifies that the Spring application context loads successfully.
 * This is the baseline integration test — if this passes, the project
 * is wired correctly and ready for feature development.
 */
@SpringBootTest
@ActiveProfiles("dev")
class BackendApplicationTests {

    @Test
    void contextLoads() {
        // If the application context fails to start, this test will fail.
        // No additional assertions needed — the context loading itself is the assertion.
    }
}
