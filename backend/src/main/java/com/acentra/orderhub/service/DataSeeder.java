package com.acentra.orderhub.service;

import com.acentra.orderhub.entity.InventoryEntity;
import com.acentra.orderhub.entity.OrderEntity;
import com.acentra.orderhub.entity.OrderEventEntity;
import com.acentra.orderhub.entity.ProductEntity;
import com.acentra.orderhub.repository.InventoryRepository;
import com.acentra.orderhub.repository.OrderEventRepository;
import com.acentra.orderhub.repository.OrderRepository;
import com.acentra.orderhub.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderRepository orderRepository;
    private final OrderEventRepository orderEventRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            log.info("Database already seeded with initial records");
            return;
        }

        log.info("Seeding initial products, inventory, and demonstration orders...");

        // 1. Seed Products
        List<ProductEntity> products = List.of(
                ProductEntity.builder()
                        .id("prod-1")
                        .name("Quantum Edge X1 Enterprise Gateway")
                        .sku("QNT-EDG-X1")
                        .category("Networking")
                        .unitPrice(1299.00)
                        .warehouse("US-East-Primary")
                        .imageUrl("https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80")
                        .build(),
                ProductEntity.builder()
                        .id("prod-2")
                        .name("Acentra Tensor Processor Unit (TPU-400)")
                        .sku("ACN-TPU-400")
                        .category("Accelerators")
                        .unitPrice(4850.00)
                        .warehouse("EU-West-Main")
                        .imageUrl("https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80")
                        .build(),
                ProductEntity.builder()
                        .id("prod-3")
                        .name("HyperDrive NVMe Gen5 8TB Array")
                        .sku("HPD-NV5-8TB")
                        .category("Storage")
                        .unitPrice(799.00)
                        .warehouse("US-West-Silicon")
                        .imageUrl("https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80")
                        .build(),
                ProductEntity.builder()
                        .id("prod-4")
                        .name("Synapse Optical Interconnect Transceiver 800G")
                        .sku("SYN-OPT-800G")
                        .category("Optics")
                        .unitPrice(340.00)
                        .warehouse("APAC-Tokyo-01")
                        .imageUrl("https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80")
                        .build(),
                ProductEntity.builder()
                        .id("prod-5")
                        .name("CyberShield HSM Cryptographic Module")
                        .sku("CSH-HSM-900")
                        .category("Security")
                        .unitPrice(2150.00)
                        .warehouse("US-Central-Dallas")
                        .imageUrl("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80")
                        .build(),
                ProductEntity.builder()
                        .id("prod-6")
                        .name("PulseFlow Smart Industrial PDU 32A")
                        .sku("PFL-PDU-32A")
                        .category("Power")
                        .unitPrice(580.00)
                        .warehouse("US-East-Primary")
                        .imageUrl("https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80")
                        .build()
        );
        productRepository.saveAll(products);

        // 2. Seed Inventory
        List<InventoryEntity> inventories = List.of(
                InventoryEntity.builder().sku("QNT-EDG-X1").totalStock(1450).availableStock(1330).reservedStock(120).lowStockThreshold(200).lastUpdated(LocalDateTime.now()).build(),
                InventoryEntity.builder().sku("ACN-TPU-400").totalStock(340).availableStock(160).reservedStock(180).lowStockThreshold(180).lastUpdated(LocalDateTime.now()).build(),
                InventoryEntity.builder().sku("HPD-NV5-8TB").totalStock(820).availableStock(725).reservedStock(95).lowStockThreshold(150).lastUpdated(LocalDateTime.now()).build(),
                InventoryEntity.builder().sku("SYN-OPT-800G").totalStock(120).availableStock(25).reservedStock(95).lowStockThreshold(40).lastUpdated(LocalDateTime.now()).build(),
                InventoryEntity.builder().sku("CSH-HSM-900").totalStock(530).availableStock(485).reservedStock(45).lowStockThreshold(100).lastUpdated(LocalDateTime.now()).build(),
                InventoryEntity.builder().sku("PFL-PDU-32A").totalStock(48).availableStock(10).reservedStock(38).lowStockThreshold(20).lastUpdated(LocalDateTime.now()).build()
        );
        inventoryRepository.saveAll(inventories);

        // 3. Seed Demonstration Orders
        createSeedOrder("ORD-98205", "Aura Cloud Infrastructure Inc.", "ops@auracloud.io", "ACN-TPU-400", "Acentra Tensor Processor Unit (TPU-400)", 4, 4850.00, "PROCESSING", "Worker 2 (Pod-B2)", "worker-2");
        createSeedOrder("ORD-98204", "Starlight Financial Analytics", "procure@starlightfin.com", "HPD-NV5-8TB", "HyperDrive NVMe Gen5 8TB Array", 12, 799.00, "RESERVED", "Worker 1 (Pod-A1)", "worker-1");
        createSeedOrder("ORD-98203", "Vanguard Genomics Ltd.", "lab@vanguardgenomics.org", "QNT-EDG-X1", "Quantum Edge X1 Enterprise Gateway", 2, 1299.00, "COMPLETED", "Worker 3 (Pod-C3)", "worker-3");
        createSeedOrder("ORD-98202", "Nexis Cybernetics Group", "devops@nexis-cyber.com", "SYN-OPT-800G", "Synapse Optical Interconnect Transceiver 800G", 16, 340.00, "RETRYING", "Worker 1 (Pod-A1)", "worker-1");
        createSeedOrder("ORD-98201", "Cobalt Media Systems", "billing@cobaltmedia.net", "CSH-HSM-900", "CyberShield HSM Cryptographic Module", 1, 2150.00, "DLQ", null, null);

        log.info("Database seeding successfully completed!");
    }

    private void createSeedOrder(String id, String customer, String email, String sku, String name, int qty, double price, String status, String workerName, String workerId) {
        LocalDateTime now = LocalDateTime.now().minusMinutes(new java.util.Random().nextInt(45));
        OrderEntity order = OrderEntity.builder()
                .id(id)
                .customerName(customer)
                .customerEmail(email)
                .productSku(sku)
                .productName(name)
                .quantity(qty)
                .unitPrice(price)
                .totalAmount(price * qty)
                .status(status)
                .priority("HIGH")
                .workerName(workerName)
                .workerId(workerId)
                .retryCount("RETRYING".equals(status) ? 2 : "DLQ".equals(status) ? 3 : 0)
                .maxRetries(3)
                .createdAt(now)
                .updatedAt(LocalDateTime.now())
                .build();
        orderRepository.save(order);

        // Timeline events
        orderEventRepository.save(OrderEventEntity.builder().id(UUID.randomUUID().toString()).orderId(id).stage("CREATED").title("Order Ingested").description("Received via REST API Gateway").status("SUCCESS").durationMs(14L).timestamp(now).build());
        orderEventRepository.save(OrderEventEntity.builder().id(UUID.randomUUID().toString()).orderId(id).stage("RESERVED").title("Inventory Reserved").description("Held " + qty + " units of " + sku).status("SUCCESS").durationMs(28L).timestamp(now.plusSeconds(5)).build());
        if ("COMPLETED".equals(status)) {
            orderEventRepository.save(OrderEventEntity.builder().id(UUID.randomUUID().toString()).orderId(id).stage("COMPLETED").title("Fulfillment Completed").description("Carrier airbill generated (AWB-9821-X)").status("SUCCESS").durationMs(420L).timestamp(now.plusSeconds(30)).build());
        } else if ("DLQ".equals(status)) {
            orderEventRepository.save(OrderEventEntity.builder().id(UUID.randomUUID().toString()).orderId(id).stage("RETRY").title("Retries Exhausted (3/3)").description("ERP webhook upstream timeout (504)").status("ERROR").timestamp(now.plusSeconds(20)).build());
            orderEventRepository.save(OrderEventEntity.builder().id(UUID.randomUUID().toString()).orderId(id).stage("DLQ").title("Moved to Dead Letter Queue").description("Sent to orders.dlq for manual operator intervention").status("ERROR").timestamp(now.plusSeconds(25)).build());
        }
    }
}
