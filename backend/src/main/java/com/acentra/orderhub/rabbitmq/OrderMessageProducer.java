package com.acentra.orderhub.rabbitmq;

import com.acentra.orderhub.dto.OrderResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicInteger;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderMessageProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${acentra.rabbitmq.exchange:orders.exchange}")
    private String exchange;

    @Value("${acentra.rabbitmq.routing-key:order.new}")
    private String orderRoutingKey;

    @Value("${acentra.rabbitmq.retry-routing-key:order.retry}")
    private String retryRoutingKey;

    @Value("${acentra.rabbitmq.dlq-routing-key:order.dlq}")
    private String dlqRoutingKey;

    // Simulated queue depth counters when operating in standalone/mock mode
    private final AtomicInteger simulatedOrderQueueDepth = new AtomicInteger(18);
    private final AtomicInteger simulatedRetryQueueDepth = new AtomicInteger(4);
    private final AtomicInteger simulatedDlqDepth = new AtomicInteger(8);

    public void publishToOrderQueue(OrderResponse order) {
        simulatedOrderQueueDepth.incrementAndGet();
        try {
            log.info("Publishing order to RabbitMQ exchange '{}' with routing key '{}': {}", exchange, orderRoutingKey, order.getId());
            rabbitTemplate.convertAndSend(exchange, orderRoutingKey, order);
        } catch (Exception e) {
            log.warn("RabbitMQ broker not connected (using in-memory simulated queue for hackathon demo): {}", e.getMessage());
        }
    }

    public void publishToRetryQueue(OrderResponse order) {
        simulatedRetryQueueDepth.incrementAndGet();
        try {
            log.warn("Publishing order to Retry Queue '{}': {}", retryRoutingKey, order.getId());
            rabbitTemplate.convertAndSend(exchange, retryRoutingKey, order);
        } catch (Exception e) {
            log.warn("RabbitMQ retry queue simulated fallback for {}", order.getId());
        }
    }

    public void publishToDlq(OrderResponse order) {
        simulatedDlqDepth.incrementAndGet();
        try {
            log.error("Publishing exhausted order to DLQ '{}': {}", dlqRoutingKey, order.getId());
            rabbitTemplate.convertAndSend(exchange, dlqRoutingKey, order);
        } catch (Exception e) {
            log.warn("RabbitMQ DLQ simulated fallback for {}", order.getId());
        }
    }

    public int getSimulatedOrderQueueDepth() {
        return Math.max(0, simulatedOrderQueueDepth.get());
    }

    public int getSimulatedRetryQueueDepth() {
        return Math.max(0, simulatedRetryQueueDepth.get());
    }

    public int getSimulatedDlqDepth() {
        return Math.max(0, simulatedDlqDepth.get());
    }

    public void decrementOrderQueue() {
        simulatedOrderQueueDepth.updateAndGet(v -> Math.max(0, v - 1));
    }

    public void decrementRetryQueue() {
        simulatedRetryQueueDepth.updateAndGet(v -> Math.max(0, v - 1));
    }

    public void purgeQueues() {
        simulatedOrderQueueDepth.set(0);
        simulatedRetryQueueDepth.set(0);
        simulatedDlqDepth.set(0);
    }
}
