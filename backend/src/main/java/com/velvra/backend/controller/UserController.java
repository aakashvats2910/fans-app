package com.velvra.backend.controller;

import com.velvra.backend.dto.common.UpdateUserRequest;
import com.velvra.backend.dto.common.UserSummary;
import com.velvra.backend.security.CurrentUser;
import com.velvra.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserSummary> me() {
        return ResponseEntity.ok(userService.getById(CurrentUser.id()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserSummary> updateMe(@Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateProfile(CurrentUser.id(), request));
    }

    @PostMapping(value = "/me/avatar", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        String url = userService.updateAvatar(CurrentUser.id(), file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
