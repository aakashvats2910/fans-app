package com.velvra.backend.service;

import com.velvra.backend.dto.notification.NotificationResponse;
import com.velvra.backend.entity.Notification;
import com.velvra.backend.entity.NotificationType;
import com.velvra.backend.entity.User;
import com.velvra.backend.exception.ApiException;
import com.velvra.backend.repository.NotificationRepository;
import com.velvra.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void notify(User recipient, User actor, NotificationType type, Long referenceId, String message) {
        if (recipient.getId().equals(actor != null ? actor.getId() : null)) {
            return; // don't notify users about their own actions
        }
        Notification notification = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .referenceId(referenceId)
                .message(message)
                .build();
        notificationRepository.save(notification);
    }

    public Page<NotificationResponse> getForUser(Long userId, Pageable pageable) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable)
                .map(NotificationResponse::from);
    }

    public long unreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Transactional
    public void markAllRead(Long userId) {
        var page = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, org.springframework.data.domain.Pageable.unpaged());
        page.forEach(n -> n.setRead(true));
    }

    @Transactional
    public void markRead(Long userId, Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> ApiException.notFound("Notification not found"));
        if (!n.getRecipient().getId().equals(userId)) {
            throw ApiException.forbidden("Not your notification");
        }
        n.setRead(true);
    }

    public User requireUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
    }
}
