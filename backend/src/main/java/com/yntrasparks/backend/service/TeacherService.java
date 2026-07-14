package com.yntrasparks.backend.service;

import com.yntrasparks.backend.dto.request.CreateTeacherRequest;
import com.yntrasparks.backend.dto.response.TeacherResponse;
import com.yntrasparks.backend.dto.response.TempPasswordResponse;
import com.yntrasparks.backend.entity.School;
import com.yntrasparks.backend.entity.User;
import com.yntrasparks.backend.exception.ResourceNotFoundException;
import com.yntrasparks.backend.exception.UnauthorizedException;
import com.yntrasparks.backend.repository.SchoolRepository;
import com.yntrasparks.backend.repository.UserRepository;
import com.yntrasparks.backend.security.filter.JwtAuthDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;

@Service
public class TeacherService {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final PasswordEncoder passwordEncoder;

    public TeacherService(UserRepository userRepository,
                          SchoolRepository schoolRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.schoolRepository = schoolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<TeacherResponse> getTeachers(Long schoolId, Pageable pageable) {
        enforceSchoolAccess(schoolId);
        return userRepository
                .findBySchoolIdAndRole(schoolId, User.Role.TEACHER, pageable)
                .map(TeacherResponse::from);
    }

    @Transactional
    public TempPasswordResponse createTeacher(Long schoolId,
                                               CreateTeacherRequest request) {
        enforceSchoolAccess(schoolId);

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "Email already in use: " + request.getEmail());
        }

        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School", schoolId));

        String tempPassword = generateTempPassword();

        User teacher = new User();
        teacher.setName(request.getName());
        teacher.setEmail(request.getEmail());
        teacher.setPassword(passwordEncoder.encode(tempPassword));
        teacher.setRole(User.Role.TEACHER);
        teacher.setSchool(school);
        teacher.setStatus(User.UserStatus.ACTIVE);
        teacher.setMustChangePassword(true); // force change on first login

        userRepository.save(teacher);

        // Temp password returned ONCE — Principal communicates it manually (ADR-001)
        // Never logged, never stored in plaintext
        return new TempPasswordResponse(tempPassword);
    }

    @Transactional
    public void deactivateTeacher(Long schoolId, Long teacherId) {
        enforceSchoolAccess(schoolId);
        User teacher = findTeacherInSchool(schoolId, teacherId);
        teacher.setStatus(User.UserStatus.INACTIVE);
        userRepository.save(teacher);
    }

    @Transactional
    public void reactivateTeacher(Long schoolId, Long teacherId) {
        enforceSchoolAccess(schoolId);
        User teacher = findTeacherInSchool(schoolId, teacherId);
        teacher.setStatus(User.UserStatus.ACTIVE);
        userRepository.save(teacher);
    }

    @Transactional
    public TempPasswordResponse resetPassword(Long schoolId, Long teacherId) {
        enforceSchoolAccess(schoolId);
        User teacher = findTeacherInSchool(schoolId, teacherId);

        String tempPassword = generateTempPassword();
        teacher.setPassword(passwordEncoder.encode(tempPassword));
        teacher.setMustChangePassword(true);
        userRepository.save(teacher);

        return new TempPasswordResponse(tempPassword);
    }

    // Enforce that the Principal can only manage their own school's teachers
    private void enforceSchoolAccess(Long schoolId) {
        JwtAuthDetails details = getCurrentUserDetails();
        String role = details.getRole();

        // Super Admin can access any school
        if (role.equals("SUPER_ADMIN")) return;

        // Principal can only access their own school
        if (!schoolId.equals(details.getSchoolId())) {
            throw new UnauthorizedException(
                    "You can only manage teachers in your own school");
        }
    }

    private User findTeacherInSchool(Long schoolId, Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", teacherId));

        if (!teacher.getSchool().getId().equals(schoolId) ||
                teacher.getRole() != User.Role.TEACHER) {
            throw new ResourceNotFoundException("Teacher", teacherId);
        }

        return teacher;
    }

    private JwtAuthDetails getCurrentUserDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (JwtAuthDetails) auth.getDetails();
    }

    // Generates a secure 10-character random password
    private String generateTempPassword() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[8];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}