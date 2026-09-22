package com.acentra.orderhub.rabbitmq;

import com.acentra.orderhub.dto.OrderResponse;
import com.acentra.orderhub.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderMessageConsumer {

    private final OrderService orderService;

    @RabbitListener(queues = "${acentra.rabbitmq.order-queue:orders.queue}")
    public void handleIncomingOrder(OrderResponse order) {
        log.info("AMQP Listener received message from orders.queue for orderId: {}", order.getId());
        orderService.dispatchOrderToWorkerAsync(order.getId());
    }
}
