package com.acentra.orderhub.service;

import com.acentra.orderhub.dto.DashboardStatsResponse;
import com.acentra.orderhub.dto.QueueMetricsResponse;
import com.acentra.orderhub.dto.WebSocketEvent;
import com.acentra.orderhub.rabbitmq.OrderMessageProducer;
import com.acentra.orderhub.repository.OrderRepository;
import com.acentra.orderhub.websocket.WebSocketBroadcastService;
import com.acentra.orderhub.worker.WorkerSimulationPool;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final OrderRepository orderRepository;
    private final WorkerSimulationPool workerPool;
    private final OrderMessageProducer messageProducer;
    private final WebSocketBroadcastService wsService;

    public DashboardStatsResponse getDashboardStats() {
        long totalOrders = orderRepository.count();
        long completed = orderRepository.countByStatus("COMPLETED");
        long processing = orderRepository.countByStatus("PROCESSING");
        long pending = orderRepository.countByStatus("PENDING") + orderRepository.countByStatus("RESERVED");
        long failed = orderRepository.countByStatus("FAILED");
        long retrying = orderRepository.countByStatus("RETRYING");
        long dlq = orderRepository.countByStatus("DLQ");
        long today = Math.max(12, totalOrders);

        int activeWorkers = (int) workerPool.getAllWorkers().stream()
                .filter(w -> "PROCESSING".equalsIgnoreCase(w.getStatus()) || "BUSY".equalsIgnoreCase(w.getStatus()))
                .count();

        int queueDepth = messageProducer.getSimulatedOrderQueueDepth();
        double successRate = totalOrders > 0 ? ((double) completed / (totalOrders)) * 100.0 : 99.2;
        double processingRate = 42.0 + (new Random().nextDouble() * 6.0);

        return DashboardStatsResponse.builder()
                .ordersToday(today)
                .totalOrders(totalOrders)
                .completedOrders(completed)
                .processingOrders(processing)
                .pendingOrders(pending)
                .failedOrders(failed)
                .retryCount(retrying)
                .dlqCount(dlq)
                .activeWorkers(Math.max(1, activeWorkers))
                .queueDepth(queueDepth)
                .processingRate(Math.round(processingRate * 10.0) / 10.0)
                .successRate(Math.round(successRate * 10.0) / 10.0)
                .sparklineReceived(List.of(32, 38, 41, 44, 48, 52, 49, 45, 50, 54))
                .sparklineProcessed(List.of(30, 36, 39, 43, 47, 50, 48, 44, 48, 52))
                .sparklineQueue(List.of(18, 22, 28, 30, 35, 42, 38, 34, 30, queueDepth))
                .build();
    }

    public QueueMetricsResponse getQueueMetrics() {
        int orderQueue = messageProducer.getSimulatedOrderQueueDepth();
        int retryQueue = messageProducer.getSimulatedRetryQueueDepth();
        int dlq = messageProducer.getSimulatedDlqDepth();

        return QueueMetricsResponse.builder()
                .orderQueue(orderQueue)
                .retryQueue(retryQueue)
                .dlq(dlq)
                .throughputIn(Math.round((40.0 + new Random().nextDouble() * 8.0) * 10.0) / 10.0)
                .throughputOut(Math.round((39.0 + new Random().nextDouble() * 8.0) * 10.0) / 10.0)
                .consumers(3)
                .avgWaitTimeMs(145)
                .build();
    }

    // Broadcast live dashboard stats every 2 seconds
    @Scheduled(fixedRate = 2000)
    public void broadcastPeriodicStats() {
        DashboardStatsResponse stats = getDashboardStats();
        wsService.broadcastDashboardEvent(stats);

        QueueMetricsResponse queueMetrics = getQueueMetrics();
        wsService.broadcastQueueEvent(WebSocketEvent.builder()
                .event("QUEUE_UPDATED")
                .orderQueue(queueMetrics.getOrderQueue())
                .retryQueue(queueMetrics.getRetryQueue())
                .dlq(queueMetrics.getDlq())
                .build());
    }
}
