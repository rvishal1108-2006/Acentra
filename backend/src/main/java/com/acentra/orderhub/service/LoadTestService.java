package com.acentra.orderhub.service;

import com.acentra.orderhub.dto.CreateOrderRequest;
import com.acentra.orderhub.dto.LoadTestRequest;
import com.acentra.orderhub.entity.ProductEntity;
import com.acentra.orderhub.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoadTestService {

    private final OrderService orderService;
    private final ProductRepository productRepository;
    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    private final AtomicInteger generatedCount = new AtomicInteger(0);

    @Async("taskExecutor")
    public void startLoadTest(LoadTestRequest request) {
        if (isRunning.getAndSet(true)) {
            log.warn("Load test is already actively executing");
            return;
        }

        generatedCount.set(0);
        int total = request.getCount() != null ? request.getCount() : 100;
        int rps = request.getRps() != null && request.getRps() > 0 ? request.getRps() : 50;
        long sleepIntervalMs = Math.max(10, 1000 / rps);

        List<ProductEntity> products = productRepository.findAll();
        Random rand = new Random();

        log.info("Starting load test: total={}, targetRPS={}", total, rps);

        try {
            for (int i = 0; i < total && isRunning.get(); i++) {
                ProductEntity product = products.get(rand.nextInt(products.size()));
                int qty = 1 + rand.nextInt(3);

                CreateOrderRequest orderReq = CreateOrderRequest.builder()
                        .customerName("Benchmark Client #" + (1 + rand.nextInt(50)))
                        .customerEmail("bench-" + (1000 + i) + "@stress.test")
                        .productSku(product.getSku())
                        .quantity(qty)
                        .priority(rand.nextBoolean() ? "HIGH" : "NORMAL")
                        .build();

                orderService.createOrder(orderReq);
                generatedCount.incrementAndGet();

                Thread.sleep(sleepIntervalMs);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            isRunning.set(false);
            log.info("Load test completed. Generated total: {}", generatedCount.get());
        }
    }

    public void stopLoadTest() {
        isRunning.set(false);
        log.info("Load test stopped by operator");
    }

    public boolean isRunning() {
        return isRunning.get();
    }

    public int getGeneratedCount() {
        return generatedCount.get();
    }
}
