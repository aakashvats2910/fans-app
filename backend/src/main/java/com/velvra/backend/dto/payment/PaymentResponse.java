package com.velvra.backend.dto.payment;

import com.velvra.backend.entity.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        Long payerId,
        String payerUsername,
        Long payeeId,
        String payeeUsername,
        BigDecimal amount,
        String type,
        String status,
        String provider,
        LocalDateTime createdAt
) {
    public static PaymentResponse from(Payment p) {
        return new PaymentResponse(
                p.getId(),
                p.getPayer().getId(),
                p.getPayer().getUsername(),
                p.getPayee().getId(),
                p.getPayee().getUsername(),
                p.getAmount(),
                p.getType().name(),
                p.getStatus().name(),
                p.getProvider(),
                p.getCreatedAt()
        );
    }
}
