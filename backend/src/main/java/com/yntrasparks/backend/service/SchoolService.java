package com.yntrasparks.backend.service;

import com.yntrasparks.backend.dto.request.SchoolRequest;
import com.yntrasparks.backend.dto.request.SchoolStatusRequest;
import com.yntrasparks.backend.dto.response.SchoolResponse;
import com.yntrasparks.backend.entity.School;
import com.yntrasparks.backend.exception.ResourceNotFoundException;
import com.yntrasparks.backend.repository.SchoolRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SchoolService {

    private final SchoolRepository schoolRepository;

    public SchoolService(SchoolRepository schoolRepository) {
        this.schoolRepository = schoolRepository;
    }

    public Page<SchoolResponse> getAllSchools(Pageable pageable) {
        return schoolRepository.findAll(pageable)
                .map(SchoolResponse::from);
    }

    public SchoolResponse getSchoolById(Long id) {
        School school = findSchoolById(id);
        return SchoolResponse.from(school);
    }

    @Transactional
    public SchoolResponse createSchool(SchoolRequest request) {
        School school = new School();
        school.setName(request.getName());
        school.setEmail(request.getEmail());
        school.setAddress(request.getAddress());
        school.setStatus(School.SchoolStatus.PENDING_APPROVAL);

        return SchoolResponse.from(schoolRepository.save(school));
    }

    @Transactional
    public SchoolResponse updateSchool(Long id, SchoolRequest request) {
        School school = findSchoolById(id);
        school.setName(request.getName());
        school.setEmail(request.getEmail());
        school.setAddress(request.getAddress());

        return SchoolResponse.from(schoolRepository.save(school));
    }

    @Transactional
    public SchoolResponse updateSchoolStatus(Long id, SchoolStatusRequest request) {
        School school = findSchoolById(id);

        try {
            School.SchoolStatus newStatus =
                    School.SchoolStatus.valueOf(request.getStatus().toUpperCase());
            school.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid status: " + request.getStatus() +
                    ". Allowed values: ACTIVE, INACTIVE, PENDING_APPROVAL");
        }

        return SchoolResponse.from(schoolRepository.save(school));
    }

    // Private helper — single place to throw 404 for a missing school
    private School findSchoolById(Long id) {
        return schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("School", id));
    }
}