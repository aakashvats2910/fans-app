package com.velvra.backend.dto.post;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(
        Long id,
        Long creatorId,
        String creatorUsername,
        String creatorDisplayName,
        String creatorAvatarUrl,
        String caption,
        boolean locked,
        BigDecimal ppvPrice,
        boolean hasAccess,
        List<PostMediaResponse> media,
        int mediaCount,
        long likeCount,
        long commentCount,
        boolean likedByMe,
        LocalDateTime createdAt
) {
}
