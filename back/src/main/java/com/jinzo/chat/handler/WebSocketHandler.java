package com.jinzo.chat.handler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jinzo.chat.models.Message;
import com.jinzo.chat.models.User;
import com.jinzo.chat.services.MessageService;
import com.jinzo.chat.services.RoomUserService;
import com.jinzo.chat.services.UserService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class WebSocketHandler extends TextWebSocketHandler implements RoomUserService {

    private static final ConcurrentHashMap<String, CopyOnWriteArrayList<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();
    private final UserService userService;
    private final MessageService messageService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WebSocketHandler(UserService userService, MessageService messageService) {
        this.userService = userService;
        this.messageService = messageService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String roomId = getRoomId(session);
        String username = getUsernameFromSession(session);
        User user = userService.getUserByUsername(username);

        if (user != null) {
            session.getAttributes().put("user", user);
            System.out.println("New connection established for room: " + roomId + " by user: " + user.getUsername());

            // Add the session to the room
            roomSessions.computeIfAbsent(roomId, k -> new CopyOnWriteArrayList<>()).add(session);

            // Broadcast user joined event to all clients in the room
            broadcastUserEvent(roomId, "USER_JOINED", user);
        } else {
            session.close();
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();
        System.out.println("Received message: " + payload);
        String roomId = getRoomId(session);

        try {
            JsonNode jsonNode = objectMapper.readTree(payload);
            String sender = jsonNode.get("sender").asText();
            String text = jsonNode.get("text").asText();
            User user = userService.getUserByUsername(sender);
            Message msg = new Message();
            msg.setContent(text);
            msg.setSender(user);
            msg.setRoomName(roomId);
            messageService.storeMessage(msg);

            // Broadcast the message to all clients in the room
            CopyOnWriteArrayList<WebSocketSession> sessions = roomSessions.get(roomId);
            if (sessions != null) {
                for (WebSocketSession webSocketSession : sessions) {
                    if (webSocketSession.isOpen()) {
                        webSocketSession.sendMessage(new TextMessage(payload));
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
        String roomId = getRoomId(session);
        User user = (User) session.getAttributes().get("user");
        System.out.println("Connection closed for room: " + roomId + " by user: " + user.getUsername());

        // Remove the session from the room
        CopyOnWriteArrayList<WebSocketSession> sessions = roomSessions.get(roomId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                roomSessions.remove(roomId);
            }
        }

        // Broadcast user left event to all clients in the room
        broadcastUserEvent(roomId, "USER_LEFT", user);
    }

    private void broadcastUserEvent(String roomId, String eventType, User user) {
        try {
            String eventPayload = objectMapper.writeValueAsString(Map.of(
                    "event", eventType,
                    "user", user.getUsername()
            ));

            CopyOnWriteArrayList<WebSocketSession> sessions = roomSessions.get(roomId);
            if (sessions != null) {
                for (WebSocketSession webSocketSession : sessions) {
                    if (webSocketSession.isOpen()) {
                        webSocketSession.sendMessage(new TextMessage(eventPayload));
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String getRoomId(WebSocketSession session) {
        String path = session.getUri().getPath();
        return path.substring(path.lastIndexOf('/') + 1);
    }

    private String getUsernameFromSession(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null) {
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                String[] keyValue = pair.split("=");
                if (keyValue[0].equals("username")) {
                    return keyValue[1];
                }
            }
        }
        return null;
    }

    @Override
    public List<User> getConnectedUsersPerRoom(String roomId) {
        CopyOnWriteArrayList<WebSocketSession> sessions = roomSessions.get(roomId);
        if (sessions != null) {
            return sessions.stream()
                    .map(session -> (User) session.getAttributes().get("user"))
                    .collect(java.util.stream.Collectors.toList());
        }
        return java.util.Collections.emptyList();
    }
}