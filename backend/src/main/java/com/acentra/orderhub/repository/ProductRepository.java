package com.acentra.orderhub.repository;

import com.acentra.orderhub.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, String> {
    Optional<ProductEntity> findBySku(String sku);
}
