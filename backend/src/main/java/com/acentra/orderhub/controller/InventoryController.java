package com.acentra.orderhub.controller;

import com.acentra.orderhub.dto.RestockRequest;
import com.acentra.orderhub.entity.InventoryEntity;
import com.acentra.orderhub.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryEntity>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @PostMapping("/restock")
    public ResponseEntity<InventoryEntity> restock(@RequestBody RestockRequest request) {
        if (request.getSku() == null || request.getAmount() == null || request.getAmount() <= 0) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(inventoryService.restock(request.getSku(), request.getAmount()));
    }
}
