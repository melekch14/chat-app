package com.jinzo.chat.repositories;

import com.jinzo.chat.models.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    boolean findByName(String name);
}
