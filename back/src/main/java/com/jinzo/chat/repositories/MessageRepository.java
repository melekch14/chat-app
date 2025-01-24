package com.jinzo.chat.repositories;

import com.jinzo.chat.models.Message;
import com.jinzo.chat.models.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByRoom(Room room);
}
