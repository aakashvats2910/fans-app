package com.velvra.backend.dto.comment;

import com.velvra.backend.entity.Comment;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long postId,
        Long userId,
        String username,
        String displayName,
        String avatarUrl,
        String content,
        LocalDateTime createdAt
) {
    public static CommentResponse from(Comment c) {
        return new CommentResponse(
                c.getId(),
                c.getPost().getId(),
                c.getUser().getId(),
                c.getUser().getUsername(),
                c.getUser().getDisplayName(),
                c.getUser().getAvatarUrl(),
                c.getContent(),
                c.getCreatedAt()
        );
    }
}
