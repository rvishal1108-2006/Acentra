package com.acentra.orderhub.repository;

import com.acentra.orderhub.entity.InventoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryEntity, Long> {
    Optional<InventoryEntity> findBySku(String sku);
}
