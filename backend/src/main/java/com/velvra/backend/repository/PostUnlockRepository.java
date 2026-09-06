package com.velvra.backend.repository;

import com.velvra.backend.entity.PostUnlock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostUnlockRepository extends JpaRepository<PostUnlock, Long> {
    Optional<PostUnlock> findByFanIdAndPostId(Long fanId, Long postId);
    List<PostUnlock> findByFanId(Long fanId);
    boolean existsByFanIdAndPostId(Long fanId, Long postId);
}
