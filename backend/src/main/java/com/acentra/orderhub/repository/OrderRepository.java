package com.acentra.orderhub.repository;

import com.acentra.orderhub.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, String> {
    
    List<OrderEntity> findAllByOrderByCreatedAtDesc();

    List<OrderEntity> findByStatusOrderByCreatedAtDesc(String status);

    long countByStatus(String status);

    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.createdAt >= CURRENT_DATE")
    long countOrdersToday();
}
