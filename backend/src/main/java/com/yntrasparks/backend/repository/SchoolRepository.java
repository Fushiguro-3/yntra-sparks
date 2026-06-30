package com.yntrasparks.backend.repository;

import com.yntrasparks.backend.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolRepository extends JpaRepository<School, Long> {
}