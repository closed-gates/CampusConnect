package com.campusconnect.backend.security;

import com.campusconnect.backend.config.WebSocketAuthInterceptor;
import com.campusconnect.backend.controller.PaymentController;
import com.campusconnect.backend.controller.RegistrationController;
import com.campusconnect.backend.dto.AuthRequest;
import com.campusconnect.backend.exception.GlobalExceptionHandler;
import com.campusconnect.backend.model.AppUser;
import com.campusconnect.backend.repository.AppUserRepository;
import com.campusconnect.backend.service.AuthService;
import com.campusconnect.backend.service.PaymentService;
import com.campusconnect.backend.service.RegistrationService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AccessRulesTest {

    private static UsernamePasswordAuthenticationToken as(String userId, String role) {
        return new UsernamePasswordAuthenticationToken(userId, "", List.of(new SimpleGrantedAuthority("ROLE_" + role)));
    }

    @Test void publicSignupCannotCreateAdmin() {
        AppUserRepository repo = mock(AppUserRepository.class);
        JwtService jwt = new JwtService("ZGV2LW9ubHktY2FtcHVzY29ubmVjdC1qd3Qtc2lnbmluZy1rZXktMzJieXRlcw==", 60_000);
        AuthService auth = new AuthService(repo, jwt, new BCryptPasswordEncoder(4));
        AuthRequest req = new AuthRequest();
        req.setUserId("X1"); req.setEmail("Evil@X.com"); req.setPassword("pw"); req.setFullName("Evil"); req.setRole("ADMIN");

        auth.register(req);

        ArgumentCaptor<AppUser> saved = ArgumentCaptor.forClass(AppUser.class);
        verify(repo).save(saved.capture());
        assertEquals("STUDENT", saved.getValue().getRole());
        assertEquals("evil@x.com", saved.getValue().getEmail());
    }

    @Test void studentCannotDropAnotherStudentsCourse() throws Exception {
        RegistrationService service = mock(RegistrationService.class);
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new RegistrationController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build();

        mvc.perform(delete("/api/registration/drop/STU002/CSE110-01").principal(as("STU001", "STUDENT")))
                .andExpect(status().isForbidden());
        verifyNoInteractions(service);

        when(service.dropSection("STU001", "CSE110-01", "Fall2026")).thenReturn(Map.of("success", true));
        mvc.perform(delete("/api/registration/drop/STU001/CSE110-01").principal(as("STU001", "STUDENT")))
                .andExpect(status().isOk());
    }

    @Test void studentPaymentHistoryIgnoresClientRoleAndId() throws Exception {
        PaymentService service = mock(PaymentService.class);
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new PaymentController(service)).build();

        mvc.perform(get("/api/payments/history?studentId=ALL&role=admin").principal(as("STU001", "STUDENT")))
                .andExpect(status().isOk());
        verify(service).getPaymentHistory("STU001", "STUDENT");
    }

    @Test void dmSubscriptionsAreFilteredWithoutClosingTheSocket() {
        var interceptor = new WebSocketAuthInterceptor(mock(JwtService.class));
        var alice = as("STU001", "STUDENT");
        java.util.function.Function<String, Object> subscribe = dest -> {
            var acc = org.springframework.messaging.simp.stomp.StompHeaderAccessor.create(
                    org.springframework.messaging.simp.stomp.StompCommand.SUBSCRIBE);
            acc.setDestination(dest);
            acc.setUser(alice);
            acc.setLeaveMutable(true);
            var msg = org.springframework.messaging.support.MessageBuilder.createMessage(new byte[0], acc.getMessageHeaders());
            return interceptor.preSend(msg, null);
        };
        assertNotNull(subscribe.apply("/topic/dm.dm_FAC001_STU001"));
        assertNotNull(subscribe.apply("/topic/dm.dm_FAC001_STU001.history"));
        assertNotNull(subscribe.apply("/topic/dm.ch_advisor_001"));     // course channel id, not a DM
        assertNull(subscribe.apply("/topic/dm.dm_FAC001_STU002"));      // someone else's DM: dropped
        assertNull(subscribe.apply("/topic/dm.*"));                     // wildcard would match every DM
    }

    @Test void dmRoomsAreOnlyOpenToParticipants() {
        var alice = as("STU001", "STUDENT");
        assertTrue(WebSocketAuthInterceptor.isRoomParticipant("dm_FAC001_STU001", alice));
        assertTrue(WebSocketAuthInterceptor.isRoomParticipant("dm_STU001_STU002", alice));
        assertFalse(WebSocketAuthInterceptor.isRoomParticipant("dm_STU002_STU003", alice));
        assertFalse(WebSocketAuthInterceptor.isRoomParticipant("dm_STU0011_STU002", alice));
    }
}
