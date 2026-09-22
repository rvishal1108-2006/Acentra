package com.acentra.orderhub.controller;

import com.acentra.orderhub.dto.LoadTestRequest;
import com.acentra.orderhub.service.LoadTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/load-test")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LoadTestController {

    private final LoadTestService loadTestService;

    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> startLoadTest(@RequestBody(required = false) LoadTestRequest request) {
        LoadTestRequest req = request != null ? request : LoadTestRequest.builder().count(100).rps(50).build();
        loadTestService.startLoadTest(req);
        return ResponseEntity.ok(Map.of(
                "status", "STARTED",
                "targetOrders", req.getCount(),
                "rps", req.getRps(),
                "message", "Concurrent order generation fired into RabbitMQ pipeline"
        ));
    }

    @PostMapping("/stop")
    public ResponseEntity<Map<String, Object>> stopLoadTest() {
        loadTestService.stopLoadTest();
        return ResponseEntity.ok(Map.of(
                "status", "STOPPED",
                "generatedCount", loadTestService.getGeneratedCount()
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(Map.of(
                "isRunning", loadTestService.isRunning(),
                "generatedCount", loadTestService.getGeneratedCount()
        ));
    }
}
