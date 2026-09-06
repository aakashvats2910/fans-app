package com.velvra.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    /**
     * Stores the file under the given sub-directory and returns a public URL path (e.g. "/media/posts/uuid.jpg").
     */
    String store(MultipartFile file, String subDir);
}
