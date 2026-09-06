package com.velvra.backend.dto.subscription;

import com.velvra.backend.entity.Subscription;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SubscriptionResponse(
        Long id,
        Long creatorId,
        String creatorUsername,
        String creatorDisplayName,
        String creatorAvatarUrl,
        String status,
        BigDecimal price,
        LocalDateTime startedAt,
        LocalDateTime expiresAt,
        boolean autoRenew
) {
    public static SubscriptionResponse from(Subscription s) {
        return new SubscriptionResponse(
                s.getId(),
                s.getCreator().getId(),
                s.getCreator().getUsername(),
                s.getCreator().getDisplayName(),
                s.getCreator().getAvatarUrl(),
                s.getStatus().name(),
                s.getPrice(),
                s.getStartedAt(),
                s.getExpiresAt(),
                s.isAutoRenew()
        );
    }
}
