package com.acentra.orderhub.repository;

import com.acentra.orderhub.entity.OrderEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderEventRepository extends JpaRepository<OrderEventEntity, String> {
    List<OrderEventEntity> findByOrderIdOrderByTimestampAsc(String orderId);
    List<OrderEventEntity> findTop25ByOrderByTimestampDesc();
}
