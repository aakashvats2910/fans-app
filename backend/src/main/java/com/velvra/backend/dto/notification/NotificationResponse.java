package com.velvra.backend.dto.notification;

import com.velvra.backend.entity.Notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String type,
        Long actorId,
        String actorUsername,
        String actorAvatarUrl,
        Long referenceId,
        String message,
        boolean read,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getType().name(),
                n.getActor() != null ? n.getActor().getId() : null,
                n.getActor() != null ? n.getActor().getUsername() : null,
                n.getActor() != null ? n.getActor().getAvatarUrl() : null,
                n.getReferenceId(),
                n.getMessage(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
