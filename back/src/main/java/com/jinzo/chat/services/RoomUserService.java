package com.jinzo.chat.services;

import com.jinzo.chat.models.User;
import java.util.List;

public interface RoomUserService {
    List<User> getConnectedUsersPerRoom(String roomId);
}
