package com.yntrasparks.backend.repository;

import com.yntrasparks.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Used for "view teacher list" — Principal sees only their own school's teachers
    Page<User> findBySchoolIdAndRole(Long schoolId, User.Role role, Pageable pageable);

    long countBySchoolIdAndRole(Long schoolId, User.Role role);
}