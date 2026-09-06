package com.velvra.backend.dto.common;

import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(max = 100) String displayName,
        @Size(max = 1000) String bio
) {
}
