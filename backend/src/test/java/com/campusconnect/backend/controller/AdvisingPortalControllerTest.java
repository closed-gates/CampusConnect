package com.campusconnect.backend.controller;

import com.campusconnect.backend.service.AdminAdvisingService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.List;
import java.util.Map;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AdvisingPortalControllerTest {
    private final AdminAdvisingService service = mock(AdminAdvisingService.class);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new AdminAdvisingController(service)).build();

    private UsernamePasswordAuthenticationToken principal(String role) {
        return new UsernamePasswordAuthenticationToken("tester", "", List.of(new SimpleGrantedAuthority("ROLE_" + role)));
    }
    @Test void adminCanToggleButStudentsAndFacultyCannot() throws Exception {
        when(service.setAdvisingPortalStatus(false, "tester", "Closed")).thenReturn(Map.of("isOpen", false));
        mvc.perform(post("/api/admin/advising-portal/toggle").principal(principal("ADMIN"))
            .contentType("application/json").content("{\"isOpen\":false,\"message\":\"Closed\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.isOpen").value(false));
        for (String role : List.of("STUDENT", "FACULTY")) {
            mvc.perform(post("/api/admin/advising-portal/toggle").principal(principal(role))
                .contentType("application/json").content("{\"isOpen\":true}"))
                .andExpect(status().isForbidden());
        }
        verify(service, times(1)).setAdvisingPortalStatus(anyBoolean(), anyString(), any());
    }
    @Test void rejectsMissingOrNonBooleanStatus() throws Exception {
        for (String body : List.of("{}", "{\"isOpen\":\"true\"}")) {
            mvc.perform(post("/api/admin/advising-portal/toggle").principal(principal("ADMIN"))
                .contentType("application/json").content(body)).andExpect(status().isBadRequest());
        }
        verifyNoInteractions(service);
    }
    @Test void statusIsNotCached() throws Exception {
        when(service.getAdvisingPortalStatus()).thenReturn(Map.of("isOpen", false));
        mvc.perform(get("/api/admin/advising-portal/status").principal(principal("STUDENT")))
            .andExpect(status().isOk()).andExpect(header().string("Cache-Control", "no-store"))
            .andExpect(jsonPath("$.isOpen").value(false));
    }
}
