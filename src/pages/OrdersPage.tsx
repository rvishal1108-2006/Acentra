import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Order, OrderStatus } from '../types';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Download, 
  Eye, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Layers, 
  CheckSquare, 
  Square,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Plus
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';
import { 
  formatCurrency, 
  formatDate, 
  formatRelativeTime, 
  getStatusBadgeConfig,
  exportToCsv,
  exportToJson
} from '../utils';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export function OrdersPage() {
  const orders = useStore((s) => s.orders);
  const openOrderDrawer = useStore((s) => s.openOrderDrawer);
  const requeueOrder = useStore((s) => s.requeueOrder);
  const cancelOrder = useStore((s) => s.cancelOrder);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'createdAt' | 'totalAmount' | 'status'>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    customer: true,
    product: true,
    quantity: true,
    amount: true,
    status: true,
    worker: true,
    time: true,
    actions: true
  });
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);

  // Status Tabs
  const statusTabs = [
    { id: 'all', label: 'All Orders', badge: orders.length },
    { id: 'pending', label: 'Pending', badge: orders.filter((o) => o.status === 'pending').length },
    { id: 'reserved', label: 'Reserved', badge: orders.filter((o) => o.status === 'reserved').length },
    { id: 'processing', label: 'Processing', badge: orders.filter((o) => o.status === 'processing').length },
    { id: 'completed', label: 'Completed', badge: orders.filter((o) => o.status === 'completed').length },
    { id: 'retrying', label: 'Retrying', badge: orders.filter((o) => o.status === 'retrying').length },
    { id: 'dlq', label: 'DLQ', badge: orders.filter((o) => o.status === 'dlq').length },
  ];

  // Filtering & Sorting
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        if (statusFilter !== 'all' && o.status !== statusFilter) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.productSku.toLowerCase().includes(q) ||
          o.productName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortField === 'createdAt') {
          const tA = new Date(a.createdAt).getTime();
          const tB = new Date(b.createdAt).getTime();
          return sortAsc ? tA - tB : tB - tA;
        }
        if (sortField === 'totalAmount') {
          return sortAsc ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
        }
        if (sortField === 'status') {
          return sortAsc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
        }
        return 0;
      });
  }, [orders, statusFilter, searchQuery, sortField, sortAsc]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  const toggleSelectOrder = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Bulk actions
  const handleBulkRequeue = () => {
    selectedIds.forEach((id) => requeueOrder(id));
    toast.success(`Re-queued ${selectedIds.size} orders`);
    setSelectedIds(new Set());
  };

  const handleBulkCancel = () => {
    selectedIds.forEach((id) => cancelOrder(id));
    toast.warning(`Cancelled ${selectedIds.size} orders and released stock`);
    setSelectedIds(new Set());
  };

  const handleExportCsv = () => {
    const exportData = filteredOrders.map((o) => ({
      ID: o.id,
      Customer: o.customerName,
      Email: o.customerEmail,
      SKU: o.productSku,
      Product: o.productName,
      Quantity: o.quantity,
      Amount: o.totalAmount,
      Status: o.status,
      Worker: o.workerName || 'None',
      Created: o.createdAt
    }));
    exportToCsv(exportData, `acentra_orders_${Date.now()}`);
    toast.success('Orders exported as CSV');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Order Processing Pipeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            High-throughput order stream with real-time state machine transitions and audit verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/portal">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Create Order
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <Tabs
          tabs={statusTabs}
          activeTab={statusFilter}
          onChange={(tab) => setStatusFilter(tab)}
          size="sm"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Search by Order ID, Customer, or SKU..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Bulk actions pill */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                <span>{selectedIds.size} selected</span>
                <Button variant="primary" size="sm" onClick={handleBulkRequeue}>
                  Re-Queue
                </Button>
                <Button variant="danger" size="sm" onClick={handleBulkCancel}>
                  Cancel
                </Button>
              </div>
            )}

            {/* Column Visibility Menu */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                onClick={() => setColumnMenuOpen(!columnMenuOpen)}
              >
                Columns
              </Button>

              {columnMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-dropdown p-3 border border-slate-200 dark:border-slate-800 shadow-2xl z-30 space-y-1 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-800">
                    Toggle Columns
                  </div>
                  {Object.entries(visibleColumns).map(([col, val]) => (
                    <label key={col} className="flex items-center gap-2 py-1 cursor-pointer capitalize text-slate-600 dark:text-slate-300 hover:text-indigo-500">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() => setVisibleColumns((c) => ({ ...c, [col]: !val }))}
                        className="rounded accent-indigo-600"
                      />
                      <span>{col}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold select-none">
                <th className="p-3.5 w-10">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {selectedIds.size === filteredOrders.length && filteredOrders.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>

                {visibleColumns.id && (
                  <th className="p-3.5">
                    <button
                      type="button"
                      onClick={() => { setSortField('createdAt'); setSortAsc(!sortAsc); }}
                      className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      <span>Order ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                )}

                {visibleColumns.customer && <th className="p-3.5">Customer</th>}
                {visibleColumns.product && <th className="p-3.5">Product SKU</th>}
                {visibleColumns.quantity && <th className="p-3.5 text-center">Qty</th>}

                {visibleColumns.amount && (
                  <th className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => { setSortField('totalAmount'); setSortAsc(!sortAsc); }}
                      className="flex items-center gap-1 ml-auto hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      <span>Amount</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                )}

                {visibleColumns.status && (
                  <th className="p-3.5">
                    <button
                      type="button"
                      onClick={() => { setSortField('status'); setSortAsc(!sortAsc); }}
                      className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                )}

                {visibleColumns.worker && <th className="p-3.5">Worker Pod</th>}
                {visibleColumns.time && <th className="p-3.5">Created</th>}
                {visibleColumns.actions && <th className="p-3.5 text-right">Actions</th>}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400">
                    No orders matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedIds.has(order.id);
                  const badge = getStatusBadgeConfig(order.status);

                  return (
                    <tr
                      key={order.id}
                      className={`group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                      onClick={() => openOrderDrawer(order)}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleSelectOrder(order.id)}
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Order ID */}
                      {visibleColumns.id && (
                        <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {order.id}
                        </td>
                      )}

                      {/* Customer */}
                      {visibleColumns.customer && (
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {order.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                            {order.customerEmail}
                          </div>
                        </td>
                      )}

                      {/* Product SKU */}
                      {visibleColumns.product && (
                        <td className="p-3.5">
                          <div className="font-mono text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {order.productSku}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                            {order.productName}
                          </div>
                        </td>
                      )}

                      {/* Quantity */}
                      {visibleColumns.quantity && (
                        <td className="p-3.5 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {order.quantity}
                        </td>
                      )}

                      {/* Total Amount */}
                      {visibleColumns.amount && (
                        <td className="p-3.5 text-right font-mono font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(order.totalAmount)}
                        </td>
                      )}

                      {/* Status Badge */}
                      {visibleColumns.status && (
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                            {badge.label}
                          </span>
                        </td>
                      )}

                      {/* Assigned Worker */}
                      {visibleColumns.worker && (
                        <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {order.workerName ? (
                            <span className="text-slate-700 dark:text-slate-300">
                              {order.workerName.split(' ')[0]}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                      )}

                      {/* Time */}
                      {visibleColumns.time && (
                        <td className="p-3.5 text-[11px] text-slate-400 font-mono">
                          {formatRelativeTime(order.createdAt)}
                        </td>
                      )}

                      {/* Actions */}
                      {visibleColumns.actions && (
                        <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openOrderDrawer(order)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Inspect Timeline"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {(order.status === 'dlq' || order.status === 'failed') && (
                              <button
                                type="button"
                                onClick={() => requeueOrder(order.id)}
                                className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10"
                                title="Re-Queue to Worker Pool"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination info */}
        <div className="p-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredOrders.length} of {orders.length} total orders</span>
          <span className="font-mono">Live WebSocket Active</span>
        </div>
      </Card>
    </div>
  );
}
