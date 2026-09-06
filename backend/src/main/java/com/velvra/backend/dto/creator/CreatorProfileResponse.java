package com.velvra.backend.dto.creator;

import com.velvra.backend.entity.CreatorProfile;

import java.math.BigDecimal;

public record CreatorProfileResponse(
        Long userId,
        String username,
        String displayName,
        String avatarUrl,
        String bio,
        String coverImageUrl,
        BigDecimal subscriptionPrice,
        String category,
        boolean verified,
        long subscriberCount,
        boolean isSubscribed,
        boolean isFollowing
) {
    public static CreatorProfileResponse from(CreatorProfile profile, boolean isSubscribed, boolean isFollowing) {
        var user = profile.getUser();
        return new CreatorProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getBio(),
                profile.getCoverImageUrl(),
                profile.getSubscriptionPrice(),
                profile.getCategory(),
                profile.isVerified(),
                profile.getSubscriberCount(),
                isSubscribed,
                isFollowing
        );
    }
}
