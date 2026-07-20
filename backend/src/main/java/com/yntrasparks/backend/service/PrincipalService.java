package com.yntrasparks.backend.service;

import com.yntrasparks.backend.dto.request.CreateTeacherRequest;
import com.yntrasparks.backend.dto.response.TeacherResponse;
import com.yntrasparks.backend.dto.response.TempPasswordResponse;
import com.yntrasparks.backend.entity.School;
import com.yntrasparks.backend.entity.User;
import com.yntrasparks.backend.exception.ResourceNotFoundException;
import com.yntrasparks.backend.repository.SchoolRepository;
import com.yntrasparks.backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;

@Service
public class PrincipalService {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final PasswordEncoder passwordEncoder;

    public PrincipalService(UserRepository userRepository,
                            SchoolRepository schoolRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.schoolRepository = schoolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<TeacherResponse> getPrincipals(Long schoolId, Pageable pageable) {
        return userRepository
                .findBySchoolIdAndRole(schoolId, User.Role.PRINCIPAL, pageable)
                .map(TeacherResponse::from);
    }

    @Transactional
    public TempPasswordResponse createPrincipal(Long schoolId, CreateTeacherRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }

        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School", schoolId));

        String tempPassword = generateTempPassword();

        User principal = new User();
        principal.setName(request.getName());
        principal.setEmail(request.getEmail());
        principal.setPassword(passwordEncoder.encode(tempPassword));
        principal.setRole(User.Role.PRINCIPAL);
        principal.setSchool(school);
        principal.setStatus(User.UserStatus.ACTIVE);
        principal.setMustChangePassword(true);

        userRepository.save(principal);

        return new TempPasswordResponse(tempPassword);
    }

    @Transactional
    public void deactivatePrincipal(Long schoolId, Long principalId) {
        User principal = findPrincipalInSchool(schoolId, principalId);
        principal.setStatus(User.UserStatus.INACTIVE);
        userRepository.save(principal);
    }

    @Transactional
    public void reactivatePrincipal(Long schoolId, Long principalId) {
        User principal = findPrincipalInSchool(schoolId, principalId);
        principal.setStatus(User.UserStatus.ACTIVE);
        userRepository.save(principal);
    }

    @Transactional
    public TempPasswordResponse resetPassword(Long schoolId, Long principalId) {
        User principal = findPrincipalInSchool(schoolId, principalId);
        String tempPassword = generateTempPassword();
        principal.setPassword(passwordEncoder.encode(tempPassword));
        principal.setMustChangePassword(true);
        userRepository.save(principal);
        return new TempPasswordResponse(tempPassword);
    }

    private User findPrincipalInSchool(Long schoolId, Long principalId) {
        User principal = userRepository.findById(principalId)
                .orElseThrow(() -> new ResourceNotFoundException("Principal", principalId));

        if (!principal.getSchool().getId().equals(schoolId) ||
                principal.getRole() != User.Role.PRINCIPAL) {
            throw new ResourceNotFoundException("Principal", principalId);
        }

        return principal;
    }

    private String generateTempPassword() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[8];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
