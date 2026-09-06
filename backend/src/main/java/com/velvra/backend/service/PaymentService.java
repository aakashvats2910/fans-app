package com.velvra.backend.service;

import com.velvra.backend.dto.payment.PaymentResponse;
import com.velvra.backend.entity.Payment;
import com.velvra.backend.entity.PaymentStatus;
import com.velvra.backend.entity.PaymentType;
import com.velvra.backend.entity.User;
import com.velvra.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * All payments in this demo go through this dummy gateway: no real card/processor is involved,
 * charges always succeed instantly and are recorded for history/earnings reporting.
 */
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Transactional
    public Payment charge(User payer, User payee, BigDecimal amount, PaymentType type, Long referenceId) {
        Payment payment = Payment.builder()
                .payer(payer)
                .payee(payee)
                .amount(amount)
                .type(type)
                .referenceId(referenceId)
                .status(PaymentStatus.SUCCEEDED)
                .provider("DUMMY")
                .build();
        return paymentRepository.save(payment);
    }

    public Page<PaymentResponse> myPayments(Long payerId, Pageable pageable) {
        return paymentRepository.findByPayerIdOrderByCreatedAtDesc(payerId, pageable).map(PaymentResponse::from);
    }

    public Page<PaymentResponse> myEarnings(Long payeeId, Pageable pageable) {
        return paymentRepository.findByPayeeIdOrderByCreatedAtDesc(payeeId, pageable).map(PaymentResponse::from);
    }

    public BigDecimal totalEarnings(Long payeeId) {
        return paymentRepository.sumEarningsForPayee(payeeId);
    }

    public BigDecimal totalPlatformRevenue() {
        return paymentRepository.sumAllRevenue();
    }
}
