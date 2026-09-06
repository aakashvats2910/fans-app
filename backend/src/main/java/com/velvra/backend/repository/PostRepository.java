package com.velvra.backend.repository;

import com.velvra.backend.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByCreatorIdOrderByCreatedAtDesc(Long creatorId, Pageable pageable);

    @Query("select p from Post p where p.creator.id in :creatorIds order by p.createdAt desc")
    Page<Post> findFeedForCreators(@Param("creatorIds") List<Long> creatorIds, Pageable pageable);

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
