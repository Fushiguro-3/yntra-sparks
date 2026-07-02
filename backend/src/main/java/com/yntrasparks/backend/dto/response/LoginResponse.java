package com.yntrasparks.backend.dto.response;

import com.yntrasparks.backend.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private final String accessToken;
    private final UserInfo user;

    @Getter
    @Builder
    public static class UserInfo {
        private final Long id;
        private final String name;
        private final String email;
        private final String role;
        private final Long schoolId;
        private final boolean mustChangePassword;
    }

    public static LoginResponse from(String accessToken, User user) {
        return LoginResponse.builder()
                .accessToken(accessToken)
                .user(UserInfo.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .schoolId(user.getSchool() != null ? user.getSchool().getId() : null)
                        .mustChangePassword(user.isMustChangePassword())
                        .build())
                .build();
    }
}