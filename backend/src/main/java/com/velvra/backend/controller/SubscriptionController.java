package com.velvra.backend.controller;

import com.velvra.backend.dto.subscription.SubscriptionResponse;
import com.velvra.backend.security.CurrentUser;
import com.velvra.backend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping("/{creatorId}")
    public ResponseEntity<SubscriptionResponse> subscribe(@PathVariable Long creatorId) {
        return ResponseEntity.ok(subscriptionService.subscribe(CurrentUser.id(), creatorId));
    }

    @DeleteMapping("/{creatorId}")
    public ResponseEntity<Void> cancel(@PathVariable Long creatorId) {
        subscriptionService.cancel(CurrentUser.id(), creatorId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/mine")
    public ResponseEntity<List<SubscriptionResponse>> mySubscriptions() {
        return ResponseEntity.ok(subscriptionService.myActiveSubscriptions(CurrentUser.id()));
    }

    @GetMapping("/subscribers")
    public ResponseEntity<List<SubscriptionResponse>> mySubscribers() {
        return ResponseEntity.ok(subscriptionService.mySubscribers(CurrentUser.id()));
    }
}
