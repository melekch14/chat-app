package com.jinzo.chat.services;

import com.jinzo.chat.models.Message;
import com.jinzo.chat.models.Room;
import com.jinzo.chat.repositories.MessageRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final RoomService roomService;

    public MessageService(MessageRepository messageRepository, @Lazy RoomService roomService) {
        this.messageRepository = messageRepository;
        this.roomService = roomService;
    }

    public Message storeMessage(Message message) {
        message.setTimestamp(LocalDateTime.now());
        Room room = getRoomByName(message.getRoomName());
        message.setRoom(room);
        return messageRepository.save(message);
    }

    public List<Message> getMessagesForRoom(String roomName) {
        Room room = getRoomByName(roomName);
        return messageRepository.findByRoom(room);
    }

    public Room getRoomByName(String id) {
        Optional<Room> optionalRoom = roomService.getRoomByName(id);

        // Check if the Room is present in the Optional
        if (optionalRoom.isPresent()) {
            // Get the Room object from the Optional
            return optionalRoom.get();
        } else {
            // Handle the case where the Room is not found
            throw new RuntimeException("Room not found with name: " + id);
        }
    }

}