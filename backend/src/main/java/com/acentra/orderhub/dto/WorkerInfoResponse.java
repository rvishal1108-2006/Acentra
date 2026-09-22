package com.acentra.orderhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerInfoResponse {
    private String id;
    private String name;
    private String status; // IDLE, PROCESSING, BUSY, ERROR, RESTARTING
    private String currentTask;
    private String currentOrderId;
    private int ordersProcessed;
    private double successRate;
    private int cpuUsage;
    private int memoryUsage;
    private String lastHeartbeat;
    private long uptimeSeconds;
    private String host;
}
