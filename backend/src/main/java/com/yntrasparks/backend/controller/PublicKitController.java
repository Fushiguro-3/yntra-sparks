package com.yntrasparks.backend.controller;

import com.yntrasparks.backend.dto.response.ApiResponse;
import com.yntrasparks.backend.dto.response.PublicKitResponse;
import com.yntrasparks.backend.service.KitService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/kits")
public class PublicKitController {

    private final KitService kitService;

    public PublicKitController(KitService kitService) {
        this.kitService = kitService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PublicKitResponse>>> list(
            @RequestParam(required = false) String grade,
            @PageableDefault(size = 12, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(ApiResponse.success(kitService.getPublicKits(grade, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PublicKitResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(kitService.getPublicKitById(id)));
    }
}
