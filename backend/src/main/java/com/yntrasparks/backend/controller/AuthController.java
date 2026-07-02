package com.yntrasparks.backend.controller;

import com.yntrasparks.backend.dto.request.LoginRequest;
import com.yntrasparks.backend.dto.response.ApiResponse;
import com.yntrasparks.backend.dto.response.LoginResponse;
import com.yntrasparks.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/login
     * Returns access token in body, sets refresh token as httpOnly cookie.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {

        LoginResponse loginResponse = authService.login(request, response);
        return ResponseEntity.ok(ApiResponse.success(loginResponse, "Login successful"));
    }

    /**
     * POST /api/auth/refresh
     * Reads refresh token from httpOnly cookie, returns new access token.
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<String>> refresh(HttpServletRequest request) {
        String newAccessToken = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.success(newAccessToken));
    }

    /**
     * POST /api/auth/logout
     * Clears the refresh token cookie server-side.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }
}