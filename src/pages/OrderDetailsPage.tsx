import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  ArrowLeft, 
  RotateCcw, 
  XCircle, 
  Copy, 
  Check, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  AlertOctagon, 
  Package, 
  Building2,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatDate, getStatusBadgeConfig } from '../utils';
import { toast } from 'sonner';

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const orders = useStore((s) => s.orders);
  const requeueOrder = useStore((s) => s.requeueOrder);
  const cancelOrder = useStore((s) => s.cancelOrder);
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);

  const order = orders.find((o) => o.id === id) || orders[0];

  if (!order) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order Not Found</h2>
        <p className="text-xs text-slate-400">The requested order ID does not exist in active memory.</p>
        <Link to="/orders">
          <Button variant="primary" size="sm">Return to Orders Table</Button>
        </Link>
      </div>
    );
  }

  const badge = getStatusBadgeConfig(order.status);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(order, null, 2));
    setCopied(true);
    toast.success('Copied JSON payload');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                {order.id}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer: {order.customerName} ({order.customerEmail})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(order.status === 'dlq' || order.status === 'failed' || order.status === 'retrying') && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => {
                requeueOrder(order.id);
                toast.success(`Re-queued order ${order.id}`);
              }}
            >
              Re-Queue Order
            </Button>
          )}

          {order.status !== 'completed' && order.status !== 'failed' && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<XCircle className="w-3.5 h-3.5" />}
              onClick={() => {
                cancelOrder(order.id);
                toast.warning(`Cancelled order ${order.id}`);
              }}
            >
              Cancel Order
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy JSON'}
          </Button>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-slate-400 font-medium">SKU / Product</div>
          <div className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
            {order.productSku}
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">{order.productName}</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-400 font-medium">Quantity</div>
          <div className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-1">
            {order.quantity} Units
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">At {formatCurrency(order.unitPrice)}/ea</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-400 font-medium">Total Settlement</div>
          <div className="font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(order.totalAmount)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Corporate ACH / Wire</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-slate-400 font-medium">Assigned Worker</div>
          <div className="font-medium text-sm text-slate-900 dark:text-white mt-1 truncate">
            {order.workerName || 'Awaiting Worker'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">SLA Priority: {order.priority}</div>
        </Card>
      </div>

      {/* Main Timeline Card */}
      <Card className="p-6 space-y-6">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          <span>Complete Execution & Retry Timeline</span>
        </CardTitle>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {order.timeline.map((item, idx) => (
            <div key={item.id || idx} className="relative">
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center">
                {item.status === 'error' ? (
                  <AlertOctagon className="w-3 h-3 text-rose-500" />
                ) : item.status === 'warning' ? (
                  <RotateCcw className="w-3 h-3 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <span className="font-mono text-[11px] text-slate-400">
                    {formatDate(item.timestamp)}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
                {item.durationMs && (
                  <span className="text-[10px] font-mono text-slate-400 inline-block pt-1">
                    Duration: {item.durationMs}ms
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Raw Payload Inspector */}
      <Card className="p-6 space-y-3">
        <CardTitle className="text-sm">Raw Ingress JSON Payload</CardTitle>
        <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800">
          <pre>{JSON.stringify(order, null, 2)}</pre>
        </div>
      </Card>
    </div>
  );
}
