package com.yntrasparks.backend.repository;

import com.yntrasparks.backend.entity.SchoolKit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolKitRepository extends JpaRepository<SchoolKit, SchoolKit.SchoolKitId> {

    boolean existsBySchoolIdAndKitId(Long schoolId, Long kitId);
    void deleteBySchoolIdAndKitId(Long schoolId, Long kitId);
}