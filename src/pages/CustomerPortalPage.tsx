import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Order } from '../types';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Package, 
  Truck, 
  CreditCard,
  Building2,
  ChevronRight
} from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatDate, getStatusBadgeConfig } from '../utils';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { backendApi } from '../services/backendApi';

export function CustomerPortalPage() {
  const inventory = useStore((s) => s.inventory);
  const orders = useStore((s) => s.orders);
  const createOrder = useStore((s) => s.createOrder);
  const currentUser = useStore((s) => s.currentUser);
  const openOrderDrawer = useStore((s) => s.openOrderDrawer);
  const isBackendConnected = useStore((s) => s.isBackendConnected);
  const upsertOrderFromBackend = useStore((s) => s.upsertOrderFromBackend);

  const [selectedProductId, setSelectedProductId] = useState<string>(inventory[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [priority, setPriority] = useState<Order['priority']>('normal');
  const [customerName, setCustomerName] = useState<string>(currentUser.name);
  const [customerEmail, setCustomerEmail] = useState<string>(currentUser.email);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  const selectedProduct = inventory.find((p) => p.id === selectedProductId) || inventory[0];
  const maxAvailable = selectedProduct?.available || 1;
  const totalPrice = (selectedProduct?.unitPrice || 0) * quantity;

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity <= 0) return;

    const newOrder = createOrder({
      customerName: customerName || 'Enterprise Buyer',
      customerEmail: customerEmail || 'buyer@enterprise.com',
      productId: selectedProduct.id,
      quantity,
      priority
    });

    setLastCreatedOrder(newOrder);

    // If live Spring Boot backend is active, also ingest to Postgres + RabbitMQ
    if (isBackendConnected) {
      backendApi.createOrder({
        customerName: customerName || 'Enterprise Buyer',
        customerEmail: customerEmail || 'buyer@enterprise.com',
        productSku: selectedProduct.sku,
        quantity,
        priority: (priority || 'NORMAL').toUpperCase()
      }).then((beOrder) => {
        if (beOrder) {
          upsertOrderFromBackend(beOrder);
          setLastCreatedOrder(beOrder);
        }
      });
    }

    // Celebratory confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }

    toast.success(`Order ${newOrder.id} successfully created! Ingested into live processing stream.`);
  };

  // User's orders
  const customerOrders = orders.filter((o) => 
    o.customerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
    o.customerName.toLowerCase() === currentUser.name.toLowerCase()
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Self-Service Order Ingestion</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Customer Procurement Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Place wholesale enterprise hardware orders with instant 2PC inventory hold confirmation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Order Creation Form & Catalog */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6">
            <CardTitle className="text-base mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-500" />
              <span>Configure New Enterprise Order</span>
            </CardTitle>

            <form onSubmit={handleOrderSubmit} className="space-y-6 text-xs">
              {/* Product Selection Cards */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Select Enterprise Hardware SKU
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inventory.map((prod) => {
                    const isSelected = prod.id === selectedProductId;
                    return (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setSelectedProductId(prod.id);
                          if (quantity > prod.available) setQuantity(Math.max(1, prod.available));
                        }}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-indigo-500">
                              {prod.sku}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {prod.available} avail
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {prod.name}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(prod.unitPrice)}
                          </span>
                          <span className="text-[10px] text-slate-400">{prod.warehouse}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Stepper & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-base font-bold text-slate-900 dark:text-white w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">
                      (Max {maxAvailable})
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Processing SLA Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="normal">Normal (Standard Queue)</option>
                    <option value="high">High (Priority Queue Routing)</option>
                    <option value="critical">Critical (Immediate Worker Dispatch)</option>
                  </select>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Customer Entity Name
                  </label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Corporate Email
                  </label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Pricing & Submit */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Total Purchase Commitment</div>
                  <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {formatCurrency(totalPrice)}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Submit & Reserve Stock
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right 5 Cols: Live Tracking & Order History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Order Live Tracker */}
          {lastCreatedOrder ? (
            <Card className="p-5 space-y-4 border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 to-slate-900/60">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-indigo-500 font-bold uppercase tracking-wider block">
                    Active Order Tracker
                  </span>
                  <h3 className="font-mono text-base font-bold text-slate-900 dark:text-white">
                    {lastCreatedOrder.id}
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openOrderDrawer(lastCreatedOrder)}
                >
                  Open Drawer
                </Button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Product:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{lastCreatedOrder.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="capitalize font-bold text-indigo-500">{lastCreatedOrder.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(lastCreatedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="pt-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Live Fulfillment Milestones
                </div>
                <div className="space-y-3 pl-3 border-l-2 border-indigo-500/30">
                  {lastCreatedOrder.timeline.map((evt) => (
                    <div key={evt.id} className="relative pl-3">
                      <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{evt.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{evt.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Tracking Idle</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Submit an order or select an existing order from your purchase history to monitor real-time worker execution.
              </p>
            </Card>
          )}

          {/* Customer Order History */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <CardTitle className="text-sm">Recent Purchases</CardTitle>
              <span className="text-[10px] text-slate-400 font-mono">{customerOrders.length} records</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {customerOrders.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No previous orders found for this persona.
                </div>
              ) : (
                customerOrders.map((ord) => {
                  const badge = getStatusBadgeConfig(ord.status);
                  return (
                    <div
                      key={ord.id}
                      onClick={() => openOrderDrawer(ord)}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {ord.id}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {ord.quantity}x {ord.productSku}
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="font-mono font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(ord.totalAmount)}
                        </div>
                        <span className={`inline-block px-2 py-0.2 rounded text-[10px] font-bold border ${badge.badgeClass}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
