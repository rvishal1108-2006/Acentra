package com.acentra.orderhub.service;

import com.acentra.orderhub.dto.CreateOrderRequest;
import com.acentra.orderhub.dto.OrderResponse;
import com.acentra.orderhub.dto.WebSocketEvent;
import com.acentra.orderhub.dto.WorkerInfoResponse;
import com.acentra.orderhub.entity.OrderEntity;
import com.acentra.orderhub.entity.OrderEventEntity;
import com.acentra.orderhub.entity.ProductEntity;
import com.acentra.orderhub.rabbitmq.OrderMessageProducer;
import com.acentra.orderhub.repository.OrderEventRepository;
import com.acentra.orderhub.repository.OrderRepository;
import com.acentra.orderhub.repository.ProductRepository;
import com.acentra.orderhub.websocket.WebSocketBroadcastService;
import com.acentra.orderhub.worker.WorkerSimulationPool;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderEventRepository orderEventRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final OrderMessageProducer messageProducer;
    private final WorkerSimulationPool workerPool;
    private final WebSocketBroadcastService wsService;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        // 1. Resolve product
        ProductEntity product = null;
        if (request.getProductSku() != null) {
            product = productRepository.findBySku(request.getProductSku()).orElse(null);
        }
        if (product == null && request.getProductId() != null) {
            product = productRepository.findById(request.getProductId()).orElse(null);
        }
        if (product == null) {
            product = productRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("No products available in database"));
        }

        int qty = request.getQuantity() != null && request.getQuantity() > 0 ? request.getQuantity() : 1;
        String orderId = "ORD-" + (10000 + new Random().nextInt(90000));
        LocalDateTime now = LocalDateTime.now();

        // 2. Reserve stock in inventory
        boolean reserved = inventoryService.reserveStock(product.getSku(), qty);
        String initialStatus = reserved ? "RESERVED" : "FAILED";

        double totalAmount = product.getUnitPrice() * qty;

        OrderEntity order = OrderEntity.builder()
                .id(orderId)
                .customerName(request.getCustomerName() != null ? request.getCustomerName() : "Enterprise Customer")
                .customerEmail(request.getCustomerEmail() != null ? request.getCustomerEmail() : "orders@client.corp")
                .productSku(product.getSku())
                .productName(product.getName())
                .quantity(qty)
                .unitPrice(product.getUnitPrice())
                .totalAmount(totalAmount)
                .status(initialStatus)
                .priority(request.getPriority() != null ? request.getPriority() : "NORMAL")
                .retryCount(0)
                .maxRetries(3)
                .createdAt(now)
                .updatedAt(now)
                .build();

        orderRepository.save(order);

        // 3. Log initial timeline event
        saveTimelineEvent(orderId, "CREATED", "Order Ingested", "Received via REST API Gateway (Region: us-east-1)", "SUCCESS", null, 12L);
        if (reserved) {
            saveTimelineEvent(orderId, "RESERVED", "Inventory Hold Confirmed", "Reserved " + qty + " units of " + product.getSku() + " from warehouse", "SUCCESS", null, 25L);
            saveTimelineEvent(orderId, "QUEUED", "Published to RabbitMQ", "Dispatched to orders.queue with routing key order.new", "SUCCESS", null, 8L);
        } else {
            saveTimelineEvent(orderId, "FAILED", "Stock Allocation Failed", "Insufficient available inventory for SKU " + product.getSku(), "ERROR", null, 5L);
        }

        OrderResponse response = mapToResponse(order);

        // 4. Publish to RabbitMQ
        if (reserved) {
            messageProducer.publishToOrderQueue(response);
            // Trigger asynchronous worker processing pipeline
            dispatchOrderToWorkerAsync(orderId);
        }

        // 5. Broadcast to WebSocket clients
        wsService.broadcastOrderEvent(WebSocketEvent.builder()
                .event("ORDER_CREATED")
                .orderId(orderId)
                .status(initialStatus)
                .product(product.getName())
                .sku(product.getSku())
                .build());

        return response;
    }

    @Async("taskExecutor")
    public CompletableFuture<Void> dispatchOrderToWorkerAsync(String orderId) {
        try {
            // Slight delay before worker pickup
            Thread.sleep(800);

            OrderEntity order = orderRepository.findById(orderId).orElse(null);
            if (order == null || !"RESERVED".equalsIgnoreCase(order.getStatus()) && !"RETRYING".equalsIgnoreCase(order.getStatus())) {
                return CompletableFuture.completedFuture(null);
            }

            // Acquire available worker
            WorkerInfoResponse worker = workerPool.acquireAvailableWorker(orderId, "Processing " + orderId + " (Payment & Fulfillment)");

            order.setStatus("PROCESSING");
            order.setWorkerId(worker.getId());
            order.setWorkerName(worker.getName());
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);

            saveTimelineEvent(orderId, "PICKED", "Picked by " + worker.getName(), "Worker node claimed consumer acknowledgement", "INFO", worker.getId(), 14L);
            saveTimelineEvent(orderId, "PROCESSING", "Executing Fulfillment Pipeline", "Verifying corporate line of credit and packing manifest", "INFO", worker.getId(), null);

            wsService.broadcastOrderEvent(WebSocketEvent.builder()
                    .event("ORDER_UPDATED")
                    .orderId(orderId)
                    .status("PROCESSING")
                    .worker(worker.getName())
                    .build());

            messageProducer.decrementOrderQueue();

            // Simulate execution time (2.0 - 2.8s)
            long duration = 2000 + new Random().nextInt(800);
            Thread.sleep(duration);

            // 85% success chance, 15% transient error chance
            boolean isSuccess = new Random().nextDouble() >= 0.15;

            if (isSuccess) {
                // SUCCESS: Complete order & consume inventory
                order.setStatus("COMPLETED");
                order.setUpdatedAt(LocalDateTime.now());
                orderRepository.save(order);

                inventoryService.consumeStock(order.getProductSku(), order.getQuantity());

                saveTimelineEvent(orderId, "COMPLETED", "Fulfillment Completed", "Packaging manifest created & dispatched to courier (AWB-9821-X)", "SUCCESS", worker.getId(), duration);
                workerPool.releaseWorker(worker.getId(), true);

                wsService.broadcastOrderEvent(WebSocketEvent.builder()
                        .event("ORDER_COMPLETED")
                        .orderId(orderId)
                        .status("COMPLETED")
                        .worker(worker.getName())
                        .build());

            } else {
                // FAILURE: Retry or send to DLQ
                int retries = order.getRetryCount() + 1;
                order.setRetryCount(retries);

                if (retries < order.getMaxRetries()) {
                    // Route to Retry Queue with backoff
                    order.setStatus("RETRYING");
                    order.setUpdatedAt(LocalDateTime.now());
                    orderRepository.save(order);

                    saveTimelineEvent(orderId, "RETRY", "Transient Failure (Attempt " + retries + "/3)", "Downstream payment gateway timeout. Routed to orders.retry.queue (3s backoff).", "WARNING", worker.getId(), duration);
                    workerPool.releaseWorker(worker.getId(), false);

                    messageProducer.publishToRetryQueue(mapToResponse(order));

                    wsService.broadcastOrderEvent(WebSocketEvent.builder()
                            .event("RETRY_TRIGGERED")
                            .orderId(orderId)
                            .status("RETRYING")
                            .worker(worker.getName())
                            .build());

                    // Re-process after 3.2s backoff
                    Thread.sleep(3200);
                    messageProducer.decrementRetryQueue();
                    dispatchOrderToWorkerAsync(orderId);

                } else {
                    // Retries exhausted -> Dead Letter Queue (DLQ)
                    order.setStatus("DLQ");
                    order.setUpdatedAt(LocalDateTime.now());
                    orderRepository.save(order);

                    saveTimelineEvent(orderId, "DLQ", "Sent to Dead Letter Queue", "Retries exhausted (3/3). Dispatched to orders.dlq for manual operator review.", "ERROR", worker.getId(), duration);
                    workerPool.releaseWorker(worker.getId(), false);

                    messageProducer.publishToDlq(mapToResponse(order));

                    wsService.broadcastOrderEvent(WebSocketEvent.builder()
                            .event("ORDER_DLQ")
                            .orderId(orderId)
                            .status("DLQ")
                            .worker(worker.getName())
                            .build());
                }
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("Error processing order {}: {}", orderId, e.getMessage(), e);
        }

        return CompletableFuture.completedFuture(null);
    }

    @Transactional
    public OrderResponse requeueOrder(String orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        order.setStatus("RESERVED");
        order.setRetryCount(0);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        saveTimelineEvent(orderId, "QUEUED", "Operator Re-Queue from DLQ", "Restored to active processing queue orders.queue", "INFO", null, 10L);

        OrderResponse response = mapToResponse(order);
        messageProducer.publishToOrderQueue(response);
        dispatchOrderToWorkerAsync(orderId);

        wsService.broadcastOrderEvent(WebSocketEvent.builder()
                .event("ORDER_UPDATED")
                .orderId(orderId)
                .status("RESERVED")
                .build());

        return response;
    }

    @Transactional
    public OrderResponse cancelOrder(String orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (!"COMPLETED".equalsIgnoreCase(order.getStatus())) {
            inventoryService.releaseStock(order.getProductSku(), order.getQuantity());
        }

        order.setStatus("FAILED");
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        saveTimelineEvent(orderId, "FAILED", "Order Cancelled", "Order terminated and reserved stock released", "ERROR", null, 5L);

        wsService.broadcastOrderEvent(WebSocketEvent.builder()
                .event("ORDER_UPDATED")
                .orderId(orderId)
                .status("FAILED")
                .build());

        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse updateStatus(String orderId, String newStatus) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        order.setStatus(newStatus.toUpperCase());
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        saveTimelineEvent(orderId, newStatus.toUpperCase(), "Status Updated to " + newStatus, "Manual operator status change", "INFO", null, 5L);

        wsService.broadcastOrderEvent(WebSocketEvent.builder()
                .event("ORDER_UPDATED")
                .orderId(orderId)
                .status(newStatus.toUpperCase())
                .build());

        return mapToResponse(order);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public OrderResponse getOrderById(String orderId) {
        return orderRepository.findById(orderId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
    }

    private void saveTimelineEvent(String orderId, String stage, String title, String desc, String status, String workerId, Long durationMs) {
        OrderEventEntity event = OrderEventEntity.builder()
                .id(UUID.randomUUID().toString())
                .orderId(orderId)
                .stage(stage)
                .title(title)
                .description(desc)
                .status(status)
                .workerId(workerId)
                .durationMs(durationMs)
                .timestamp(LocalDateTime.now())
                .build();
        orderEventRepository.save(event);
    }

    public OrderResponse mapToResponse(OrderEntity order) {
        List<OrderResponse.TimelineEventDto> timeline = orderEventRepository.findByOrderIdOrderByTimestampAsc(order.getId()).stream()
                .map(e -> OrderResponse.TimelineEventDto.builder()
                        .id(e.getId())
                        .stage(e.getStage())
                        .title(e.getTitle())
                        .description(e.getDescription())
                        .status(e.getStatus())
                        .workerId(e.getWorkerId())
                        .durationMs(e.getDurationMs())
                        .timestamp(e.getTimestamp())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .productSku(order.getProductSku())
                .productName(order.getProductName())
                .quantity(order.getQuantity())
                .unitPrice(order.getUnitPrice())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .priority(order.getPriority())
                .workerId(order.getWorkerId())
                .workerName(order.getWorkerName())
                .retryCount(order.getRetryCount())
                .maxRetries(order.getMaxRetries())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .timeline(timeline)
                .build();
    }
}
