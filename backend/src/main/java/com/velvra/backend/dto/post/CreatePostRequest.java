package com.velvra.backend.dto.post;

import java.math.BigDecimal;

public record CreatePostRequest(
        String caption,
        boolean locked,
        BigDecimal ppvPrice
) {
}
