package com.acentra.orderhub.websocket;

import com.acentra.orderhub.dto.WebSocketEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastOrderEvent(WebSocketEvent event) {
        log.info("Broadcasting to /topic/orders: orderId={}, status={}", event.getOrderId(), event.getStatus());
        messagingTemplate.convertAndSend("/topic/orders", event);
    }

    public void broadcastInventoryEvent(WebSocketEvent event) {
        log.info("Broadcasting to /topic/inventory: sku={}, available={}, reserved={}", event.getSku(), event.getAvailable(), event.getReserved());
        messagingTemplate.convertAndSend("/topic/inventory", event);
    }

    public void broadcastDashboardEvent(Object stats) {
        messagingTemplate.convertAndSend("/topic/dashboard", stats);
    }

    public void broadcastWorkerEvent(Object workerData) {
        messagingTemplate.convertAndSend("/topic/workers", workerData);
    }

    public void broadcastQueueEvent(WebSocketEvent event) {
        messagingTemplate.convertAndSend("/topic/queues", event);
    }
}
