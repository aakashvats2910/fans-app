package com.velvra.backend.service;

import com.velvra.backend.dto.creator.CreatorProfileResponse;
import com.velvra.backend.dto.creator.UpdateCreatorProfileRequest;
import com.velvra.backend.entity.CreatorProfile;
import com.velvra.backend.entity.SubscriptionStatus;
import com.velvra.backend.entity.User;
import com.velvra.backend.exception.ApiException;
import com.velvra.backend.repository.CreatorProfileRepository;
import com.velvra.backend.repository.FollowRepository;
import com.velvra.backend.repository.SubscriptionRepository;
import com.velvra.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class CreatorService {

    private final CreatorProfileRepository creatorProfileRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final FollowRepository followRepository;
    private final StorageService storageService;

    public Page<CreatorProfileResponse> listCreators(Pageable pageable, Long viewerId) {
        return creatorProfileRepository.findAll(pageable)
                .map(profile -> toResponse(profile, viewerId));
    }

    public CreatorProfileResponse getByUsername(String username, Long viewerId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> ApiException.notFound("Creator not found"));
        CreatorProfile profile = creatorProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> ApiException.notFound("Creator not found"));
        return toResponse(profile, viewerId);
    }

    private CreatorProfileResponse toResponse(CreatorProfile profile, Long viewerId) {
        boolean isSubscribed = false;
        boolean isFollowing = false;
        if (viewerId != null) {
            isSubscribed = subscriptionRepository.findByFanIdAndCreatorId(viewerId, profile.getUser().getId())
                    .map(s -> s.getStatus() == SubscriptionStatus.ACTIVE)
                    .orElse(false);
            isFollowing = followRepository.existsByFollowerIdAndFollowingId(viewerId, profile.getUser().getId());
        }
        return CreatorProfileResponse.from(profile, isSubscribed, isFollowing);
    }

    @Transactional
    public CreatorProfileResponse updateOwnProfile(Long creatorUserId, UpdateCreatorProfileRequest request) {
        CreatorProfile profile = creatorProfileRepository.findByUserId(creatorUserId)
                .orElseThrow(() -> ApiException.notFound("Creator profile not found"));
        User user = profile.getUser();

        if (request.bio() != null) {
            user.setBio(request.bio());
        }
        if (request.category() != null) {
            profile.setCategory(request.category());
        }
        if (request.subscriptionPrice() != null) {
            profile.setSubscriptionPrice(request.subscriptionPrice());
        }
        userRepository.save(user);
        creatorProfileRepository.save(profile);
        return toResponse(profile, creatorUserId);
    }

    @Transactional
    public String updateCoverImage(Long creatorUserId, MultipartFile file) {
        CreatorProfile profile = creatorProfileRepository.findByUserId(creatorUserId)
                .orElseThrow(() -> ApiException.notFound("Creator profile not found"));
        String url = storageService.store(file, "covers");
        profile.setCoverImageUrl(url);
        creatorProfileRepository.save(profile);
        return url;
    }
}
