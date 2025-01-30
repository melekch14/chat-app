package com.jinzo.chat.services;

import com.jinzo.chat.models.Room;
import com.jinzo.chat.models.User;
import com.jinzo.chat.repositories.RoomRepository;
import com.jinzo.chat.repositories.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final RoomUserService roomUserService;

    public RoomService(RoomRepository roomRepository, UserRepository userRepository, @Lazy RoomUserService roomUserService) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.roomUserService = roomUserService;
    }

    public Room createRoom(Room room) {
        return roomRepository.save(room);
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public void addUserToRoom(String roomId, String username) {
        Room room = roomRepository.findRoomByName(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (room.getUsers().contains(user)) {
            throw new RuntimeException("User already exists in the room");
        }

        room.getUsers().add(user);
        roomRepository.save(room);
    }

    public List<Room> getUserRooms(String username) {
        return roomRepository.findAll().stream()
                .filter(room -> room.getUsers().stream()
                        .anyMatch(user -> user.getUsername().equals(username)))
                .collect(Collectors.toList());
    }

    public Optional<Room> getRoomById(Long id) {
        return roomRepository.findById(id);
    }

    public Optional<Room> getRoomByName(String id) {
        return roomRepository.findRoomByName(id);
    }

    public List<User> getConnectedUsersPerRoom(String roomId) {
        List<User> users = roomUserService.getConnectedUsersPerRoom(roomId);
        System.out.println("vvvvvvvvvvvv " + users.size());
        return users;
    }

}