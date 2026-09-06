package com.velvra.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 30) @Pattern(regexp = "^[a-zA-Z0-9_.]+$", message = "Username may only contain letters, numbers, underscores and dots")
        String username,

        @NotBlank @Email
        String email,

        @NotBlank @Size(min = 6, max = 72)
        String password,

        @NotBlank @Size(min = 1, max = 100)
        String displayName,

        // "FAN" or "CREATOR"
        @NotBlank
        String role
) {
}
