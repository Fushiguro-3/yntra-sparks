package com.yntrasparks.backend.controller;

import com.yntrasparks.backend.dto.request.SchoolRequest;
import com.yntrasparks.backend.dto.request.SchoolStatusRequest;
import com.yntrasparks.backend.dto.response.ApiResponse;
import com.yntrasparks.backend.dto.response.SchoolResponse;
import com.yntrasparks.backend.service.SchoolService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/schools")
public class SchoolController {

    private final SchoolService schoolService;

    public SchoolController(SchoolService schoolService) {
        this.schoolService = schoolService;
    }

    /**
     * GET /api/schools?page=0&size=20
     * Super Admin only — returns paginated list of all schools
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<SchoolResponse>>> getAllSchools(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        Page<SchoolResponse> schools = schoolService.getAllSchools(pageable);
        return ResponseEntity.ok(ApiResponse.success(schools));
    }

    /**
     * GET /api/schools/{id}
     * Super Admin only — returns single school by id
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SchoolResponse>> getSchool(@PathVariable Long id) {
        SchoolResponse school = schoolService.getSchoolById(id);
        return ResponseEntity.ok(ApiResponse.success(school));
    }

    /**
     * POST /api/schools
     * Super Admin only — creates a new school (defaults to PENDING_APPROVAL)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SchoolResponse>> createSchool(
            @Valid @RequestBody SchoolRequest request) {

        SchoolResponse school = schoolService.createSchool(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(school, "School created successfully"));
    }

    /**
     * PUT /api/schools/{id}
     * Super Admin only — updates school name, email, address
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SchoolResponse>> updateSchool(
            @PathVariable Long id,
            @Valid @RequestBody SchoolRequest request) {

        SchoolResponse school = schoolService.updateSchool(id, request);
        return ResponseEntity.ok(ApiResponse.success(school, "School updated successfully"));
    }

    /**
     * PATCH /api/schools/{id}/status
     * Super Admin only — activate, deactivate, or set pending approval
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SchoolResponse>> updateSchoolStatus(
            @PathVariable Long id,
            @Valid @RequestBody SchoolStatusRequest request) {

        SchoolResponse school = schoolService.updateSchoolStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(school, "School status updated"));
    }
}