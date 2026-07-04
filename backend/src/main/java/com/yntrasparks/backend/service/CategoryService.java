package com.yntrasparks.backend.service;

import com.yntrasparks.backend.dto.request.CategoryRequest;
import com.yntrasparks.backend.dto.response.CategoryResponse;
import com.yntrasparks.backend.entity.Category;
import com.yntrasparks.backend.exception.ResourceNotFoundException;
import com.yntrasparks.backend.repository.CategoryRepository;
import com.yntrasparks.backend.repository.KitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final KitRepository kitRepository;

    public CategoryService(CategoryRepository categoryRepository,
                           KitRepository kitRepository) {
        this.categoryRepository = categoryRepository;
        this.kitRepository = kitRepository;
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException(
                    "Category already exists: " + request.getName());
        }
        Category category = new Category();
        category.setName(request.getName().trim());
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findCategoryById(id);

        if (categoryRepository.existsByIdNotAndNameIgnoreCase(id, request.getName())) {
            throw new IllegalArgumentException(
                    "Category name already in use: " + request.getName());
        }

        category.setName(request.getName().trim());
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        findCategoryById(id);

        // Block delete if any Kit references this category (api-contract.md Q2)
        if (kitRepository.existsByCategoryId(id)) {
            throw new IllegalArgumentException(
                    "Cannot delete category: kits are still assigned to it. " +
                    "Reassign or archive those kits first.");
        }

        categoryRepository.deleteById(id);
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }
}