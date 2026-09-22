package com.acentra.orderhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    private String customerName;
    private String customerEmail;
    private String productSku;
    private String productId;
    private Integer quantity;
    private String priority; // LOW, NORMAL, HIGH, CRITICAL
}
