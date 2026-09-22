package com.acentra.orderhub.controller;

import com.acentra.orderhub.dto.DashboardStatsResponse;
import com.acentra.orderhub.dto.QueueMetricsResponse;
import com.acentra.orderhub.dto.WorkerInfoResponse;
import com.acentra.orderhub.service.DashboardService;
import com.acentra.orderhub.worker.WorkerSimulationPool;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;
    private final WorkerSimulationPool workerPool;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/workers")
    public ResponseEntity<List<WorkerInfoResponse>> getWorkers() {
        return ResponseEntity.ok(workerPool.getAllWorkers());
    }

    @GetMapping("/queues")
    public ResponseEntity<QueueMetricsResponse> getQueues() {
        return ResponseEntity.ok(dashboardService.getQueueMetrics());
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "timestamp", LocalDateTime.now().toString(),
                "services", Map.of(
                        "api", Map.of("status", "healthy", "latencyMs", 14),
                        "postgres", Map.of("status", "healthy", "latencyMs", 4),
                        "rabbitmq", Map.of("status", "healthy", "latencyMs", 8),
                        "websocket", Map.of("status", "healthy", "activeChannels", 5)
                )
        ));
    }
}
