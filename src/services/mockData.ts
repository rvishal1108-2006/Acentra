import { 
  Order, 
  InventoryItem, 
  Reservation, 
  RabbitQueue, 
  WorkerNode, 
  AuditLog, 
  SystemHealth, 
  LiveKPIs, 
  LiveEventFeedItem 
} from '../types';

export const INITIAL_PRODUCTS: InventoryItem[] = [
  {
    id: 'prod-1',
    name: 'Quantum Edge X1 Enterprise Gateway',
    sku: 'QNT-EDG-X1',
    category: 'Networking',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    totalStock: 1450,
    reserved: 120,
    available: 1330,
    unitPrice: 1299.00,
    lowStockThreshold: 200,
    reorderPoint: 350,
    lastUpdated: new Date().toISOString(),
    warehouse: 'US-East-Primary'
  },
  {
    id: 'prod-2',
    name: 'Acentra Tensor Processor Unit (TPU-400)',
    sku: 'ACN-TPU-400',
    category: 'Accelerators',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80',
    totalStock: 340,
    reserved: 180,
    available: 160,
    unitPrice: 4850.00,
    lowStockThreshold: 180,
    reorderPoint: 250,
    lastUpdated: new Date().toISOString(),
    warehouse: 'EU-West-Main'
  },
  {
    id: 'prod-3',
    name: 'HyperDrive NVMe Gen5 8TB Array',
    sku: 'HPD-NV5-8TB',
    category: 'Storage',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80',
    totalStock: 820,
    reserved: 95,
    available: 725,
    unitPrice: 799.00,
    lowStockThreshold: 150,
    reorderPoint: 200,
    lastUpdated: new Date().toISOString(),
    warehouse: 'US-West-Silicon'
  },
  {
    id: 'prod-4',
    name: 'Synapse Optical Interconnect Transceiver 800G',
    sku: 'SYN-OPT-800G',
    category: 'Optics',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    totalStock: 120,
    reserved: 95,
    available: 25,
    unitPrice: 340.00,
    lowStockThreshold: 40,
    reorderPoint: 60,
    lastUpdated: new Date().toISOString(),
    warehouse: 'APAC-Tokyo-01'
  },
  {
    id: 'prod-5',
    name: 'CyberShield HSM Cryptographic Module',
    sku: 'CSH-HSM-900',
    category: 'Security',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    totalStock: 530,
    reserved: 45,
    available: 485,
    unitPrice: 2150.00,
    lowStockThreshold: 100,
    reorderPoint: 150,
    lastUpdated: new Date().toISOString(),
    warehouse: 'US-Central-Dallas'
  },
  {
    id: 'prod-6',
    name: 'PulseFlow Smart Industrial PDU 32A',
    sku: 'PFL-PDU-32A',
    category: 'Power',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    totalStock: 48,
    reserved: 38,
    available: 10,
    unitPrice: 580.00,
    lowStockThreshold: 20,
    reorderPoint: 30,
    lastUpdated: new Date().toISOString(),
    warehouse: 'US-East-Primary'
  }
];

export const INITIAL_QUEUES: RabbitQueue[] = [
  {
    id: 'q-orders',
    name: 'orders.v1.incoming',
    type: 'order_queue',
    messages: 34,
    throughputIn: 42.5,
    throughputOut: 41.8,
    consumers: 4,
    avgWaitTimeMs: 142,
    memoryBytes: 4280000,
    state: 'active',
    vhost: '/production-east'
  },
  {
    id: 'q-retry',
    name: 'orders.v1.retry.backoff',
    type: 'retry_queue',
    messages: 6,
    throughputIn: 3.2,
    throughputOut: 2.9,
    consumers: 2,
    avgWaitTimeMs: 4200,
    memoryBytes: 890000,
    state: 'idle',
    vhost: '/production-east'
  },
  {
    id: 'q-dlq',
    name: 'orders.v1.deadletter.dlq',
    type: 'dead_letter_queue',
    messages: 12,
    throughputIn: 0.8,
    throughputOut: 0.0,
    consumers: 1,
    avgWaitTimeMs: 38400,
    memoryBytes: 1540000,
    state: 'throttled',
    vhost: '/production-east'
  }
];

