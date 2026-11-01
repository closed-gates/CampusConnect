package com.campusconnect.backend.config;

import com.campusconnect.backend.security.JwtService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;

/**
 * Authenticates STOMP sessions with the same JWT as the REST API and keeps
 * DM topics private to their two participants.
 */
@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final String DM_TOPIC_PREFIX = "/topic/dm.";

    private final JwtService jwtService;

    public WebSocketAuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) return message;

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String header = accessor.getFirstNativeHeader("Authorization");
            String token = header != null && header.startsWith("Bearer ") ? header.substring(7) : null;
            if (token == null || !jwtService.isTokenValid(token)) {
                throw new MessagingException("Missing or invalid token");
            }
            String role = jwtService.extractRole(token);
            accessor.setUser(new UsernamePasswordAuthenticationToken(
                    jwtService.extractUserId(token), null, List.of(new SimpleGrantedAuthority("ROLE_" + role))));
            return message;
        }

        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String dest = accessor.getDestination();
            // The simple broker treats * ? { } as patterns; /topic/dm.* would receive every DM.
            if (dest != null && dest.matches(".*[*?{}].*")) {
                return null;
            }
            if (dest != null && dest.startsWith(DM_TOPIC_PREFIX)) {
                String roomId = dest.substring(DM_TOPIC_PREFIX.length()).replaceFirst("\\.history$", "");
                // Only private dm_ rooms are guarded. Drop (return null) rather than throw:
                // a STOMP ERROR would close the user's whole socket, and the client also
                // subscribes here for course channels (ch_*), which carry no DM traffic.
                if (roomId.startsWith("dm_") && !isRoomParticipant(roomId, accessor.getUser())) {
                    return null;
                }
            }
        }
        return message;
    }

    /** Room ids are built by the client as dm_{smallerId}_{largerId}. */
    public static boolean isRoomParticipant(String roomId, Principal user) {
        if (roomId == null || user == null) return false;
        String me = user.getName();
        return roomId.startsWith("dm_" + me + "_") || (roomId.startsWith("dm_") && roomId.endsWith("_" + me));
    }
}
