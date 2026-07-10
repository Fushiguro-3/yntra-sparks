package com.yntrasparks.backend.repository;

import com.yntrasparks.backend.entity.Kit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface KitRepository extends JpaRepository<Kit, Long> {

    // Super Admin — all active kits, optionally filtered by category
    Page<Kit> findByStatus(Kit.KitStatus status, Pageable pageable);

    Page<Kit> findByStatusAndGradeIgnoreCase(Kit.KitStatus status, String grade, Pageable pageable);

    Optional<Kit> findByIdAndStatus(Long id, Kit.KitStatus status);

    // Principal/Teacher — only kits their school has purchased, active only
    @Query("""
        SELECT k FROM Kit k
        JOIN SchoolKit sk ON sk.kit.id = k.id
        WHERE sk.school.id = :schoolId
        AND k.status = 'ACTIVE'
        """)
    Page<Kit> findBySchoolId(@Param("schoolId") Long schoolId, Pageable pageable);

    // Check if a school has access to a specific kit
    @Query("""
        SELECT COUNT(sk) > 0 FROM SchoolKit sk
        WHERE sk.school.id = :schoolId AND sk.kit.id = :kitId
        """)
    boolean existsBySchoolIdAndKitId(
            @Param("schoolId") Long schoolId,
            @Param("kitId") Long kitId);

    boolean existsByCategoryId(Long categoryId);
}
