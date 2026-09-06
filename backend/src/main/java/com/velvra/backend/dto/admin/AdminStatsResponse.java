package com.velvra.backend.dto.admin;

import java.math.BigDecimal;

public record AdminStatsResponse(
        long totalUsers,
        long totalFans,
        long totalCreators,
        long totalPosts,
        long totalActiveSubscriptions,
        BigDecimal totalRevenue
) {
}
