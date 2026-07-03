package com.yntrasparks.backend.dto.response;

import com.yntrasparks.backend.entity.User;

public class LoginResponse {

    private final String accessToken;
    private final UserInfo user;

    private LoginResponse(String accessToken, UserInfo user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    public static LoginResponse from(String accessToken, User user) {
        UserInfo userInfo = new UserInfo(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getSchool() != null ? user.getSchool().getId() : null,
                user.isMustChangePassword()
        );
        return new LoginResponse(accessToken, userInfo);
    }

    public String getAccessToken() { return accessToken; }
    public UserInfo getUser() { return user; }

    public static class UserInfo {
        private final Long id;
        private final String name;
        private final String email;
        private final String role;
        private final Long schoolId;
        private final boolean mustChangePassword;

        public UserInfo(Long id, String name, String email, String role,
                        Long schoolId, boolean mustChangePassword) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
            this.schoolId = schoolId;
            this.mustChangePassword = mustChangePassword;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
        public Long getSchoolId() { return schoolId; }
        public boolean isMustChangePassword() { return mustChangePassword; }
    }
}