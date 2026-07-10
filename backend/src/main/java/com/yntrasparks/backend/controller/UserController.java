package com.yntrasparks.backend.controller;

import com.yntrasparks.backend.dto.response.ApiResponse;
import com.yntrasparks.backend.dto.response.LoginResponse;
import com.yntrasparks.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse.UserInfo>> me() {
        return ResponseEntity.ok(ApiResponse.success(userService.getCurrentUser()));
    }
}
