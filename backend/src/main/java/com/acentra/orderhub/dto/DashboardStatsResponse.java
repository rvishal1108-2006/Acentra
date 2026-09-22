package com.acentra.orderhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long ordersToday;
    private long totalOrders;
    private long completedOrders;
    private long processingOrders;
    private long pendingOrders;
    private long failedOrders;
    private long retryCount;
    private long dlqCount;
    private int activeWorkers;
    private int queueDepth;
    private double processingRate;
    private double successRate;
    private List<Integer> sparklineReceived;
    private List<Integer> sparklineProcessed;
    private List<Integer> sparklineQueue;
}
