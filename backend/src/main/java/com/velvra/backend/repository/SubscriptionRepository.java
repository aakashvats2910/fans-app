package com.velvra.backend.repository;

import com.velvra.backend.entity.Subscription;
import com.velvra.backend.entity.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByFanIdAndCreatorId(Long fanId, Long creatorId);
    List<Subscription> findByFanIdAndStatus(Long fanId, SubscriptionStatus status);
    List<Subscription> findByCreatorIdAndStatus(Long creatorId, SubscriptionStatus status);
    long countByCreatorIdAndStatus(Long creatorId, SubscriptionStatus status);
    long countByStatus(SubscriptionStatus status);
}
