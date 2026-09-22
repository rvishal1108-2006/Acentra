package com.acentra.orderhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueMetricsResponse {
    private int orderQueue;
    private int retryQueue;
    private int dlq;
    private double throughputIn;
    private double throughputOut;
    private int consumers;
    private long avgWaitTimeMs;
}
