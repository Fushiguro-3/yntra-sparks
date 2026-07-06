package com.yntrasparks.backend.controller;

import com.yntrasparks.backend.dto.request.CreateTeacherRequest;
import com.yntrasparks.backend.dto.response.ApiResponse;
import com.yntrasparks.backend.dto.response.TeacherResponse;
import com.yntrasparks.backend.dto.response.TempPasswordResponse;
import com.yntrasparks.backend.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/schools/{schoolId}/teachers")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    /**
     * GET /api/schools/{schoolId}/teachers
     * Principal (own school) or Super Admin (any school)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<TeacherResponse>>> getTeachers(
            @PathVariable Long schoolId,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<TeacherResponse> teachers =
                teacherService.getTeachers(schoolId, pageable);
        return ResponseEntity.ok(ApiResponse.success(teachers));
    }

    /**
     * POST /api/schools/{schoolId}/teachers
     * Principal (own school) only
     * Returns temp password ONCE — never retrievable again
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TempPasswordResponse>> createTeacher(
            @PathVariable Long schoolId,
            @Valid @RequestBody CreateTeacherRequest request) {

        TempPasswordResponse response =
                teacherService.createTeacher(schoolId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response,
                        "Teacher created. Share the temp password now — it won't be shown again."));
    }

    /**
     * DELETE /api/schools/{schoolId}/teachers/{teacherId}
     * Principal (own school) only — soft delete (sets status INACTIVE)
     */
    @DeleteMapping("/{teacherId}")
    public ResponseEntity<ApiResponse<Void>> deactivateTeacher(
            @PathVariable Long schoolId,
            @PathVariable Long teacherId) {

        teacherService.deactivateTeacher(schoolId, teacherId);
        return ResponseEntity.ok(
                ApiResponse.success(null, "Teacher deactivated"));
    }

    /**
     * PATCH /api/schools/{schoolId}/teachers/{teacherId}/reset-password
     * Principal (own school) only
     * Returns new temp password ONCE
     */
    @PatchMapping("/{teacherId}/reset-password")
    public ResponseEntity<ApiResponse<TempPasswordResponse>> resetPassword(
            @PathVariable Long schoolId,
            @PathVariable Long teacherId) {

        TempPasswordResponse response =
                teacherService.resetPassword(schoolId, teacherId);
        return ResponseEntity.ok(ApiResponse.success(response,
                "Password reset. Share the temp password now — it won't be shown again."));
    }
}