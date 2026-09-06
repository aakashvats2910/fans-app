package com.velvra.backend.service;

import com.velvra.backend.dto.post.CreatePostRequest;
import com.velvra.backend.dto.post.PostMediaResponse;
import com.velvra.backend.dto.post.PostResponse;
import com.velvra.backend.entity.*;
import com.velvra.backend.exception.ApiException;
import com.velvra.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PostUnlockRepository postUnlockRepository;
    private final PostLikeRepository postLikeRepository;
    private final NotificationService notificationService;
    private final StorageService storageService;
    private final PaymentService paymentService;

    @Transactional
    public PostResponse createPost(Long creatorId, CreatePostRequest request, List<MultipartFile> files) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        if (creator.getRole() != Role.CREATOR) {
            throw ApiException.forbidden("Only creators can publish posts");
        }
        if (files == null || files.isEmpty()) {
            throw ApiException.badRequest("At least one media file is required");
        }
        if (request.locked() && (request.ppvPrice() == null || request.ppvPrice().signum() <= 0)) {
            throw ApiException.badRequest("Locked posts require a positive PPV price");
        }

        Post post = Post.builder()
                .creator(creator)
                .caption(request.caption())
                .locked(request.locked())
                .ppvPrice(request.locked() ? request.ppvPrice() : null)
                .build();
        post = postRepository.save(post);

        int order = 0;
        for (MultipartFile file : files) {
            String contentType = file.getContentType() == null ? "" : file.getContentType();
            MediaType type = contentType.startsWith("video") ? MediaType.VIDEO : MediaType.IMAGE;
            String url = storageService.store(file, "posts");
            PostMedia media = PostMedia.builder()
                    .post(post)
                    .mediaType(type)
                    .url(url)
                    .sortOrder(order++)
                    .build();
            post.getMedia().add(media);
        }
        post = postRepository.save(post);

        notifyAudienceOfNewPost(post, creator);

        return toResponse(post, creatorId);
    }

    private void notifyAudienceOfNewPost(Post post, User creator) {
        subscriptionRepository.findByCreatorIdAndStatus(creator.getId(), SubscriptionStatus.ACTIVE)
                .forEach(sub -> notificationService.notify(
                        sub.getFan(), creator, NotificationType.NEW_POST, post.getId(),
                        creator.getDisplayName() + " shared a new post"));
    }

    public Page<PostResponse> getFeed(Long fanId, Pageable pageable) {
        List<Subscription> active = subscriptionRepository.findByFanIdAndStatus(fanId, SubscriptionStatus.ACTIVE);
        List<Long> creatorIds = active.stream().map(s -> s.getCreator().getId()).collect(java.util.stream.Collectors.toList());
        creatorIds.add(fanId); // include own posts if the fan is also a creator
        if (creatorIds.isEmpty()) {
            return Page.empty(pageable);
        }
        return postRepository.findFeedForCreators(creatorIds, pageable).map(post -> toResponse(post, fanId));
    }

    public Page<PostResponse> getCreatorPosts(String username, Long viewerId, Pageable pageable) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> ApiException.notFound("Creator not found"));
        return postRepository.findByCreatorIdOrderByCreatedAtDesc(creator.getId(), pageable)
                .map(post -> toResponse(post, viewerId));
    }

    public Page<PostResponse> getPublicTrending(Pageable pageable) {
        return postRepository.findAllByOrderByCreatedAtDesc(pageable).map(post -> toResponse(post, null));
    }

    public PostResponse getPost(Long postId, Long viewerId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> ApiException.notFound("Post not found"));
        return toResponse(post, viewerId);
    }

    @Transactional
    public void deletePost(Long postId, Long requesterId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> ApiException.notFound("Post not found"));
        if (!post.getCreator().getId().equals(requesterId)) {
            throw ApiException.forbidden("You can only delete your own posts");
        }
        postRepository.delete(post);
    }

    @Transactional
    public PostResponse unlockPost(Long fanId, Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> ApiException.notFound("Post not found"));
        if (!post.isLocked()) {
            throw ApiException.badRequest("This post is not locked");
        }
        if (post.getCreator().getId().equals(fanId)) {
            throw ApiException.badRequest("You already own this post");
        }
        if (postUnlockRepository.existsByFanIdAndPostId(fanId, postId)) {
            throw ApiException.conflict("Post already unlocked");
        }
        User fan = userRepository.findById(fanId).orElseThrow(() -> ApiException.notFound("User not found"));

        var payment = paymentService.charge(fan, post.getCreator(), post.getPpvPrice(), PaymentType.PPV_UNLOCK, postId);

        PostUnlock unlock = PostUnlock.builder()
                .fan(fan)
                .post(post)
                .paymentId(payment.getId())
                .build();
        postUnlockRepository.save(unlock);

        notificationService.notify(post.getCreator(), fan, NotificationType.POST_UNLOCKED, postId,
                fan.getDisplayName() + " unlocked your post for $" + post.getPpvPrice());

        return toResponse(post, fanId);
    }

    public Post requirePostWithAccess(Long postId, Long viewerId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> ApiException.notFound("Post not found"));
        if (!hasAccess(post, viewerId)) {
            throw ApiException.forbidden("You need to unlock this post first");
        }
        return post;
    }

    boolean hasAccess(Post post, Long viewerId) {
        if (!post.isLocked()) {
            return true;
        }
        if (viewerId == null) {
            return false;
        }
        if (post.getCreator().getId().equals(viewerId)) {
            return true;
        }
        boolean subscribed = subscriptionRepository.findByFanIdAndCreatorId(viewerId, post.getCreator().getId())
                .map(s -> s.getStatus() == SubscriptionStatus.ACTIVE)
                .orElse(false);
        if (subscribed) {
            return true;
        }
        return postUnlockRepository.existsByFanIdAndPostId(viewerId, post.getId());
    }

    PostResponse toResponse(Post post, Long viewerId) {
        boolean access = hasAccess(post, viewerId);
        List<PostMediaResponse> media = access
                ? post.getMedia().stream().map(PostMediaResponse::from).toList()
                : List.of();
        boolean likedByMe = viewerId != null && postLikeRepository.existsByPostIdAndUserId(post.getId(), viewerId);

        return new PostResponse(
                post.getId(),
                post.getCreator().getId(),
                post.getCreator().getUsername(),
                post.getCreator().getDisplayName(),
                post.getCreator().getAvatarUrl(),
                post.getCaption(),
                post.isLocked(),
                post.getPpvPrice(),
                access,
                media,
                post.getMedia().size(),
                post.getLikeCount(),
                post.getCommentCount(),
                likedByMe,
                post.getCreatedAt()
        );
    }
}
