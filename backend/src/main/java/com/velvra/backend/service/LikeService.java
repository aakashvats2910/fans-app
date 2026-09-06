package com.velvra.backend.service;

import com.velvra.backend.entity.NotificationType;
import com.velvra.backend.entity.Post;
import com.velvra.backend.entity.PostLike;
import com.velvra.backend.entity.User;
import com.velvra.backend.exception.ApiException;
import com.velvra.backend.repository.PostLikeRepository;
import com.velvra.backend.repository.PostRepository;
import com.velvra.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostService postService;
    private final NotificationService notificationService;

    @Transactional
    public long like(Long userId, Long postId) {
        Post post = postService.requirePostWithAccess(postId, userId);
        if (postLikeRepository.existsByPostIdAndUserId(postId, userId)) {
            return post.getLikeCount();
        }
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        postLikeRepository.save(PostLike.builder().post(post).user(user).build());
        post.setLikeCount(post.getLikeCount() + 1);
        postRepository.save(post);

        notificationService.notify(post.getCreator(), user, NotificationType.NEW_LIKE, postId,
                user.getDisplayName() + " liked your post");
        return post.getLikeCount();
    }

    @Transactional
    public long unlike(Long userId, Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> ApiException.notFound("Post not found"));
        postLikeRepository.findByPostIdAndUserId(postId, userId).ifPresent(like -> {
            postLikeRepository.delete(like);
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
            postRepository.save(post);
        });
        return post.getLikeCount();
    }
}
