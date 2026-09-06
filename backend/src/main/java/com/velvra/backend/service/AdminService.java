package com.velvra.backend.service;

import com.velvra.backend.dto.admin.AdminStatsResponse;
import com.velvra.backend.dto.common.UserSummary;
import com.velvra.backend.entity.Role;
import com.velvra.backend.entity.SubscriptionStatus;
import com.velvra.backend.entity.User;
import com.velvra.backend.exception.ApiException;
import com.velvra.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;

    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalFans = userRepository.findByRole(Role.FAN, Pageable.unpaged()).getTotalElements();
        long totalCreators = userRepository.findByRole(Role.CREATOR, Pageable.unpaged()).getTotalElements();
        long totalPosts = postRepository.count();
        long totalActiveSubs = subscriptionRepository.countByStatus(SubscriptionStatus.ACTIVE);
        var totalRevenue = paymentRepository.sumAllRevenue();
        return new AdminStatsResponse(totalUsers, totalFans, totalCreators, totalPosts, totalActiveSubs, totalRevenue);
    }

    public Page<UserSummary> listUsers(Role role, Pageable pageable) {
        Page<User> page = role != null ? userRepository.findByRole(role, pageable) : userRepository.findAll(pageable);
        return page.map(UserSummary::from);
    }

    @Transactional
    public void setEnabled(Long userId, boolean enabled) {
        User user = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        user.setEnabled(enabled);
        userRepository.save(user);
    }
}
