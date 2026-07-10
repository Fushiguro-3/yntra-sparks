package com.yntrasparks.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    private final Path manualUploadDir;

    public StaticResourceConfig(@Value("${app.upload.manual-dir:uploads/manuals}") String manualDir) {
        this.manualUploadDir = Paths.get(manualDir).toAbsolutePath().normalize();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/manuals/**")
                .addResourceLocations(manualUploadDir.toUri().toString());
    }
}
