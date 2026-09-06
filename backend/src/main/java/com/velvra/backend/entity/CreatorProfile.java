package com.velvra.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "creator_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(name = "subscription_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal subscriptionPrice;

    private String category;

    @Column(name = "is_verified")
    @Builder.Default
    private boolean verified = false;

    @Column(name = "subscriber_count")
    @Builder.Default
    private long subscriberCount = 0L;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
