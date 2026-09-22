import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { backendApi, realtimeManager, BackendStats } from '../services/backendApi';
import { toast } from 'sonner';
import { Order } from '../types';

export function useBackendSync() {
  const isBackendConnected = useStore((s) => s.isBackendConnected);
  const setBackendStatus = useStore((s) => s.setBackendStatus);
  const syncBackendOrders = useStore((s) => s.syncBackendOrders);
  const syncBackendStats = useStore((s) => s.syncBackendStats);
  const syncBackendInventory = useStore((s) => s.syncBackendInventory);
  const upsertOrderFromBackend = useStore((s) => s.upsertOrderFromBackend);
  const addEvent = useStore((s) => s.addEvent);

  const initialSyncRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // Setup STOMP subscriptions
    realtimeManager.updateCallbacks({
      onConnectionChange: (status) => {
        if (!isMounted) return;
        setBackendStatus(status.connected, status.serverUrl);
      },
      onOrderUpdated: (order: Order) => {
        if (!isMounted) return;
        upsertOrderFromBackend(order);

        // Add to live event stream
        const stage = order.status;
        let eventType: any = 'order_created';
        let severity: any = 'info';

        if (stage === 'completed') {
          eventType = 'order_completed';
          severity = 'success';
          toast.success(`Order ${order.id} Completed!`, {
            description: `${order.productName} fulfilled by ${order.workerName || 'Worker Node'}.`
          });
        } else if (stage === 'retrying') {
          eventType = 'retry_triggered';
          severity = 'warning';
          toast.warning(`Order ${order.id} Retrying (${order.retryCount}/${order.maxRetries})`, {
            description: 'Transient failure handled. Re-queued with exponential backoff.'
          });
        } else if (stage === 'dlq') {
          eventType = 'dlq_routed';
          severity = 'error';
          toast.error(`Order ${order.id} Moved to DLQ!`, {
            description: 'Retries exhausted. Routed to orders.dlq for operator triage.'
          });
        } else if (stage === 'processing') {
          eventType = 'worker_assigned';
          severity = 'info';
        }

        addEvent({
          type: eventType,
          title: `Order ${order.id} → ${stage.toUpperCase()}`,
          description: `${order.customerName} • ${order.quantity}x ${order.productSku} • $${order.totalAmount?.toLocaleString()}`,
          orderId: order.id,
          severity,
          workerId: order.workerId || undefined
        });
      },
      onStatsUpdated: (stats: BackendStats) => {
        if (!isMounted) return;
        syncBackendStats(stats);
      },
      onInventoryUpdated: (items: any[]) => {
        if (!isMounted) return;
        syncBackendInventory(items);
      }
    });

    // Check backend health & sync initial dataset
    const checkAndSync = async () => {
      const isAlive = await backendApi.checkHealth();
      if (!isMounted) return;

      setBackendStatus(isAlive);

      if (isAlive) {
        // Connect WebSocket
        realtimeManager.connect();

        // Perform initial REST pull once
        if (!initialSyncRef.current) {
          initialSyncRef.current = true;
          try {
            const [orders, stats, inventory] = await Promise.all([
              backendApi.getOrders(),
              backendApi.getStats(),
              backendApi.getInventory()
            ]);

            if (isMounted) {
              if (orders && orders.length > 0) syncBackendOrders(orders);
              if (stats) syncBackendStats(stats);
              if (inventory && inventory.length > 0) syncBackendInventory(inventory);
              
              toast.info('Connected to Spring Boot 3 Live Engine', {
                description: 'PostgreSQL + RabbitMQ workers and WebSockets live on :8081',
                duration: 4000
              });
            }
          } catch (e) {
            console.warn('[BackendSync] Initial fetch failed:', e);
          }
        }
      }
    };

    // Immediate check
    checkAndSync();

    // Regular heartbeat probe
    const interval = setInterval(checkAndSync, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [setBackendStatus, syncBackendOrders, syncBackendStats, syncBackendInventory, upsertOrderFromBackend, addEvent]);

  return { isBackendConnected };
}
