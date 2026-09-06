package com.velvra.backend.dto.common;

import com.velvra.backend.entity.User;

public record UserSummary(
        Long id,
        String username,
        String displayName,
        String role,
        String avatarUrl,
        String bio
) {
    public static UserSummary from(User user) {
        return new UserSummary(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getRole().name(),
                user.getAvatarUrl(),
                user.getBio()
        );
    }
}
