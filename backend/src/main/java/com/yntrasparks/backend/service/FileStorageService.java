package com.yntrasparks.backend.service;

import com.yntrasparks.backend.dto.response.ManualUploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path manualUploadDir;

    public FileStorageService(@Value("${app.upload.manual-dir:uploads/manuals}") String manualDir) {
        this.manualUploadDir = Paths.get(manualDir).toAbsolutePath().normalize();
    }

    public ManualUploadResponse storeManualPdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Manual PDF is required");
        }

        String originalName = file.getOriginalFilename() == null ? "manual.pdf" : file.getOriginalFilename();
        String lowerName = originalName.toLowerCase(Locale.ROOT);
        if (!lowerName.endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF manuals can be uploaded");
        }

        try {
            Files.createDirectories(manualUploadDir);
            String storedName = UUID.randomUUID() + ".pdf";
            Path target = manualUploadDir.resolve(storedName).normalize();
            if (!target.startsWith(manualUploadDir)) {
                throw new IllegalArgumentException("Invalid manual file name");
            }
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return new ManualUploadResponse("/uploads/manuals/" + storedName, originalName);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not store manual PDF", ex);
        }
    }
}
