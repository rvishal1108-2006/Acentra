package com.acentra.orderhub.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String customerName;

    private String customerEmail;

    @Column(nullable = false, length = 64)
    private String productSku;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double unitPrice;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false, length = 32)
    private String status; // PENDING, RESERVED, PROCESSING, COMPLETED, FAILED, RETRYING, DLQ

    @Column(length = 32)
    private String priority; // LOW, NORMAL, HIGH, CRITICAL

    private String workerId;

    private String workerName;

    @Builder.Default
    private Integer retryCount = 0;

    @Builder.Default
    private Integer maxRetries = 3;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
