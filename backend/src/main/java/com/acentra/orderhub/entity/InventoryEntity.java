package com.acentra.orderhub.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String sku;

    @Column(nullable = false)
    private Integer totalStock;

    @Column(nullable = false)
    private Integer availableStock;

    @Column(nullable = false)
    private Integer reservedStock;

    private Integer lowStockThreshold;

    private LocalDateTime lastUpdated;
}
