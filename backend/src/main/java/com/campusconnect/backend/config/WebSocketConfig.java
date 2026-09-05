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
 * Real-time messages are pushed via:
 *   /topic/seats/{sectionId}          ← seat-count updates per section
 *   /topic/course.{id}.{sub}          ← course chat messages per sub-channel
 *   /topic/dm.{roomId}                ← direct messages between two users
 *   /topic/dm.{roomId}.history        ← DM history on room join
 *
 * Registration events flow:
 *   1. Student clicks Register (POST /api/registration/register)
 *   2. RegistrationService commits seat change to DB
 *   3. SimpMessagingTemplate.convertAndSend("/topic/seats/{id}", payload)
 *   4. All subscribed frontend clients update the seat counter immediately
 *
 * Direct Message flow:
 *   1. Client A publishes to /app/dm.send
 *   2. DirectMessageController persists → stamps → broadcasts to /topic/dm.{roomId}
 *   3. Client B (subscribed to /topic/dm.{roomId}) receives the message live
 *
 * SockJS fallback ensures compatibility with browsers/networks that do
 * not support raw WebSocket connections.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable simple in-memory broker for /topic (broadcast) and /queue (user-specific)
        registry.enableSimpleBroker("/topic", "/queue");
        // Application-level destinations are prefixed with /app
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(
                        "https://*.onrender.com",
                        "http://localhost:*",
                        "http://127.0.0.1:*"
                )
                .withSockJS();                     // SockJS fallback for broad compatibility
    }
}
