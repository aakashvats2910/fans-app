package com.velvra.backend.service;

import com.velvra.backend.dto.comment.CommentResponse;
import com.velvra.backend.entity.Comment;
import com.velvra.backend.entity.NotificationType;
import com.velvra.backend.entity.Post;
import com.velvra.backend.entity.User;
import com.velvra.backend.exception.ApiException;
import com.velvra.backend.repository.CommentRepository;
import com.velvra.backend.repository.PostRepository;
import com.velvra.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostService postService;
    private final NotificationService notificationService;

    @Transactional
    public CommentResponse addComment(Long userId, Long postId, String content) {
        Post post = postService.requirePostWithAccess(postId, userId);
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));

        Comment comment = Comment.builder().post(post).user(user).content(content).build();
        comment = commentRepository.save(comment);

        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        notificationService.notify(post.getCreator(), user, NotificationType.NEW_COMMENT, postId,
                user.getDisplayName() + " commented on your post");

        return CommentResponse.from(comment);
    }

    public Page<CommentResponse> getComments(Long postId, Pageable pageable) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId, pageable).map(CommentResponse::from);
    }
}
