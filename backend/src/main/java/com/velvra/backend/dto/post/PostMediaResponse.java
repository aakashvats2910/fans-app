package com.velvra.backend.dto.post;

import com.velvra.backend.entity.PostMedia;

public record PostMediaResponse(Long id, String mediaType, String url, String thumbnailUrl) {
    public static PostMediaResponse from(PostMedia media) {
        return new PostMediaResponse(media.getId(), media.getMediaType().name(), media.getUrl(), media.getThumbnailUrl());
    }
}
