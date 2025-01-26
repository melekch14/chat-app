package com.jinzo.chat.controllers;

import com.jinzo.chat.models.User;
import com.jinzo.chat.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        return authService.register(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        System.out.println("ssssssssssssssssssssss "+user.getUsername());
        return authService.login(user.getUsername(), user.getPassword());
    }
}