export const INITIAL_WORKERS: WorkerNode[] = [
  {
    id: 'worker-01',
    name: 'Worker Alpha (Pod-A1)',
    status: 'active',
    currentTask: 'Processing ORD-98201 (Payload validation & Payment Capture)',
    currentOrderId: 'ORD-98201',
    ordersProcessed: 14820,
    successRate: 99.4,
    cpuUsage: 48,
    memoryUsage: 62,
    lastHeartbeat: new Date().toISOString(),
    uptimeSeconds: 84200,
    host: 'node-k8s-c4x-01',
    concurrencyLimit: 10
  },
  {
    id: 'worker-02',
    name: 'Worker Beta (Pod-B4)',
    status: 'busy',
    currentTask: 'Reserving Inventory for ORD-98204 (Lock acquired: TPU-400)',
    currentOrderId: 'ORD-98204',
    ordersProcessed: 12940,
    successRate: 98.9,
    cpuUsage: 76,
    memoryUsage: 71,
    lastHeartbeat: new Date().toISOString(),
    uptimeSeconds: 84150,
    host: 'node-k8s-c4x-02',
    concurrencyLimit: 10
  },
  {
    id: 'worker-03',
    name: 'Worker Gamma (Pod-C2)',
    status: 'active',
    currentTask: 'Routing ORD-98199 to FedEx Enterprise Logistics Hook',
    currentOrderId: 'ORD-98199',
    ordersProcessed: 15430,
    successRate: 99.7,
    cpuUsage: 38,
    memoryUsage: 54,
    lastHeartbeat: new Date().toISOString(),
    uptimeSeconds: 124000,
    host: 'node-k8s-c4x-03',
    concurrencyLimit: 10
  },
  {
    id: 'worker-04',
    name: 'Worker Delta (Pod-D9)',
    status: 'active',
    currentTask: 'Retrying transaction for ORD-98188 with backoff 4.2s',
    currentOrderId: 'ORD-98188',
    ordersProcessed: 11210,
    successRate: 97.8,
    cpuUsage: 52,
    memoryUsage: 59,
    lastHeartbeat: new Date().toISOString(),
    uptimeSeconds: 61200,
    host: 'node-k8s-c4x-04',
    concurrencyLimit: 10
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-98205',
    customerName: 'Aura Cloud Infrastructure Inc.',
    customerEmail: 'ops@auracloud.io',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    productId: 'prod-2',
    productName: 'Acentra Tensor Processor Unit (TPU-400)',
    productSku: 'ACN-TPU-400',
    quantity: 4,
    unitPrice: 4850.00,
    totalAmount: 19400.00,
    status: 'processing',
    priority: 'critical',
    workerId: 'worker-02',
    workerName: 'Worker Beta (Pod-B4)',
    retryCount: 0,
    maxRetries: 3,
    createdAt: new Date(Date.now() - 1000 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 5).toISOString(),
    timeline: [
      {
        id: 't-1',
        stage: 'created',
        title: 'Order Ingested',
        description: 'Received via REST API Gateway (Region: us-east-1)',
        timestamp: new Date(Date.now() - 1000 * 25).toISOString(),
        status: 'success',
        durationMs: 12
      },
      {
        id: 't-2',
        stage: 'reserved',
        title: 'Inventory Reserved',
        description: 'Allocated 4 units of ACN-TPU-400 from EU-West-Main with 15m TTL hold',
        timestamp: new Date(Date.now() - 1000 * 20).toISOString(),
        status: 'success',
        durationMs: 45
      },
      {
        id: 't-3',
        stage: 'queued',
        title: 'Dispatched to RabbitMQ',
        description: 'Published to orders.v1.incoming with routing key: order.priority.critical',
        timestamp: new Date(Date.now() - 1000 * 15).toISOString(),
        status: 'success',
        durationMs: 8
      },
      {
        id: 't-4',
        stage: 'picked',
        title: 'Picked by Worker',
        description: 'Worker Beta (Pod-B4) acknowledged consumer tag: ctag-982',
        timestamp: new Date(Date.now() - 1000 * 10).toISOString(),
        status: 'info',
        workerId: 'worker-02',
        durationMs: 14
      },
      {
        id: 't-5',
        stage: 'processing',
        title: 'Processing Payment & Fulfillment',
        description: 'Verifying corporate line of credit and generating dispatch manifest',
        timestamp: new Date(Date.now() - 1000 * 5).toISOString(),
        status: 'info',
        workerId: 'worker-02'
      }
    ],
    metadata: {
      region: 'us-east-1',
      paymentRef: 'tx_aura_998124',
      deliveryMethod: 'Priority Next-Flight Logistics'
    }
  },
  {
    id: 'ORD-98204',
    customerName: 'Starlight Financial Analytics',
    customerEmail: 'procure@starlightfin.com',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    productId: 'prod-3',
    productName: 'HyperDrive NVMe Gen5 8TB Array',
    productSku: 'HPD-NV5-8TB',
    quantity: 12,
    unitPrice: 799.00,
    totalAmount: 9588.00,
    status: 'reserved',
    priority: 'high',
    workerId: 'worker-01',
    workerName: 'Worker Alpha (Pod-A1)',
    retryCount: 0,
    maxRetries: 3,
    createdAt: new Date(Date.now() - 1000 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 45).toISOString(),
    timeline: [
      {
        id: 't-1',
        stage: 'created',
        title: 'Order Created',
        description: 'API checkout payload validated against schema v2.1',
        timestamp: new Date(Date.now() - 1000 * 60).toISOString(),
        status: 'success',
        durationMs: 14
      },
      {
        id: 't-2',
        stage: 'reserved',
        title: 'Hold Active',
        description: 'Reserved 12 units of HPD-NV5-8TB. TTL countdown started (10 min)',
        timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
        status: 'success',
        durationMs: 38
      }
    ]
  },
  {
    id: 'ORD-98203',
    customerName: 'Vanguard Genomics Ltd.',
    customerEmail: 'lab@vanguardgenomics.org',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    productId: 'prod-1',
    productName: 'Quantum Edge X1 Enterprise Gateway',
    productSku: 'QNT-EDG-X1',
    quantity: 2,
    unitPrice: 1299.00,
    totalAmount: 2598.00,
    status: 'completed',
    priority: 'normal',
    workerId: 'worker-03',
    workerName: 'Worker Gamma (Pod-C2)',
    retryCount: 0,
    maxRetries: 3,
    createdAt: new Date(Date.now() - 1000 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 30).toISOString(),
    timeline: [
      {
        id: 't-1',
        stage: 'created',
        title: 'Order Placed',
        description: 'Checkout complete via Stripe Corporate ACH',
        timestamp: new Date(Date.now() - 1000 * 180).toISOString(),
        status: 'success',
        durationMs: 10
      },
      {
        id: 't-2',
        stage: 'reserved',
        title: 'Inventory Reserved',
        description: '2 units committed from US-East-Primary',
        timestamp: new Date(Date.now() - 1000 * 160).toISOString(),
        status: 'success',
        durationMs: 32
      },
      {
        id: 't-3',
        stage: 'queued',
        title: 'Queued',
        description: 'Dispatched to RabbitMQ queue: orders.v1.incoming',
        timestamp: new Date(Date.now() - 1000 * 140).toISOString(),
        status: 'success',
        durationMs: 9
      },
      {
        id: 't-4',
        stage: 'picked',
        title: 'Worker Picked',
        description: 'Worker Gamma (Pod-C2) claimed processing token',
        timestamp: new Date(Date.now() - 1000 * 110).toISOString(),
        status: 'info',
        workerId: 'worker-03',
        durationMs: 18
      },
      {
        id: 't-5',
        stage: 'completed',
        title: 'Fulfillment Completed',
        description: 'AirWayBill generated (AWB-8921-X9). Dispatched for courier pickup.',
        timestamp: new Date(Date.now() - 1000 * 30).toISOString(),
        status: 'success',
        workerId: 'worker-03',
        durationMs: 420
      }
    ]
  },
  {
    id: 'ORD-98202',
    customerName: 'Nexis Cybernetics Group',
    customerEmail: 'devops@nexis-cyber.com',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    productId: 'prod-4',
    productName: 'Synapse Optical Interconnect Transceiver 800G',
    productSku: 'SYN-OPT-800G',
    quantity: 16,
    unitPrice: 340.00,
    totalAmount: 5440.00,
    status: 'retrying',
    priority: 'high',
    workerId: 'worker-04',
    workerName: 'Worker Delta (Pod-D9)',
    retryCount: 2,
    maxRetries: 3,
    createdAt: new Date(Date.now() - 1000 * 340).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 12).toISOString(),
    timeline: [
      {
        id: 't-1',
        stage: 'created',
        title: 'Order Created',
        description: 'Received from Wholesale API client',
        timestamp: new Date(Date.now() - 1000 * 340).toISOString(),
        status: 'success'
      },
      {
        id: 't-2',
        stage: 'reserved',
        title: 'Reserved',
        description: '16 units held in APAC-Tokyo-01',
        timestamp: new Date(Date.now() - 1000 * 320).toISOString(),
        status: 'success'
      },
      {
        id: 't-3',
        stage: 'retry',
        title: 'Payment Gateway Transient Timeout',
        description: 'Attempt 1 failed: Connection reset by peer (gateway.tokyo.pay). Backing off 2s.',
        timestamp: new Date(Date.now() - 1000 * 180).toISOString(),
        status: 'warning',
        durationMs: 2000
      },
      {
        id: 't-4',
        stage: 'retry',
        title: 'Re-queued with Exponential Backoff (Attempt 2/3)',
        description: 'Worker Delta picked retry task. Awaiting 4.2s delay before 3rd attempt.',
        timestamp: new Date(Date.now() - 1000 * 12).toISOString(),
        status: 'warning',
        workerId: 'worker-04'
      }
    ]
  },
  {
    id: 'ORD-98201',
    customerName: 'Cobalt Media Systems',
    customerEmail: 'billing@cobaltmedia.net',
    customerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    productId: 'prod-5',
    productName: 'CyberShield HSM Cryptographic Module',
    productSku: 'CSH-HSM-900',
    quantity: 1,
    unitPrice: 2150.00,
    totalAmount: 2150.00,
    status: 'dlq',
    priority: 'normal',
    retryCount: 3,
    maxRetries: 3,
    createdAt: new Date(Date.now() - 1000 * 800).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 120).toISOString(),
    timeline: [
      {
        id: 't-1',
        stage: 'created',
        title: 'Order Created',
        description: 'Direct checkout initiated',
        timestamp: new Date(Date.now() - 1000 * 800).toISOString(),
        status: 'success'
      },
      {
        id: 't-2',
        stage: 'retry',
        title: 'Max Retries Exceeded (3/3)',
        description: 'Target ERP webhook failed repeatedly with HTTP 504 Gateway Timeout',
        timestamp: new Date(Date.now() - 1000 * 200).toISOString(),
        status: 'error'
      },
      {
        id: 't-3',
        stage: 'dlq',
        title: 'Routed to Dead Letter Queue (DLQ)',
        description: 'Sent to orders.v1.deadletter.dlq for manual operator inspection and resolution',
        timestamp: new Date(Date.now() - 1000 * 120).toISOString(),
        status: 'error'
      }
    ],
    metadata: {
      failureReason: 'ERP Webhook upstream timeout (504). Exhausted 3 exponential retries.',
      region: 'us-central-1'
    }
  },
  {
    id: 'ORD-98200',
    customerName: 'Helios Planetary Research',
    customerEmail: 'astronomy@helios-labs.edu',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    productId: 'prod-6',
    productName: 'PulseFlow Smart Industrial PDU 32A',
    productSku: 'PFL-PDU-32A',
    quantity: 2,
    unitPrice: 580.00,
    totalAmount: 1160.00,
    status: 'pending',
    priority: 'low',
    retryCount: 0,
    maxRetries: 3,
    createdAt: new Date(Date.now() - 1000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 10).toISOString(),
    timeline: [
      {
        id: 't-1',
        stage: 'created',
        title: 'Order Submitted',
        description: 'Awaiting inventory allocation check',
        timestamp: new Date(Date.now() - 1000 * 10).toISOString(),
        status: 'info'
      }
    ]
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-89201',
    orderId: 'ORD-98205',
    sku: 'ACN-TPU-400',
    productName: 'Acentra Tensor Processor Unit (TPU-400)',
    quantity: 4,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 20).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 14.5).toISOString(), // ~14.5 mins left
    customerName: 'Aura Cloud Infrastructure Inc.',
    warehouse: 'EU-West-Main'
  },
  {
    id: 'res-89202',
    orderId: 'ORD-98204',
    sku: 'HPD-NV5-8TB',
    productName: 'HyperDrive NVMe Gen5 8TB Array',
    quantity: 12,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 45).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 8.2).toISOString(), // ~8.2 mins left
    customerName: 'Starlight Financial Analytics',
    warehouse: 'US-West-Silicon'
  },
  {
    id: 'res-89203',
    orderId: 'ORD-98202',
    sku: 'SYN-OPT-800G',
    productName: 'Synapse Optical Interconnect Transceiver 800G',
    quantity: 16,
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 320).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 45).toISOString(), // 45 seconds left!
    customerName: 'Nexis Cybernetics Group',
    warehouse: 'APAC-Tokyo-01'
  },
  {
    id: 'res-89198',
    orderId: 'ORD-98195',
    sku: 'PFL-PDU-32A',
    productName: 'PulseFlow Smart Industrial PDU 32A',
    quantity: 6,
    status: 'expired',
    createdAt: new Date(Date.now() - 1000 * 1800).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 300).toISOString(),
    customerName: 'Quantum Dynamics Corp',
    warehouse: 'US-East-Primary'
  },
  {
    id: 'res-89199',
    orderId: 'ORD-98203',
    sku: 'QNT-EDG-X1',
    productName: 'Quantum Edge X1 Enterprise Gateway',
    quantity: 2,
    status: 'committed',
    createdAt: new Date(Date.now() - 1000 * 160).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 30).toISOString(),
    customerName: 'Vanguard Genomics Ltd.',
    warehouse: 'US-East-Primary'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-7712',
    timestamp: new Date(Date.now() - 1000 * 15).toISOString(),
    user: {
      name: 'Sarah Chen',
      email: 'schen@acentra.internal',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
      role: 'Staff SRE'
    },
    action: 'INSPECT_DLQ_MESSAGE',
    module: 'Queues',
    details: 'Examined payload for ORD-98201 in dead letter queue. Root cause: upstream ERP timeout.',
    result: 'warning',
    ip: '10.42.0.198'
  },
  {
    id: 'aud-7711',
    timestamp: new Date(Date.now() - 1000 * 85).toISOString(),
    user: {
      name: 'Marcus Vance',
      email: 'mvance@acentra.internal',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
      role: 'Principal Architect'
    },
    action: 'RESTART_WORKER_POD',
    module: 'Workers',
    details: 'Initiated graceful rolling restart on Worker Delta (Pod-D9) after transient socket exhaustion.',
    result: 'success',
    ip: '10.42.1.42'
  },
  {
    id: 'aud-7710',
    timestamp: new Date(Date.now() - 1000 * 240).toISOString(),
    user: {
      name: 'System Orchestrator',
      email: 'daemon@k8s.acentra.net',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      role: 'Autonomous Service'
    },
    action: 'AUTO_SCALE_WORKER_POOL',
    module: 'Workers',
    details: 'HPA triggered scale-up: 3 -> 4 worker pods to handle ingress traffic surge.',
    result: 'success',
    ip: '127.0.0.1'
  },
  {
    id: 'aud-7709',
    timestamp: new Date(Date.now() - 1000 * 520).toISOString(),
    user: {
      name: 'Elena Rostova',
      email: 'erostova@acentra.internal',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role: 'Inventory Director'
    },
    action: 'MANUAL_RESTOCK',
    module: 'Inventory',
    details: 'Dispatched restock purchase order PO-9912 for 500 units of QNT-EDG-X1.',
    result: 'success',
    ip: '192.168.1.55'
  }
];

