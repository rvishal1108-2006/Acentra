import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Reservation, ReservationStatus } from '../types';
import { 
  Clock, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertOctagon, 
  Timer, 
  Building2, 
  ShoppingBag,
  Filter,
  ArrowRight
} from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { formatRelativeTime } from '../utils';
import { toast } from 'sonner';

// Countdown Timer subcomponent
function ReservationCountdown({ expiresAt, status }: { expiresAt: string; status: ReservationStatus }) {
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0);

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeftSec(diff);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (status === 'expired') {
    return (
      <span className="font-mono text-xs text-rose-500 font-semibold flex items-center gap-1">
        <AlertOctagon className="w-3.5 h-3.5" /> Expired
      </span>
    );
  }

  if (status === 'released') {
    return (
      <span className="font-mono text-xs text-slate-400 font-semibold flex items-center gap-1">
        <Unlock className="w-3.5 h-3.5" /> Released
      </span>
    );
  }

  if (status === 'committed') {
    return (
      <span className="font-mono text-xs text-emerald-500 font-semibold flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5" /> Committed
      </span>
    );
  }

  const mins = Math.floor(timeLeftSec / 60);
  const secs = timeLeftSec % 60;
  const isUrgent = timeLeftSec <= 60;

  return (
    <div className={`font-mono text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
      isUrgent 
        ? 'bg-rose-500/15 text-rose-500 animate-pulse border border-rose-500/30' 
        : 'bg-sky-500/15 text-sky-500 border border-sky-500/30'
    }`}>
      <Timer className="w-3.5 h-3.5" />
      <span>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')} TTL
      </span>
    </div>
  );
}

export function ReservationsPage() {
  const reservations = useStore((s) => s.reservations);
  const releaseReservation = useStore((s) => s.releaseReservation);
  const commitReservation = useStore((s) => s.commitReservation);
  const openOrderDrawer = useStore((s) => s.openOrderDrawer);
  const orders = useStore((s) => s.orders);

  const [filter, setFilter] = useState<string>('all');

  const tabs = [
    { id: 'all', label: 'All Holds', badge: reservations.length },
    { id: 'active', label: 'Active', badge: reservations.filter((r) => r.status === 'active').length },
    { id: 'committed', label: 'Committed', badge: reservations.filter((r) => r.status === 'committed').length },
    { id: 'expired', label: 'Expired', badge: reservations.filter((r) => r.status === 'expired').length },
    { id: 'released', label: 'Released', badge: reservations.filter((r) => r.status === 'released').length },
  ];

  const filtered = reservations.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleRelease = (id: string) => {
    releaseReservation(id);
    toast.success(`Reservation ${id} released. Stock returned to inventory.`);
  };

  const handleCommit = (id: string) => {
    commitReservation(id);
    toast.success(`Reservation ${id} committed to order.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reservation & Inventory Lock Monitor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time tracking of optimistic 2PC reservation holds with automatic time-to-live (TTL) expiration.
          </p>
        </div>

        <Tabs tabs={tabs} activeTab={filter} onChange={setFilter} size="sm" />
      </div>

      {/* Grid of Reservation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((res) => {
          const matchingOrder = orders.find((o) => o.id === res.orderId);

          return (
            <Card key={res.id} className="p-5 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${
                    res.status === 'active' 
                      ? 'bg-sky-500/10 text-sky-500' 
                      : res.status === 'committed' 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {res.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white block">
                      {res.id}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {res.status} Hold
                    </span>
                  </div>
                </div>

                <ReservationCountdown expiresAt={res.expiresAt} status={res.status} />
              </div>

              {/* Details Box */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order Ref:</span>
                  <button
                    type="button"
                    onClick={() => matchingOrder && openOrderDrawer(matchingOrder)}
                    className="font-mono font-bold text-indigo-500 hover:underline"
                  >
                    {res.orderId}
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Product:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                    {res.productName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Locked Units:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {res.quantity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Warehouse:</span>
                  <span className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                    {res.warehouse}
                  </span>
                </div>
              </div>

              {/* Customer info */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Buyer: {res.customerName}</span>
                <span>{formatRelativeTime(res.createdAt)}</span>
              </div>

              {/* Action Buttons */}
              {res.status === 'active' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleRelease(res.id)}
                  >
                    Release Hold
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleCommit(res.id)}
                  >
                    Commit Stock
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
