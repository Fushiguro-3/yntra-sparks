package com.yntrasparks.backend.repository;

import com.yntrasparks.backend.entity.SchoolKit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SchoolKitRepository extends JpaRepository<SchoolKit, SchoolKit.SchoolKitId> {

    boolean existsBySchoolIdAndKitId(Long schoolId, Long kitId);
    void deleteBySchoolIdAndKitId(Long schoolId, Long kitId);

    @Query("select sk from SchoolKit sk join fetch sk.school where sk.kit.id = :kitId")
    List<SchoolKit> findByKitIdWithSchool(@Param("kitId") Long kitId);
}
