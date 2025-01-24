package com.jinzo.chat.services;

import com.jinzo.chat.models.Message;
import com.jinzo.chat.models.Room;
import com.jinzo.chat.repositories.MessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Message storeMessage(Message message) {
        message.setTimestamp(LocalDateTime.now());
        return messageRepository.save(message);
    }

    public List<Message> getMessagesForRoom(Room room) {
        return messageRepository.findByRoom(room);
    }
}
