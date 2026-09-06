package com.velvra.backend.repository;

import com.velvra.backend.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Page<Payment> findByPayerIdOrderByCreatedAtDesc(Long payerId, Pageable pageable);
    Page<Payment> findByPayeeIdOrderByCreatedAtDesc(Long payeeId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("select coalesce(sum(p.amount), 0) from Payment p where p.payee.id = :payeeId and p.status = com.velvra.backend.entity.PaymentStatus.SUCCEEDED")
    java.math.BigDecimal sumEarningsForPayee(@org.springframework.data.repository.query.Param("payeeId") Long payeeId);

    @org.springframework.data.jpa.repository.Query("select coalesce(sum(p.amount), 0) from Payment p where p.status = com.velvra.backend.entity.PaymentStatus.SUCCEEDED")
    java.math.BigDecimal sumAllRevenue();
}
