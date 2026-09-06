package com.velvra.backend.dto.auth;

import com.velvra.backend.dto.common.UserSummary;

public record AuthResponse(String token, UserSummary user) {
}
