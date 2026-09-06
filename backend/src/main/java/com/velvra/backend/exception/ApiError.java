package com.velvra.backend.exception;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiError(LocalDateTime timestamp, int status, String message, Map<String, String> fieldErrors) {
    public ApiError(int status, String message) {
        this(LocalDateTime.now(), status, message, null);
    }

    public ApiError(int status, String message, Map<String, String> fieldErrors) {
        this(LocalDateTime.now(), status, message, fieldErrors);
    }
}
