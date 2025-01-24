package com.jinzo.chat.services;

import com.jinzo.chat.models.Room;
import com.jinzo.chat.models.User;
import com.jinzo.chat.repositories.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public Room createRoom(Room room){
        if(roomRepository.findByName(room.getName()))
            throw new IllegalStateException("Room already exist");
        return roomRepository.save(room);
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public void addUserToRoom(Room room, User user){
        room.getUsers().add(user);
    }

    public List<Room> getUserRooms(User user){
        return roomRepository.findAll().stream().filter(room ->
                room.getUsers().contains(user)).collect(Collectors.toList());
    }

    public Optional<Room> getRoomById(Long id){
        return roomRepository.findById(id);
    }
}

