package com.jinzo.chat.startup;

import com.jinzo.chat.models.Room;
import com.jinzo.chat.services.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class StartupInitialization {

    @Autowired
    private RoomService roomService;

    @EventListener(ContextRefreshedEvent.class)
    public void onApplicationEvent(ContextRefreshedEvent event) {
        Room generalRoom = roomService.getRoomByName("GN").orElse(null);
        if (generalRoom == null) {
            Room newRoom = new Room();
            newRoom.setName("GN");
            roomService.createRoom(newRoom);
        } else {
            System.out.println("Room already exists");
        }
    }
}