export const INITIAL_SYSTEM_HEALTH: SystemHealth = {
  api: {
    name: 'REST API Gateway (Kong/Envoy)',
    status: 'healthy',
    latencyMs: 18,
    errorRate: 0.02,
    description: 'Serving 2.4k req/sec across 6 active edge regions',
    extra: '99.99% SLA'
  },
  postgres: {
    name: 'PostgreSQL Distributed Cluster',
    status: 'healthy',
    latencyMs: 4.2,
    errorRate: 0.0,
    description: 'Read-write replica sync delay < 12ms. Pool utilization 41%',
    extra: '128 / 300 conns'
  },
  rabbitmq: {
    name: 'RabbitMQ Enterprise Cluster',
    status: 'healthy',
    latencyMs: 8.5,
    errorRate: 0.01,
    description: 'Erlang VM memory pressure nominal. Disk free: 88%',
    extra: '3 Nodes'
  },
  websocket: {
    name: 'Real-Time WebSocket Gateway',
    status: 'healthy',
    latencyMs: 12.1,
    errorRate: 0.0,
    description: 'Broadcast channel latencies within 15ms target',
    extra: '1,420 Active Sockets'
  },
  workerCluster: {
    name: 'Worker Execution Pool (K8s)',
    status: 'healthy',
    latencyMs: 24.8,
    errorRate: 0.12,
    description: '4 of 4 worker pods active and accepting tasks',
    extra: '4 Active Pods'
  },
  overall: 'healthy',
  lastChecked: new Date().toISOString()
};

