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
@Table(name = "order_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEventEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 64)
    private String orderId;

    @Column(nullable = false, length = 32)
    private String stage; // CREATED, RESERVED, QUEUED, PICKED, PROCESSING, COMPLETED, RETRY, DLQ, FAILED

    @Column(nullable = false)
    private String title;

    @Column(length = 1024)
    private String description;

    @Column(length = 32)
    private String status; // SUCCESS, WARNING, ERROR, INFO

    private String workerId;

    private Long durationMs;

    private LocalDateTime timestamp;
}
