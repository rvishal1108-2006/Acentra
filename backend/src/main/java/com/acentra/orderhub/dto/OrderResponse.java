package com.acentra.orderhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private String id;
    private String customerName;
    private String customerEmail;
    private String productSku;
    private String productName;
    private Integer quantity;
    private Double unitPrice;
    private Double totalAmount;
    private String status;
    private String priority;
    private String workerId;
    private String workerName;
    private Integer retryCount;
    private Integer maxRetries;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TimelineEventDto> timeline;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineEventDto {
        private String id;
        private String stage;
        private String title;
        private String description;
        private String status;
        private String workerId;
        private Long durationMs;
        private LocalDateTime timestamp;
    }
}
