package com.acentra.orderhub.worker;

import com.acentra.orderhub.dto.WorkerInfoResponse;
import com.acentra.orderhub.websocket.WebSocketBroadcastService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@RequiredArgsConstructor
@Slf4j
public class WorkerSimulationPool {

    private final WebSocketBroadcastService wsService;
    private final Map<String, WorkerInfoResponse> workers = new ConcurrentHashMap<>();
    private final AtomicInteger roundRobinIndex = new AtomicInteger(0);

    @PostConstruct
    public void init() {
        workers.put("worker-1", WorkerInfoResponse.builder()
                .id("worker-1")
                .name("Worker 1 (Pod-A1)")
                .status("IDLE")
                .currentTask("Idle - Polling orders.queue")
                .currentOrderId(null)
                .ordersProcessed(4120)
                .successRate(99.2)
                .cpuUsage(38)
                .memoryUsage(55)
                .lastHeartbeat(LocalDateTime.now().toString())
                .uptimeSeconds(86400)
                .host("k8s-c4x-01")
                .build());

        workers.put("worker-2", WorkerInfoResponse.builder()
                .id("worker-2")
                .name("Worker 2 (Pod-B2)")
                .status("IDLE")
                .currentTask("Idle - Polling orders.queue")
                .currentOrderId(null)
                .ordersProcessed(3890)
                .successRate(98.8)
                .cpuUsage(42)
                .memoryUsage(61)
                .lastHeartbeat(LocalDateTime.now().toString())
                .uptimeSeconds(86400)
                .host("k8s-c4x-02")
                .build());

        workers.put("worker-3", WorkerInfoResponse.builder()
                .id("worker-3")
                .name("Worker 3 (Pod-C3)")
                .status("IDLE")
                .currentTask("Idle - Polling orders.queue")
                .currentOrderId(null)
                .ordersProcessed(4350)
                .successRate(99.4)
                .cpuUsage(34)
                .memoryUsage(52)
                .lastHeartbeat(LocalDateTime.now().toString())
                .uptimeSeconds(86400)
                .host("k8s-c4x-03")
                .build());
    }

    public List<WorkerInfoResponse> getAllWorkers() {
        return new ArrayList<>(workers.values());
    }

    public synchronized WorkerInfoResponse acquireAvailableWorker(String orderId, String taskDescription) {
        // Find idle worker or least busy worker
        Optional<WorkerInfoResponse> idleWorker = workers.values().stream()
                .filter(w -> "IDLE".equalsIgnoreCase(w.getStatus()))
                .findFirst();

        WorkerInfoResponse selected = idleWorker.orElseGet(() -> {
            List<WorkerInfoResponse> list = new ArrayList<>(workers.values());
            int idx = Math.abs(roundRobinIndex.getAndIncrement() % list.size());
            return list.get(idx);
        });

        selected.setStatus("PROCESSING");
        selected.setCurrentOrderId(orderId);
        selected.setCurrentTask(taskDescription);
        selected.setCpuUsage(Math.min(95, selected.getCpuUsage() + 25));
        selected.setLastHeartbeat(LocalDateTime.now().toString());

        broadcastWorkerUpdate(selected);
        return selected;
    }

    public void releaseWorker(String workerId, boolean success) {
        WorkerInfoResponse worker = workers.get(workerId);
        if (worker != null) {
            worker.setStatus("IDLE");
            worker.setCurrentOrderId(null);
            worker.setCurrentTask("Idle - Awaiting next RabbitMQ order packet");
            worker.setOrdersProcessed(worker.getOrdersProcessed() + 1);
            worker.setCpuUsage(Math.max(22, worker.getCpuUsage() - 25));
            worker.setLastHeartbeat(LocalDateTime.now().toString());
            broadcastWorkerUpdate(worker);
        }
    }

    public void updateWorkerStatus(String workerId, String status, String task) {
        WorkerInfoResponse worker = workers.get(workerId);
        if (worker != null) {
            worker.setStatus(status);
            worker.setCurrentTask(task);
            worker.setLastHeartbeat(LocalDateTime.now().toString());
            broadcastWorkerUpdate(worker);
        }
    }

    private void broadcastWorkerUpdate(WorkerInfoResponse worker) {
        wsService.broadcastWorkerEvent(worker);
    }

    // Periodic telemetry fluctuations & heartbeat broadcast every 2.5 seconds
    @Scheduled(fixedRate = 2500)
    public void telemetryTick() {
        Random rand = new Random();
        for (WorkerInfoResponse w : workers.values()) {
            if ("IDLE".equalsIgnoreCase(w.getStatus())) {
                w.setCpuUsage(Math.max(15, Math.min(50, w.getCpuUsage() + rand.nextInt(7) - 3)));
            } else {
                w.setCpuUsage(Math.max(45, Math.min(92, w.getCpuUsage() + rand.nextInt(9) - 4)));
            }
            w.setMemoryUsage(Math.max(40, Math.min(80, w.getMemoryUsage() + rand.nextInt(3) - 1)));
            w.setLastHeartbeat(LocalDateTime.now().toString());
        }
        wsService.broadcastWorkerEvent(getAllWorkers());
    }
}
