package com.velvra.backend.controller;

import com.velvra.backend.dto.comment.CommentResponse;
import com.velvra.backend.dto.comment.CreateCommentRequest;
import com.velvra.backend.dto.post.CreatePostRequest;
import com.velvra.backend.dto.post.PostResponse;
import com.velvra.backend.security.CurrentUser;
import com.velvra.backend.service.CommentService;
import com.velvra.backend.service.LikeService;
import com.velvra.backend.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final LikeService likeService;
    private final CommentService commentService;

    private Long currentViewerIdOrNull() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return CurrentUser.id();
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<PostResponse> createPost(
            @RequestParam(required = false) String caption,
            @RequestParam(defaultValue = "false") boolean locked,
            @RequestParam(required = false) BigDecimal ppvPrice,
            @RequestParam("files") List<MultipartFile> files) {
        CreatePostRequest request = new CreatePostRequest(caption, locked, ppvPrice);
        return ResponseEntity.ok(postService.createPost(CurrentUser.id(), request, files));
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<PostResponse>> getFeed(Pageable pageable) {
        return ResponseEntity.ok(postService.getFeed(CurrentUser.id(), pageable));
    }

    @GetMapping("/public/trending")
    public ResponseEntity<Page<PostResponse>> getPublicTrending(Pageable pageable) {
        return ResponseEntity.ok(postService.getPublicTrending(pageable));
    }

    @GetMapping("/creator/{username}")
    public ResponseEntity<Page<PostResponse>> getCreatorPosts(@PathVariable String username, Pageable pageable) {
        return ResponseEntity.ok(postService.getCreatorPosts(username, currentViewerIdOrNull(), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPost(id, currentViewerIdOrNull()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id, CurrentUser.id());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/unlock")
    public ResponseEntity<PostResponse> unlockPost(@PathVariable Long id) {
        return ResponseEntity.ok(postService.unlockPost(CurrentUser.id(), id));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Long>> like(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("likeCount", likeService.like(CurrentUser.id(), id)));
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<Map<String, Long>> unlike(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("likeCount", likeService.unlike(CurrentUser.id(), id)));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<Page<CommentResponse>> getComments(@PathVariable Long id, Pageable pageable) {
        return ResponseEntity.ok(commentService.getComments(id, pageable));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long id, @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.ok(commentService.addComment(CurrentUser.id(), id, request.content()));
    }
}
