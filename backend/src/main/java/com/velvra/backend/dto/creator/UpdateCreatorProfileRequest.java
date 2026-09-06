package com.velvra.backend.dto.creator;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateCreatorProfileRequest(
        @Size(max = 1000) String bio,
        @Size(max = 100) String category,
        @DecimalMin(value = "0.00", message = "Price cannot be negative") BigDecimal subscriptionPrice
) {
}
