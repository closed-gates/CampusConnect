package com.campusconnect.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocketConfig – Configures STOMP over WebSocket with SockJS fallback.
 *
 * MVC Role: Infrastructure Config
 *
 * Real-time seat count updates are pushed via:
 *   /topic/seats/{sectionId}  ← subscribed by frontend per visible section
 *
 * Registration events flow:
 *   1. Student clicks Register (POST /api/registration/register)
 *   2. RegistrationService commits seat change to DB
 *   3. SimpMessagingTemplate.convertAndSend("/topic/seats/{id}", payload)
 *   4. All subscribed frontend clients update the seat counter immediately
 *
 * SockJS fallback ensures compatibility with browsers/networks that do
 * not support raw WebSocket connections.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable a simple in-memory topic broker for seat-update broadcasts
        registry.enableSimpleBroker("/topic");
        // Application-level destinations are prefixed with /app
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(
                        "http://localhost:5173",   // Vite dev server
                        "http://localhost:3000",   // React dev server
                        "http://localhost:*"       // any local port
                )
                .withSockJS();                     // SockJS fallback for broad compatibility
    }
}
