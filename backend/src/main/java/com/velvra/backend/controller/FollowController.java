package com.velvra.backend.controller;

import com.velvra.backend.security.CurrentUser;
import com.velvra.backend.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping("/{userId}")
    public ResponseEntity<Void> follow(@PathVariable Long userId) {
        followService.follow(CurrentUser.id(), userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> unfollow(@PathVariable Long userId) {
        followService.unfollow(CurrentUser.id(), userId);
        return ResponseEntity.noContent().build();
    }
}
