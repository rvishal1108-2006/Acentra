export type OrderStatus = 
  | 'pending' 
  | 'reserved' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'retrying' 
  | 'dlq';

export type OrderPriority = 'low' | 'normal' | 'high' | 'critical';

export interface OrderTimelineEvent {
  id: string;
  stage: 'created' | 'reserved' | 'queued' | 'picked' | 'processing' | 'completed' | 'retry' | 'dlq' | 'failed';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  workerId?: string;
  durationMs?: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: OrderStatus;
  priority: OrderPriority;
  workerId?: string;
  workerName?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineEvent[];
  metadata?: {
    region?: string;
    paymentRef?: string;
    deliveryMethod?: string;
    userAgent?: string;
    failureReason?: string;
    payload?: Record<string, unknown>;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  image: string;
  totalStock: number;
  reserved: number;
  available: number;
  unitPrice: number;
  lowStockThreshold: number;
  reorderPoint: number;
  lastUpdated: string;
  warehouse: string;
}

export type ReservationStatus = 'active' | 'expired' | 'released' | 'committed';

export interface Reservation {
  id: string;
  orderId: string;
  sku: string;
  productName: string;
  quantity: number;
  status: ReservationStatus;
  createdAt: string;
  expiresAt: string; // ISO string for countdown
  customerName: string;
  warehouse: string;
}

export type QueueType = 'order_queue' | 'retry_queue' | 'dead_letter_queue';

export interface RabbitQueue {
  id: string;
  name: string;
  type: QueueType;
  messages: number;
  throughputIn: number; // msg/sec
  throughputOut: number; // msg/sec
  consumers: number;
  avgWaitTimeMs: number;
  memoryBytes: number;
  state: 'idle' | 'active' | 'surging' | 'throttled';
  vhost: string;
}

export type WorkerStatus = 'active' | 'idle' | 'busy' | 'restarting' | 'error';

export interface WorkerNode {
  id: string;
  name: string;
  status: WorkerStatus;
  currentTask?: string;
  currentOrderId?: string;
  ordersProcessed: number;
  successRate: number;
  cpuUsage: number; // 0-100
  memoryUsage: number; // 0-100
  lastHeartbeat: string;
  uptimeSeconds: number;
  host: string;
  concurrencyLimit: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: {
    name: string;
    email: string;
    avatar: string;
    role: string;
  };
  action: string;
  module: 'Orders' | 'Inventory' | 'Queues' | 'Workers' | 'Reservations' | 'LoadTest' | 'System' | 'Auth';
  details: string;
  result: 'success' | 'failure' | 'warning';
  ip: string;
}

export interface ServiceHealthMetric {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  errorRate: number;
  description: string;
  extra?: string;
}

export interface SystemHealth {
  api: ServiceHealthMetric;
  postgres: ServiceHealthMetric;
  rabbitmq: ServiceHealthMetric;
  websocket: ServiceHealthMetric;
  workerCluster: ServiceHealthMetric;
  overall: 'healthy' | 'degraded' | 'down';
  lastChecked: string;
}

export interface LiveKPIs {
  ordersReceived: number;
  ordersProcessed: number;
  processingRate: number; // orders/sec
  pendingOrders: number;
  failedOrders: number;
  retryQueueCount: number;
  dlqCount: number;
  inventoryAlerts: number;
  ordersToday: number;
  successRate: number;
  activeWorkers: number;
  queueDepth: number;
  sparklines: {
    received: number[];
    processed: number[];
    rate: number[];
    failed: number[];
    queue: number[];
  };
}

export interface LiveEventFeedItem {
  id: string;
  type: 'new_order' | 'inventory_reserved' | 'worker_started' | 'retry_triggered' | 'dlq_event' | 'order_completed' | 'worker_heartbeat';
  title: string;
  description: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  orderId?: string;
  workerId?: string;
}

export interface LoadTestState {
  isRunning: boolean;
  isPaused: boolean;
  targetRps: number;
  totalOrders: number;
  burstMode: boolean;
  generatedCount: number;
  processedCount: number;
  failedCount: number;
  currentThroughput: number;
  latencySamples: number[];
}
