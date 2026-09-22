package com.acentra.orderhub.service;

import com.acentra.orderhub.dto.WebSocketEvent;
import com.acentra.orderhub.entity.InventoryEntity;
import com.acentra.orderhub.entity.ProductEntity;
import com.acentra.orderhub.repository.InventoryRepository;
import com.acentra.orderhub.repository.ProductRepository;
import com.acentra.orderhub.websocket.WebSocketBroadcastService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WebSocketBroadcastService wsService;

    @Transactional
    public synchronized boolean reserveStock(String sku, int quantity) {
        InventoryEntity inventory = inventoryRepository.findBySku(sku)
                .orElseThrow(() -> new IllegalArgumentException("Inventory item not found for SKU: " + sku));

        if (inventory.getAvailableStock() < quantity) {
            log.warn("Insufficient stock for SKU {}. Available: {}, Requested: {}", sku, inventory.getAvailableStock(), quantity);
            return false;
        }

        inventory.setAvailableStock(inventory.getAvailableStock() - quantity);
        inventory.setReservedStock(inventory.getReservedStock() + quantity);
        inventory.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(inventory);

        broadcastInventoryChange(inventory, "INVENTORY_RESERVED");
        return true;
    }

    @Transactional
    public synchronized void consumeStock(String sku, int quantity) {
        inventoryRepository.findBySku(sku).ifPresent(inv -> {
            inv.setReservedStock(Math.max(0, inv.getReservedStock() - quantity));
            inv.setTotalStock(Math.max(0, inv.getTotalStock() - quantity));
            inv.setLastUpdated(LocalDateTime.now());
            inventoryRepository.save(inv);
            broadcastInventoryChange(inv, "INVENTORY_CONSUMED");
        });
    }

    @Transactional
    public synchronized void releaseStock(String sku, int quantity) {
        inventoryRepository.findBySku(sku).ifPresent(inv -> {
            inv.setReservedStock(Math.max(0, inv.getReservedStock() - quantity));
            inv.setAvailableStock(inv.getAvailableStock() + quantity);
            inv.setLastUpdated(LocalDateTime.now());
            inventoryRepository.save(inv);
            broadcastInventoryChange(inv, "INVENTORY_RELEASED");
        });
    }

    @Transactional
    public synchronized InventoryEntity restock(String sku, int amount) {
        InventoryEntity inv = inventoryRepository.findBySku(sku)
                .orElseThrow(() -> new IllegalArgumentException("SKU not found: " + sku));

        inv.setTotalStock(inv.getTotalStock() + amount);
        inv.setAvailableStock(inv.getAvailableStock() + amount);
        inv.setLastUpdated(LocalDateTime.now());
        InventoryEntity saved = inventoryRepository.save(inv);

        broadcastInventoryChange(saved, "INVENTORY_RESTOCKED");
        return saved;
    }

    public List<InventoryEntity> getAllInventory() {
        return inventoryRepository.findAll();
    }

    private void broadcastInventoryChange(InventoryEntity inv, String eventType) {
        ProductEntity prod = productRepository.findBySku(inv.getSku()).orElse(null);
        String productName = prod != null ? prod.getName() : inv.getSku();

        WebSocketEvent event = WebSocketEvent.builder()
                .event(eventType)
                .sku(inv.getSku())
                .product(productName)
                .available(inv.getAvailableStock())
                .reserved(inv.getReservedStock())
                .totalStock(inv.getTotalStock())
                .build();

        wsService.broadcastInventoryEvent(event);
    }
}
