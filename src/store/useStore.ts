import { create } from 'zustand';
import { 
  Order, 
  OrderStatus, 
  InventoryItem, 
  Reservation, 
  RabbitQueue, 
  WorkerNode, 
  AuditLog, 
  SystemHealth, 
  LiveKPIs, 
  LiveEventFeedItem,
  LoadTestState
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_QUEUES,
  INITIAL_WORKERS,
  INITIAL_ORDERS,
  INITIAL_RESERVATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SYSTEM_HEALTH,
  INITIAL_KPIS,
  INITIAL_EVENTS
} from '../services/mockData';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
  roleType: 'operator' | 'customer' | 'admin';
}

interface AppStore {
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Auth
  currentUser: UserProfile;
  isAuthenticated: boolean;
  switchUserRole: (roleType: 'operator' | 'customer' | 'admin') => void;
  login: (email: string, roleType?: 'operator' | 'customer' | 'admin') => void;
  logout: () => void;

  // Real-time Data
  orders: Order[];
  inventory: InventoryItem[];
  reservations: Reservation[];
  queues: RabbitQueue[];
  workers: WorkerNode[];
  auditLogs: AuditLog[];
  systemHealth: SystemHealth;
  kpis: LiveKPIs;
  eventFeed: LiveEventFeedItem[];

  // Simulation Controls
  isSimulationActive: boolean;
  simulationSpeed: number; // 1, 2, 5
  chaosMode: boolean;
  simulatedLatencyMs: number;
  audioEnabled: boolean;
  toggleSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  toggleChaosMode: () => void;
  setSimulatedLatency: (ms: number) => void;
  toggleAudio: () => void;

  // Drawer & Command Palette UI
  selectedOrder: Order | null;
  isOrderDrawerOpen: boolean;
  openOrderDrawer: (order: Order) => void;
  closeOrderDrawer: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Domain Actions
  createOrder: (payload: {
    customerName: string;
    customerEmail: string;
    productId: string;
    quantity: number;
    priority?: Order['priority'];
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, details?: string) => void;
  requeueOrder: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  restockInventory: (sku: string, amount: number) => void;
  releaseReservation: (resId: string) => void;
  commitReservation: (resId: string) => void;
  restartWorker: (workerId: string) => void;
  purgeQueue: (queueId: string) => void;
  addAuditLog: (entry: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  addEvent: (event: Omit<LiveEventFeedItem, 'id' | 'timestamp'> & { timestamp?: string }) => void;

  // Load Test
  loadTest: LoadTestState;
  startLoadTest: (config: { targetRps: number; totalOrders: number; burstMode: boolean }) => void;
  pauseLoadTest: () => void;
  resumeLoadTest: () => void;
  stopLoadTest: () => void;
  resetLoadTest: () => void;

  // Live Backend Bridge
  isBackendConnected: boolean;
  backendUrl: string;
  setBackendStatus: (connected: boolean, url?: string) => void;
  syncBackendOrders: (orders: Order[]) => void;
  syncBackendStats: (stats: any) => void;
  syncBackendInventory: (items: InventoryItem[]) => void;
  upsertOrderFromBackend: (order: Order) => void;

  // Master Tick
  tickSimulation: () => void;
}

export const useStore = create<AppStore>((set, get) => ({
  // Theme
  theme: 'dark',
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme: next });
  },
  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },

  // Auth
  currentUser: {
    name: 'Sarah Chen',
    email: 'schen@acentra.internal',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    role: 'Staff SRE & Ops Lead',
    roleType: 'operator'
  },
  isAuthenticated: true,
  switchUserRole: (roleType) => {
    if (roleType === 'customer') {
      set({
        currentUser: {
          name: 'Alex Mercer',
          email: 'alex@nexis-cyber.com',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
          role: 'Procurement Manager',
          roleType: 'customer'
        }
      });
    } else if (roleType === 'admin') {
      set({
        currentUser: {
          name: 'Elena Rostova',
          email: 'erostova@acentra.internal',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          role: 'System Superadmin',
          roleType: 'admin'
        }
      });
    } else {
      set({
        currentUser: {
          name: 'Sarah Chen',
          email: 'schen@acentra.internal',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
          role: 'Staff SRE & Ops Lead',
          roleType: 'operator'
        }
      });
    }
  },
  login: (email, roleType = 'operator') => {
    set({ isAuthenticated: true });
    get().switchUserRole(roleType);
    get().addAuditLog({
      user: get().currentUser,
      action: 'USER_LOGIN',
      module: 'Auth',
      details: `User signed in with role ${roleType} (${email})`,
      result: 'success',
      ip: '10.42.0.12'
    });
  },
  logout: () => {
    set({ isAuthenticated: false });
  },

