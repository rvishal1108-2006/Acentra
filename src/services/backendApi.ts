import { Client } from '@stomp/stompjs';
import { Order, InventoryItem, LiveKPIs, WorkerNode, RabbitQueue } from '../types';

export const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8081/ws';

export interface BackendStats {
  ordersToday: number;
  totalOrders: number;
  completedOrders: number;
  processingOrders: number;
  pendingOrders: number;
  failedOrders: number;
  retryCount: number;
  dlqCount: number;
  activeWorkers: number;
  queueDepth: number;
  processingRate: number;
  successRate: number;
  sparklineReceived: number[];
  sparklineProcessed: number[];
  sparklineQueue: number[];
}

export interface BackendOrderPayload {
  customerName: string;
  customerEmail: string;
  productSku: string;
  quantity: number;
  priority?: string;
}

export interface BackendConnectionStatus {
  connected: boolean;
  serverUrl: string;
  lastSync?: Date;
  error?: string;
}

// REST Client methods
export const backendApi = {
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${BACKEND_URL}/dashboard/stats`, {
        signal: AbortSignal.timeout(3000)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getStats(): Promise<BackendStats | null> {
    try {
      const res = await fetch(`${BACKEND_URL}/dashboard/stats`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('[BackendAPI] Failed to fetch stats:', e);
      return null;
    }
  },

  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${BACKEND_URL}/orders`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('[BackendAPI] Failed to fetch orders:', e);
      return [];
    }
  },

  async getOrder(id: string): Promise<Order | null> {
    try {
      const res = await fetch(`${BACKEND_URL}/orders/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`[BackendAPI] Failed to fetch order ${id}:`, e);
      return null;
    }
  },

  async createOrder(payload: BackendOrderPayload): Promise<Order | null> {
    try {
      const res = await fetch(`${BACKEND_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('[BackendAPI] Failed to create order:', e);
      return null;
    }
  },

  async requeueOrder(id: string): Promise<Order | null> {
    try {
      const res = await fetch(`${BACKEND_URL}/orders/${id}/requeue`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error(`[BackendAPI] Failed to requeue order ${id}:`, e);
      return null;
    }
  },

  async cancelOrder(id: string): Promise<Order | null> {
    try {
      const res = await fetch(`${BACKEND_URL}/orders/${id}/cancel`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error(`[BackendAPI] Failed to cancel order ${id}:`, e);
      return null;
    }
  },

  async getInventory(): Promise<InventoryItem[]> {
    try {
      const res = await fetch(`${BACKEND_URL}/inventory`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.map((item: any) => ({
        id: String(item.id),
        sku: item.sku,
        name: item.name || item.sku,
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=60',
        totalStock: item.totalStock,
        available: item.availableStock,
        reserved: item.reservedStock,
        lowStockThreshold: item.lowStockThreshold || 50,
        reorderPoint: item.lowStockThreshold ? item.lowStockThreshold * 2 : 100,
        unitPrice: item.unitPrice || 499,
        category: 'Hardware',
        warehouse: 'US-East Primary',
        lastUpdated: item.lastUpdated || new Date().toISOString()
      }));
    } catch (e) {
      console.warn('[BackendAPI] Failed to fetch inventory:', e);
      return [];
    }
  },

  async restockInventory(sku: string, quantity: number): Promise<boolean> {
    try {
      const res = await fetch(`${BACKEND_URL}/inventory/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, quantity })
      });
      return res.ok;
    } catch (e) {
      console.error('[BackendAPI] Failed to restock inventory:', e);
      return false;
    }
  },

  async startLoadTest(ordersCount: number = 25, targetRps: number = 50): Promise<any> {
    try {
      const res = await fetch(`${BACKEND_URL}/load-test/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordersCount, targetRps })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('[BackendAPI] Failed to start load test:', e);
      return null;
    }
  }
};

export type WebSocketCallbackMap = {
  onOrderUpdated?: (order: Order) => void;
  onStatsUpdated?: (stats: BackendStats) => void;
  onInventoryUpdated?: (inventory: any) => void;
  onWorkerUpdated?: (worker: any) => void;
  onQueueUpdated?: (queue: any) => void;
  onConnectionChange?: (status: BackendConnectionStatus) => void;
};

// WebSocket / STOMP Realtime Manager
export class BackendRealtimeManager {
  private client: Client | null = null;
  private callbacks: WebSocketCallbackMap = {};
  private isConnected = false;

  constructor(callbacks: WebSocketCallbackMap = {}) {
    this.callbacks = callbacks;
  }

  public updateCallbacks(callbacks: WebSocketCallbackMap) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public connect() {
    if (this.client && this.client.active) {
      return;
    }

    try {
      this.client = new Client({
        brokerURL: WS_URL,
        reconnectDelay: 4000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          // Keep console clean, uncomment for deep debug if needed:
          // console.log('[STOMP]', str);
        },
        onConnect: () => {
          this.isConnected = true;
          this.callbacks.onConnectionChange?.({
            connected: true,
            serverUrl: WS_URL,
            lastSync: new Date()
          });

          // Subscribe to live channels
          this.client?.subscribe('/topic/orders', (message) => {
            try {
              const body = JSON.parse(message.body);
              if (body.data) {
                this.callbacks.onOrderUpdated?.(body.data);
              } else if (body.id) {
                this.callbacks.onOrderUpdated?.(body);
              }
            } catch (err) {
              console.error('[WS] Error parsing order message:', err);
            }
          });

          this.client?.subscribe('/topic/dashboard', (message) => {
            try {
              const stats: BackendStats = JSON.parse(message.body);
              this.callbacks.onStatsUpdated?.(stats);
            } catch (err) {
              console.error('[WS] Error parsing stats message:', err);
            }
          });

          this.client?.subscribe('/topic/inventory', (message) => {
            try {
              const inv = JSON.parse(message.body);
              this.callbacks.onInventoryUpdated?.(inv);
            } catch (err) {
              console.error('[WS] Error parsing inventory message:', err);
            }
          });

          this.client?.subscribe('/topic/workers', (message) => {
            try {
              const worker = JSON.parse(message.body);
              this.callbacks.onWorkerUpdated?.(worker);
            } catch (err) {
              console.error('[WS] Error parsing worker message:', err);
            }
          });

          this.client?.subscribe('/topic/queues', (message) => {
            try {
              const queue = JSON.parse(message.body);
              this.callbacks.onQueueUpdated?.(queue);
            } catch (err) {
              console.error('[WS] Error parsing queue message:', err);
            }
          });
        },
        onStompError: (frame) => {
          console.warn('[STOMP] Broker reported error:', frame.headers['message']);
          this.isConnected = false;
          this.callbacks.onConnectionChange?.({
            connected: false,
            serverUrl: WS_URL,
            error: frame.headers['message']
          });
        },
        onWebSocketClose: () => {
          this.isConnected = false;
          this.callbacks.onConnectionChange?.({
            connected: false,
            serverUrl: WS_URL,
            error: 'WebSocket disconnected'
          });
        }
      });

      this.client.activate();
    } catch (e: any) {
      console.warn('[STOMP] Connection failed to initialize:', e);
      this.isConnected = false;
      this.callbacks.onConnectionChange?.({
        connected: false,
        serverUrl: WS_URL,
        error: e.message
      });
    }
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
    }
  }

  public get connected(): boolean {
    return this.isConnected;
  }
}

export const realtimeManager = new BackendRealtimeManager();
