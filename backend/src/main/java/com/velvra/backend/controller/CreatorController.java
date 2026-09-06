package com.velvra.backend.controller;

import com.velvra.backend.dto.creator.CreatorProfileResponse;
import com.velvra.backend.dto.creator.UpdateCreatorProfileRequest;
import com.velvra.backend.security.CurrentUser;
import com.velvra.backend.service.CreatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/creators")
@RequiredArgsConstructor
public class CreatorController {

    private final CreatorService creatorService;

    private Long currentViewerIdOrNull() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return CurrentUser.id();
    }

    @GetMapping
    public ResponseEntity<Page<CreatorProfileResponse>> listCreators(Pageable pageable) {
        return ResponseEntity.ok(creatorService.listCreators(pageable, currentViewerIdOrNull()));
    }

    @GetMapping("/{username}")
    public ResponseEntity<CreatorProfileResponse> getCreator(@PathVariable String username) {
        return ResponseEntity.ok(creatorService.getByUsername(username, currentViewerIdOrNull()));
    }

    @PutMapping("/me")
    public ResponseEntity<CreatorProfileResponse> updateOwnProfile(@Valid @RequestBody UpdateCreatorProfileRequest request) {
        return ResponseEntity.ok(creatorService.updateOwnProfile(CurrentUser.id(), request));
    }

    @PostMapping(value = "/me/cover", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, String>> uploadCover(@RequestParam("file") MultipartFile file) {
        String url = creatorService.updateCoverImage(CurrentUser.id(), file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
