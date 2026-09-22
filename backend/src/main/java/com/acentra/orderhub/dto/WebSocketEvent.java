package com.acentra.orderhub.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WebSocketEvent {
    private String event;
    private String orderId;
    private String status;
    private String worker;
    private String product;
    private String sku;
    private Integer available;
    private Integer reserved;
    private Integer totalStock;
    private Integer orderQueue;
    private Integer retryQueue;
    private Integer dlq;
    private Object payload;
    
    @Builder.Default
    private String timestamp = LocalDateTime.now().toString();
}
