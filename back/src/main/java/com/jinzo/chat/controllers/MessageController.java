package com.jinzo.chat.controllers;

import com.jinzo.chat.models.Message;
import com.jinzo.chat.services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/chat/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/roommsg/{roomId}")
    public List<Message> getUserRooms(@PathVariable String roomId) {
        return messageService.getMessagesForRoom(roomId);
    }
}
