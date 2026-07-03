package com.yntrasparks.backend.controller;

import com.yntrasparks.backend.dto.request.CategoryRequest;
import com.yntrasparks.backend.dto.response.ApiResponse;
import com.yntrasparks.backend.dto.response.CategoryResponse;
import com.yntrasparks.backend.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * GET /api/categories
     * All authenticated users — flat list, not paginated (small dataset)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    /**
     * POST /api/categories
     * Super Admin only — SecurityConfig enforces this
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request) {

        CategoryResponse category = categoryService.createCategory(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(category, "Category created successfully"));
    }

    /**
     * PUT /api/categories/{id}
     * Super Admin only
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {

        CategoryResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success(category, "Category updated successfully"));
    }

    /**
     * DELETE /api/categories/{id}
     * Super Admin only — blocked if any Kit references this category
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success(null, "Category deleted"));
    }
}