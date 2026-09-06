package com.velvra.backend.controller;

import com.velvra.backend.dto.payment.PaymentResponse;
import com.velvra.backend.security.CurrentUser;
import com.velvra.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/mine")
    public ResponseEntity<Page<PaymentResponse>> myPayments(Pageable pageable) {
        return ResponseEntity.ok(paymentService.myPayments(CurrentUser.id(), pageable));
    }

    @GetMapping("/earnings")
    public ResponseEntity<Page<PaymentResponse>> myEarnings(Pageable pageable) {
        return ResponseEntity.ok(paymentService.myEarnings(CurrentUser.id(), pageable));
    }

    @GetMapping("/earnings/total")
    public ResponseEntity<Map<String, BigDecimal>> totalEarnings() {
        return ResponseEntity.ok(Map.of("total", paymentService.totalEarnings(CurrentUser.id())));
    }
}
