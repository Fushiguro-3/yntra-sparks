package com.yntrasparks.backend.service;

import com.yntrasparks.backend.dto.response.LoginResponse;
import com.yntrasparks.backend.entity.User;
import com.yntrasparks.backend.exception.UnauthorizedException;
import com.yntrasparks.backend.repository.UserRepository;
import com.yntrasparks.backend.security.filter.JwtAuthDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LoginResponse.UserInfo getCurrentUser() {
        JwtAuthDetails details = getCurrentUserDetails();

        User user = userRepository.findById(details.getUserId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (user.getStatus() == User.UserStatus.INACTIVE) {
            throw new UnauthorizedException("Account is deactivated");
        }

        return new LoginResponse.UserInfo(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getSchool() != null ? user.getSchool().getId() : null,
                user.isMustChangePassword()
        );
    }

    private JwtAuthDetails getCurrentUserDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getDetails() instanceof JwtAuthDetails details)) {
            throw new UnauthorizedException("Authentication required");
        }
        return details;
    }
}