export const INITIAL_KPIS: LiveKPIs = {
  ordersReceived: 2841,
  ordersProcessed: 2795,
  processingRate: 42.8,
  pendingOrders: 18,
  failedOrders: 8,
  retryQueueCount: 6,
  dlqCount: 12,
  inventoryAlerts: 2,
  ordersToday: 8940,
  successRate: 99.1,
  activeWorkers: 4,
  queueDepth: 34,
  sparklines: {
    received: [32, 38, 41, 39, 44, 48, 52, 49, 43, 47, 51, 56],
    processed: [30, 37, 39, 38, 43, 47, 50, 48, 42, 46, 50, 54],
    rate: [38, 40, 42, 41, 43, 45, 48, 46, 44, 45, 47, 48],
    failed: [0, 1, 0, 2, 0, 1, 0, 0, 1, 2, 1, 0],
    queue: [18, 22, 28, 24, 30, 35, 42, 38, 32, 36, 30, 34]
  }
};

export const INITIAL_EVENTS: LiveEventFeedItem[] = [
  {
    id: 'evt-1',
    type: 'new_order',
    title: 'New Order Ingested',
    description: 'ORD-98205 placed by Aura Cloud Infrastructure ($19,400.00)',
    timestamp: new Date(Date.now() - 1000 * 25).toISOString(),
    severity: 'info',
    orderId: 'ORD-98205'
  },
  {
    id: 'evt-2',
    type: 'inventory_reserved',
    title: 'Inventory Reserved',
    description: 'Hold active for 4 units of ACN-TPU-400 (TTL 15m)',
    timestamp: new Date(Date.now() - 1000 * 20).toISOString(),
    severity: 'success',
    orderId: 'ORD-98205'
  },
  {
    id: 'evt-3',
    type: 'worker_started',
    title: 'Worker Alpha Assigned Task',
    description: 'Worker Alpha picked ORD-98204 for payload validation',
    timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
    severity: 'info',
    workerId: 'worker-01',
    orderId: 'ORD-98204'
  },
  {
    id: 'evt-4',
    type: 'retry_triggered',
    title: 'Transient Failure & Retry',
    description: 'ORD-98202 payment gateway timed out. Exponential retry 2/3 triggered.',
    timestamp: new Date(Date.now() - 1000 * 120).toISOString(),
    severity: 'warning',
    orderId: 'ORD-98202'
  },
  {
    id: 'evt-5',
    type: 'dlq_event',
    title: 'Order Routed to DLQ',
    description: 'ORD-98201 exhausted retries. Dispatched to Dead Letter Queue for manual review.',
    timestamp: new Date(Date.now() - 1000 * 180).toISOString(),
    severity: 'error',
    orderId: 'ORD-98201'
  }
];