  // State
  orders: INITIAL_ORDERS,
  inventory: INITIAL_PRODUCTS,
  reservations: INITIAL_RESERVATIONS,
  queues: INITIAL_QUEUES,
  workers: INITIAL_WORKERS,
  auditLogs: INITIAL_AUDIT_LOGS,
  systemHealth: INITIAL_SYSTEM_HEALTH,
  kpis: INITIAL_KPIS,
  eventFeed: INITIAL_EVENTS,

  // Simulation Controls
  isSimulationActive: true,
  simulationSpeed: 1,
  chaosMode: false,
  simulatedLatencyMs: 24,
  audioEnabled: false,
  toggleSimulation: () => set((s) => ({ isSimulationActive: !s.isSimulationActive })),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  toggleChaosMode: () => {
    const nextChaos = !get().chaosMode;
    set({ chaosMode: nextChaos });
    get().addEvent({
      type: 'retry_triggered',
      title: nextChaos ? 'Chaos Mode Activated' : 'Chaos Mode Disabled',
      description: nextChaos 
        ? 'Fault injection enabled: 15% transient network packet loss & worker latency spikes simulated.' 
        : 'Normal operations restored: all synthetic faults neutralized.',
      severity: nextChaos ? 'warning' : 'info'
    });
  },
  setSimulatedLatency: (ms) => set({ simulatedLatencyMs: ms }),
  toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),

  // UI Drawers
  selectedOrder: null,
  isOrderDrawerOpen: false,
  openOrderDrawer: (order) => set({ selectedOrder: order, isOrderDrawerOpen: true }),
  closeOrderDrawer: () => set({ isOrderDrawerOpen: false }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // Live Backend Bridge
  isBackendConnected: false,
  backendUrl: 'http://localhost:8081',
  setBackendStatus: (connected, url) => set({ isBackendConnected: connected, ...(url ? { backendUrl: url } : {}) }),
  syncBackendOrders: (incomingOrders) => {
    if (!incomingOrders || incomingOrders.length === 0) return;
    set((state) => {
      const map = new Map<string, Order>();
      state.orders.forEach((o) => map.set(o.id, o));
      incomingOrders.forEach((o) => {
        const normalizedStatus = (o.status ? (o.status as string).toLowerCase() : 'pending') as OrderStatus;
        const existing = map.get(o.id);
        map.set(o.id, {
          ...o,
          status: normalizedStatus,
          customerAvatar: o.customerAvatar || existing?.customerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${o.id}`
        });
      });
      return { orders: Array.from(map.values()) };
    });
  },
  syncBackendStats: (stats) => {
    if (!stats) return;
    set((state) => ({
      kpis: {
        ...state.kpis,
        ordersToday: stats.ordersToday ?? state.kpis.ordersToday,
        processingRate: stats.processingRate ?? state.kpis.processingRate,
        successRate: stats.successRate ?? state.kpis.successRate,
        queueDepth: stats.queueDepth ?? state.kpis.queueDepth,
        activeWorkers: stats.activeWorkers ?? state.kpis.activeWorkers,
        totalRetries: stats.retryCount ?? state.kpis.totalRetries,
        dlqCount: stats.dlqCount ?? state.kpis.dlqCount,
        sparklineReceived: stats.sparklineReceived ?? state.kpis.sparklineReceived,
        sparklineProcessed: stats.sparklineProcessed ?? state.kpis.sparklineProcessed,
        sparklineQueue: stats.sparklineQueue ?? state.kpis.sparklineQueue
      }
    }));
  },
  syncBackendInventory: (items) => {
    if (!items || items.length === 0) return;
    set((state) => {
      const updated = state.inventory.map((inv) => {
        const found = items.find((b) => b.sku === inv.sku);
        if (found) {
          return {
            ...inv,
            available: found.available,
            reserved: found.reserved,
            total: found.total
          };
        }
        return inv;
      });
      return { inventory: updated };
    });
  },
  upsertOrderFromBackend: (incoming) => {
    if (!incoming || !incoming.id) return;
    const normalizedStatus = (incoming.status ? (incoming.status as string).toLowerCase() : 'pending') as OrderStatus;
    const formatted: Order = {
      ...incoming,
      status: normalizedStatus,
      customerAvatar: incoming.customerAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${incoming.id}`
    };
    set((state) => {
      const idx = state.orders.findIndex((o) => o.id === incoming.id);
      const newOrders = idx >= 0
        ? state.orders.map((o) => o.id === incoming.id ? formatted : o)
        : [formatted, ...state.orders];
      return {
        orders: newOrders,
        selectedOrder: state.selectedOrder?.id === incoming.id ? formatted : state.selectedOrder
      };
    });
  },

  // Order Creation
  createOrder: (payload) => {
    const product = get().inventory.find((p) => p.id === payload.productId) || get().inventory[0];
    const orderNum = Math.floor(98200 + Math.random() * 1800);
    const orderId = `ORD-${orderNum}`;
    const now = new Date().toISOString();
    const unitPrice = product.unitPrice;
    const totalAmount = unitPrice * payload.quantity;

    const newOrder: Order = {
      id: orderId,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${orderId}`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: payload.quantity,
      unitPrice,
      totalAmount,
      status: 'pending',
      priority: payload.priority || 'normal',
      retryCount: 0,
      maxRetries: 3,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          stage: 'created',
          title: 'Order Submitted',
          description: `Order ${orderId} received for ${payload.quantity}x ${product.name}`,
          timestamp: now,
          status: 'info',
          durationMs: 12
        }
      ],
      metadata: {
        region: 'us-east-1',
        deliveryMethod: 'Standard Express Courier'
      }
    };

    // Update inventory reservation hold
    set((state) => {
      const updatedInventory = state.inventory.map((item) => {
        if (item.id === product.id) {
          const reserved = item.reserved + payload.quantity;
          const available = Math.max(0, item.totalStock - reserved);
          return { ...item, reserved, available, lastUpdated: now };
        }
        return item;
      });

      const newReservation: Reservation = {
        id: `res-${Math.floor(89210 + Math.random() * 5000)}`,
        orderId,
        sku: product.sku,
        productName: product.name,
        quantity: payload.quantity,
        status: 'active',
        createdAt: now,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 mins TTL
        customerName: payload.customerName,
        warehouse: product.warehouse
      };

      const updatedQueues = state.queues.map((q) => {
        if (q.type === 'order_queue') {
          return { ...q, messages: q.messages + 1, throughputIn: +(q.throughputIn + 0.5).toFixed(1) };
        }
        return q;
      });

      const updatedKpis: LiveKPIs = {
        ...state.kpis,
        ordersReceived: state.kpis.ordersReceived + 1,
        ordersToday: state.kpis.ordersToday + 1,
        pendingOrders: state.kpis.pendingOrders + 1,
        queueDepth: state.kpis.queueDepth + 1
      };

      return {
        orders: [newOrder, ...state.orders],
        inventory: updatedInventory,
        reservations: [newReservation, ...state.reservations],
        queues: updatedQueues,
        kpis: updatedKpis
      };
    });

    get().addEvent({
      type: 'new_order',
      title: 'Order Ingested',
      description: `${orderId} created by ${payload.customerName} ($${totalAmount.toLocaleString()})`,
      timestamp: now,
      severity: 'info',
      orderId
    });

    return newOrder;
  },

  updateOrderStatus: (orderId, status, details) => {
    const now = new Date().toISOString();
    set((state) => {
      const updated = state.orders.map((ord) => {
        if (ord.id === orderId) {
          const newEvent = {
            id: `t-${Date.now()}`,
            stage: (status === 'completed' ? 'completed' : status === 'failed' ? 'failed' : 'processing') as any,
            title: `Status: ${status.toUpperCase()}`,
            description: details || `Order transitioned to ${status}`,
            timestamp: now,
            status: (status === 'completed' ? 'success' : status === 'failed' ? 'error' : 'info') as any
          };
          return {
            ...ord,
            status,
            updatedAt: now,
            timeline: [...ord.timeline, newEvent]
          };
        }
        return ord;
      });

      return {
        orders: updated,
        selectedOrder: state.selectedOrder?.id === orderId 
          ? updated.find((o) => o.id === orderId) || null 
          : state.selectedOrder
      };
    });
  },

  requeueOrder: (orderId) => {
    const now = new Date().toISOString();
    set((state) => {
      const target = state.orders.find((o) => o.id === orderId);
      if (!target) return state;

      const updatedOrders = state.orders.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'pending' as OrderStatus,
            retryCount: 0,
            updatedAt: now,
            timeline: [
              ...ord.timeline,
              {
                id: `t-${Date.now()}`,
                stage: 'queued' as const,
                title: 'Operator Manual Re-Queue',
                description: 'Recovered from Dead Letter Queue (DLQ) and re-routed to orders.v1.incoming',
                timestamp: now,
                status: 'info' as const
              }
            ]
          };
        }
        return ord;
      });

      const updatedQueues = state.queues.map((q) => {
        if (q.type === 'dead_letter_queue') {
          return { ...q, messages: Math.max(0, q.messages - 1) };
        }
        if (q.type === 'order_queue') {
          return { ...q, messages: q.messages + 1 };
        }
        return q;
      });

      return {
        orders: updatedOrders,
        queues: updatedQueues,
        kpis: {
          ...state.kpis,
          dlqCount: Math.max(0, state.kpis.dlqCount - 1),
          pendingOrders: state.kpis.pendingOrders + 1,
          queueDepth: state.kpis.queueDepth + 1
        }
      };
    });

    get().addAuditLog({
      user: get().currentUser,
      action: 'REQUEUE_DLQ_ORDER',
      module: 'Queues',
      details: `Manual intervention: Re-queued ${orderId} from DLQ to incoming pipeline`,
      result: 'success',
      ip: '10.42.0.1'
    });

    get().addEvent({
      type: 'dlq_event',
      title: 'Order Recovered from DLQ',
      description: `${orderId} restored to active processing queue`,
      timestamp: now,
      severity: 'info',
      orderId
    });
  },

  cancelOrder: (orderId) => {
    const now = new Date().toISOString();
    set((state) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return state;

      // Release inventory
      const updatedInventory = state.inventory.map((item) => {
        if (item.sku === order.productSku) {
          const reserved = Math.max(0, item.reserved - order.quantity);
          const available = item.totalStock - reserved;
          return { ...item, reserved, available, lastUpdated: now };
        }
        return item;
      });

      const updatedReservations = state.reservations.map((res) => {
        if (res.orderId === orderId && res.status === 'active') {
          return { ...res, status: 'released' as const };
        }
        return res;
      });

      const updatedOrders = state.orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'failed' as OrderStatus,
            updatedAt: now,
            timeline: [
              ...o.timeline,
              {
                id: `t-${Date.now()}`,
                stage: 'failed' as const,
                title: 'Order Cancelled',
                description: 'Order terminated and reserved inventory released back to pool',
                timestamp: now,
                status: 'error' as const
              }
            ]
          };
        }
        return o;
      });

      return {
        orders: updatedOrders,
        inventory: updatedInventory,
        reservations: updatedReservations
      };
    });

    get().addAuditLog({
      user: get().currentUser,
      action: 'CANCEL_ORDER',
      module: 'Orders',
      details: `Cancelled ${orderId} and released reserved stock`,
      result: 'warning',
      ip: '10.42.0.1'
    });
  },

  restockInventory: (sku, amount) => {
    const now = new Date().toISOString();
    set((state) => {
      const updated = state.inventory.map((item) => {
        if (item.sku === sku) {
          const totalStock = item.totalStock + amount;
          const available = totalStock - item.reserved;
          return { ...item, totalStock, available, lastUpdated: now };
        }
        return item;
      });
      return { inventory: updated };
    });

    get().addAuditLog({
      user: get().currentUser,
      action: 'RESTOCK_INVENTORY',
      module: 'Inventory',
      details: `Added ${amount} units to SKU: ${sku}`,
      result: 'success',
      ip: '10.42.0.1'
    });

    get().addEvent({
      type: 'inventory_reserved',
      title: 'Inventory Replenished',
      description: `Stock level boosted (+${amount}) for SKU ${sku}`,
      timestamp: now,
      severity: 'success'
    });
  },

  releaseReservation: (resId) => {
    const now = new Date().toISOString();
    set((state) => {
      const res = state.reservations.find((r) => r.id === resId);
      if (!res || res.status !== 'active') return state;

      const updatedReservations = state.reservations.map((r) => 
        r.id === resId ? { ...r, status: 'released' as const } : r
      );

      const updatedInventory = state.inventory.map((item) => {
        if (item.sku === res.sku) {
          const reserved = Math.max(0, item.reserved - res.quantity);
          const available = item.totalStock - reserved;
          return { ...item, reserved, available, lastUpdated: now };
        }
        return item;
      });

      return {
        reservations: updatedReservations,
        inventory: updatedInventory
      };
    });

    get().addAuditLog({
      user: get().currentUser,
      action: 'RELEASE_RESERVATION',
      module: 'Reservations',
      details: `Manual unlock: Released hold ${resId}`,
      result: 'success',
      ip: '10.42.0.1'
    });
  },

  commitReservation: (resId) => {
    set((state) => {
      const updatedReservations = state.reservations.map((r) => 
        r.id === resId ? { ...r, status: 'committed' as const } : r
      );
      return { reservations: updatedReservations };
    });
  },

  restartWorker: (workerId) => {
    const now = new Date().toISOString();
    set((state) => {
      const updatedWorkers = state.workers.map((w) => {
        if (w.id === workerId) {
          return {
            ...w,
            status: 'restarting' as const,
            cpuUsage: 9,
            memoryUsage: 35,
            currentTask: 'Restarting pod container & re-establishing RabbitMQ channel...',
            lastHeartbeat: now
          };
        }
        return w;
      });
      return { workers: updatedWorkers };
    });

    setTimeout(() => {
      set((state) => {
        const restoredWorkers = state.workers.map((w) => {
          if (w.id === workerId) {
            return {
              ...w,
              status: 'active' as const,
              currentTask: 'Idle - Polling queue orders.v1.incoming',
              currentOrderId: undefined,
              cpuUsage: 28,
              memoryUsage: 48,
              lastHeartbeat: new Date().toISOString()
            };
          }
          return w;
        });
        return { workers: restoredWorkers };
      });
    }, 2500);

    get().addAuditLog({
      user: get().currentUser,
      action: 'RESTART_WORKER',
      module: 'Workers',
      details: `Restarted worker pod ${workerId}`,
      result: 'success',
      ip: '10.42.0.1'
    });
  },

  purgeQueue: (queueId) => {
    set((state) => {
      const updatedQueues = state.queues.map((q) => 
        q.id === queueId ? { ...q, messages: 0, throughputIn: 0, throughputOut: 0 } : q
      );
      return { queues: updatedQueues };
    });

    get().addAuditLog({
      user: get().currentUser,
      action: 'PURGE_QUEUE',
      module: 'Queues',
      details: `Purged all unacknowledged messages in queue: ${queueId}`,
      result: 'warning',
      ip: '10.42.0.1'
    });
  },

  addAuditLog: (entry) => {
    const newLog: AuditLog = {
      ...entry,
      id: `aud-${Math.floor(7700 + Math.random() * 5000)}`,
      timestamp: new Date().toISOString()
    };
    set((state) => ({ auditLogs: [newLog, ...state.auditLogs.slice(0, 99)] }));
  },

  addEvent: (event) => {
    const newEvent: LiveEventFeedItem = {
      ...event,
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: event.timestamp || new Date().toISOString()
    };
    set((state) => ({ eventFeed: [newEvent, ...state.eventFeed.slice(0, 49)] }));
  },

  // Load Test
  loadTest: {
    isRunning: false,
    isPaused: false,
    targetRps: 50,
    totalOrders: 1000,
    burstMode: false,
    generatedCount: 0,
    processedCount: 0,
    failedCount: 0,
    currentThroughput: 0,
    latencySamples: [24, 28, 26, 32, 29, 35, 42, 38, 45, 40]
  },

  startLoadTest: (config) => {
    set((state) => ({
      loadTest: {
        ...state.loadTest,
        isRunning: true,
        isPaused: false,
        targetRps: config.targetRps,
        totalOrders: config.totalOrders,
        burstMode: config.burstMode,
        currentThroughput: config.targetRps
      }
    }));

    get().addAuditLog({
      user: get().currentUser,
      action: 'START_LOAD_TEST',
      module: 'LoadTest',
      details: `Launched stress test: Target ${config.targetRps} RPS, Volume: ${config.totalOrders}, Burst: ${config.burstMode ? 'ON' : 'OFF'}`,
      result: 'warning',
      ip: '10.42.0.1'
    });

    get().addEvent({
      type: 'worker_started',
      title: 'Load Test Ingestion Started',
      description: `Injecting synthetic high-volume traffic (${config.targetRps} RPS)`,
      severity: 'warning'
    });
  },

  pauseLoadTest: () => {
    set((state) => ({
      loadTest: { ...state.loadTest, isPaused: true, currentThroughput: 0 }
    }));
  },

  resumeLoadTest: () => {
    set((state) => ({
      loadTest: { ...state.loadTest, isPaused: false, currentThroughput: state.loadTest.targetRps }
    }));
  },

  stopLoadTest: () => {
    set((state) => ({
      loadTest: { ...state.loadTest, isRunning: false, isPaused: false, currentThroughput: 0 }
    }));
    get().addEvent({
      type: 'order_completed',
      title: 'Load Test Finished',
      description: 'Stress test run terminated. Workers returning to nominal baseline.',
      severity: 'info'
    });
  },

  resetLoadTest: () => {
    set((state) => ({
      loadTest: {
        ...state.loadTest,
        isRunning: false,
        isPaused: false,
        generatedCount: 0,
        processedCount: 0,
        failedCount: 0,
        currentThroughput: 0,
        latencySamples: [20, 22, 25, 23, 24]
      }
    }));
  },

  // Real-Time Simulation Master Tick
  tickSimulation: () => {
    const state = get();
    if (!state.isSimulationActive) return;

    const now = new Date().toISOString();
    const speed = state.simulationSpeed;

    // 1. Handle Load Test Step
    let newLoadTest = { ...state.loadTest };
    let loadTestOrdersToAdd: Order[] = [];

    if (newLoadTest.isRunning && !newLoadTest.isPaused) {
      const stepCount = Math.min(
        Math.floor((newLoadTest.targetRps / 2) * (newLoadTest.burstMode ? 2 : 1)),
        newLoadTest.totalOrders - newLoadTest.generatedCount
      );

      if (stepCount > 0) {
        newLoadTest.generatedCount += stepCount;
        const failedStep = state.chaosMode ? Math.floor(stepCount * 0.08) : Math.floor(stepCount * 0.01);
        const processedStep = stepCount - failedStep;
        newLoadTest.processedCount += processedStep;
        newLoadTest.failedCount += failedStep;
        newLoadTest.currentThroughput = +(newLoadTest.targetRps * (0.9 + Math.random() * 0.2)).toFixed(1);

        const currentLat = Math.round(20 + (newLoadTest.currentThroughput * 0.4) + (state.chaosMode ? 80 : 0));
        newLoadTest.latencySamples = [...newLoadTest.latencySamples.slice(-15), currentLat];

        // Create sample order for the table
        const sampleProduct = state.inventory[Math.floor(Math.random() * state.inventory.length)];
        const batchOrderNum = Math.floor(98300 + Math.random() * 9000);
        loadTestOrdersToAdd.push({
          id: `ORD-${batchOrderNum}`,
          customerName: `Benchmark Agent #${Math.floor(Math.random() * 50)}`,
          customerEmail: `bench-${batchOrderNum}@loadtest.local`,
          productId: sampleProduct.id,
          productName: sampleProduct.name,
          productSku: sampleProduct.sku,
          quantity: Math.floor(1 + Math.random() * 4),
          unitPrice: sampleProduct.unitPrice,
          totalAmount: sampleProduct.unitPrice * 2,
          status: state.chaosMode && Math.random() < 0.15 ? 'retrying' : 'processing',
          priority: 'high',
          workerId: state.workers[Math.floor(Math.random() * state.workers.length)].id,
          workerName: state.workers[Math.floor(Math.random() * state.workers.length)].name,
          retryCount: 0,
          maxRetries: 3,
          createdAt: now,
          updatedAt: now,
          timeline: [
            {
              id: `t-${Date.now()}`,
              stage: 'processing',
              title: 'Load Test Batch Processed',
              description: `Generated at ${newLoadTest.currentThroughput} req/s throughput`,
              timestamp: now,
              status: 'info'
            }
          ]
        });

        if (newLoadTest.generatedCount >= newLoadTest.totalOrders) {
          newLoadTest.isRunning = false;
        }
      }
    }

    // 2. Advance existing orders through lifecycle
    const updatedOrders = state.orders.map((ord) => {
      // Pending -> Reserved -> Processing -> Completed (or Retry / DLQ if Chaos)
      if (ord.status === 'pending' && Math.random() < 0.45 * speed) {
        return {
          ...ord,
          status: 'reserved' as OrderStatus,
          updatedAt: now,
          timeline: [
            ...ord.timeline,
            {
              id: `t-${Date.now()}`,
              stage: 'reserved' as const,
              title: 'Inventory Reserved',
              description: `Stock lock confirmed for ${ord.productSku} (15m hold)`,
              timestamp: now,
              status: 'success' as const
            }
          ]
        };
      }

      if (ord.status === 'reserved' && Math.random() < 0.4 * speed) {
        const assignedWorker = state.workers[Math.floor(Math.random() * state.workers.length)];
        return {
          ...ord,
          status: 'processing' as OrderStatus,
          workerId: assignedWorker.id,
          workerName: assignedWorker.name,
          updatedAt: now,
          timeline: [
            ...ord.timeline,
            {
              id: `t-${Date.now()}-q`,
              stage: 'queued' as const,
              title: 'Enqueued to RabbitMQ',
              description: 'Routing key: order.priority.standard',
              timestamp: now,
              status: 'success' as const
            },
            {
              id: `t-${Date.now()}-p`,
              stage: 'picked' as const,
              title: `Claimed by ${assignedWorker.name}`,
              description: 'Acquired worker thread and executing fulfillment pipeline',
              timestamp: now,
              status: 'info' as const,
              workerId: assignedWorker.id
            }
          ]
        };
      }

      if (ord.status === 'processing') {
        const failureChance = state.chaosMode ? 0.25 : 0.05;
        if (Math.random() < failureChance && ord.retryCount < 2) {
          // Trigger retry
          return {
            ...ord,
            status: 'retrying' as OrderStatus,
            retryCount: ord.retryCount + 1,
            updatedAt: now,
            timeline: [
              ...ord.timeline,
              {
                id: `t-${Date.now()}`,
                stage: 'retry' as const,
                title: `Transient Delay (Retry ${ord.retryCount + 1}/3)`,
                description: 'Payment API gateway response latency high. Backing off before retry.',
                timestamp: now,
                status: 'warning' as const
              }
            ]
          };
        } else if (Math.random() < 0.35 * speed) {
          // Completed
          return {
            ...ord,
            status: 'completed' as OrderStatus,
            updatedAt: now,
            timeline: [
              ...ord.timeline,
              {
                id: `t-${Date.now()}`,
                stage: 'completed' as const,
                title: 'Fulfillment Completed',
                description: 'Packaging label generated & dispatched to carrier',
                timestamp: now,
                status: 'success' as const
              }
            ]
          };
        }
      }

      if (ord.status === 'retrying' && Math.random() < 0.3 * speed) {
        if (state.chaosMode && ord.retryCount >= 2 && Math.random() < 0.5) {
          return {
            ...ord,
            status: 'dlq' as OrderStatus,
            updatedAt: now,
            timeline: [
              ...ord.timeline,
              {
                id: `t-${Date.now()}`,
                stage: 'dlq' as const,
                title: 'Sent to Dead Letter Queue',
                description: 'Retries exhausted. Manual operator intervention required.',
                timestamp: now,
                status: 'error' as const
              }
            ]
          };
        }
        return {
          ...ord,
          status: 'processing' as OrderStatus,
          updatedAt: now,
          timeline: [
            ...ord.timeline,
            {
              id: `t-${Date.now()}`,
              stage: 'processing' as const,
              title: 'Retry Succeeded: Resumed Processing',
              description: 'Payment verified successfully on retry',
              timestamp: now,
              status: 'info' as const
            }
          ]
        };
      }

      return ord;
    });

    // 3. Worker telemetry fluctuations
    const updatedWorkers = state.workers.map((w) => {
      if (w.status === 'restarting') return w;

      const deltaCpu = (Math.random() - 0.48) * 12;
      const targetCpu = Math.min(96, Math.max(18, Math.round(w.cpuUsage + deltaCpu)));
      const deltaMem = (Math.random() - 0.48) * 4;
      const targetMem = Math.min(88, Math.max(35, Math.round(w.memoryUsage + deltaMem)));

      const isBusy = targetCpu > 65;
      return {
        ...w,
        cpuUsage: targetCpu,
        memoryUsage: targetMem,
        status: isBusy ? ('busy' as const) : ('active' as const),
        ordersProcessed: w.ordersProcessed + (Math.random() < 0.6 ? 1 : 0),
        lastHeartbeat: now
      };
    });

    // 4. Queue throughput fluctuations
    const updatedQueues = state.queues.map((q) => {
      if (q.type === 'order_queue') {
        const newMsg = Math.max(8, Math.min(180, q.messages + Math.floor((Math.random() - 0.48) * 6)));
        const throughput = +(40 + Math.random() * 10 + (state.loadTest.isRunning ? state.loadTest.currentThroughput : 0)).toFixed(1);
        return {
          ...q,
          messages: newMsg,
          throughputIn: throughput,
          throughputOut: +(throughput * 0.98).toFixed(1),
          state: newMsg > 100 ? ('surging' as const) : ('active' as const)
        };
      }
      if (q.type === 'retry_queue') {
        const retryingCount = updatedOrders.filter((o) => o.status === 'retrying').length;
        return { ...q, messages: retryingCount };
      }
      if (q.type === 'dead_letter_queue') {
        const dlqCount = updatedOrders.filter((o) => o.status === 'dlq').length;
        return { ...q, messages: dlqCount };
      }
      return q;
    });

    // 5. Update KPIs & Sparklines
    const completedCount = updatedOrders.filter((o) => o.status === 'completed').length;
    const pendingCount = updatedOrders.filter((o) => o.status === 'pending' || o.status === 'reserved').length;
    const failedCount = updatedOrders.filter((o) => o.status === 'failed').length;
    const dlqCount = updatedOrders.filter((o) => o.status === 'dlq').length;
    const retryCount = updatedOrders.filter((o) => o.status === 'retrying').length;

    const currentRate = +(42 + Math.random() * 8 + (state.loadTest.isRunning ? state.loadTest.currentThroughput : 0)).toFixed(1);

    const newKpis: LiveKPIs = {
      ...state.kpis,
      ordersProcessed: state.kpis.ordersProcessed + Math.floor(Math.random() * 2),
      processingRate: currentRate,
      pendingOrders: pendingCount,
      failedOrders: failedCount,
      retryQueueCount: retryCount,
      dlqCount,
      queueDepth: updatedQueues[0].messages,
      sparklines: {
        received: [...state.kpis.sparklines.received.slice(1), Math.round(currentRate * 1.05)],
        processed: [...state.kpis.sparklines.processed.slice(1), Math.round(currentRate * 0.98)],
        rate: [...state.kpis.sparklines.rate.slice(1), Math.round(currentRate)],
        failed: [...state.kpis.sparklines.failed.slice(1), state.chaosMode ? Math.floor(Math.random() * 3) : 0],
        queue: [...state.kpis.sparklines.queue.slice(1), updatedQueues[0].messages]
      }
    };

    // 6. Check for expired reservations
    const updatedReservations = state.reservations.map((r) => {
      if (r.status === 'active' && new Date(r.expiresAt).getTime() <= Date.now()) {
        return { ...r, status: 'expired' as const };
      }
      return r;
    });

    set({
      orders: [...loadTestOrdersToAdd, ...updatedOrders].slice(0, 100),
      workers: updatedWorkers,
      queues: updatedQueues,
      kpis: newKpis,
      reservations: updatedReservations,
      loadTest: newLoadTest
    });
  }
}));
