package com.velvra.backend.service;

import com.velvra.backend.dto.common.UpdateUserRequest;
import com.velvra.backend.dto.common.UserSummary;
import com.velvra.backend.entity.User;
import com.velvra.backend.exception.ApiException;
import com.velvra.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StorageService storageService;

    public UserSummary getById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        return UserSummary.from(user);
    }

    @Transactional
    public UserSummary updateProfile(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        if (request.displayName() != null && !request.displayName().isBlank()) {
            user.setDisplayName(request.displayName());
        }
        if (request.bio() != null) {
            user.setBio(request.bio());
        }
        return UserSummary.from(userRepository.save(user));
    }

    @Transactional
    public String updateAvatar(Long id, MultipartFile file) {
        User user = userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        String url = storageService.store(file, "avatars");
        user.setAvatarUrl(url);
        userRepository.save(user);
        return url;
    }
}
