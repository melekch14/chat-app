package com.jinzo.chat.controllers;

import com.jinzo.chat.models.Room;
import com.jinzo.chat.models.User;
import com.jinzo.chat.services.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    public void joinUser(@RequestBody Map<String, String> request) {
        String roomId = request.get("roomId");
        String username = request.get("userName");
        roomService.addUserToRoom(roomId, username);
    }

    @GetMapping("/usersRooms/{username}")
    public List<Room> getUserRooms(@PathVariable String username) {
         return roomService.getUserRooms(username);
    }

    @GetMapping("/rooms/{roomId}/users")
    public List<User> getConnectedUsers(@PathVariable String roomId) {
        return roomService.getConnectedUsersPerRoom(roomId);
    }

    @GetMapping("/rooms/{roomId}")
    public Room getRoom(@PathVariable Long roomId) {
        Optional<Room> room = roomService.getRoomById(roomId);
        return room.orElse(null);
    }

    @GetMapping("/getRoomByName/{roomId}")
    public Room getRoomByName(@PathVariable String roomId) {
        System.out.println("getRoomByName "+roomId);
        Optional<Room> room = roomService.getRoomByName(roomId);
        return room.orElse(null);
    }

}
