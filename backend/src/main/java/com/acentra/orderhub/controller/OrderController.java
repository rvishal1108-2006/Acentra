package com.acentra.orderhub.controller;

import com.acentra.orderhub.dto.CreateOrderRequest;
import com.acentra.orderhub.dto.OrderResponse;
import com.acentra.orderhub.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    @PostMapping("/{id}/requeue")
    public ResponseEntity<OrderResponse> requeueOrder(@PathVariable String id) {
        return ResponseEntity.ok(orderService.requeueOrder(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable String id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }
}
