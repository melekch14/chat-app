package com.jinzo.chat.controllers;

import com.jinzo.chat.models.Room;
import com.jinzo.chat.models.User;
import com.jinzo.chat.services.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @PostMapping("/create")
    public Room createRoom(@RequestBody Room room) {
        return roomService.createRoom(room);
    }

    @GetMapping("/rooms")
    public List<Room> getAllRooms() {
        return roomService.getAllRooms();
    }

    @PostMapping("/addUser")
    public void joinUser(@RequestBody Room room, @RequestBody User user) {
        roomService.addUserToRoom(room, user);
    }

    @GetMapping("/usersRooms")
    public List<Room> getUsersRooms(@RequestBody User user) {
        return roomService.getUserRooms(user);
    }

}
