package com.yntrasparks.backend.controller;

import com.yntrasparks.backend.dto.request.KitRequest;
import com.yntrasparks.backend.dto.response.ApiResponse;
import com.yntrasparks.backend.dto.response.KitResponse;
import com.yntrasparks.backend.dto.response.ManualUploadResponse;
import com.yntrasparks.backend.dto.response.SchoolResponse;
import com.yntrasparks.backend.service.FileStorageService;
import com.yntrasparks.backend.service.KitService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.yntrasparks.backend.dto.response.ManualDownloadResponse;

import java.util.List;

@RestController
@RequestMapping("/api")
public class KitController {

    private final KitService kitService;
    private final FileStorageService fileStorageService;

    public KitController(KitService kitService, FileStorageService fileStorageService) {
        this.kitService = kitService;
        this.fileStorageService = fileStorageService;
    }

    /**
     * GET /api/kits
     * Super Admin only — all active kits
     */
    @GetMapping("/kits")
    public ResponseEntity<ApiResponse<Page<KitResponse>>> getAllKits(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(ApiResponse.success(kitService.getAllKits(pageable)));
    }

    /**
     * GET /api/kits/school
     * Principal / Teacher — only their school's purchased kits
     */
    @GetMapping("/kits/school")
    public ResponseEntity<ApiResponse<Page<KitResponse>>> getSchoolKits(
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(ApiResponse.success(kitService.getSchoolKits(pageable)));
    }

    /**
     * GET /api/kits/{id}
     * All authenticated — service enforces school boundary for non-admins
     */
    @GetMapping("/kits/{id}")
    public ResponseEntity<ApiResponse<KitResponse>> getKit(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(kitService.getKitById(id)));
    }

    /**
     * GET /api/kits/{id}/schools
     * Super Admin only - schools that currently have access to this kit
     */
    @GetMapping("/kits/{id}/schools")
    public ResponseEntity<ApiResponse<List<SchoolResponse>>> getSchoolsForKit(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(kitService.getSchoolsForKit(id)));
    }

    /**
     * POST /api/kits
     * Super Admin only
     */
    @PostMapping("/kits")
    public ResponseEntity<ApiResponse<KitResponse>> createKit(
            @Valid @RequestBody KitRequest request) {

        KitResponse kit = kitService.createKit(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(kit, "Kit created successfully"));
    }

    /**
     * POST /api/kits/manuals
     * Super Admin only — uploads a kit manual PDF and returns its public URL.
     */
    @PostMapping("/kits/manuals")
    public ResponseEntity<ApiResponse<ManualUploadResponse>> uploadManual(
            @RequestParam("file") MultipartFile file) {

        ManualUploadResponse manual = fileStorageService.storeManualPdf(file);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(manual, "Manual uploaded successfully"));
    }

    /**
     * GET /api/kits/manuals/{key}/download-url
     * Generates a fresh, short-lived (15 min) download link for a manual.
     * Never store this URL — call this endpoint again each time a download is
     * needed.
     */
    @GetMapping("/kits/manuals/{key}/download-url")
    public ResponseEntity<ApiResponse<ManualDownloadResponse>> getManualDownloadUrl(
            @PathVariable String key) {

        String downloadUrl = fileStorageService.generateDownloadUrl("manuals/" + key);
        return ResponseEntity.ok(ApiResponse.success(new ManualDownloadResponse(downloadUrl)));
    }

    /**
     * PUT /api/kits/{id}
     * Super Admin only
     */
    @PutMapping("/kits/{id}")
    public ResponseEntity<ApiResponse<KitResponse>> updateKit(
            @PathVariable Long id,
            @Valid @RequestBody KitRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(kitService.updateKit(id, request),
                        "Kit updated successfully"));
    }

    /**
     * DELETE /api/kits/{id}
     * Super Admin only — archives rather than hard deletes (er-diagram.md ADR)
     */
    @DeleteMapping("/kits/{id}")
    public ResponseEntity<ApiResponse<Void>> archiveKit(@PathVariable Long id) {
        kitService.archiveKit(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Kit archived successfully"));
    }

    /**
     * POST /api/schools/{schoolId}/kits/{kitId}
     * Super Admin only — assign kit to school
     */
    @PostMapping("/schools/{schoolId}/kits/{kitId}")
    public ResponseEntity<ApiResponse<Void>> assignKitToSchool(
            @PathVariable Long schoolId,
            @PathVariable Long kitId) {

        kitService.assignKitToSchool(schoolId, kitId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(null, "Kit assigned to school"));
    }

    /**
     * DELETE /api/schools/{schoolId}/kits/{kitId}
     * Super Admin only — revoke school's access to kit
     */
    @DeleteMapping("/schools/{schoolId}/kits/{kitId}")
    public ResponseEntity<ApiResponse<Void>> revokeKitFromSchool(
            @PathVariable Long schoolId,
            @PathVariable Long kitId) {

        kitService.revokeKitFromSchool(schoolId, kitId);
        return ResponseEntity.ok(ApiResponse.success(null, "Kit access revoked"));
    }
}
