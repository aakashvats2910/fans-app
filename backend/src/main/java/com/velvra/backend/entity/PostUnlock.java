package com.velvra.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "post_unlocks", uniqueConstraints = @UniqueConstraint(columnNames = {"fan_id", "post_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostUnlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fan_id", nullable = false)
    private User fan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "payment_id")
    private Long paymentId;

    @Column(name = "unlocked_at", updatable = false)
    private LocalDateTime unlockedAt;

    @PrePersist
    void onCreate() {
        unlockedAt = LocalDateTime.now();
    }
}
