package com.velvra.backend.controller;

import com.velvra.backend.dto.admin.AdminStatsResponse;
import com.velvra.backend.dto.common.UserSummary;
import com.velvra.backend.entity.Role;
import com.velvra.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserSummary>> listUsers(
            @RequestParam(required = false) Role role, Pageable pageable) {
        return ResponseEntity.ok(adminService.listUsers(role, pageable));
    }

    @PostMapping("/users/{id}/enable")
    public ResponseEntity<Void> enableUser(@PathVariable Long id) {
        adminService.setEnabled(id, true);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/disable")
    public ResponseEntity<Void> disableUser(@PathVariable Long id) {
        adminService.setEnabled(id, false);
        return ResponseEntity.noContent().build();
    }
}
