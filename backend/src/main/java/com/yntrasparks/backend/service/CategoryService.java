package com.yntrasparks.backend.service;

import com.yntrasparks.backend.dto.request.CategoryRequest;
import com.yntrasparks.backend.dto.response.CategoryResponse;
import com.yntrasparks.backend.entity.Category;
import com.yntrasparks.backend.exception.ResourceNotFoundException;
import com.yntrasparks.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
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

        // Check name conflict — exclude current category from the check
        if (categoryRepository.existsByIdNotAndNameIgnoreCase(id, request.getName())) {
            throw new IllegalArgumentException(
                    "Category name already in use: " + request.getName());
        }

        category.setName(request.getName().trim());
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = findCategoryById(id);
        // Per api-contract.md open question #2: block delete if any Kit
        // references this category. KitRepository check added once Kit entity exists.
        categoryRepository.delete(category);
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }
}