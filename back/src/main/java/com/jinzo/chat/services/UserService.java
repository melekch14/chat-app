package com.jinzo.chat.services;

import com.jinzo.chat.models.User;
import com.jinzo.chat.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        if(userRepository.findByUsername(user.getUsername()) != null)
            throw new IllegalStateException("Username is already in use");
        return userRepository.save(user);
    }

    public User getUserById(Long id){
        return userRepository.findById(id).orElse(null);
    }

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

}
