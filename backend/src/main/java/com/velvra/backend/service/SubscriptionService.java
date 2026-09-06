package com.velvra.backend.service;

import com.velvra.backend.dto.subscription.SubscriptionResponse;
import com.velvra.backend.entity.*;
import com.velvra.backend.exception.ApiException;
import com.velvra.backend.repository.CreatorProfileRepository;
import com.velvra.backend.repository.SubscriptionRepository;
import com.velvra.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private static final int SUBSCRIPTION_DAYS = 30;

    private final SubscriptionRepository subscriptionRepository;
    private final CreatorProfileRepository creatorProfileRepository;
    private final UserRepository userRepository;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    @Transactional
    public SubscriptionResponse subscribe(Long fanId, Long creatorId) {
        if (fanId.equals(creatorId)) {
            throw ApiException.badRequest("You cannot subscribe to yourself");
        }
        User fan = userRepository.findById(fanId).orElseThrow(() -> ApiException.notFound("User not found"));
        User creator = userRepository.findById(creatorId).orElseThrow(() -> ApiException.notFound("Creator not found"));
        CreatorProfile profile = creatorProfileRepository.findByUserId(creatorId)
                .orElseThrow(() -> ApiException.notFound("Creator profile not found"));

        Subscription subscription = subscriptionRepository.findByFanIdAndCreatorId(fanId, creatorId)
                .orElse(null);

        boolean isNewSubscriber = subscription == null || subscription.getStatus() != SubscriptionStatus.ACTIVE;

        // Simulated payment gateway charge - always succeeds in this demo build.
        paymentService.charge(fan, creator, profile.getSubscriptionPrice(), PaymentType.SUBSCRIPTION, creatorId);

        if (subscription == null) {
            subscription = Subscription.builder()
                    .fan(fan)
                    .creator(creator)
                    .price(profile.getSubscriptionPrice())
                    .status(SubscriptionStatus.ACTIVE)
                    .expiresAt(LocalDateTime.now().plusDays(SUBSCRIPTION_DAYS))
                    .build();
        } else {
            subscription.setStatus(SubscriptionStatus.ACTIVE);
            subscription.setPrice(profile.getSubscriptionPrice());
            subscription.setExpiresAt(LocalDateTime.now().plusDays(SUBSCRIPTION_DAYS));
            subscription.setAutoRenew(true);
        }
        subscription = subscriptionRepository.save(subscription);

        if (isNewSubscriber) {
            profile.setSubscriberCount(profile.getSubscriberCount() + 1);
            creatorProfileRepository.save(profile);
            notificationService.notify(creator, fan, NotificationType.NEW_SUBSCRIBER, fan.getId(),
                    fan.getDisplayName() + " subscribed to you");
        }

        return SubscriptionResponse.from(subscription);
    }

    @Transactional
    public void cancel(Long fanId, Long creatorId) {
        Subscription subscription = subscriptionRepository.findByFanIdAndCreatorId(fanId, creatorId)
                .orElseThrow(() -> ApiException.notFound("Subscription not found"));
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setAutoRenew(false);
    }

    public List<SubscriptionResponse> myActiveSubscriptions(Long fanId) {
        return subscriptionRepository.findByFanIdAndStatus(fanId, SubscriptionStatus.ACTIVE)
                .stream().map(SubscriptionResponse::from).toList();
    }

    public List<SubscriptionResponse> mySubscribers(Long creatorId) {
        return subscriptionRepository.findByCreatorIdAndStatus(creatorId, SubscriptionStatus.ACTIVE)
                .stream().map(SubscriptionResponse::from).toList();
    }
}
