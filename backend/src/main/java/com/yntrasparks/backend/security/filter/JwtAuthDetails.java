package com.yntrasparks.backend.security.filter;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.authentication.WebAuthenticationDetails;

/**
 * Extends WebAuthenticationDetails to carry userId, schoolId, and role
 * from JWT claims into the security context. This lets service-layer code
 * call SecurityContextHolder to get the current user's schoolId without
 * an extra database hit on every request.
 *
 * Usage in any service:
 *   Authentication auth = SecurityContextHolder.getContext().getAuthentication();
 *   JwtAuthDetails details = (JwtAuthDetails) auth.getDetails();
 *   Long schoolId = details.getSchoolId();
 */
public class JwtAuthDetails extends WebAuthenticationDetails {

    private final Long userId;
    private final Long schoolId;
    private final String role;

    public JwtAuthDetails(Long userId, Long schoolId, String role,
                          HttpServletRequest request) {
        super(request);
        this.userId   = userId;
        this.schoolId = schoolId;
        this.role     = role;
    }

    public Long getUserId()   { return userId; }
    public Long getSchoolId() { return schoolId; }
    public String getRole()   { return role; }
}