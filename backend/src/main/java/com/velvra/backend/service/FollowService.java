package com.velvra.backend.service;

import com.velvra.backend.entity.Follow;
import com.velvra.backend.entity.NotificationType;
import com.velvra.backend.entity.User;
import com.velvra.backend.exception.ApiException;
import com.velvra.backend.repository.FollowRepository;
import com.velvra.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public void follow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw ApiException.badRequest("You cannot follow yourself");
        }
        if (followRepository.existsByFollowerIdAndFollowingId(followerId, followingId)) {
            return;
        }
        User follower = userRepository.findById(followerId).orElseThrow(() -> ApiException.notFound("User not found"));
        User following = userRepository.findById(followingId).orElseThrow(() -> ApiException.notFound("User not found"));

        followRepository.save(Follow.builder().follower(follower).following(following).build());
        notificationService.notify(following, follower, NotificationType.NEW_FOLLOWER, followerId,
                follower.getDisplayName() + " started following you");
    }

    @Transactional
    public void unfollow(Long followerId, Long followingId) {
        followRepository.findByFollowerIdAndFollowingId(followerId, followingId)
                .ifPresent(followRepository::delete);
    }

    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }
}
