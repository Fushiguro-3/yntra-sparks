package com.yntrasparks.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.util.List;

/**
 * Standard response envelope for every endpoint.
 * Matches the shape defined in docs/api-contract.md.
 *
 * Usage:
 *   return ResponseEntity.ok(ApiResponse.success(data));
 *   return ResponseEntity.badRequest().body(ApiResponse.error("Validation failed", errors));
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL) // omit null fields from JSON output
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;
    private final List<FieldError> errors;

    private ApiResponse(boolean success, T data, String message, List<FieldError> errors) {
        this.success = success;
        this.data    = data;
        this.message = message;
        this.errors  = errors;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null, null);
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, data, message, null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, message, null);
    }

    public static <T> ApiResponse<T> error(String message, List<FieldError> errors) {
        return new ApiResponse<>(false, null, message, errors);
    }

    @Getter
    public static class FieldError {
        private final String field;
        private final String message;

        public FieldError(String field, String message) {
            this.field   = field;
            this.message = message;
        }
    }
}