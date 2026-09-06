package com.velvra.backend.service;

import com.velvra.backend.config.AppProperties;
import com.velvra.backend.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocalStorageService implements StorageService {

    private final AppProperties appProperties;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "webm");

    @Override
    public String store(MultipartFile file, String subDir) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("File is empty");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex + 1).toLowerCase();
        }
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw ApiException.badRequest("Unsupported file type: " + extension);
        }

        String filename = UUID.randomUUID() + "." + extension;

        try {
            Path targetDir = Path.of(appProperties.getUpload().getDir(), subDir).normalize();
            Files.createDirectories(targetDir);
            Path targetPath = targetDir.resolve(filename).normalize();
            if (!targetPath.startsWith(targetDir)) {
                throw ApiException.badRequest("Invalid file path");
            }
            file.transferTo(targetPath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }

        return "/media/" + subDir + "/" + filename;
    }
}
