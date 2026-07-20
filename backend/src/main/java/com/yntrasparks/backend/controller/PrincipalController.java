package com.yntrasparks.backend.controller;

import com.yntrasparks.backend.dto.request.CreateTeacherRequest;
import com.yntrasparks.backend.dto.response.ApiResponse;
import com.yntrasparks.backend.dto.response.TeacherResponse;
import com.yntrasparks.backend.dto.response.TempPasswordResponse;
import com.yntrasparks.backend.service.PrincipalService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/schools/{schoolId}/principals")
public class PrincipalController {

    private final PrincipalService principalService;

    public PrincipalController(PrincipalService principalService) {
        this.principalService = principalService;
    }

    /** GET /api/schools/{schoolId}/principals — Super Admin only */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<TeacherResponse>>> getPrincipals(
            @PathVariable Long schoolId,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(ApiResponse.success(
                principalService.getPrincipals(schoolId, pageable)));
    }

    /** POST /api/schools/{schoolId}/principals — Super Admin only */
    @PostMapping
    public ResponseEntity<ApiResponse<TempPasswordResponse>> createPrincipal(
            @PathVariable Long schoolId,
            @Valid @RequestBody CreateTeacherRequest request) {

        TempPasswordResponse response = principalService.createPrincipal(schoolId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response,
                        "Principal created. Share the temp password now — it won't be shown again."));
    }

    /** DELETE /api/schools/{schoolId}/principals/{principalId} — Super Admin only */
    @DeleteMapping("/{principalId}")
    public ResponseEntity<ApiResponse<Void>> deactivatePrincipal(
            @PathVariable Long schoolId,
            @PathVariable Long principalId) {

        principalService.deactivatePrincipal(schoolId, principalId);
        return ResponseEntity.ok(ApiResponse.success(null, "Principal deactivated"));
    }

    /** PATCH /api/schools/{schoolId}/principals/{principalId}/activate — Super Admin only */
    @PatchMapping("/{principalId}/activate")
    public ResponseEntity<ApiResponse<Void>> reactivatePrincipal(
            @PathVariable Long schoolId,
            @PathVariable Long principalId) {

        principalService.reactivatePrincipal(schoolId, principalId);
        return ResponseEntity.ok(ApiResponse.success(null, "Principal activated"));
    }

    /** PATCH /api/schools/{schoolId}/principals/{principalId}/reset-password — Super Admin only */
    @PatchMapping("/{principalId}/reset-password")
    public ResponseEntity<ApiResponse<TempPasswordResponse>> resetPassword(
            @PathVariable Long schoolId,
            @PathVariable Long principalId) {

        TempPasswordResponse response = principalService.resetPassword(schoolId, principalId);
        return ResponseEntity.ok(ApiResponse.success(response,
                "Password reset. Share the temp password now — it won't be shown again."));
    }
}
